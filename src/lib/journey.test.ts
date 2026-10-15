import { describe, expect, it } from "vitest";
import { personJourney, trainingReadiness, type JourneyRecord } from "./journey";

const person: JourneyRecord = {
  id: "person-1",
  kind: "people",
  fields: { name: "New person" },
};
const foundation: JourneyRecord = {
  id: "class-1",
  kind: "classes",
  fields: { name: "First Steps", track: "Foundation" },
};

describe("personJourney", () => {
  it("does not confuse enrolment with completed foundation training", () => {
    const enrolled: JourneyRecord = {
      id: "enrolment-1",
      kind: "enrolments",
      fields: {
        personId: person.id,
        classId: foundation.id,
        status: "Enrolled",
      },
    };
    expect(
      personJourney([person, foundation, enrolled], person.id)[2].state,
    ).toBe("in_progress");
    expect(
      personJourney(
        [
          person,
          foundation,
          { ...enrolled, fields: { ...enrolled.fields, status: "Completed" } },
        ],
        person.id,
      )[2].state,
    ).toBe("done");
  });

  it("keeps department membership distinct from serving", () => {
    const department: JourneyRecord = {
      id: "membership-1",
      kind: "department-memberships",
      fields: {
        personId: person.id,
        departmentId: "department-1",
        status: "Active",
      },
    };
    const steps = personJourney([person, department], person.id);
    expect(steps.find((step) => step.label === "Department")?.state).toBe(
      "done",
    );
    expect(steps.find((step) => step.label === "Serving")?.state).toBe(
      "not_started",
    );
  });

  it("does not treat a requested department as active service", () => {
    const request: JourneyRecord = { id: "request-1", kind: "department-memberships", fields: { personId: person.id, departmentId: "department-1", status: "Requested" } };
    expect(personJourney([person, request], person.id)[5].state).toBe("not_started");
  });

  it("does not count another person's progress", () => {
    const contact: JourneyRecord = {
      id: "contact-1",
      kind: "follow-up",
      fields: { personId: "person-2", result: "Contacted" },
    };
    expect(personJourney([person, contact], person.id)[1].state).toBe(
      "not_started",
    );
  });
});

describe("trainingReadiness", () => {
  const twoSessions: JourneyRecord = { ...foundation, fields: { ...foundation.fields, requiredSessions: "2" } };
  const enrolment: JourneyRecord = { id: "enrol-1", kind: "enrolments", fields: { personId: person.id, classId: foundation.id, status: "Enrolled", assessment: "Passed" } };
  const attendance = (id: string, date: string): JourneyRecord => ({ id, kind: "attendance", fields: { personId: person.id, ministryId: foundation.id, date, status: "Present" } });
  it("requires distinct attended dates and a passing assessment", () => {
    const records = [person, twoSessions, enrolment, attendance("a1", "2026-10-01"), attendance("a2", "2026-10-01")];
    expect(trainingReadiness(records, person.id, foundation.id)).toMatchObject({ ready: false, attended: 1, required: 2, assessed: true });
    expect(trainingReadiness([...records, attendance("a3", "2026-10-02")], person.id, foundation.id).ready).toBe(true);
  });
  it("does not complete without a passing assessment", () => {
    const records = [twoSessions, { ...enrolment, fields: { ...enrolment.fields, assessment: "Needs more work" } }, attendance("a1", "2026-10-01"), attendance("a2", "2026-10-02")];
    expect(trainingReadiness(records, person.id, foundation.id).ready).toBe(false);
  });
});
