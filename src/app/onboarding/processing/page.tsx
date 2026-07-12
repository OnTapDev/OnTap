import { redirect } from "next/navigation";
import { ProcessingClient } from "./ProcessingClient";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ orgId?: string }>;
};

export default async function ProcessingPage({ searchParams }: Props) {
  const { orgId } = await searchParams;
  if (!orgId) redirect("/onboarding/subscription");

  return <ProcessingClient orgId={orgId} />;
}
