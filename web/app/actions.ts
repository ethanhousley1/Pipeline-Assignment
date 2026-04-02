"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function selectCustomerAction(formData: FormData) {
  const customerId = formData.get("customer_id")?.toString();
  if (customerId) {
    const cookieStore = await cookies();
    cookieStore.set("selected_customer_id", customerId, { path: "/" });
  }
  redirect("/dashboard");
}
