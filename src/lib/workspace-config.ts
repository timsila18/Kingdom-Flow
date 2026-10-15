export type Field = {
  key: string;
  label: string;
  type?: string;
  required?: boolean;
  options?: string[];
  source?: string;
};
export type SectionConfig = {
  title: string;
  action: string;
  empty: string;
  fields: Field[];
};
export const sections: Record<string, SectionConfig> = {
  branches: {
    title: "Branches",
    action: "Add branch",
    empty: "No additional branches added yet",
    fields: [
      { key: "name", label: "Branch name", required: true },
      { key: "location", label: "Location" },
      { key: "assignedTo", label: "Branch coordinator", source: "team" },
    ],
  },
  people: {
    title: "People",
    action: "Add a person",
    empty: "No people added yet",
    fields: [
      { key: "name", label: "Full name", required: true },
      { key: "phone", label: "Phone number", type: "tel" },
      { key: "email", label: "Email address", type: "email" },
      {
        key: "stage",
        label: "Church journey",
        options: ["Visitor", "New convert", "Member"],
      },
      { key: "assignedTo", label: "Follow-up worker", source: "team" },
    ],
  },
  "follow-up": {
    title: "Follow-up",
    action: "Record contact",
    empty: "No follow-up recorded yet",
    fields: [
      { key: "personId", label: "Person", source: "people", required: true },
      {
        key: "method",
        label: "Contact method",
        options: ["Phone", "Message", "Visit", "In person"],
      },
      {
        key: "result",
        label: "Result",
        options: ["Contacted", "No response", "Try again", "Completed"],
      },
      { key: "nextDate", label: "Next contact date", type: "date" },
      { key: "assignedTo", label: "Follow-up worker", source: "team" },
      { key: "note", label: "Contact notes", type: "textarea" },
    ],
  },
  departments: {
    title: "Departments",
    action: "Add department",
    empty: "No departments added yet",
    fields: [
      { key: "name", label: "Department name", required: true },
      { key: "assignedTo", label: "Department coordinator", source: "team" },
      { key: "published", label: "Open to member requests", options: ["no", "yes"] },
    ],
  },
  groups: {
    title: "Groups & fellowships",
    action: "Add group",
    empty: "No groups added yet",
    fields: [
      { key: "name", label: "Group name", required: true },
      { key: "location", label: "Meeting location" },
      { key: "assignedTo", label: "Group coordinator", source: "team" },
    ],
  },
  classes: {
    title: "Discipleship & classes",
    action: "Create class",
    empty: "No classes scheduled yet",
    fields: [
      { key: "name", label: "Class or programme name", required: true },
      {
        key: "track",
        label: "Training path",
        options: ["Other", "Foundation", "Discipleship"],
      },
      { key: "date", label: "Start date", type: "date" },
      { key: "requiredSessions", label: "Sessions required to complete", type: "number" },
      { key: "assignedTo", label: "Class coordinator", source: "team" },
      { key: "published", label: "Visible to members", options: ["no", "yes"] },
    ],
  },
  events: {
    title: "Events",
    action: "Create event",
    empty: "No upcoming events",
    fields: [
      { key: "name", label: "Event name", required: true },
      { key: "date", label: "Date", type: "date", required: true },
      { key: "location", label: "Location" },
      { key: "published", label: "Visible to members", options: ["no", "yes"] },
    ],
  },
  attendance: {
    title: "Attendance",
    action: "Record attendance",
    empty: "No attendance recorded yet",
    fields: [
      { key: "personId", label: "Person", source: "people", required: true },
      {
        key: "ministryId",
        label: "Class, group or event",
        source: "ministry",
        required: true,
      },
      { key: "date", label: "Date", type: "date", required: true },
      { key: "status", label: "Attendance", options: ["Present", "Absent"] },
    ],
  },
  duties: {
    title: "Serving duties",
    action: "Assign duty",
    empty: "No duties assigned yet",
    fields: [
      { key: "personId", label: "Person", source: "people", required: true },
      {
        key: "ministryId",
        label: "Department",
        source: "departments",
        required: true,
      },
      { key: "name", label: "Duty", required: true },
      { key: "date", label: "First duty date", type: "date", required: true },
      { key: "recurrence", label: "Repeat", options: ["Once", "Weekly", "Monthly"] },
    ],
  },
  visits: {
    title: "Visits",
    action: "Arrange visit",
    empty: "No visits arranged yet",
    fields: [
      { key: "personId", label: "Person", source: "people", required: true },
      { key: "date", label: "Visit date", type: "date", required: true },
      {
        key: "status",
        label: "Status",
        options: ["Planned", "Completed", "Cancelled"],
      },
      { key: "note", label: "Visit notes", type: "textarea" },
    ],
  },
  care: {
    title: "My care cases",
    action: "Add care case",
    empty: "No care cases assigned",
    fields: [
      { key: "personId", label: "Person", source: "people", required: true },
      { key: "name", label: "Case title", required: true },
      {
        key: "status",
        label: "Status",
        options: ["Open", "In progress", "Closed"],
      },
      { key: "note", label: "Confidential notes", type: "textarea" },
    ],
  },
  prayer: {
    title: "Prayer requests",
    action: "Request prayer",
    empty: "No prayer requests yet",
    fields: [
      { key: "name", label: "Prayer request", required: true },
      { key: "note", label: "Details", type: "textarea" },
      { key: "status", label: "Status", options: ["Open", "Answered"] },
    ],
  },
  giving: {
    title: "Giving",
    action: "Record giving",
    empty: "No giving recorded yet",
    fields: [
      { key: "name", label: "Giving category", required: true },
      { key: "amount", label: "Amount", type: "number", required: true },
      { key: "currency", label: "Currency", required: true },
      { key: "date", label: "Date", type: "date", required: true },
      { key: "reference", label: "Payment reference" },
    ],
  },
  expenses: {
    title: "Expenses",
    action: "Add expense",
    empty: "No expenses recorded yet",
    fields: [
      { key: "name", label: "Expense description", required: true },
      { key: "amount", label: "Amount", type: "number", required: true },
      { key: "currency", label: "Currency", required: true },
      { key: "date", label: "Date", type: "date", required: true },
      { key: "reference", label: "Receipt reference" },
    ],
  },
  decisions: {
    title: "Decisions",
    action: "Submit decision",
    empty: "No decisions awaiting review",
    fields: [
      { key: "name", label: "Decision needed", required: true },
      { key: "note", label: "Details", type: "textarea" },
    ],
  },
};
export const journeyStages = [
  "Added",
  "Contacted",
  "Discipleship",
  "Fellowship",
  "Serving",
];
