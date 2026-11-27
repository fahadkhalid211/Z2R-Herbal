"use server";

import { subscribe } from "@/server/actions";

export interface NewsletterState {
  status: "idle" | "success" | "error";
  message?: string;
}

export async function subscribeToNewsletter(
  _prev: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  const result = await subscribe(String(formData.get("email") ?? ""));
  return result.ok
    ? { status: "success", message: "Thank you! You're on the list." }
    : { status: "error", message: result.message };
}
