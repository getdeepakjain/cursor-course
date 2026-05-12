import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Check,
  GitBranch,
  GitPullRequest,
  Lightbulb,
  Package,
  Sparkles,
  Star,
  Tag,
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
  },
] as const;

export default function Home() {
  return (
    <div className="flex min-h-full flex-col bg-[#f3f3f1] text-zinc-900 dark:bg-background dark:text-foreground">
      <div className="relative z-[1] flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 border-b border-white/10 bg-gradient-to-r from-fuchsia-600 via-violet-600 to-amber-400 px-4 py-2.5 text-center text-sm font-medium text-white shadow-sm">
        <span className="max-w-[min(100%,42rem)] text-balance">
          Weekly digests and release highlights for the repos you track
        </span>
        <Link
          href="#pricing"
          className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-black/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-black/30"
        >
          See plans
          <ArrowRight className="size-3.5 opacity-90" aria-hidden />
        </Link>
      </div>
      <LandingNav />

      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-zinc-200/80 dark:border-border/60">
          <div
            className="pointer-events-none absolute inset-0 -z-10 opacity-40 dark:opacity-25"
            aria-hidden
          >
            <div className="absolute -left-1/4 top-0 h-[420px] w-[70%] rounded-full bg-gradient-to-br from-violet-200/80 via-transparent to-transparent blur-3xl dark:from-violet-500/20" />
            <div className="absolute -right-1/4 bottom-0 h-[380px] w-[60%] rounded-full bg-gradient-to-tl from-sky-200/70 via-transparent to-transparent blur-3xl dark:from-sky-500/15" />
          </div>
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
            <div className="mx-auto max-w-2xl text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-amber-800/90 dark:text-amber-400/90">
                Dandi GitHub Analyzer
              </p>
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200/70 bg-amber-50/90 px-3 py-1 text-xs font-medium text-amber-950 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-100">
                <Sparkles className="size-3.5 shrink-0 opacity-80" aria-hidden />
                Insights for the open source you depend on
              </p>
              <h1 className="font-heading text-balance text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl lg:text-5xl dark:text-foreground">
                Understand repos{" "}
                <span className="relative inline-block pb-1">
                  <span className="relative z-[1]">in minutes</span>
                  <span
                    className="absolute bottom-0 left-0 right-0 z-0 h-2.5 rounded-sm bg-[#f5d148] dark:bg-amber-400"
                    aria-hidden
                  />
                </span>
                , not hours.
              </h1>
              <p className="mt-4 text-pretty text-base leading-relaxed text-zinc-600 sm:text-lg dark:text-muted-foreground">
                Summaries, stars, memorable facts, high-signal pull requests, and version updates—curated from
                public GitHub activity so you can ship with clearer upstream context.
              </p>
              <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:justify-center">
                <Link href="/login" className={landingBtnPrimaryLg}>
                  <Terminal className="size-[1.125rem] opacity-90" aria-hidden />
                  Sign up free
                </Link>
                <Link href="#pricing" className={landingBtnSecondaryLg}>
                  <Tag className="size-[1.125rem] opacity-80" aria-hidden />
                  View pricing
                </Link>
              </div>
              <p className="mt-4 text-xs text-zinc-500 dark:text-muted-foreground">
                Sign in with Google to open your dashboard and manage API access.
              </p>
            </div>
          </div>
        </section>

        <section id="features" className="border-b border-zinc-200/80 py-16 sm:py-20 dark:border-border/60">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                Everything you wish the README hinted at
              </h2>
              <p className="mt-3 text-zinc-600 sm:text-lg dark:text-muted-foreground">
                Dandi connects the dots across activity, traction, and releases so your team stays aligned on
                upstream risk and opportunity.
              </p>
            </div>
            <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ title, description, icon: Icon }) => (
                <li key={title}>
                  <Card className="h-full border-zinc-200/90 bg-white/60 shadow-sm transition-shadow hover:shadow-lg dark:border-border/80 dark:bg-card">
                    <CardHeader>
                      <div className="flex size-10 items-center justify-center rounded-lg bg-[#f5d148]/90 text-zinc-900 shadow-sm ring-1 ring-amber-300/50 dark:bg-amber-400/90 dark:text-zinc-950 dark:ring-amber-200/40">
                        <Icon className="size-5" aria-hidden />
                      </div>
                      <CardTitle className="mt-2">{title}</CardTitle>
                      <CardDescription className="text-base leading-relaxed">{description}</CardDescription>
                    </CardHeader>
                  </Card>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-b border-zinc-200/80 bg-white/50 py-16 sm:py-20 dark:border-border/60 dark:bg-muted/30">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                  From star count to story
                </h2>
                <p className="mt-3 text-zinc-600 sm:text-lg dark:text-muted-foreground">
                  Whether you are evaluating a dependency, watching a critical upstream, or briefing leadership,
                  Dandi turns raw GitHub signals into narratives your whole organization can use.
                </p>
                <ul className="mt-6 space-y-3 text-sm text-zinc-600 dark:text-muted-foreground">
                  <li className="flex gap-2">
                    <Zap className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
                    <span>Prioritizes merges and releases that change behavior or security posture.</span>
                  </li>
                  <li className="flex gap-2">
                    <Zap className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
                    <span>Keeps context portable—shareable snapshots instead of a pile of browser tabs.</span>
                  </li>
                  <li className="flex gap-2">
                    <Zap className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
                    <span>Free tier so individuals and small teams can start without a credit card.</span>
                  </li>
                </ul>
              </div>
              <Card className="border-dashed border-zinc-300/90 bg-white shadow-lg shadow-zinc-900/5 dark:border-border/80 dark:bg-card/80 dark:shadow-none">
                <CardHeader>
                  <CardTitle className="text-base">Sample insight card</CardTitle>
                  <CardDescription>Illustrative output—not live data.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p className="font-medium text-foreground">next.js / vercel / next.js</p>
                  <p className="leading-relaxed text-muted-foreground">
                    Active React framework with frequent minor releases. Recent focus on Turbopack stability and
                    App Router polish. Notable PR: streaming and partial prerendering improvements in the last
                    minor.
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded-md bg-muted px-2 py-1 font-medium text-foreground">Stars trending up</span>
                    <span className="rounded-md bg-muted px-2 py-1 font-medium text-foreground">New patch release</span>
                    <span className="rounded-md bg-muted px-2 py-1 font-medium text-foreground">PR: perf</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <GitHubSummarizerDemo />

        <section id="pricing" className="py-16 sm:py-20 dark:bg-background">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">Pricing</h2>
              <p className="mt-3 text-zinc-600 sm:text-lg dark:text-muted-foreground">
                Start on the free tier and upgrade when you need deeper refresh cadence and more repositories.
              </p>
            </div>
            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {plans.map((plan) => (
                <Card
                  key={plan.name}
                  className="relative flex h-full flex-col border-zinc-200/90 bg-white/70 shadow-md dark:border-border/80 dark:bg-card"
                >
                  {plan.comingSoon ? (
                    <div className="absolute right-3 top-3 z-10 rounded-full border border-zinc-200/90 bg-white/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-600 shadow-sm backdrop-blur-sm dark:border-border dark:bg-card/95 dark:text-muted-foreground sm:right-4 sm:top-4 sm:text-[11px]">
                      Coming soon
                    </div>
                  ) : null}
                  <CardHeader>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="pt-2">
                      <span className="text-3xl font-semibold tracking-tight">{plan.price}</span>
                      {plan.cadence ? (
                        <span className="text-muted-foreground"> / {plan.cadence}</span>
                      ) : (
                        <p className="mt-1 text-sm text-muted-foreground">Volume pricing and onboarding</p>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ul className="space-y-2.5">
                      {plan.highlights.map((item) => (
                        <li key={item} className="flex gap-2 text-sm text-zinc-600 dark:text-muted-foreground">
                          <Check className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    {plan.comingSoon ? (
                      <span
                        className={cn(
                          landingBtnSecondary,
                          "inline-flex h-10 w-full cursor-not-allowed items-center justify-center text-sm font-semibold opacity-55 pointer-events-none select-none"
                        )}
                        aria-disabled="true"
                      >
                        {plan.cta}
                      </span>
                    ) : (
                      <Link
                        href={plan.href}
                        className={cn(landingBtnSecondary, "h-10 w-full text-sm font-semibold")}
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

        <section className="border-t border-zinc-200/80 bg-white/60 py-12 dark:border-border/60 dark:bg-muted/30">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 text-center sm:flex-row sm:px-6 sm:text-left">
            <div>
              <h2 className="font-heading text-lg font-semibold tracking-tight text-zinc-950 sm:text-xl dark:text-foreground">
                Ready to read GitHub like a teammate?
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-muted-foreground">
                Create an account, connect the repos you care about, and ship with clearer upstream context.
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:shrink-0">
              <Link href="/login" className={landingBtnPrimaryLg}>
                <Terminal className="size-[1.125rem] opacity-90" aria-hidden />
                Sign up
              </Link>
              <Link href="/login" className={landingBtnSecondaryLg}>
                Log in
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200/90 py-8 dark:border-border/80">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-zinc-600 dark:text-muted-foreground sm:flex-row sm:px-6">
          <p className="flex items-center gap-2">
            <GitBranch className="size-4" aria-hidden />
            <span>© {new Date().getFullYear()} Dandi GitHub Analyzer</span>
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/login" className="hover:text-foreground">
              Log in
            </Link>
            <Link href="/dashboard" className="hover:text-foreground">
              Dashboard
            </Link>
            <Link href="/playground" className="hover:text-foreground">
              Playground
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
