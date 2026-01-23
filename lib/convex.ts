import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

// Initialize Convex client
// This will use CONVEX_URL from environment variables
const getConvexClient = () => {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL;
  if (!convexUrl) {
    throw new Error("CONVEX_URL environment variable is not set");
  }
  return new ConvexHttpClient(convexUrl);
};

export const convex = getConvexClient();

// Re-export API
export { api };
