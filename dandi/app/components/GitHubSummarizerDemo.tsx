"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { BookOpen, Loader2, RotateCcw, Send } from "lucide-react";
import { landingBtnPrimary, landingBtnSecondary } from "@/lib/landing-buttons";
import { cn } from "@/lib/utils";

const DEFAULT_PAYLOAD = `{
  "githubUrl": "https://github.com/assafelovic/gpt-researcher"
}`;

function prettyJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function GitHubSummarizerDemo() {
  const [payload, setPayload] = useState(DEFAULT_PAYLOAD);
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [status, setStatus] = useState<number | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);

  const send = useCallback(async () => {
    setClientError(null);
    setResponse(null);
    setStatus(null);

    let body: unknown;
    try {
      body = JSON.parse(payload) as unknown;
    } catch {
      setClientError("Invalid JSON — fix the payload before sending.");
      return;
    }

    if (typeof body !== "object" || body === null) {
      setClientError("Body must be a JSON object.");
      return;
    }

    setLoading(true);
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      const trimmed = apiKey.trim();
      if (trimmed) headers.Authorization = `Bearer ${trimmed}`;

      const res = await fetch("/api/github-summarizer", {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      setStatus(res.status);
      const text = await res.text();
      try {
        setResponse(prettyJson(JSON.parse(text) as unknown));
      } catch {
        setResponse(text);
      }
    } catch {
      setClientError("Network error — is the dev server running?");
    } finally {
      setLoading(false);
    }
  }, [apiKey, payload]);

  return (
    <section
      id="api-demo"
      className="relative border-b border-zinc-200/70 bg-zinc-950 py-16 sm:py-24 dark:border-white/5"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(124,58,237,0.28),transparent)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-400">Live demo</p>
            <h2 className="font-heading mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Try the GitHub summarizer API
            </h2>
            <p className="mt-2 max-w-2xl text-zinc-400">
              Same request shape as Postman:{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-violet-200 ring-1 ring-white/10">
                POST /api/github-summarizer
              </code>{" "}
              with a JSON body. Edit the payload and send again. Use an API key from your dashboard (Bearer auth).
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link
              href="#github-summarizer-docs"
              className={cn(
                landingBtnSecondary,
                "inline-flex h-10 items-center gap-2 border-white/15 bg-white/5 px-4 text-sm font-semibold text-white touch-manipulation hover:bg-white/10",
              )}
            >
              <BookOpen className="size-4 opacity-80" aria-hidden />
              Documentation
            </Link>
            <button
              type="button"
              onClick={() => {
                setPayload(DEFAULT_PAYLOAD);
                setClientError(null);
              }}
              className={cn(
                landingBtnSecondary,
                "inline-flex h-10 items-center gap-2 border-white/15 bg-white/5 px-4 text-sm font-semibold text-white touch-manipulation hover:bg-white/10",
              )}
            >
              <RotateCcw className="size-4 opacity-80" aria-hidden />
              Reset example
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-zinc-900/90 p-4 shadow-xl shadow-black/30 backdrop-blur-sm sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Request body (JSON)</span>
              <span className="font-mono text-[11px] text-violet-300/80">POST /api/github-summarizer</span>
            </div>
            <label className="mt-3 block text-sm font-medium text-zinc-200">
              API key <span className="font-normal text-zinc-500">(Bearer — optional in body as </span>
              <code className="font-mono text-xs text-violet-300">secret</code>
              <span className="font-normal text-zinc-500">)</span>
              <input
                type="password"
                autoComplete="off"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="dandi_… from Dashboard → API keys"
                className="mt-1.5 block w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2.5 font-mono text-sm text-zinc-100 outline-none ring-violet-500/30 focus:border-violet-500/50 focus:ring-2"
              />
            </label>
            <textarea
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              spellCheck={false}
              rows={12}
              className="mt-4 block min-h-[12rem] w-full resize-y rounded-lg border border-white/10 bg-zinc-950 p-3 font-mono text-sm leading-relaxed text-zinc-100 outline-none ring-violet-500/20 focus:border-violet-500/40 focus:ring-2"
              aria-label="Request JSON body"
            />
            <button
              type="button"
              disabled={loading}
              onClick={() => void send()}
              className={cn(landingBtnPrimary, "mt-4 inline-flex h-11 w-full items-center justify-center gap-2 px-4 text-sm font-semibold touch-manipulation disabled:opacity-60")}
            >
              {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Send className="size-4 opacity-90" aria-hidden />}
              {loading ? "Sending…" : "Send request"}
            </button>
            {clientError ? (
              <p className="mt-3 text-sm text-red-400" role="alert">
                {clientError}
              </p>
            ) : null}
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-900/90 p-4 shadow-xl shadow-black/30 backdrop-blur-sm sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Response</span>
              {status !== null ? (
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                    status >= 200 && status < 300
                      ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200"
                      : "bg-red-100 text-red-900 dark:bg-red-950/40 dark:text-red-200",
                  )}
                >
                  {status}
                </span>
              ) : (
                <span className="text-xs text-zinc-600">—</span>
              )}
            </div>
            <pre className="mt-4 max-h-[min(28rem,55vh)] overflow-auto whitespace-pre-wrap break-words rounded-lg border border-white/10 bg-zinc-950 p-3 font-mono text-xs text-zinc-300">
              {response ?? "Send a request to see the JSON response here."}
            </pre>
          </div>
        </div>

        <div
          id="github-summarizer-docs"
          className="mt-12 scroll-mt-24 rounded-2xl border border-white/10 bg-zinc-900/60 p-5 text-sm text-zinc-400 shadow-lg sm:p-6"
        >
          <h3 className="font-heading text-lg font-semibold text-white">GitHub summarizer — API reference</h3>
          <ul className="mt-4 list-inside list-disc space-y-2 marker:text-violet-500">
            <li>
              <strong className="text-zinc-200">Endpoint:</strong>{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-violet-200">POST /api/github-summarizer</code>{" "}
              (same host as the app, e.g. <code className="font-mono text-xs">https://…vercel.app/api/github-summarizer</code> in production).
            </li>
            <li>
              <strong className="text-zinc-200">Authentication:</strong> Dandi API key via{" "}
              <code className="font-mono text-xs">Authorization: Bearer &lt;key&gt;</code>,{" "}
              <code className="font-mono text-xs">X-Api-Key</code>, or a <code className="font-mono text-xs">secret</code> field in the JSON body.
            </li>
            <li>
              <strong className="text-zinc-200">Body:</strong> JSON with{" "}
              <code className="font-mono text-xs">githubUrl</code> pointing to a public GitHub repo (e.g.{" "}
              <code className="font-mono text-xs">https://github.com/owner/repo</code>). The service fetches the README and returns a summary.
            </li>
            <li>
              <strong className="text-zinc-200">Success (200):</strong>{" "}
              <code className="font-mono text-xs">
                {"{ ok, summary, cool_facts, stars, latest_version, website_url, license }"}
              </code>{" "}
              when <code className="font-mono text-xs">githubUrl</code> is present. <code className="font-mono text-xs">stars</code> is the GitHub
              stargazer count; <code className="font-mono text-xs">latest_version</code> is the latest Release{" "}
              <code className="font-mono text-xs">tag_name</code> when published, otherwise the newest repo tag, or{" "}
              <code className="font-mono text-xs">null</code>. <code className="font-mono text-xs">website_url</code> is the repo’s configured site
              URL (or <code className="font-mono text-xs">null</code>). <code className="font-mono text-xs">license</code> is the SPDX id when GitHub
              provides one (else the license name, or <code className="font-mono text-xs">null</code>). Optional env{" "}
              <code className="font-mono text-xs">GITHUB_TOKEN</code> helps avoid REST rate limits.
            </li>
            <li>
              <strong className="text-zinc-200">Summarizer:</strong> README text is summarized with{" "}
              <a
                href="https://ollama.ai/"
                className="font-medium text-violet-300 underline-offset-2 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ollama
              </a>{" "}
              via <strong className="text-zinc-200">Ollama Cloud</strong> by default (
              <code className="font-mono text-xs">OLLAMA_API_KEY</code>,{" "}
              <code className="font-mono text-xs">OLLAMA_BASE_URL</code>,{" "}
              <code className="font-mono text-xs">OLLAMA_MODEL</code>). Override{" "}
              <code className="font-mono text-xs">OLLAMA_BASE_URL</code> to{" "}
              <code className="font-mono text-xs">http://127.0.0.1:11434</code> for a local Ollama install (omit the API key).
            </li>
            <li>
              <strong className="text-zinc-200">Errors:</strong> <code className="font-mono text-xs">401</code> without a valid
              Dandi key; <code className="font-mono text-xs">400</code> for bad repo URL or missing README;{" "}
              <code className="font-mono text-xs">503</code> when Ollama is unreachable or the model is missing;{" "}
              <code className="font-mono text-xs">502</code> for other summarizer failures.
            </li>
          </ul>
          <p className="mt-4 text-xs text-zinc-500">
            Create keys under{" "}
            <Link href="/dashboard" className="font-medium text-violet-300 underline-offset-2 hover:underline">
              Dashboard → API keys
            </Link>
            . Keys are never stored by this demo — they stay in your browser until you refresh.
          </p>
        </div>
      </div>
    </section>
  );
}
