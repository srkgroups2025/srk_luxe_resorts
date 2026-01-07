import cron from "node-cron";
import { expireBookingsJob } from "./expireBookingsJob.js";

// Every 5 minutes
cron.schedule("*/5 * * * *", async () => {
  console.log("⏰ Running expire bookings job...");
  await expireBookingsJob();
});
