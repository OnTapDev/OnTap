import { ClerkProvider } from "@clerk/nextjs";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-charcoal">
        <div className="text-center p-8">
          <h1 className="text-warm-white text-2xl font-bold mb-4">Configuration Required</h1>
          <p className="text-warm-sand">
            Please add your Clerk keys to <code className="text-olive-gold">.env.local</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <ClerkProvider
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: "#7D7254",
          colorBackground: "#1A1A1A",
          colorInputBackground: "#1A1A1A",
          colorInputText: "#F3E7D3",
          colorText: "#F3E7D3",
          colorTextSecondary: "#B2A88A",
          colorDanger: "#EF4444",
          borderRadius: "0.5rem",
        },
        elements: {
          formButtonPrimary:
            "bg-olive-gold text-charcoal hover:bg-olive-gold/90 font-bold",
          card: "bg-charcoal border border-warm-sand/20",
          headerTitle: "text-warm-white",
          headerSubtitle: "text-warm-sand",
          socialButtonsBlockButton:
            "border-warm-sand/30 bg-charcoal text-warm-white hover:bg-warm-sand/10",
          dividerLine: "bg-warm-sand/20",
          dividerText: "text-warm-sand",
          formFieldLabel: "text-warm-sand",
          formFieldInput:
            "border-warm-sand/30 bg-charcoal text-warm-white focus:border-olive-gold focus:ring-olive-gold",
          footerActionLink: "text-olive-gold hover:text-olive-gold/80",
          organizationSwitcherTrigger:
            "bg-charcoal border border-warm-sand/30 text-warm-white hover:bg-warm-sand/10",
          organizationPreviewText: "text-warm-white",
          organizationSwitcherTriggerIcon: "text-warm-sand",
          organizationListItem: "text-warm-white hover:bg-warm-sand/10",
          organizationListItemIcon: "text-warm-sand",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
