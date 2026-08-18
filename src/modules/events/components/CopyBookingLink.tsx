"use client";

import { useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";
import { Button } from "@/ui/primitives";

export function CopyBookingLink({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  const appUrl = typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || "https://wereontap.com";
  const bookingUrl = `${appUrl}/book/${slug}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(bookingUrl);
    } catch {
      const input = document.createElement("input");
      input.value = bookingUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        onClick={handleCopy}
        variant="secondary"
        className="border-warm-sand/20 text-warm-sand hover:text-warm-white hover:border-warm-sand/40"
        title="Copy booking link"
      >
        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        <span className="hidden sm:inline">{copied ? "Copied!" : "Booking Link"}</span>
      </Button>
      <a
        href={bookingUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-lg text-warm-sand hover:text-olive-gold transition-colors"
        title="Preview booking page"
      >
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  );
}
