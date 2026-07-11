import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
export const stripe = key ? new Stripe(key, {
  apiVersion: "2025-03-31.chatgpt__2290_1" as Stripe.LatestApiVersion,
}) : null;

// Set to 0.05 (5%) when marketplace is activated
export const PLATFORM_FEE_PERCENTAGE = 0;
export const PLATFORM_APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
