export function teamMemberName(member?: { name: string }) {
  const name = member?.name.trim();
  if (!member) return "Not assigned";
  return name && !name.includes("@") ? name : "Name not set";
}
