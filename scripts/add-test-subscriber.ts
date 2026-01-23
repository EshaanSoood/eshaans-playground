import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import * as dotenv from "dotenv";
import { resolve } from "path";

// Load environment variables
dotenv.config({ path: resolve(__dirname, "../.env.local") });

async function addTestSubscriber() {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL;
  
  if (!convexUrl) {
    throw new Error("CONVEX_URL or NEXT_PUBLIC_CONVEX_URL environment variable is not set");
  }
  
  const client = new ConvexHttpClient(convexUrl);
  
  try {
    const result = await client.mutation(api.subscribers.addSubscriber, {
      email: "eshaansoood@gmail.com",
      name: "Eshaan Sood",
      source: "manual_test",
    });
    
    if (result === null) {
      console.log("Subscriber already exists (already subscribed)");
    } else {
      console.log("✅ Successfully added subscriber:", result);
    }
  } catch (error) {
    console.error("❌ Error adding subscriber:", error);
    throw error;
  }
}

addTestSubscriber()
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed:", error);
    process.exit(1);
  });
