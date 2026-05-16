import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Check,
  GitBranch,
  GitPullRequest,
  KeyRound,
  Lightbulb,
  Package,
  Sparkles,
  Star,
  Terminal,
  Zap,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  landingBtnPrimaryLg,
  landingBtnSecondary,
  landingBtnSecondaryLg,
} from "@/lib/landing-buttons";
import { cn } from "@/lib/utils";
import { GitHubSummarizerDemo } from "./components/GitHubSummarizerDemo";
import { LandingNav } from "./components/LandingNav";

const features = [
  {
    title: "Repo summaries",
    description:
      "Plain-language overviews of what a project does, who it is for, and how the pieces fit together.",
    icon: BookOpen,
  },
  {
    title: "Stars & momentum",
    description:
      "Track attention and growth so you can spot rising libraries and long-lived staples worth watching.",
    icon: Star,
  },
  {
    title: "Cool facts",
    description:
      "Human-readable tidbits—ecosystem role, notable dependencies, and what makes the repo interesting.",
    icon: Lightbulb,
  },
  {
    title: "Important pull requests",
    description:
      "Surfaces merges and discussions that matter: large changes, security fixes, and breaking API updates.",
    icon: GitPullRequest,
  },
  {
    title: "Version & release updates",
    description:
      "Stay on top of tags, releases, and semver signals without digging through compare views by hand.",
    icon: Package,
  },
  {
    title: "Built for OSS",
    description:
      "Designed around public GitHub workflows so teams can monitor upstreams they rely on in production.",
    icon: GitBranch,
  },
] as const;

const steps = [
  {
    step: "01",
    title: "Sign in & create a key",
    description: "Use Google OAuth, then mint an API key from your dashboard in one click.",
  },
  {
    step: "02",
    title: "Point at any public repo",
    description: "Send a GitHub URL to the summarizer—README content is fetched and analyzed automatically.",
  },
  {
    step: "03",
    title: "Ship with context",
    description: "Get summaries, cool facts, stars, releases, and license metadata in a single JSON response.",
  },
] as const;

const plans = [
  {
    name: "Free",
    price: "$0",
    cadence: "forever",
    description: "Try the analyzer on a small set of repos and share read-only summaries with your team.",
    highlights: [
      "Up to 3 tracked repositories",
      "Weekly digest email",
      "Summary + stars snapshot",
      "Community support",
    ],
    cta: "Sign up free",
    href: "/login",
    comingSoon: false,
    featured: false,
  },
  {
    name: "Pro",
    price: "$19",
    cadence: "per month",
    description: "For maintainers and platform teams who need timely PR and release intelligence.",
    highlights: [
      "Up to 25 tracked repositories",
      "Daily refresh + PR highlights",
      "Version & release alerts",
      "Export to Slack (coming soon)",
      "Email support",
    ],
    cta: "Start Pro trial",
    href: "/login",
    comingSoon: true,
    featured: true,
  },
  {
    name: "Team",
    price: "Custom",
    cadence: "",
    description: "Org-wide tracking, SSO, and higher limits for companies shipping on open source.",
    highlights: [
      "Unlimited seats (fair use)",
      "Custom repo and org limits",
      "Priority ingestion & SLAs",
      "Dedicated success engineer",
    ],
    cta: "Talk to sales",
    href: "/login",
    comingSoon: true,
    featured: false,
  },
] as const;

function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-600 dark:text-violet-400">
      {children}
    </p>
  );
}

function SectionHeading({
  title,
  description,
  className,
}: {
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto max-w-2xl text-center", className)}>
      <h2 className="font-heading mt-3 text-balance text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl lg:text-4xl dark:text-foreground">
        {title}
      </h2>
      <p className="mt-4 text-pretty text-base leading-relaxed text-zinc-600 sm:text-lg dark:text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-full flex-col bg-[#fafaf9] text-zinc-900 dark:bg-[#0c0a12] dark:text-foreground">
      {/* Announcement */}
      <div className="relative z-[2] border-b border-violet-500/20 bg-gradient-to-r from-violet-700 via-violet-600 to-indigo-600 px-4 py-2.5 text-center text-sm text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-1.5">
          <Sparkles className="size-4 shrink-0 opacity-90" aria-hidden />
          <span className="font-medium">GitHub README summarizer API — live in the playground</span>
          <Link
            href="/playground"
            className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold ring-1 ring-white/25 transition hover:bg-white/25"
          >
            Try it
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>
      </div>

      <LandingNav />

      <main className="relative flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-zinc-200/70 dark:border-white/5">
          <div
            className="pointer-events-none absolute inset-0 -z-10"
            aria-hidden
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(124,58,237,0.18),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(124,58,237,0.35),transparent)]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_55%,transparent_100%)]" />
            <div className="absolute -right-32 top-24 h-96 w-96 rounded-full bg-amber-300/30 blur-3xl dark:bg-amber-500/10" />
            <div className="absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-violet-400/20 blur-3xl dark:bg-violet-600/15" />
          </div>

          <div className="mx-auto max-w-6xl px-4 pb-20 pt-14 sm:px-6 sm:pb-28 sm:pt-20 lg:pt-24">
            <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
              <div className="text-center lg:text-left">
                <p className="inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-violet-50/90 px-3.5 py-1.5 text-xs font-medium text-violet-900 shadow-sm dark:border-violet-500/30 dark:bg-violet-950/50 dark:text-violet-100">
                  <Sparkles className="size-3.5 text-violet-600 dark:text-violet-400" aria-hidden />
                  Dandi GitHub Analyzer
                </p>
                <h1 className="font-heading mt-6 text-balance text-4xl font-bold tracking-tight text-zinc-950 sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1] dark:text-white">
                  Understand any open-source repo{" "}
                  <span className="bg-gradient-to-r from-violet-600 via-violet-500 to-indigo-500 bg-clip-text text-transparent dark:from-violet-400 dark:via-violet-300 dark:to-indigo-300">
                    in minutes
                  </span>
                </h1>
                <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-zinc-600 sm:text-lg lg:mx-0 lg:text-left dark:text-zinc-400">
                  Summaries, stars, memorable facts, high-signal pull requests, and version updates—curated from
                  public GitHub so your team ships with clearer upstream context.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                  <Link href="/login" className={landingBtnPrimaryLg}>
                    <Terminal className="size-[1.125rem] opacity-90" aria-hidden />
                    Get started free
                  </Link>
                  <Link href="#api-demo" className={landingBtnSecondaryLg}>
                    <Zap className="size-[1.125rem] opacity-80" aria-hidden />
                    Live API demo
                  </Link>
                </div>
                <p className="mt-5 text-xs text-zinc-500 lg:text-left dark:text-zinc-500">
                  Sign in with Google · Manage keys in your dashboard · Try{" "}
                  <Link href="/playground" className="font-medium text-violet-600 hover:underline dark:text-violet-400">
                    API Playground
                  </Link>
                </p>
                <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-zinc-200/80 pt-8 dark:border-white/10 sm:max-w-md lg:max-w-none">
                  {[
                    { label: "API endpoint", value: "1" },
                    { label: "OAuth sign-in", value: "Google" },
                    { label: "Default demo", value: "GPT-R" },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <dt className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
                        {label}
                      </dt>
                      <dd className="mt-1 font-heading text-lg font-semibold text-zinc-900 dark:text-white">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Hero preview card */}
              <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-violet-500/20 via-transparent to-amber-400/15 blur-2xl dark:from-violet-500/30" />
                <Card className="relative overflow-hidden border-zinc-200/90 bg-white/90 shadow-2xl shadow-violet-950/10 backdrop-blur-sm dark:border-white/10 dark:bg-zinc-900/80 dark:shadow-black/40">
                  <div className="flex items-center gap-2 border-b border-zinc-100 bg-zinc-50/80 px-4 py-3 dark:border-white/5 dark:bg-zinc-950/60">
                    <span className="size-2.5 rounded-full bg-red-400/90" />
                    <span className="size-2.5 rounded-full bg-amber-400/90" />
                    <span className="size-2.5 rounded-full bg-emerald-400/90" />
                    <span className="ml-2 font-mono text-[11px] text-zinc-500 dark:text-zinc-500">
                      gpt-researcher · summary
                    </span>
                  </div>
                  <CardContent className="space-y-4 p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-500">Repository</p>
                        <p className="mt-0.5 font-mono text-sm font-medium text-zinc-900 dark:text-white">
                          assafelovic/gpt-researcher
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900 ring-1 ring-amber-200/80 dark:bg-amber-950/50 dark:text-amber-200 dark:ring-amber-500/30">
                        <Star className="size-3 fill-current" aria-hidden />
                        12k+
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                      Autonomous research agent that browses the web, gathers sources, and produces cited reports—built
                      for developers evaluating AI research stacks.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {["MIT license", "Active releases", "README summarized"].map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-800 ring-1 ring-violet-100 dark:bg-violet-950/40 dark:text-violet-200 dark:ring-violet-500/20"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50/80 p-3 dark:border-white/10 dark:bg-zinc-950/40">
                      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-500">Cool fact</p>
                      <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                        Combines LLM planning with live web retrieval—useful for competitive scans and literature reviews.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-b border-zinc-200/70 bg-white py-16 dark:border-white/5 dark:bg-zinc-950/50 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionEyebrow>How it works</SectionEyebrow>
            <SectionHeading
              title="From API key to insight in three steps"
              description="No sprawling setup—authenticate, call the summarizer, and wire the JSON into your own tools or dashboards."
            />
            <ol className="mt-14 grid gap-6 md:grid-cols-3">
              {steps.map(({ step, title, description }) => (
                <li
                  key={step}
                  className="group relative rounded-2xl border border-zinc-200/90 bg-[#fafaf9] p-6 shadow-sm transition hover:border-violet-200 hover:shadow-md dark:border-white/10 dark:bg-zinc-900/50 dark:hover:border-violet-500/30"
                >
                  <span className="font-heading text-3xl font-bold text-violet-200 dark:text-violet-900">{step}</span>
                  <h3 className="mt-3 font-heading text-lg font-semibold text-zinc-900 dark:text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-b border-zinc-200/70 py-16 sm:py-24 dark:border-white/5">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionEyebrow>Features</SectionEyebrow>
            <SectionHeading
              title="Everything you wish the README hinted at"
              description="Dandi connects activity, traction, and releases so your team stays aligned on upstream risk and opportunity."
            />
            <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ title, description, icon: Icon }) => (
                <li key={title}>
                  <Card className="group h-full border-zinc-200/90 bg-white transition-all hover:-translate-y-0.5 hover:border-violet-200/80 hover:shadow-lg hover:shadow-violet-950/5 dark:border-white/10 dark:bg-zinc-900/40 dark:hover:border-violet-500/25">
                    <CardHeader className="pb-2">
                      <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md shadow-violet-500/25 transition group-hover:scale-105">
                        <Icon className="size-5" aria-hidden />
                      </div>
                      <CardTitle className="mt-4 text-lg">{title}</CardTitle>
                      <CardDescription className="text-[15px] leading-relaxed">{description}</CardDescription>
                    </CardHeader>
                  </Card>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Story + sample */}
        <section className="border-b border-zinc-200/70 bg-gradient-to-b from-violet-50/50 to-transparent py-16 dark:border-white/5 dark:from-violet-950/20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
              <div>
                <SectionEyebrow>Why teams use Dandi</SectionEyebrow>
                <h2 className="font-heading mt-3 text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
                  From star count to story
                </h2>
                <p className="mt-4 text-base leading-relaxed text-zinc-600 sm:text-lg dark:text-zinc-400">
                  Whether you are evaluating a dependency, watching a critical upstream, or briefing leadership, Dandi
                  turns raw GitHub signals into narratives your whole organization can use.
                </p>
                <ul className="mt-8 space-y-4">
                  {[
                    "Prioritizes merges and releases that change behavior or security posture.",
                    "Keeps context portable—shareable snapshots instead of a pile of browser tabs.",
                    "Free tier so individuals and small teams can start without a credit card.",
                  ].map((text) => (
                    <li key={text} className="flex gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                        <Check className="size-3" strokeWidth={3} aria-hidden />
                      </span>
                      {text}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/dashboard"
                  className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
                >
                  Open dashboard
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>
              <Card className="border-zinc-200/90 bg-white/95 shadow-xl dark:border-white/10 dark:bg-zinc-900/60">
                <CardHeader className="border-b border-zinc-100 dark:border-white/5">
                  <div className="flex items-center gap-2">
                    <KeyRound className="size-4 text-violet-600 dark:text-violet-400" aria-hidden />
                    <CardTitle className="text-base">Sample insight card</CardTitle>
                  </div>
                  <CardDescription>Illustrative output—not live data.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-5">
                  <p className="font-mono text-sm font-medium">vercel / next.js</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Active React framework with frequent minor releases. Recent focus on Turbopack stability and App
                    Router polish. Notable PR: streaming and partial prerendering improvements.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["Stars trending up", "New patch release", "PR: perf"].map((t) => (
                      <span
                        key={t}
                        className="rounded-lg bg-zinc-100 px-2.5 py-1 text-xs font-medium dark:bg-zinc-800"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <GitHubSummarizerDemo />

        {/* Pricing */}
        <section id="pricing" className="py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionEyebrow>Pricing</SectionEyebrow>
            <SectionHeading
              title="Plans that grow with your stack"
              description="Start on the free tier and upgrade when you need deeper refresh cadence and more repositories."
            />
            <div className="mt-14 grid gap-6 lg:grid-cols-3 lg:items-stretch">
              {plans.map((plan) => (
                <Card
                  key={plan.name}
                  className={cn(
                    "relative flex h-full flex-col transition-shadow",
                    plan.featured
                      ? "border-violet-300/80 bg-white shadow-xl shadow-violet-500/10 ring-2 ring-violet-500/20 dark:border-violet-500/40 dark:bg-zinc-900 dark:ring-violet-500/30 lg:scale-[1.02]"
                      : "border-zinc-200/90 bg-white/80 shadow-md dark:border-white/10 dark:bg-zinc-900/50",
                  )}
                >
                  {plan.comingSoon ? (
                    <div className="absolute right-4 top-4 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-400">
                      Coming soon
                    </div>
                  ) : null}
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription className="min-h-[3rem]">{plan.description}</CardDescription>
                    <div className="pt-3">
                      <span className="font-heading text-4xl font-bold tracking-tight">{plan.price}</span>
                      {plan.cadence ? (
                        <span className="text-muted-foreground"> / {plan.cadence}</span>
                      ) : (
                        <p className="mt-1 text-sm text-muted-foreground">Volume pricing and onboarding</p>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ul className="space-y-3">
                      {plan.highlights.map((item) => (
                        <li key={item} className="flex gap-2.5 text-sm text-zinc-600 dark:text-zinc-400">
                          <Check className="mt-0.5 size-4 shrink-0 text-violet-600 dark:text-violet-400" aria-hidden />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="pt-2">
                    {plan.comingSoon ? (
                      <span
                        className={cn(
                          landingBtnSecondary,
                          "inline-flex h-11 w-full cursor-not-allowed items-center justify-center text-sm font-semibold opacity-50 pointer-events-none",
                        )}
                        aria-disabled="true"
                      >
                        {plan.cta}
                      </span>
                    ) : (
                      <Link
                        href={plan.href}
                        className={cn(
                          plan.featured ? landingBtnPrimaryLg : landingBtnSecondary,
                          "h-11 w-full text-sm font-semibold",
                        )}
                      >
                        {plan.cta}
                      </Link>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 pb-16 sm:px-6 sm:pb-24">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-violet-600 to-indigo-700 px-6 py-12 text-center shadow-2xl shadow-violet-900/25 sm:px-12 sm:py-16">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Ready to read GitHub like a teammate?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-violet-100 sm:text-base">
              Create an account, mint an API key, and start summarizing the repos you depend on—right from the
              playground or your own stack.
            </p>
            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-base font-semibold text-violet-700 shadow-lg transition hover:bg-violet-50"
              >
                <Terminal className="size-5" aria-hidden />
                Sign up free
              </Link>
              <Link
                href="/playground"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-white/30 bg-white/10 px-6 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                API Playground
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200/80 bg-white py-10 dark:border-white/10 dark:bg-zinc-950">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-8 sm:flex-row sm:items-start">
            <div className="text-center sm:text-left">
              <p className="flex items-center justify-center gap-2 font-semibold text-zinc-900 dark:text-white sm:justify-start">
                <span className="flex size-8 items-center justify-center rounded-lg bg-violet-600 text-white">
                  <GitBranch className="size-4" aria-hidden />
                </span>
                Dandi GitHub Analyzer
              </p>
              <p className="mt-2 text-sm text-zinc-500">© {new Date().getFullYear()} All rights reserved.</p>
            </div>
            <nav className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
              <Link href="#features" className="transition hover:text-violet-600 dark:hover:text-violet-400">
                Features
              </Link>
              <Link href="#api-demo" className="transition hover:text-violet-600 dark:hover:text-violet-400">
                API demo
              </Link>
              <Link href="#pricing" className="transition hover:text-violet-600 dark:hover:text-violet-400">
                Pricing
              </Link>
              <Link href="/login" className="transition hover:text-violet-600 dark:hover:text-violet-400">
                Log in
              </Link>
              <Link href="/dashboard" className="transition hover:text-violet-600 dark:hover:text-violet-400">
                Dashboard
              </Link>
              <Link href="/playground" className="transition hover:text-violet-600 dark:hover:text-violet-400">
                Playground
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
