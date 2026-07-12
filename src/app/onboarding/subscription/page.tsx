import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SubscriptionClient } from "./SubscriptionClient";

export const dynamic = "force-dynamic";

export default async function SubscriptionPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const email = user.emailAddresses?.[0]?.emailAddress || "";
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || email;

  return <SubscriptionClient clerkId={user.id} email={email} name={name} />;
}
