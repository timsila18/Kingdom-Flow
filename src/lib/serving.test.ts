import { describe, expect, it } from "vitest";
import { upcomingDutyDates } from "./serving";

describe("upcomingDutyDates", () => {
  it("builds a weekly roster from its first date", () => {
    expect(upcomingDutyDates("2026-10-04", "Weekly", new Date("2026-10-11T12:00:00Z"))).toEqual(["2026-10-11", "2026-10-18", "2026-10-25"]);
  });
  it("keeps monthly assignments on the last day when needed", () => {
    expect(upcomingDutyDates("2026-01-31", "Monthly", new Date("2026-02-01T00:00:00Z"))).toEqual(["2026-02-28", "2026-03-31", "2026-04-30"]);
  });
  it("does not invent dates for past one-off or invalid duties", () => {
    expect(upcomingDutyDates("2026-01-01", "Once", new Date("2026-10-11T00:00:00Z"))).toEqual([]);
    expect(upcomingDutyDates("2026-02-31", "Weekly")).toEqual([]);
  });
  it("finds the next date for a long-running weekly roster", () => {
    expect(upcomingDutyDates("2000-01-02", "Weekly", new Date("2026-10-11T00:00:00Z"), 1)).toEqual(["2026-10-11"]);
  });
});
