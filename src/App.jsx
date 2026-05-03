import React, { useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, ClipboardList, Edit3, ExternalLink, HelpCircle, Info, ShieldCheck } from "lucide-react";

const issueOptions = [
  "The room or property was not as advertised.",
  "Something broke and the landlord refuses to repair it.",
  "I want my deposit back.",
  "I want to end the tenancy early.",
  "I received a demand for rent, repair costs, or damages.",
  "I am being asked to leave.",
  "I am not sure.",
];

const roles = ["Tenant", "Landlord", "Property agent", "Helping someone else", "I am not sure"];
const wants = ["Repair", "Compensation", "Deposit return", "End tenancy early", "Respond to a demand", "Understand options"];

const selectedTopicMap = {
  "The room or property was not as advertised.": ["misrepresentation", "tenancy terms"],
  "Something broke and the landlord refuses to repair it.": ["repair issue", "property condition"],
  "I want my deposit back.": ["deposit", "payment dispute"],
  "I want to end the tenancy early.": ["early termination", "tenancy terms"],
  "I received a demand for rent, repair costs, or damages.": ["rent or damage demand", "responding to a claim"],
  "I am being asked to leave.": ["asked to leave", "urgent housing concern"],
  "I am not sure.": ["uncertain issue", "guided triage"],
};

function Pill({ children }) {
  return <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700">{children}</span>;
}

function SectionCard({ icon: Icon, title, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        {Icon && <Icon className="h-5 w-5 text-blue-700" />}
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      </div>
      <div className="text-sm leading-6 text-slate-700">{children}</div>
    </section>
  );
}

function OptionButton({ selected, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-xl border p-4 text-left text-sm transition hover:border-blue-400 hover:bg-blue-50 ${
        selected ? "border-blue-600 bg-blue-50 ring-2 ring-blue-100" : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border ${selected ? "border-blue-600 bg-blue-600" : "border-slate-300"}`} />
        <span className="font-medium text-slate-800">{children}</span>
      </div>
    </button>
  );
}

function Header({ step, total }) {
  const percent = Math.round((step / total) * 100);
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-5xl px-5 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Student prototype</p>
            <h1 className="mt-1 text-xl font-bold text-slate-950">Redesigned Digital Legal Help Intake</h1>
            <p className="mt-1 text-sm text-slate-600">Illustrative mockup only — not an official Singapore Courts page.</p>
          </div>
          <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">Step {step} of {total}</div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-blue-700 transition-all" style={{ width: `${percent}%` }} />
        </div>
      </div>
    </header>
  );
}

export default function App() {
  const [screen, setScreen] = useState(0);
  const [issue, setIssue] = useState("");
  const [role, setRole] = useState("");
  const [want, setWant] = useState("");
  const [agreement, setAgreement] = useState("");
  const [residential, setResidential] = useState("");
  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState("");
  const [urgent, setUrgent] = useState("");
  const [contacted, setContacted] = useState("");

  const totalScreens = 5;
  const selectedTopics = useMemo(() => {
    const base = [role || "role not selected", "landlord/tenant dispute"];
    if (residential === "Yes") base.push("residential tenancy");
    if (amount === "Yes") base.push("SCT information");
    if (issue) base.push(...(selectedTopicMap[issue] || []));
    if (want) base.push(want.toLowerCase());
    if (urgent === "Yes") base.push("urgent support");
    base.push("low-cost help", "limited English support");
    return [...new Set(base.filter(Boolean))];
  }, [role, residential, amount, issue, want, urgent]);

  const assumptions = [
    { label: `You are ${role ? role.toLowerCase() : "a tenant"}.`, editScreen: 1 },
    { label: `Your issue concerns ${residential === "No" ? "a non-residential or uncertain tenancy" : "a residential tenancy"}.`, editScreen: 1 },
    { label: `The amount involved is ${amount === "No" ? "not confirmed to be below S$20,000" : "below S$20,000"}.`, editScreen: 1 },
    { label: `The tenancy period is ${duration === "No" ? "not confirmed to be two years or less" : "two years or less"}.`, editScreen: 1 },
    { label: `You are looking for ${want ? want.toLowerCase() : "repair, early termination, deposit, or compensation-related"} information.`, editScreen: 1 },
    { label: `There is ${urgent === "Yes" ? "an immediate urgency, lockout, threat, harassment, or safety issue" : "no immediate lockout, threat, harassment, or safety issue"}.`, editScreen: 1 },
  ];

  const canContinue = [
    Boolean(issue),
    Boolean(role) && Boolean(want) && Boolean(agreement) && Boolean(residential) && Boolean(amount) && Boolean(duration) && Boolean(urgent) && Boolean(contacted),
    true,
    true,
    true,
  ][screen];

  const next = () => setScreen((s) => Math.min(s + 1, totalScreens - 1));
  const back = () => setScreen((s) => Math.max(s - 1, 0));
  const restart = () => {
    setScreen(0);
    setIssue("");
    setRole("");
    setWant("");
    setAgreement("");
    setResidential("");
    setAmount("");
    setDuration("");
    setUrgent("");
    setContacted("");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header step={screen + 1} total={totalScreens} />

      <main className="mx-auto max-w-5xl px-5 py-8">
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <div className="flex gap-3">
            <Info className="mt-0.5 h-5 w-5 shrink-0" />
            <p>
              This prototype illustrates a revised flow for academic discussion. It provides general information only and does not decide whether a user has a valid legal claim.
            </p>
          </div>
        </div>

        {screen === 0 && (
          <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-blue-700">Mockup 1 — Problem-first intake</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Tell us what is happening.</h2>
              <p className="mt-3 text-base leading-7 text-slate-600">
                You do not need to know the legal category. Choose the option closest to your situation.
              </p>
              <div className="mt-6 grid gap-3">
                {issueOptions.map((option) => (
                  <OptionButton key={option} selected={issue === option} onClick={() => setIssue(option)}>
                    {option}
                  </OptionButton>
                ))}
              </div>
            </section>

            <aside className="space-y-4">
              <SectionCard icon={ShieldCheck} title="Justice rationale">
                This gives the user voice before legal classification and reduces premature remedy classification for one-shot users.
              </SectionCard>
              <SectionCard icon={AlertTriangle} title="Current issue addressed">
                The current remedy-first phrasing requires users to know what legal outcome they should seek before they understand the available pathway.
              </SectionCard>
            </aside>
          </div>
        )}

        {screen === 1 && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-blue-700">Mockup 2 — Supported “I am not sure” branch</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">No problem. We will ask a few questions to guide you.</h2>
            <p className="mt-3 text-base leading-7 text-slate-600">
              These questions help route the user without requiring them to know legal categories or predict the correct forum.
            </p>

            <div className="mt-7 grid gap-6 lg:grid-cols-2">
              <Question title="1. Are you the tenant, landlord, or agent?" options={roles} value={role} setValue={setRole} />
              <Question title="2. What do you mainly want?" options={wants} value={want} setValue={setWant} />
              <Question title="3. Is there a written tenancy agreement?" options={["Yes", "No", "I am not sure"]} value={agreement} setValue={setAgreement} />
              <Question title="4. Is this a residential tenancy?" options={["Yes", "No", "I am not sure"]} value={residential} setValue={setResidential} />
              <Question title="5. Is the amount involved below S$20,000?" options={["Yes", "No", "I am not sure"]} value={amount} setValue={setAmount} />
              <Question title="6. Is the tenancy period two years or less?" options={["Yes", "No", "I am not sure"]} value={duration} setValue={setDuration} />
              <Question title="7. Is there urgency, lockout, harassment, threats, or safety risk?" options={["Yes", "No", "I am not sure"]} value={urgent} setValue={setUrgent} />
              <Question title="8. Have you contacted the other party in writing?" options={["Yes", "No", "I am not sure"]} value={contacted} setValue={setContacted} />
            </div>
          </section>
        )}

        {screen === 2 && (
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-blue-700">Mockup 3 — Next-action card</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Your possible next step: landlord/tenant small claim information</h2>
              <p className="mt-4 rounded-2xl bg-blue-50 p-4 text-sm leading-6 text-blue-950">
                Based on your answers, SCT information may be relevant if your claim fits the conditions below. You may also consider negotiation or legal help if any red flags apply.
              </p>

              <div className="mt-6 space-y-5">
                <Checklist title="This pathway may be relevant if:" items={[
                  "your dispute concerns a residential tenancy;",
                  "the amount claimed is within the relevant SCT limit;",
                  "the tenancy period fits the SCT conditions;",
                  "your issue can be framed as a claim that SCT can hear.",
                ]} />
                <Checklist title="Prepare before taking action:" items={[
                  "tenancy agreement;",
                  "online listing screenshots;",
                  "photos or videos of the room condition;",
                  "messages with landlord or agent;",
                  "repair requests and refusal;",
                  "deposit and payment records;",
                  "repair quotations or receipts.",
                ]} />
              </div>
            </section>

            <aside className="space-y-5">
              <SectionCard icon={ClipboardList} title="Consider writing first">
                Ask the landlord in writing for repair, compensation, deposit return, or early termination. Keep proof of sending.
              </SectionCard>
              <SectionCard icon={AlertTriangle} title="Get legal help if">
                <ul className="list-disc space-y-2 pl-5">
                  <li>you face lockout, harassment, threats, or safety issues;</li>
                  <li>the amount or tenancy period appears outside SCT limits;</li>
                  <li>the other party has made a counterclaim;</li>
                  <li>you are unsure about deadlines or documents;</li>
                  <li>you need representation or legal advice.</li>
                </ul>
              </SectionCard>
              <SectionCard icon={ShieldCheck} title="Justice rationale">
                This helps the user move from information to action while avoiding legal advice or prediction of success.
              </SectionCard>
            </aside>
          </div>
        )}

        {screen === 3 && (
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-blue-700">Mockup 4 — Explainable triage summary and editable assumptions check</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Before you continue, check what we understood.</h2>
              <p className="mt-3 text-base leading-7 text-slate-600">
                Review the assumptions below. A mistaken answer can change the suggested pathway, so each answer can be edited before continuing.
              </p>

              <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
                {assumptions.map((item, index) => (
                  <div key={item.label} className={`flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between ${index !== assumptions.length - 1 ? "border-b border-slate-200" : ""}`}>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
                      <p className="text-sm font-medium leading-6 text-slate-800">{item.label}</p>
                    </div>
                    <button
                      onClick={() => setScreen(item.editScreen)}
                      className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      Edit answer
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <aside className="space-y-5">
              <SectionCard icon={Info} title="Why you are seeing this result">
                SCT information may be relevant because your answers suggest a landlord/tenant dispute within possible SCT conditions. This tool does not decide whether you have a valid claim. Please check the conditions below and seek legal help if any answer is uncertain.
              </SectionCard>
              <SectionCard icon={ShieldCheck} title="Justice rationale">
                This supports trustworthiness and neutrality. It shows the user how the pathway was generated and gives the user a chance to correct mistakes. It also reduces one-shotter disadvantage because legally relevant assumptions are visible instead of hidden.
              </SectionCard>
              <SectionCard icon={AlertTriangle} title="Current issue addressed">
                A result can feel authoritative even when it depends on uncertain or mistaken answers. An assumptions check makes the limits of the pathway clearer.
              </SectionCard>
            </aside>
          </div>
        )}

        {screen === 4 && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-blue-700">Mockup 5 — Warm handoff to legal help finder</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">We will carry over your selected topics.</h2>
            <p className="mt-3 text-base leading-7 text-slate-600">
              You should not have to search again from scratch. These topic tags can help locate relevant information and support options.
            </p>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="font-semibold text-slate-900">Selected topics</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedTopics.map((topic) => <Pill key={topic}>{topic}</Pill>)}
              </div>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              <SectionCard icon={CheckCircle2} title="If results are found">
                These resources may be relevant to your situation. Please check eligibility and scope before relying on them.
              </SectionCard>
              <SectionCard icon={HelpCircle} title="If no exact result is found">
                <p className="mb-3">We could not find an exact match. Try these broader pathways:</p>
                <ul className="list-disc space-y-2 pl-5">
                  <li>landlord/tenant dispute;</li>
                  <li>small claim;</li>
                  <li>negotiation or mediation;</li>
                  <li>free or low-cost legal help;</li>
                  <li>preparing evidence.</li>
                </ul>
              </SectionCard>
            </div>

            <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
              <div className="flex items-start gap-3">
                <ExternalLink className="mt-1 h-5 w-5 shrink-0 text-blue-700" />
                <div>
                  <h3 className="font-semibold text-blue-950">Justice rationale</h3>
                  <p className="mt-1 text-sm leading-6 text-blue-950">
                    This reduces referral friction and avoids a “No items found” dead end, especially for users who do not know legal keywords.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        <footer className="mt-8 flex items-center justify-between gap-3">
          <button
            onClick={screen === 0 ? restart : back}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            {screen === 0 ? "Reset" : "Back"}
          </button>
          {screen < totalScreens - 1 ? (
            <button
              onClick={next}
              disabled={!canContinue}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={restart}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-800"
            >
              Start again
            </button>
          )}
        </footer>
      </main>
    </div>
  );
}

function Question({ title, options, value, setValue }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <div className="mt-3 grid gap-2">
        {options.map((option) => (
          <label key={option} className="flex cursor-pointer items-center gap-3 rounded-xl bg-white p-3 text-sm text-slate-800 ring-1 ring-slate-200 hover:ring-blue-300">
            <input
              type="radio"
              checked={value === option}
              onChange={() => setValue(option)}
              className="h-4 w-4 accent-blue-700"
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function Checklist({ title, items }) {
  return (
    <div>
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-700">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
