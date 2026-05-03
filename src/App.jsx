import React, { useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, ClipboardList, Edit3, ExternalLink, HelpCircle, Info, Route, ShieldCheck, Users } from "lucide-react";

const intakeRoles = [
  "I rent or live in the room/property.",
  "I own or rent out the room/property.",
  "I am an agent or helping someone else.",
  "I am not sure / my situation is different.",
];
const helperRoles = ["The person renting or living in the property.", "The person who owns or rents out the property.", "I am not sure."];
const tenantIssues = [
  "The room or property was not as advertised.",
  "Something broke and the landlord refuses to repair it.",
  "I want my deposit back.",
  "I want to end the tenancy early.",
  "I received a demand for rent, repair costs, or damages.",
  "I am being asked to leave or cannot access the property.",
  "I am not sure.",
];
const landlordIssues = [
  "Rent has not been paid.",
  "I believe the property was damaged.",
  "There is a dispute about the deposit.",
  "The tenant wants to end the tenancy early.",
  "I want to end the tenancy or ask the tenant to leave.",
  "I received a claim or demand from the tenant.",
  "I am not sure.",
];
const roles = ["Tenant", "Landlord", "Property agent", "Helping someone else", "I am not sure"];
const wants = ["Repair", "Compensation", "Deposit return", "End tenancy early", "Respond to a demand", "Understand options"];
const unsureExamples = [
  "I paid a deposit but my name is not on the tenancy agreement.",
  "I am a subtenant or room occupier.",
  "I am helping a friend or family member.",
  "I dealt mainly with an agent.",
  "I am not sure whether this is a tenancy, licence, or informal arrangement.",
];
const topicMap = {
  "The room or property was not as advertised.": ["misrepresentation", "tenancy terms"],
  "Something broke and the landlord refuses to repair it.": ["repair issue", "property condition"],
  "I want my deposit back.": ["deposit", "payment dispute"],
  "I want to end the tenancy early.": ["early termination", "tenancy terms"],
  "I received a demand for rent, repair costs, or damages.": ["rent or damage demand", "responding to a claim"],
  "I am being asked to leave or cannot access the property.": ["asked to leave", "urgent housing concern"],
  "Rent has not been paid.": ["rent arrears", "payment dispute"],
  "I believe the property was damaged.": ["property damage", "repair costs"],
  "There is a dispute about the deposit.": ["deposit", "payment dispute"],
  "The tenant wants to end the tenancy early.": ["early termination", "tenancy terms"],
  "I want to end the tenancy or ask the tenant to leave.": ["ending tenancy", "occupancy dispute"],
  "I received a claim or demand from the tenant.": ["claim from tenant", "responding to a claim"],
  "I am not sure.": ["uncertain issue", "guided triage"],
};

function possibleRoutes() {
  return [
    "Residential tenancy, two years or less, amount below S$20,000: possible SCT.",
    "Safety, harassment, threats, or lockout: urgent help / protection route first.",
    "Property agent issue: agency / CEA-related route.",
    "Non-residential tenancy: civil court, mediation, or specialist route.",
    "Higher amount or longer tenancy: civil court or legal advice.",
  ];
}

function getResult({ role, want, agreement, residential, amount, duration, urgent, contacted }) {
  const likelySct = urgent === "No" && residential === "Yes" && duration === "Yes" && amount === "Yes" && ["Tenant", "Landlord", "Helping someone else", "I am not sure"].includes(role);
  let r;
  if (urgent === "Yes") {
    r = { priority: "Priority 1", tone: "urgent", title: "Urgent or safety-related issue — consider urgent help first", bullets: [
      "If there is immediate danger, threats, harassment, lockout, or safety risk, the user should prioritise safety, emergency help, police, or harassment/protection routes.",
      "Do not send the user directly to SCT while the urgent issue is unresolved.",
      "If there is also a money claim such as deposit, compensation, repair cost, or rent, SCT can be considered later only after the urgent issue is handled.",
    ], secondary: "A separate SCT claim may still be possible for the money dispute." };
  } else if (role === "Property agent") {
    r = { priority: "Priority 2", tone: "agent", title: "Property agent issue — consider CEA / agency complaint / dispute resolution route", bullets: [
      "If the dispute is about property agent service, commission, agency agreement, misrepresentation, or agent conduct, the user may need to contact the agency first or consider CEA-related complaint/dispute resolution routes.",
      "SCT should not be the default result for property agent disputes.",
    ] };
  } else if (residential === "No") {
    r = { priority: "Priority 3", tone: "other", title: "Not a residential tenancy — consider other civil or mediation routes", bullets: [
      "The SCT residential tenancy path is mainly for residential tenancy disputes.",
      "If this is commercial, office, industrial, retail, licensing, or another non-residential arrangement, the user may need civil court, mediation, or another specialist route.",
    ] };
  } else if (residential === "I am not sure") {
    r = { priority: "Priority 4", tone: "more", title: "More information needed — check whether this is a residential tenancy", bullets: [
      "SCT may be possible only if this is actually a residential tenancy and the other SCT conditions are met.",
      "The user should check the property type and agreement before deciding.",
    ] };
  } else if (duration === "No") {
    r = { priority: "Priority 5", tone: "other", title: "Tenancy period may be outside SCT scope", bullets: [
      "If the tenancy period is more than two years, the matter may fall outside the usual SCT residential tenancy route.",
      "The user may need to consider civil court, mediation, or legal advice.",
    ] };
  } else if (duration === "I am not sure") {
    r = { priority: "Priority 6", tone: "more", title: "More information needed — check tenancy period", bullets: [
      "SCT may be possible only if the residential tenancy period is two years or less.",
      "The user should check the tenancy agreement, renewal terms, or move-in documents.",
    ] };
  } else if (amount === "No") {
    r = { priority: "Priority 7", tone: "other", title: "Amount may be above SCT limit — check civil court or consent option", bullets: [
      "If the amount is above S$20,000, SCT may not be available unless the amount is within the higher consent limit and both sides agree.",
      "If the amount is much higher, the user may need to consider ordinary civil court or legal advice.",
    ] };
  } else if (amount === "I am not sure") {
    r = { priority: "Priority 8", tone: "more", title: "More information needed — estimate the amount involved", bullets: [
      "The user should estimate the amount claimed, including deposit, repair costs, compensation, rent, or other losses.",
      "SCT may be possible only if the amount is within the SCT limit and the other conditions are met.",
    ] };
  } else if (likelySct) {
    r = { priority: "Priority 9", tone: "sct", title: "Likely SCT pathway", bullets: [
      "Based on the answers, this may fit the SCT pathway because it appears to involve a residential tenancy, a tenancy period of two years or less, and an amount below S$20,000, with no urgent safety risk identified.",
      "SCT may be relevant for deposit return, compensation, repair-related costs, rent-related claims, or tenancy-related money disputes.",
      "The user should prepare documents and evidence before proceeding.",
    ] };
  } else {
    r = { priority: "Default fallback", tone: "more", title: "More information needed — possible routes", bullets: possibleRoutes() };
  }
  const modifiers = [];
  if (agreement === "No" || agreement === "I am not sure") modifiers.push({ title: "Evidence may need strengthening", text: "A written tenancy agreement is helpful, but if there is no written agreement or the user is unsure, they should collect other evidence such as payment records, chat messages, receipts, photos, deposit records, and proof of occupation." });
  if (contacted === "No") modifiers.push({ title: "Consider writing first", text: "Consider contacting the other party in writing first, unless it is unsafe to do so. A short written message can explain the issue, the requested outcome, the amount claimed, and a reasonable deadline." });
  if (contacted === "I am not sure") modifiers.push({ title: "Check existing written communication", text: "Check whether there is already written communication, such as WhatsApp, SMS, email, letter, or payment notes. Written records may help clarify the dispute." });
  if (want === "Understand options" && !likelySct && r.title !== "More information needed — possible routes") modifiers.push({ title: "Possible routes to compare", text: possibleRoutes().join(" • ") });
  return { ...r, likelySct, modifiers };
}

function Header({ step, total }) {
  return <header className="border-b border-slate-200 bg-white"><div className="mx-auto max-w-5xl px-5 py-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Student prototype</p><h1 className="mt-1 text-xl font-bold text-slate-950">Redesigned Digital Legal Help Intake</h1><p className="mt-1 text-sm text-slate-600">Illustrative mockup only — not an official Singapore Courts page.</p></div><div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">Step {step} of {total}</div></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-700 transition-all" style={{ width: `${Math.round((step / total) * 100)}%` }} /></div></div></header>;
}
function Pill({ children }) { return <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700">{children}</span>; }
function Card({ icon: Icon, title, children }) { return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-3 flex items-center gap-2">{Icon && <Icon className="h-5 w-5 text-blue-700" />}<h3 className="text-base font-semibold text-slate-900">{title}</h3></div><div className="text-sm leading-6 text-slate-700">{children}</div></section>; }
function Option({ selected, children, onClick }) { return <button onClick={onClick} className={`w-full rounded-xl border p-4 text-left text-sm transition hover:border-blue-400 hover:bg-blue-50 ${selected ? "border-blue-600 bg-blue-50 ring-2 ring-blue-100" : "border-slate-200 bg-white"}`}><div className="flex items-start gap-3"><span className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border ${selected ? "border-blue-600 bg-blue-600" : "border-slate-300"}`} /><span className="font-medium text-slate-800">{children}</span></div></button>; }
function Question({ title, options, value, setValue }) { return <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-sm font-semibold text-slate-900">{title}</h3><div className="mt-3 grid gap-2">{options.map((o) => <label key={o} className="flex cursor-pointer items-center gap-3 rounded-xl bg-white p-3 text-sm text-slate-800 ring-1 ring-slate-200 hover:ring-blue-300"><input type="radio" checked={value === o} onChange={() => setValue(o)} className="h-4 w-4 accent-blue-700" /><span>{o}</span></label>)}</div></div>; }
function IssueList({ options, issue, setIssue }) { return <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-xl font-semibold text-slate-900">What is happening?</h3><p className="mt-2 text-sm leading-6 text-slate-600">You do not need to know the legal category.</p><div className="mt-4 grid gap-3">{options.map((o) => <Option key={o} selected={issue === o} onClick={() => setIssue(o)}>{o}</Option>)}</div></div>; }

export default function App() {
  const [screen, setScreen] = useState(0);
  const [intakeRole, setIntakeRole] = useState("");
  const [helperRole, setHelperRole] = useState("");
  const [issue, setIssue] = useState("");
  const [role, setRole] = useState("");
  const [want, setWant] = useState("");
  const [agreement, setAgreement] = useState("");
  const [residential, setResidential] = useState("");
  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState("");
  const [urgent, setUrgent] = useState("");
  const [contacted, setContacted] = useState("");
  const total = 5;
  const result = useMemo(() => getResult({ role, want, agreement, residential, amount, duration, urgent, contacted }), [role, want, agreement, residential, amount, duration, urgent, contacted]);
  const intakeSummary = useMemo(() => {
    if (intakeRole === intakeRoles[0]) return "tenant-side pathway";
    if (intakeRole === intakeRoles[1]) return "landlord-side pathway";
    if (intakeRole === intakeRoles[2] && helperRole === helperRoles[0]) return "tenant-side pathway via helper/agent";
    if (intakeRole === intakeRoles[2] && helperRole === helperRoles[1]) return "landlord-side pathway via helper/agent";
    if (intakeRole === intakeRoles[2]) return "guided pathway for helper/agent";
    if (intakeRole === intakeRoles[3]) return "supported uncertainty pathway";
    return "pathway not yet selected";
  }, [intakeRole, helperRole]);
  const topics = useMemo(() => [...new Set([role || "role not selected", "landlord/tenant dispute", intakeSummary, result.title, residential === "Yes" && "residential tenancy", amount === "Yes" && "amount below S$20,000", duration === "Yes" && "tenancy period two years or less", issue && ...(topicMap[issue] || []), want && want.toLowerCase(), urgent === "Yes" && "urgent support", "low-cost help", "limited English support"].flat().filter(Boolean))], [role, intakeSummary, result.title, residential, amount, duration, issue, want, urgent]);
  const assumptions = [
    [`You entered through a ${intakeSummary}.`, 0], [`The issue selected was ${issue ? issue.toLowerCase() : "not yet confirmed"}.`, 0], [`You confirmed your role as ${role || "not yet confirmed"}.`, 1], [`Your main goal is ${want ? want.toLowerCase() : "not yet confirmed"}.`, 1], [`Written tenancy agreement: ${agreement || "not yet confirmed"}.`, 1], [`Residential tenancy: ${residential || "not yet confirmed"}.`, 1], [`Amount below S$20,000: ${amount || "not yet confirmed"}.`, 1], [`Tenancy period two years or less: ${duration || "not yet confirmed"}.`, 1], [`Urgency, lockout, harassment, threats, or safety risk: ${urgent || "not yet confirmed"}.`, 1], [`Written contact with the other party: ${contacted || "not yet confirmed"}.`, 1],
  ];
  const can0 = () => {
    if (!intakeRole) return false;
    if (intakeRole === intakeRoles[0] || intakeRole === intakeRoles[1]) return Boolean(issue);
    if (intakeRole === intakeRoles[2]) return helperRole && (helperRole === helperRoles[2] || Boolean(issue));
    return true;
  };
  const canContinue = [can0(), role && want && agreement && residential && amount && duration && urgent && contacted, true, true, true][screen];
  const reset = () => { setScreen(0); setIntakeRole(""); setHelperRole(""); setIssue(""); setRole(""); setWant(""); setAgreement(""); setResidential(""); setAmount(""); setDuration(""); setUrgent(""); setContacted(""); };
  const setIntake = (v) => { setIntakeRole(v); setHelperRole(""); setIssue(""); };
  const setHelper = (v) => { setHelperRole(v); setIssue(""); };

  return <div className="min-h-screen bg-slate-50 text-slate-900"><Header step={screen + 1} total={total} /><main className="mx-auto max-w-5xl px-5 py-8"><div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><div className="flex gap-3"><Info className="mt-0.5 h-5 w-5 shrink-0" /><p>This prototype illustrates a revised flow for academic discussion. It provides general information only and does not decide whether a user has a valid legal claim.</p></div></div>

  {screen === 0 && <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]"><section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-sm font-semibold text-blue-700">Mockup 1 — Role-tailored landlord/tenant intake</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">What is your role in this landlord/tenant issue?</h2><p className="mt-3 text-base leading-7 text-slate-600">Choose the option closest to your situation. This does not decide your legal status.</p><div className="mt-6 grid gap-3">{intakeRoles.map((o) => <Option key={o} selected={intakeRole === o} onClick={() => setIntake(o)}>{o}</Option>)}</div>{intakeRole === intakeRoles[0] && <IssueList options={tenantIssues} issue={issue} setIssue={setIssue} />}{intakeRole === intakeRoles[1] && <IssueList options={landlordIssues} issue={issue} setIssue={setIssue} />}{intakeRole === intakeRoles[2] && <div className="mt-8 space-y-5 rounded-2xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-xl font-semibold text-slate-900">Who are you helping?</h3><div className="grid gap-3">{helperRoles.map((o) => <Option key={o} selected={helperRole === o} onClick={() => setHelper(o)}>{o}</Option>)}</div>{helperRole === helperRoles[0] && <IssueList options={tenantIssues} issue={issue} setIssue={setIssue} />}{helperRole === helperRoles[1] && <IssueList options={landlordIssues} issue={issue} setIssue={setIssue} />}{helperRole === helperRoles[2] && <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4"><div className="flex items-start gap-3"><Users className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" /><div><h4 className="font-semibold text-blue-950">No problem.</h4><p className="mt-1 text-sm leading-6 text-blue-950">We will ask a few questions to guide you.</p></div></div></div>}</div>}{intakeRole === intakeRoles[3] && <div className="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-5"><h3 className="text-xl font-semibold text-blue-950">No problem. We will ask a few questions to guide you.</h3><p className="mt-3 text-sm leading-6 text-blue-950">Examples:</p><ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-blue-950">{unsureExamples.map((x) => <li key={x}>{x}</li>)}</ul></div>}</section><aside className="space-y-4"><Card icon={ShieldCheck} title="Justice rationale">This design improves neutrality because it does not assume the user is a tenant. It also improves voice because users begin with ordinary facts, not legal remedies.</Card><Card icon={AlertTriangle} title="Current issue addressed">The current DGQ asks, “I would like the other party to…,” which requires early remedy classification. A problem-first redesign should also avoid assuming that every user is a tenant.</Card></aside></div>}

  {screen === 1 && <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-sm font-semibold text-blue-700">Mockup 2 — Prioritised triage questions</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">No problem. We will ask a few questions to guide you.</h2><p className="mt-3 text-base leading-7 text-slate-600">These questions help route the user without requiring them to know legal categories or predict the correct forum. SCT is one possible result, not the default result.</p><div className="mt-7 grid gap-6 lg:grid-cols-2"><Question title="1. Please confirm or change your role in this situation." options={roles} value={role} setValue={setRole} /><Question title="2. What do you mainly want?" options={wants} value={want} setValue={setWant} /><Question title="3. Is there a written tenancy agreement?" options={["Yes", "No", "I am not sure"]} value={agreement} setValue={setAgreement} /><Question title="4. Is this a residential tenancy?" options={["Yes", "No", "I am not sure"]} value={residential} setValue={setResidential} /><Question title="5. Is the amount involved below S$20,000?" options={["Yes", "No", "I am not sure"]} value={amount} setValue={setAmount} /><Question title="6. Is the tenancy period two years or less?" options={["Yes", "No", "I am not sure"]} value={duration} setValue={setDuration} /><Question title="7. Is there urgency, lockout, harassment, threats, or safety risk?" options={["Yes", "No", "I am not sure"]} value={urgent} setValue={setUrgent} /><Question title="8. Have you contacted the other party in writing?" options={["Yes", "No", "I am not sure"]} value={contacted} setValue={setContacted} /></div></section>}

  {screen === 2 && <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]"><section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-sm font-semibold text-blue-700">Mockup 3 — Prioritised result card</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{result.title}</h2><div className="mt-4 flex flex-wrap gap-2"><Pill>{result.priority}</Pill><Pill>{result.likelySct ? "SCT is possible" : "Not routed directly to SCT"}</Pill></div><div className={`mt-5 rounded-2xl p-4 text-sm leading-6 ${result.tone === "urgent" ? "border border-amber-200 bg-amber-50 text-amber-950" : result.tone === "sct" ? "border border-blue-200 bg-blue-50 text-blue-950" : "border border-slate-200 bg-slate-50 text-slate-800"}`}><ul className="list-disc space-y-2 pl-5">{result.bullets.map((b) => <li key={b}>{b}</li>)}</ul>{result.secondary && <p className="mt-3 rounded-xl bg-white/70 p-3 font-medium">{result.secondary}</p>}</div>{result.modifiers.length > 0 && <div className="mt-6 space-y-3"><h3 className="font-semibold text-slate-900">Additional notes</h3>{result.modifiers.map((m) => <div key={m.title} className="rounded-2xl border border-slate-200 bg-white p-4"><h4 className="text-sm font-semibold text-slate-900">{m.title}</h4><p className="mt-1 text-sm leading-6 text-slate-700">{m.text}</p></div>)}</div>}</section><aside className="space-y-5"><Card icon={Route} title="Routing rule">SCT is used only if the answers clearly satisfy: no urgent safety risk, residential tenancy, tenancy period two years or less, and amount below S$20,000. Otherwise, the result asks for more information or points to another route.</Card><Card icon={ClipboardList} title="Prepare before taking action"><ul className="list-disc space-y-2 pl-5"><li>tenancy agreement or proof of occupation;</li><li>online listing screenshots;</li><li>photos or videos of room condition or damage;</li><li>messages with landlord, tenant, or agent;</li><li>deposit, rent, repair, and payment records;</li><li>repair quotations, receipts, or demands.</li></ul></Card><Card icon={ShieldCheck} title="Justice rationale">The result is no longer authoritative-looking SCT by default. It makes forum routing conditional, visible, and easier for one-shot users to understand.</Card></aside></div>}

  {screen === 3 && <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]"><section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-sm font-semibold text-blue-700">Mockup 4 — Explainable triage summary and editable assumptions check</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Before you continue, check what we understood.</h2><p className="mt-3 text-base leading-7 text-slate-600">Review the assumptions below. A mistaken answer can change the suggested pathway, so each answer can be edited before continuing.</p><div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">{assumptions.map(([label, edit], i) => <div key={label} className={`flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between ${i !== assumptions.length - 1 ? "border-b border-slate-200" : ""}`}><div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" /><p className="text-sm font-medium leading-6 text-slate-800">{label}</p></div><button onClick={() => setScreen(edit)} className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><Edit3 className="h-3.5 w-3.5" />Edit answer</button></div>)}</div></section><aside className="space-y-5"><Card icon={Info} title="Why you are seeing this result"><p className="font-semibold text-slate-900">{result.title}</p><p className="mt-2">This result appears because the prototype applies the prioritised routing rules in order, rather than using SCT as a fallback. This tool does not decide whether the user has a valid claim.</p></Card><Card icon={ShieldCheck} title="Justice rationale">This supports trustworthiness and neutrality. It shows how the pathway was generated and gives the user a chance to correct mistakes before acting.</Card><Card icon={AlertTriangle} title="Current issue addressed">A result can feel authoritative even when it depends on uncertain or mistaken answers. An assumptions check makes the limits of the pathway clearer.</Card></aside></div>}

  {screen === 4 && <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-sm font-semibold text-blue-700">Mockup 5 — Warm handoff to legal help finder</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">We will carry over your selected topics.</h2><p className="mt-3 text-base leading-7 text-slate-600">You should not have to search again from scratch. These topic tags can help locate relevant information and support options.</p><div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5"><h3 className="font-semibold text-slate-900">Selected topics</h3><div className="mt-3 flex flex-wrap gap-2">{topics.map((t) => <Pill key={t}>{t}</Pill>)}</div></div><div className="mt-6 grid gap-5 lg:grid-cols-2"><Card icon={CheckCircle2} title="If results are found">These resources may be relevant to your situation. Please check eligibility and scope before relying on them.</Card><Card icon={HelpCircle} title="If no exact result is found"><p className="mb-3">We could not find an exact match. Try these broader pathways:</p><ul className="list-disc space-y-2 pl-5"><li>urgent help or protection route;</li><li>property agent / CEA-related route;</li><li>landlord/tenant dispute;</li><li>possible SCT only if the conditions are clearly met;</li><li>civil court, mediation, or legal advice;</li><li>preparing evidence.</li></ul></Card></div><div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5"><div className="flex items-start gap-3"><ExternalLink className="mt-1 h-5 w-5 shrink-0 text-blue-700" /><div><h3 className="font-semibold text-blue-950">Justice rationale</h3><p className="mt-1 text-sm leading-6 text-blue-950">This reduces referral friction and avoids a “No items found” dead end, especially for users who do not know legal keywords or the correct forum.</p></div></div></div></section>}

  <footer className="mt-8 flex items-center justify-between gap-3"><button onClick={screen === 0 ? reset : () => setScreen((s) => Math.max(s - 1, 0))} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"><ArrowLeft className="h-4 w-4" />{screen === 0 ? "Reset" : "Back"}</button>{screen < total - 1 ? <button onClick={() => setScreen((s) => Math.min(s + 1, total - 1))} disabled={!canContinue} className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300">Continue<ArrowRight className="h-4 w-4" /></button> : <button onClick={reset} className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-800">Start again</button>}</footer>
  </main></div>;
}
