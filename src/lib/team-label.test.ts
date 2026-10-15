import { describe, expect, it } from "vitest";
import { teamMemberName } from "./team-label";

describe("teamMemberName", () => {
  it("shows the person's name", () => {
    expect(teamMemberName({ name: " Timothy Sila Kamwilwa " })).toBe(
      "Timothy Sila Kamwilwa",
    );
  });
  it("does not use an email as the person's name", () => {
    expect(teamMemberName({ name: "person@example.com" })).toBe("Name not set");
    expect(teamMemberName({ name: "" })).toBe("Name not set");
  });
  it("labels an unassigned worker", () => {
    expect(teamMemberName()).toBe("Not assigned");
  });
});
