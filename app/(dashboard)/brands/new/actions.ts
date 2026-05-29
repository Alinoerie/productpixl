"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { createBrand } from "@/lib/brands";

export async function createBrandFormAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const name = String(formData.get("name") ?? "");
  const description = String(formData.get("description") ?? "");

  await createBrand(session.user.id, { name, description });
  redirect("/brand");
}
