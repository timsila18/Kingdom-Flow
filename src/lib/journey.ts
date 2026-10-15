export type JourneyRecord = {
  id: string;
  kind: string;
  fields: Record<string, string>;
};

export type JourneyStep = {
  label: string;
  state: "done" | "in_progress" | "not_started";
  detail: string;
};

function active(records: JourneyRecord[], kind: string) {
  return records.filter(
    (record) => record.kind === kind && record.fields.archived !== "yes",
  );
}

export function trainingReadiness(
  records: JourneyRecord[],
  personId: string,
  classId: string,
): { ready: boolean; attended: number; required: number; assessed: boolean } {
  const training = active(records, "classes").find((record) => record.id === classId);
  const enrolment = active(records, "enrolments").find(
    (record) =>
      record.fields.personId === personId &&
      (record.fields.classId || record.fields.ministryId) === classId &&
      record.fields.status === "Enrolled",
  );
  const required = Math.max(1, Number(training?.fields.requiredSessions) || 1);
  const attended = new Set(
    active(records, "attendance")
      .filter(
        (record) =>
          record.fields.personId === personId &&
          record.fields.ministryId === classId &&
          record.fields.status === "Present",
      )
      .map((record) => record.fields.date),
  ).size;
  const assessed = enrolment?.fields.assessment === "Passed";
  return { ready: Boolean(training && enrolment && attended >= required && assessed), attended, required, assessed };
}

function trainingState(
  records: JourneyRecord[],
  personId: string,
  track: string,
): JourneyStep["state"] {
  const classIds = new Set(
    active(records, "classes")
      .filter(
        (record) =>
          record.fields.track === track ||
          (!record.fields.track &&
            (track === "Foundation"
              ? /foundation/i.test(record.fields.name ?? "")
              : /discipleship/i.test(record.fields.name ?? ""))),
      )
      .map((record) => record.id),
  );
  const enrolments = active(records, "enrolments").filter(
    (record) =>
      record.fields.personId === personId &&
      classIds.has(record.fields.classId || record.fields.ministryId),
  );
  if (enrolments.some((record) => record.fields.status === "Completed"))
    return "done";
  return enrolments.length ? "in_progress" : "not_started";
}

export function personJourney(
  records: JourneyRecord[],
  personId: string,
): JourneyStep[] {
  const person = active(records, "people").find(
    (record) => record.id === personId,
  );
  const linked = (kind: string) =>
    active(records, kind).filter(
      (record) => record.fields.personId === personId,
    );
  const contacted = linked("follow-up").some((record) =>
    ["Contacted", "Completed"].includes(record.fields.result),
  );
  const foundation = trainingState(records, personId, "Foundation");
  const discipleship = trainingState(records, personId, "Discipleship");
  const fellowship = linked("connections").some((record) =>
    Boolean(record.fields.groupId),
  );
  const department = linked("department-memberships").some(
    (record) => record.fields.status === "Active",
  );
  const serving = linked("duties").length > 0;
  return [
    {
      label: "Person recorded",
      state: person ? "done" : "not_started",
      detail: person ? "Person profile created" : "Add this person first",
    },
    {
      label: "Welcomed",
      state: contacted ? "done" : "not_started",
      detail: contacted ? "Follow-up contact recorded" : "Contact and welcome",
    },
    {
      label: "Foundation school",
      state: foundation,
      detail:
        foundation === "done"
          ? "Training completed"
          : foundation === "in_progress"
            ? "Requested or enrolled"
            : "Offer a foundation class",
    },
    {
      label: "Discipleship",
      state: discipleship,
      detail:
        discipleship === "done"
          ? "Training completed"
          : discipleship === "in_progress"
            ? "Requested or enrolled"
            : "Available when ready",
    },
    {
      label: "Fellowship",
      state: fellowship ? "done" : "not_started",
      detail: fellowship ? "Connected to a group" : "Choose a group",
    },
    {
      label: "Department",
      state: department ? "done" : "not_started",
      detail: department ? "Part of a department" : "Choose where to serve",
    },
    {
      label: "Serving",
      state: serving ? "done" : "not_started",
      detail: serving ? "A duty has been assigned" : "Assign a first duty",
    },
  ];
}
