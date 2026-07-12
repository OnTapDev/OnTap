import Image from "next/image";
import Link from "next/link";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-charcoal flex flex-col">
      <header className="flex items-center justify-center py-6">
        <Link href="/">
          <Image
            src="/images/svg/horizontal_lockup.svg"
            alt="OnTap"
            width={160}
            height={40}
            className="h-10 w-auto"
          />
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4">
        {children}
      </main>
    </div>
  );
}
