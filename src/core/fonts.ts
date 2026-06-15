import localFont from "next/font/local";

export const satoshi = localFont({
  src: [
    {
      path: "../../public/brand/fonts/Satoshi-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/brand/fonts/Satoshi-Italic.woff2",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../public/brand/fonts/Satoshi-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/brand/fonts/Satoshi-BoldItalic.woff2",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-satoshi",
});
