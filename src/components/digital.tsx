import Link from "next/link";
import { Bell, Bot, CalendarCheck, Church, Clapperboard, CreditCard, IdCard, Library, MessageCircle, Radio, Send, Shield, Sparkles, UsersRound } from "lucide-react";
import { ButtonLink, Card, PageHeader, StatCard } from "@/components/ui";
import { announcements, bibleReadingPlans, conversations, devotionals, pastoralAppointmentRequests, sermons } from "@/lib/digital-data";
import { getAiCopilotDashboard, getCommunicationDashboard, getDigitalMinistryDashboard, getFellowshipExperience, getLiveNowExperience, getMemberJourney, getMyChurch, getNotificationCenter, getPersonalizedMemberHome, getSermonLibrary, getSolcoRoomAccess, scanDigitalMembershipCard } from "@/lib/digital-engine";

export const memberLinks = [
  ["Home", ""],
  ["My Journey", "journey"],
  ["My Church", "church"],
  ["My Fellowship", "fellowship"],
  ["Services", "services"],
  ["Sermons", "sermons"],
  ["Sermon Player", "sermon-player"],
  ["Live", "live"],
  ["Devotionals", "devotionals"],
  ["Bible Plans", "bible-plans"],
  ["Prayer", "prayer"],
  ["Testimonies", "testimonies"],
  ["Programmes", "programmes"],
  ["Events", "events"],
  ["Volunteer", "volunteer"],
  ["Giving", "giving"],
  ["Messages", "messages"],
  ["Announcements", "announcements"],
  ["Appointments", "appointments"],
  ["My Family", "family"],
  ["My Documents", "documents"],
  ["My Profile", "profile"],
  ["Privacy Settings", "privacy"],
  ["Help", "help"],
] as const;

export const digitalAdminLinks = [
  ["Communication Dashboard", ""],
  ["Announcement Builder", "announcements"],
  ["Templates", "templates"],
  ["Communication Analytics", "analytics"],
  ["Sermon Management", "sermons"],
  ["Livestream Management", "livestreams"],
  ["Devotionals", "devotionals"],
  ["Bible Plans", "bible-plans"],
  ["Resource Library", "resources"],
  ["Forms Builder", "forms"],
  ["Polls and Surveys", "polls"],
  ["Messaging Moderation", "moderation"],
  ["Member Directory Settings", "directory"],
  ["AI Copilot", "ai"],
  ["AI Knowledge Base", "ai-knowledge"],
  ["AI Settings", "ai-settings"],
  ["AI Usage", "ai-usage"],
  ["Integration Settings", "integrations"],
  ["Solco Settings", "solco"],
] as const;

function MemberNav({ slug }: { slug: string }) {
  return <div className="mb-6 flex gap-2 overflow-x-auto pb-2 text-sm">{["Home", "Church", "Journey", "Messages", "More"].map((label) => <Link key={label} href={`/workspace/${slug}/member${label === "Home" ? "" : `/${label.toLowerCase()}`}`} className="shrink-0 rounded-full border border-border bg-surface px-4 py-2 font-medium">{label}</Link>)}</div>;
}

export function MemberHome({ slug, tenantId, userId, personId }: { slug: string; tenantId: string; userId: string; personId: string }) {
  const home = getPersonalizedMemberHome({ tenantId, userId, personId, branchId: "branch-imaara" });
  return (
    <>
      <MemberNav slug={slug} />
      <PageHeader title="Member Home" description="A simple member companion for services, fellowship, sermons, prayer, messages, next steps and giving without administrative clutter." actions={<ButtonLink href={`/workspace/${slug}/member/messages`}>Messages</ButtonLink>} />
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <StatCard label="Unread updates" value={home.unreadMessages} />
        <StatCard label="Next service" value={home.nextService?.startTime ?? "soon"} detail={home.nextService?.title} />
        <StatCard label="Bible plan day" value={home.biblePlan?.currentDay ?? "-"} />
        <StatCard label="Receipt available" value={home.receiptAvailable ? "Yes" : "No"} />
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card><Radio className="text-accent" /><p className="mt-3 font-semibold">{home.liveNow?.title ?? "Live when scheduled"}</p><p className="mt-2 text-sm text-muted">Live now appears only from configured streams. No secret stream keys, no giving pressure.</p></Card>
        <Card><Sparkles className="text-accent" /><p className="mt-3 font-semibold">{home.devotional?.title}</p><p className="mt-2 text-sm text-muted">{home.devotional?.reflection}</p></Card>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3 xl:grid-cols-4">{memberLinks.slice(1).map(([label, path]) => <Link key={path} href={`/workspace/${slug}/member/${path}`} className="rounded-lg border border-border bg-surface p-5 shadow-sm transition hover:border-accent"><p className="font-semibold">{label}</p><p className="mt-2 text-sm leading-6 text-muted">Open {label.toLowerCase()}.</p></Link>)}</div>
    </>
  );
}

export function MemberSection({ section, slug, tenantId, userId, personId }: { section: string; slug: string; tenantId: string; userId: string; personId: string }) {
  const context = { tenantId, userId, personId, branchId: "branch-imaara" };
  if (section === "journey") { const journey = getMemberJourney(context); return <><MemberNav slug={slug} /><PageHeader title="My Journey" description="Private milestones from real ministry records. Sensitive counselling and safeguarding notes stay hidden." /><div className="mt-8 grid gap-4">{journey.milestones?.map((item) => <Card key={item.id}><IdCard className="text-accent" /><p className="mt-3 font-semibold">{item.title}</p><p className="mt-2 text-sm text-muted">{item.occurredOn} · {item.milestoneType.replaceAll("_", " ")}</p></Card>)}</div></>; }
  if (section === "church") { const church = getMyChurch(context); return <><MemberNav slug={slug} /><PageHeader title="My Church" description="Church-controlled profile, branches, service times, contact, livestream and giving instructions." /><Card className="mt-8"><Church className="text-accent" /><p className="mt-3 font-semibold">{church.churchName}</p><p className="mt-2 text-sm text-muted">{church.mission} · livestream configured {String(church.livestreamConfigured)}</p></Card></>; }
  if (section === "fellowship") { const fellowship = getFellowshipExperience(personId); return <><MemberNav slug={slug} /><PageHeader title="My Fellowship" description="Leader, meeting schedule, safe location, announcements, resources and prayer topics." /><Card className="mt-8"><UsersRound className="text-accent" /><p className="mt-3 font-semibold">{fellowship?.fellowship.name}</p><p className="mt-2 text-sm text-muted">{fellowship?.location} · exact private address hidden {String(fellowship?.exactPrivateAddressHidden)}</p></Card></>; }
  if (section === "sermons" || section === "sermon-player") { const library = getSermonLibrary(context); return <><MemberNav slug={slug} /><PageHeader title={section === "sermon-player" ? "Sermon Player" : "Sermons"} description="Audio, video, scripture, transcript, captions, private notes, bookmarks and history." /><div className="mt-8 grid gap-4">{library.map((sermon) => <Card key={sermon.id}><Clapperboard className="text-accent" /><p className="mt-3 font-semibold">{sermon.title}</p><p className="mt-2 text-sm text-muted">{sermon.scriptureReferences.join(", ")} · media {sermon.media.length} · private notes only</p></Card>)}</div></>; }
  if (section === "live") { const live = getLiveNowExperience(context); return <><MemberNav slug={slug} /><PageHeader title="Live" description="Live Now player foundation with notes, scriptures, prayer response, testimony and moderated chat." /><Card className="mt-8"><Radio className="text-accent" /><p className="mt-3 font-semibold">{live?.live.title}</p><p className="mt-2 text-sm text-muted">{live?.live.provider} · {live?.live.liveStatus} · secret key exposed {String(live?.secretStreamKeyExposed)}</p></Card></>; }
  if (section === "devotionals" || section === "bible-plans") return <><MemberNav slug={slug} /><PageHeader title={section === "devotionals" ? "Devotionals" : "Bible Plans"} description="Daily and group reading with reminders, resume/restart and no shame for missed days." /><div className="mt-8 grid gap-4">{(section === "devotionals" ? devotionals : bibleReadingPlans).map((item) => <Card key={item.id}><Library className="text-accent" /><p className="mt-3 font-semibold">{item.title}</p><p className="mt-2 text-sm text-muted">{"devotionalDate" in item ? item.devotionalDate : `${item.durationDays} days`} · published</p></Card>)}</div></>;
  if (section === "messages") return <><MemberNav slug={slug} /><PageHeader title="Messages" description="Native messaging, read state, moderation and sensitive preview redaction." /><div className="mt-8 grid gap-4">{conversations.map((conversation) => <Card key={conversation.id}><MessageCircle className="text-accent" /><p className="mt-3 font-semibold">{conversation.title}</p><p className="mt-2 text-sm text-muted">{conversation.conversationType.replaceAll("_", " ")} · restricted {String(conversation.restricted)}</p></Card>)}</div></>;
  if (section === "announcements") return <><MemberNav slug={slug} /><PageHeader title="Announcements" description="Native announcements, notification center read state and sensitive preview redaction." /><div className="mt-8 grid gap-4">{getNotificationCenter(personId).map((item) => <Card key={item.id}><MessageCircle className="text-accent" /><p className="mt-3 font-semibold">{item.title}</p><p className="mt-2 text-sm text-muted">{item.preview}</p></Card>)}</div></>;
  if (section === "appointments") return <><MemberNav slug={slug} /><PageHeader title="Appointments" description="Request pastoral, counselling, prayer or mentorship appointments with minimal sensitive detail." /><div className="mt-8 grid gap-4">{pastoralAppointmentRequests.map((appointment) => <Card key={appointment.id}><CalendarCheck className="text-accent" /><p className="mt-3 font-semibold">{appointment.requestType}</p><p className="mt-2 text-sm text-muted">{appointment.status} · {appointment.preferredDate}</p></Card>)}</div></>;
  if (section === "giving") return <><MemberNav slug={slug} /><PageHeader title="Giving" description="Own verified giving, receipts and approved payment instructions only." /><Card className="mt-8"><CreditCard className="text-accent" /><p className="mt-3 font-semibold">Giving portal linked</p><p className="mt-2 text-sm text-muted">No rankings, no comparisons, no pastoral visibility into private giving.</p></Card></>;
  return <><MemberNav slug={slug} /><PageHeader title={memberLinks.find(([, path]) => path === section)?.[0] ?? "Member Portal"} description="Member-safe digital experience with privacy, consent, family safeguards and accessibility foundations." /><Card className="mt-8"><Shield className="text-accent" /><p className="mt-3 font-semibold">Privacy by design</p><p className="mt-2 text-sm text-muted">Family, documents, forms, prayer, testimony, volunteering, events and programmes use existing KingdomFlow records and permissions.</p></Card></>;
}

export function DigitalAdminHome({ slug, tenantId }: { slug: string; tenantId: string }) {
  const communication = getCommunicationDashboard(tenantId);
  const ministry = getDigitalMinistryDashboard(tenantId);
  const ai = getAiCopilotDashboard(tenantId);
  return (
    <>
      <PageHeader title="Communication & Digital Ministry" description="Announcements, messaging, sermons, livestreams, devotionals, Bible plans, Solco integration and AI Ministry Copilot." actions={<ButtonLink href={`/workspace/${slug}/digital/announcements`}>New announcement</ButtonLink>} />
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <StatCard label="Announcements" value={communication.announcements} />
        <StatCard label="Delivery failures" value={communication.failures} />
        <StatCard label="Live status" value={ministry.liveStatus ?? "none"} />
        <StatCard label="AI quota" value={ai.quota.toLocaleString()} />
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3 xl:grid-cols-4">{digitalAdminLinks.slice(1).map(([label, path]) => <Link key={path} href={`/workspace/${slug}/digital/${path}`} className="rounded-lg border border-border bg-surface p-5 shadow-sm transition hover:border-accent"><p className="font-semibold">{label}</p><p className="mt-2 text-sm leading-6 text-muted">Open {label.toLowerCase()}.</p></Link>)}</div>
    </>
  );
}

export function DigitalAdminSection({ section, tenantId }: { section: string; slug: string; tenantId: string }) {
  if (section === "announcements" || section === "templates" || section === "analytics") return <><PageHeader title={section === "analytics" ? "Communication Analytics" : section === "templates" ? "Templates" : "Announcement Builder"} description="Targeted communication with consent, opt-outs, emergency permission, provider evidence and no false delivery claims." /><div className="mt-8 grid gap-4">{announcements.map((announcement) => <Card key={announcement.id}><Send className="text-accent" /><p className="mt-3 font-semibold">{announcement.title}</p><p className="mt-2 text-sm text-muted">{announcement.priority} · {announcement.status} · {announcement.channels.join(", ")}</p></Card>)}</div></>;
  if (section === "sermons" || section === "livestreams" || section === "devotionals" || section === "bible-plans" || section === "resources") return <><PageHeader title={section === "livestreams" ? "Livestream Management" : section === "sermons" ? "Sermon Management" : section === "resources" ? "Resource Library" : digitalAdminLinks.find(([, path]) => path === section)?.[0] ?? "Media"} description="Sermons, series, scripture references, media processing, captions, transcripts, livestreams and low-bandwidth resources." /><div className="mt-8 grid gap-4">{sermons.map((sermon) => <Card key={sermon.id}><Clapperboard className="text-accent" /><p className="mt-3 font-semibold">{sermon.title}</p><p className="mt-2 text-sm text-muted">{sermon.status} · {sermon.visibility} · no copyrighted Bible text stored</p></Card>)}</div></>;
  if (section === "ai" || section === "ai-knowledge" || section === "ai-settings" || section === "ai-usage") { const ai = getAiCopilotDashboard(tenantId); return <><PageHeader title={digitalAdminLinks.find(([, path]) => path === section)?.[0] ?? "AI Copilot"} description="Permission-scoped AI with knowledge sources, human review, usage limits, cost controls and safety events." /><div className="mt-8 grid gap-4 md:grid-cols-3"><StatCard label="Enabled" value={ai.enabled ? "Yes" : "No"} /><StatCard label="Quota" value={ai.quota.toLocaleString()} /><StatCard label="Pending reviews" value={ai.pendingHumanReviews} /></div><Card className="mt-8"><Bot className="text-accent" /><p className="mt-3 font-semibold">Human-reviewed assistance</p><p className="mt-2 text-sm text-muted">No divine claims, no cross-tenant retrieval, no confidential pastoral leakage, no actions without confirmation.</p></Card></>; }
  if (section === "solco" || section === "integrations") { const solco = getSolcoRoomAccess(tenantId, "small_group", "group-imaara-family"); return <><PageHeader title={section === "solco" ? "Solco Settings" : "Integration Settings"} description="Optional Solco adapter contracts, identity links, room links, webhooks and graceful native fallback." /><Card className="mt-8"><MessageCircle className="text-accent" /><p className="mt-3 font-semibold">Solco status: {solco.status}</p><p className="mt-2 text-sm text-muted">Production delivery available {String(solco.productionDeliveryAvailable)} · fake API result {String(solco.fakeApiResult)} · fallback {solco.fallback}</p></Card></>; }
  if (section === "moderation" || section === "directory") return <><PageHeader title={section === "moderation" ? "Messaging Moderation" : "Member Directory Settings"} description="Reports, blocks, abuse handling, minor safeguards, directory consent and evidence-preserving moderation." /><Card className="mt-8"><Shield className="text-accent" /><p className="mt-3 font-semibold">Minor safeguards</p><p className="mt-2 text-sm text-muted">Unrelated adult-minor private messaging is blocked unless a supervised approved channel applies.</p></Card></>;
  return <><PageHeader title={section === "forms" ? "Forms Builder" : "Polls and Surveys"} description="Digital forms, polls and surveys with consent, moderation, response access controls and no sensitive public leakage." /><Card className="mt-8"><Bell className="text-accent" /><p className="mt-3 font-semibold">Safe submission foundation</p><p className="mt-2 text-sm text-muted">Responses respect permissions, safeguarding routing and audit requirements.</p></Card></>;
}

export function MemberCardPreview() {
  const card = scanDigitalMembershipCard("kf-card-amina-safe");
  return <div className="rounded-lg border border-border bg-surface p-4 text-sm leading-6 text-muted"><p>{card?.name} · {card?.memberNumber} · QR exposes minimum necessary data only.</p></div>;
}

export function DigitalPrinciplesNotice() {
  return <div className="rounded-lg border border-border bg-surface p-4 text-sm leading-6 text-muted"><p>Digital ministry supports communication, discipleship and care without spiritual rankings, fake integrations, fake AI citations, adult-minor messaging shortcuts or confidential data leakage.</p></div>;
}
