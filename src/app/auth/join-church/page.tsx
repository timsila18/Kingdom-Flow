import { redirect } from "next/navigation";
import { AuthShell } from "@/components/shells";
import { getCurrentUser } from "@/lib/app-auth";
import { publicChurchOptions } from "@/lib/church-joining";
import Link from "next/link";

export default async function JoinChurchPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/sign-in?next=/auth/join-church");
  const churches = await publicChurchOptions();
  const query = await searchParams;
  return (
    <AuthShell title="Join a church">
      {query.error ? (
        <p role="alert" className="mb-4 text-sm text-danger">
          Your church could not be joined. Select an available church and try
          again.
        </p>
      ) : null}
      <form
        action="/auth/join-church/submit"
        method="post"
        className="grid gap-4"
      >
        <label className="grid gap-2 text-sm font-medium">
          Full name
          <input
            name="name"
            required
            maxLength={200}
            defaultValue={user.name.includes("@") ? "" : user.name}
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Phone number (optional)
          <input name="phone" type="tel" maxLength={50} />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Your church
          <select name="churchId" defaultValue="" required>
            <option value="">Select a church</option>
            {churches.map((church) => (
              <option key={church.id} value={church.id}>
                {church.public_name}
                {church.region ? ` (${church.region})` : ""}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Where are you starting?
          <select name="journeyStage" defaultValue="Visitor">
            <option value="Visitor">I am visiting or joining</option>
            <option value="New convert">I am a new believer</option>
          </select>
        </label>
        <button
          disabled={!churches.length}
          className="min-h-11 rounded-md bg-primary px-4 font-semibold text-white"
        >
          Join church
        </button>
      </form>
      <Link href="/auth/workspaces" className="mt-5 block text-sm text-primary">
        Your churches
      </Link>
    </AuthShell>
  );
}
