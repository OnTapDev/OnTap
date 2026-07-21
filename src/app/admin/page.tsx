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

  const [{ data: requests }, { data: tickets }] = await Promise.all([
    supabase.from("support_requests").select("*").order("created_at", { ascending: false }),
    supabase.from("support_tickets").select("*").order("created_at", { ascending: false }),
  ]);

  const allTickets = [...(requests || []), ...(tickets || [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return <AdminSupportPage tickets={allTickets} />;
}
