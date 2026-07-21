import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { getAvailableSpots } from "@/modules/public/actions/waitlist";
import { HomeClient } from "./HomeClient";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await currentUser();
  if (user) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: userRecord } = await supabase
      .from("users")
      .select("org_id")
      .eq("clerk_id", user.id)
      .maybeSingle();

    if (userRecord?.org_id) {
      const { data: org } = await supabase
        .from("organizations")
        .select("stripe_subscription_status")
        .eq("id", userRecord.org_id)
        .maybeSingle();

      if (org?.stripe_subscription_status === "active" || org?.stripe_subscription_status === "trialing") {
        redirect("/dashboard");
      }
    }
  }

  const availableSpots = await getAvailableSpots();

  return <HomeClient availableSpots={availableSpots} />;
}
