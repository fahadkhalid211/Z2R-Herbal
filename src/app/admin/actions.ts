"use server";

import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE,
  ADMIN_COOKIE_OPTIONS,
  checkAdminPassword,
  createAdminSession,
  verifyAdminSession,
} from "@/server/admin-session";
import { getStore } from "@/server/json-store";
import { isOrderStatus, setOrderStatus } from "@/server/orders";
import { createRateLimit } from "@/server/rate-limit";

const loginLimit = createRateLimit({ limit: 8, windowMs: 15 * 60 * 1000 });

export async function adminLogin(formData: FormData): Promise<void> {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!loginLimit(ip) || !checkAdminPassword(String(formData.get("password") ?? ""))) {
    redirect("/admin/orders?error=1");
  }
  (await cookies()).set(ADMIN_COOKIE, createAdminSession(), ADMIN_COOKIE_OPTIONS);
  redirect("/admin/orders");
}

export async function adminLogout(): Promise<void> {
  (await cookies()).delete({ name: ADMIN_COOKIE, path: ADMIN_COOKIE_OPTIONS.path });
  redirect("/admin/orders");
}

export async function updateOrderStatus(formData: FormData): Promise<void> {
  if (!verifyAdminSession((await cookies()).get(ADMIN_COOKIE)?.value)) redirect("/admin/orders");
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (id && isOrderStatus(status)) await setOrderStatus(getStore(), id, status);
  revalidatePath("/admin/orders");
}
