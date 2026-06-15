import { SettingsClient } from "@/modules/settings/components/SettingsClient";
import { currentUser } from "@clerk/nextjs/server";
import { getUserPreferences } from "@/lib/preferences/actions";
import { getUserTickets } from "@/lib/support/actions";

export default async function SettingsPage() {
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress || null;
  const emailVerified = user?.emailAddresses?.[0]?.verification?.status === "verified";
  
  const preferences = await getUserPreferences();
  const tickets = await getUserTickets();
  
  return <SettingsClient userEmail={email} emailVerified={emailVerified} preferences={preferences} tickets={tickets} />;
}