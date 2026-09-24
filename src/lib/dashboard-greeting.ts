export type GreetingPeriod = "pagi" | "siang" | "sore" | "malam";

/** Sapaan mengikuti jam Asia/Jakarta, terlepas dari zona waktu perangkat. */
export function getWibGreeting(date: Date): GreetingPeriod {
  const hour = Number(new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    hourCycle: "h23",
  }).format(date));

  if (hour >= 4 && hour < 11) return "pagi";
  if (hour >= 11 && hour < 15) return "siang";
  if (hour >= 15 && hour < 18) return "sore";
  return "malam";
}
