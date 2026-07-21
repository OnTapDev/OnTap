import { createClient } from "@supabase/supabase-js";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AdminSupportPage } from "./AdminSupportClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");
  if (user.emailAddresses?.[0]?.emailAddress !== "ontap.inquiries@gmail.com") {
    redirect("/dashboard");
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: tickets } = await supabase
    .from("support_requests")
    .select("*")
    .order("created_at", { ascending: false });

  return <AdminSupportPage tickets={tickets || []} />;
}
