import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const email = user.emailAddresses?.[0]?.emailAddress || "";
  if (email !== "ontap.inquiries@gmail.com") {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
