import { Resend } from "resend";

function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendSupportTicketEmails(
  userEmail: string,
  subject: string,
  message: string,
  category: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const resend = getResend();
    if (!resend) return { success: false, error: "Email service not configured" };

    // Send confirmation to user
    await resend.emails.send({
      from: "OnTap <ontap@resend.dev>",
      to: [userEmail],
      subject: `Support Ticket Received - ${subject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1A1A1A;">We received your ticket</h2>
          <p style="color: #666;">Thank you for contacting support. Here's a summary:</p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Category:</strong> ${category}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
          </div>
          
          <p style="color: #666;">Our team will respond within 24-48 hours.</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          
          <p style="color: #999; font-size: 12px;">
            OnTap - The operating system for mobile bar operators<br />
            OnTapInquiries@gmail.com
          </p>
        </div>
      `,
    });

    // Send notification to admin
    await resend.emails.send({
      from: "OnTap <ontap@resend.dev>",
      to: ["OnTapInquiries@gmail.com"],
      subject: `New Support Ticket: ${subject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1A1A1A;">New Support Ticket</h2>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>From:</strong> ${userEmail}</p>
            <p><strong>Category:</strong> ${category}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
          </div>
          
          <a href="#" style="display: inline-block; background: #7D7254; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none;">
            View in Dashboard
          </a>
        </div>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error: "Failed to send email" };
  }
}