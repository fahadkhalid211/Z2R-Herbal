import { cookies, headers } from "next/headers";
import { StoreApiError, storeApi } from "./client";

const ACCESS = "z2r_session";
const REFRESH = "z2r_refresh";

export interface ApiCustomer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}

export interface CustomerSession {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  refreshExpiresAt: string;
  customer: ApiCustomer;
}

const secure = process.env.NODE_ENV === "production";

export async function endUserIp(): Promise<string | undefined> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || undefined;
}

async function saveAccess(accessToken: string, expiresIn: number) {
  (await cookies()).set(ACCESS, accessToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: Math.max(60, expiresIn - 30),
  });
}

export async function saveSession(session: CustomerSession): Promise<void> {
  await saveAccess(session.accessToken, session.expiresIn);
  (await cookies()).set(REFRESH, session.refreshToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    expires: new Date(session.refreshExpiresAt),
  });
}

export async function updateAccessToken(accessToken: string, expiresIn: number): Promise<void> {
  await saveAccess(accessToken, expiresIn);
}

export async function clearSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(ACCESS);
  jar.delete(REFRESH);
}

export async function hasSession(): Promise<boolean> {
  const jar = await cookies();
  return Boolean(jar.get(ACCESS)?.value || jar.get(REFRESH)?.value);
}

const renewals = new Map<string, Promise<CustomerSession>>();

async function renew(refreshToken: string): Promise<CustomerSession> {
  let pending = renewals.get(refreshToken);
  if (!pending) {
    pending = storeApi<CustomerSession>("/customers/refresh", {
      method: "POST",
      body: { refreshToken },
      endUserIp: await endUserIp(),
    }).then((r) => r.data);
    renewals.set(refreshToken, pending);
    void pending
      .finally(() => setTimeout(() => renewals.delete(refreshToken), 30_000))
      .catch(() => undefined);
  }
  return pending;
}

const signedOut = () => new StoreApiError("unauthenticated", "Please sign in to continue.", 401);

export async function asCustomer<T>(call: (token: string, ip: string | undefined) => Promise<T>): Promise<T> {
  const jar = await cookies();
  const ip = await endUserIp();
  let access = jar.get(ACCESS)?.value;
  const refresh = jar.get(REFRESH)?.value;
  if (!access && !refresh) throw signedOut();

  const renewAndSave = async () => {
    if (!refresh) throw signedOut();
    try {
      const session = await renew(refresh);
      await saveSession(session);
      return session.accessToken;
    } catch (error) {
      await clearSession();
      throw error instanceof StoreApiError && error.status !== 401 && error.status !== 400
        ? error
        : signedOut();
    }
  };

  if (!access) access = await renewAndSave();
  try {
    return await call(access, ip);
  } catch (error) {
    if (!(error instanceof StoreApiError) || error.status !== 401 || !refresh) throw error;
    return call(await renewAndSave(), ip);
  }
}

export async function customerTokenIfSignedIn(): Promise<string | undefined> {
  if (!(await hasSession())) return undefined;
  try {
    return await asCustomer(async (token) => token);
  } catch {
    return undefined;
  }
}

export const customerCalls = {
  register: async (input: { name: string; email: string; phone: string; password: string }) =>
    (
      await storeApi<CustomerSession>("/customers/register", {
        method: "POST",
        body: input,
        endUserIp: await endUserIp(),
      })
    ).data,
  login: async (input: { email: string; password: string }) =>
    (
      await storeApi<CustomerSession>("/customers/login", {
        method: "POST",
        body: input,
        endUserIp: await endUserIp(),
      })
    ).data,
  logout: (token: string, ip?: string) =>
    storeApi<{ signedOut: boolean }>("/customers/logout", {
      method: "POST",
      customerToken: token,
      endUserIp: ip,
    }),
  me: async (token: string, ip?: string) =>
    (await storeApi<ApiCustomer>("/customers/me", { customerToken: token, endUserIp: ip })).data,
  update: async (token: string, ip: string | undefined, body: { name?: string; phone?: string }) =>
    (
      await storeApi<ApiCustomer>("/customers/me", {
        method: "PATCH",
        body,
        customerToken: token,
        endUserIp: ip,
      })
    ).data,
  changePassword: async (
    token: string,
    ip: string | undefined,
    body: { currentPassword: string; newPassword: string },
  ) =>
    (
      await storeApi<{ accessToken: string; expiresIn: number; passwordChanged: boolean }>(
        "/customers/me/password",
        {
          method: "POST",
          body,
          customerToken: token,
          endUserIp: ip,
        },
      )
    ).data,
  forgotPassword: async (email: string, ip: string | undefined) =>
    (
      await storeApi<{ delivery: PasswordResetDelivery | null; resendAfterSeconds: number }>(
        "/customers/password/forgot",
        { method: "POST", body: { email }, endUserIp: ip },
      )
    ).data,
  resetPassword: async (body: { email: string; code: string; newPassword: string }, ip: string | undefined) =>
    (await storeApi<unknown>("/customers/password/reset", { method: "POST", body, endUserIp: ip })).data,
};

export interface PasswordResetDelivery {
  code: string;
  expiresAt: string;
  expiresInMinutes: number;
  customer: { name: string; email: string };
}
