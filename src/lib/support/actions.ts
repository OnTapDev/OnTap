"use server";

import { createClient } from "@supabase/supabase-js";
import { currentUser } from "@clerk/nextjs/server";
import { sendSupportTicketEmails } from "@/lib/email/support";

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

interface SupportTicket {
  id: string;
  user_id: string;
  user_email: string;
  category: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

export async function getUserTickets(): Promise<SupportTicket[]> {
  const user = await currentUser();
  
  if (!user) {
    return [];
  }

  const clerkId = user.id;
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("user_id", clerkId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Get tickets error:", error);
    return [];
  }

  return data || [];
}

export async function submitSupportTicket(
  category: string,
  subject: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  const user = await currentUser();
  
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const clerkId = user.id;
  const email = user.emailAddresses?.[0]?.emailAddress || "unknown";
  const supabase = createAdminClient();

  const ticket: Omit<SupportTicket, "id" | "created_at"> = {
    user_id: clerkId,
    user_email: email,
    category,
    subject,
    message,
    status: "open",
  };

  const { error } = await supabase
    .from("support_tickets")
    .insert(ticket);

  if (error) {
    console.error("Support ticket error:", error);
    return { success: false, error: error.message };
  }

  // Send email notifications
  await sendSupportTicketEmails(email, subject, message, category);

  return { success: true };
}