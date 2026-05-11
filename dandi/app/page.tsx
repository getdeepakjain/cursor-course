import Link from "next/link";
import {
  BookOpen,
  Check,
  GitBranch,
  GitPullRequest,
  Lightbulb,
  Package,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
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
    featured: false,
  },
] as const;

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <LandingNav />

      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-border/60">
          <div
            className="pointer-events-none absolute inset-0 -z-10 opacity-40 dark:opacity-25"
            aria-hidden
          >
            <div className="absolute -left-1/4 top-0 h-[420px] w-[70%] rounded-full bg-gradient-to-br from-violet-200/80 via-transparent to-transparent blur-3xl dark:from-violet-500/20" />
            <div className="absolute -right-1/4 bottom-0 h-[380px] w-[60%] rounded-full bg-gradient-to-tl from-sky-200/70 via-transparent to-transparent blur-3xl dark:from-sky-500/15" />
          </div>
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
            <div className="mx-auto max-w-2xl text-center">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
                <Sparkles className="size-3.5 shrink-0 text-foreground/70" aria-hidden />
                Insights for the open source you depend on
              </p>
              <h1 className="font-heading text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                Dandi GitHub Analyzer
              </h1>
              <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
                Summaries, stars, memorable facts, high-signal pull requests, and version updates—curated from
                public GitHub activity so you can understand a repo in minutes, not hours.
              </p>
              <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                <Link href="/login" className={cn(buttonVariants({ variant: "default", size: "lg" }), "w-full sm:w-auto")}>
                  Sign up
                </Link>
                <Link
                  href="#pricing"
                  className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full sm:w-auto")}
                >
                  View pricing
                </Link>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Sign in with Google to open your dashboard and manage API access.
              </p>
            </div>
          </div>
        </section>

        <section id="features" className="border-b border-border/60 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                Everything you wish the README hinted at
              </h2>
              <p className="mt-3 text-muted-foreground sm:text-lg">
                Dandi connects the dots across activity, traction, and releases so your team stays aligned on
                upstream risk and opportunity.
              </p>
            </div>
            <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ title, description, icon: Icon }) => (
                <li key={title}>
                  <Card className="h-full border-border/80 shadow-none transition-shadow hover:shadow-md">
                    <CardHeader>
                      <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-foreground">
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

        <section className="border-b border-border/60 bg-muted/30 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                  From star count to story
                </h2>
                <p className="mt-3 text-muted-foreground sm:text-lg">
                  Whether you are evaluating a dependency, watching a critical upstream, or briefing leadership,
                  Dandi turns raw GitHub signals into narratives your whole organization can use.
                </p>
                <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <Zap className="mt-0.5 size-4 shrink-0 text-foreground" aria-hidden />
                    <span>Prioritizes merges and releases that change behavior or security posture.</span>
                  </li>
                  <li className="flex gap-2">
                    <Zap className="mt-0.5 size-4 shrink-0 text-foreground" aria-hidden />
                    <span>Keeps context portable—shareable snapshots instead of a pile of browser tabs.</span>
                  </li>
                  <li className="flex gap-2">
                    <Zap className="mt-0.5 size-4 shrink-0 text-foreground" aria-hidden />
                    <span>Free tier so individuals and small teams can start without a credit card.</span>
                  </li>
                </ul>
              </div>
              <Card className="border-dashed border-border/80 bg-card/80 shadow-sm">
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

        <section id="pricing" className="py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">Pricing</h2>
              <p className="mt-3 text-muted-foreground sm:text-lg">
                Start on the free tier and upgrade when you need deeper refresh cadence and more repositories.
              </p>
            </div>
            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {plans.map((plan) => (
                <Card
                  key={plan.name}
                  className={cn(
                    "relative flex h-full flex-col border-border/80 shadow-sm",
                    plan.featured && "border-primary/40 ring-2 ring-primary/20"
                  )}
                >
                  {plan.featured ? (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">
                      Popular
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
                        <li key={item} className="flex gap-2 text-sm text-muted-foreground">
                          <Check className="mt-0.5 size-4 shrink-0 text-foreground" aria-hidden />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Link
                      href={plan.href}
                      className={cn(
                        buttonVariants({ variant: plan.featured ? "default" : "outline", size: "default" }),
                        "w-full"
                      )}
                    >
                      {plan.cta}
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border/60 bg-muted/30 py-12">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 text-center sm:flex-row sm:px-6 sm:text-left">
            <div>
              <h2 className="font-heading text-lg font-semibold tracking-tight sm:text-xl">
                Ready to read GitHub like a teammate?
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Create an account, connect the repos you care about, and ship with clearer upstream context.
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:shrink-0">
              <Link href="/login" className={cn(buttonVariants({ variant: "default", size: "lg" }), "w-full sm:w-auto")}>
                Sign up
              </Link>
              <Link href="/login" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full sm:w-auto")}>
                Log in
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/80 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground sm:flex-row sm:px-6">
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
