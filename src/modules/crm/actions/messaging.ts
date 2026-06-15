"use server";

import { createClient } from "@/core/db/server";
import { revalidatePath } from "next/cache";

export type MessageType = "email" | "sms";

export async function getMessages(contactId: string) {
  const supabase = await createClient();
  
  const { data: messages, error } = await supabase
    .from("messages")
    .select("*")
    .eq("contact_id", contactId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching messages:", error);
    return [];
  }

  return messages || [];
}

export async function sendEmail(to: string, subject: string, body: string, contactId: string, orgId: string) {
  const resendApiKey = process.env.RESEND_API_KEY;
  
  if (!resendApiKey) {
    throw new Error("Email service not configured. Add RESEND_API_KEY to .env.local");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${resendApiKey}`,
    },
    body: JSON.stringify({
      from: "OnTap <noreply@yourdomain.com>",
      to: to,
      subject: subject,
      html: body,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to send email");
  }

  const supabase = await createClient();
  await supabase.from("messages").insert({
    org_id: orgId,
    contact_id: contactId,
    type: "email",
    subject,
    body,
    status: "sent",
    recipient: to,
  });

  revalidatePath("/crm");
  return { success: true };
}

export async function sendSMS(to: string, body: string, contactId: string, orgId: string) {
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

  if (!twilioSid || !twilioToken || !twilioPhone) {
    throw new Error("SMS service not configured. Add TWILIO credentials to .env.local");
  }

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${Buffer.from(`${twilioSid}:${twilioToken}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        From: twilioPhone,
        To: to,
        Body: body,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to send SMS");
  }

  const supabase = await createClient();
  await supabase.from("messages").insert({
    org_id: orgId,
    contact_id: contactId,
    type: "sms",
    subject: "",
    body,
    status: "sent",
    recipient: to,
  });

  revalidatePath("/crm");
  return { success: true };
}
