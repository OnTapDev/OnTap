import { getAvailableSpots } from "@/modules/public/actions/waitlist";
import { HomeClient } from "./HomeClient";

export const dynamic = "force-dynamic";

export default async function Home() {
  const availableSpots = await getAvailableSpots();

  return <HomeClient availableSpots={availableSpots} />;
}
