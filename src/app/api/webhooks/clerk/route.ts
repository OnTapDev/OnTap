import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import crypto from "crypto";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function verifyClerkWebhook(body: string, signature: string) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET || "";
  if (!webhookSecret) return true;
  
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(body)
    .digest("hex");
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("clerk-signature") || "";
    
    // Verify webhook (skip if no secret configured)
    if (!verifyClerkWebhook(body, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
    
    const event = JSON.parse(body);
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    if (event.type === "user.created") {
      const { id: clerk_id, email_addresses, first_name, last_name } = event.data;
      
      const email = email_addresses?.[0]?.email_address;
      const name = [first_name, last_name].filter(Boolean).join(" ") || email;
      
      // Create default organization for new user
      const orgId = crypto.randomUUID();
      
      const { error: orgError } = await supabase
        .from("organizations")
        .insert({
          id: orgId,
          name: name || "My Bar Company",
          slug: `bar-${Date.now()}`,
        })
        .select()
        .single();
      
      if (orgError) {
        console.error("Error creating organization:", orgError);
      }
      
      // Create user record
      if (orgId && clerk_id) {
        const { error: userError } = await supabase
          .from("users")
          .insert({
            org_id: orgId,
            clerk_id,
            email: email || "",
            name: name || "",
            role: "owner",
          });
        
        if (userError) {
          console.error("Error creating user:", userError);
        }
        
        // Create default pipeline stages
        const stages = [
          { name: "New Inquiry", order: 0, color: "#7D7254" },
          { name: "Quoted", order: 1, color: "#B2A88A" },
          { name: "Tentative", order: 2, color: "#F3E7D3" },
          { name: "Booked", order: 3, color: "#7D6854" },
          { name: "Completed", order: 4, color: "#7D7254" },
        ];
        
        for (const stage of stages) {
          await supabase.from("pipeline_stages").insert({
            org_id: orgId,
            ...stage,
          });
        }
      }
      
      console.log("New user created:", { clerk_id, email, orgId });
    }
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}