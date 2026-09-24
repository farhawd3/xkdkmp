import { describe, expect, it } from "vitest";
import { getWibGreeting } from "@/lib/dashboard-greeting";

describe("sapaan dashboard menurut WIB", () => {
  it.each([
    ["2026-09-23T20:59:00Z", "malam"],
    ["2026-09-23T21:00:00Z", "pagi"],
    ["2026-09-24T03:59:00Z", "pagi"],
    ["2026-09-24T04:00:00Z", "siang"],
    ["2026-09-24T08:00:00Z", "sore"],
    ["2026-09-24T11:00:00Z", "malam"],
  ] as const)("%s menghasilkan %s", (timestamp, expected) => {
    expect(getWibGreeting(new Date(timestamp))).toBe(expected);
  });
});
