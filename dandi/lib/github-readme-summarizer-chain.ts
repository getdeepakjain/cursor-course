import type { BaseMessage } from "@langchain/core/messages";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import type { Runnable } from "@langchain/core/runnables";
import { RunnableLambda } from "@langchain/core/runnables";
import { ChatOllama } from "@langchain/ollama";
import { z } from "zod";
import {
  isOllamaCloudApiBaseUrl,
  readOllamaApiKey,
  readOllamaBaseUrl,
  readOllamaModel,
} from "@/lib/ollama-env";

/** LLM output shape for README-based repo summarization. */
export const githubReadmeSummarySchema = z.object({
  summary: z
    .string()
    .describe("A clear, concise summary of the repository based only on the README."),
  cool_facts: z
    .array(z.string())
    .describe("Short, interesting facts or highlights from the README (stack, purpose, notable details)."),
});

export type GithubReadmeSummary = z.infer<typeof githubReadmeSummarySchema>;

const README_SUMMARY_PROMPT = `You output ONLY valid JSON (no markdown, no prose, no code fences, no keys besides the two below).

Return a single JSON object with exactly these keys:
- "summary": string — one concise paragraph summarizing the repository from the README only.
- "cool_facts": array of strings — 3 to 8 short bullet-style facts (stack, purpose, notable details).

README:
{readme_content}`;

export type GithubReadmeSummarizerChainInput = {
  readme_content: string;
};

/** Metadata from the GitHub REST API for a public repo. */
export type GithubRepoPublicInfo = {
  stars: number;
  /** Latest GitHub Release tag, or the newest repo tag if there are no releases; `null` if unknown. */
  latest_version: string | null;
  /** Repository “Website” link from GitHub settings, normalized with `https://` when missing a scheme; `null` if unset. */
  website_url: string | null;
  /** SPDX id when set (e.g. `MIT`); otherwise GitHub’s license name; `null` if no license is detected. */
  license: string | null;
};

const GITHUB_API = "https://api.github.com";

function githubRestHeaders(): HeadersInit {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "dandi-github-summarizer",
  };
  const token = process.env.GITHUB_TOKEN?.trim();
  if (token) {
    h.Authorization = `Bearer ${token}`;
  }
  return h;
}

/**
 * Parses `https://github.com/owner/repo` (optional path suffix or `.git`).
 * Returns `null` if the URL is not a GitHub repo URL.
 */
export function parseGithubRepoFromUrl(githubUrl: string): { owner: string; repo: string } | null {
  const match = githubUrl
    .trim()
    .match(/^https:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\/.*)?$/i);
  if (!match) return null;
  const [, ownerRaw, repoRaw] = match;
  let repo = repoRaw;
  if (repo.endsWith(".git")) {
    repo = repo.slice(0, -4);
  }
  return { owner: ownerRaw, repo };
}

async function githubJson<T>(path: string): Promise<T> {
  const res = await fetch(`${GITHUB_API}${path}`, {
    headers: githubRestHeaders(),
  });
  if (!res.ok) {
    throw new Error(`GitHub API ${path} → ${res.status}`);
  }
  return (await res.json()) as T;
}

function normalizeRepoWebsiteUrl(homepage: unknown): string | null {
  if (typeof homepage !== "string") return null;
  const t = homepage.trim();
  if (!t) return null;
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

function licenseTypeFromGithubLicense(
  license: { spdx_id?: string | null; name?: string | null } | null | undefined,
): string | null {
  if (!license || typeof license !== "object") return null;
  const spdx = typeof license.spdx_id === "string" ? license.spdx_id.trim() : "";
  if (spdx && spdx !== "NOASSERTION") return spdx;
  const name = typeof license.name === "string" ? license.name.trim() : "";
  return name || null;
}

/**
 * Fetches public repo metadata (stars, version tag, homepage, license) via the GitHub REST API.
 * Requires network access; optional `GITHUB_TOKEN` increases rate limits.
 */
export async function fetchGithubRepoPublicInfo(owner: string, repo: string): Promise<GithubRepoPublicInfo> {
  const encOwner = encodeURIComponent(owner);
  const encRepo = encodeURIComponent(repo);

  const repoData = await githubJson<{
    stargazers_count: number;
    homepage?: unknown;
    license?: { spdx_id?: string | null; name?: string | null } | null;
  }>(`/repos/${encOwner}/${encRepo}`);
  const stars = repoData.stargazers_count;
  const website_url = normalizeRepoWebsiteUrl(repoData.homepage);
  const licenseSpdxOrName = licenseTypeFromGithubLicense(repoData.license);

  let latest_version: string | null = null;
  try {
    const releaseRes = await fetch(`${GITHUB_API}/repos/${encOwner}/${encRepo}/releases/latest`, {
      headers: githubRestHeaders(),
    });
    if (releaseRes.ok) {
      const rel = (await releaseRes.json()) as { tag_name?: unknown };
      if (typeof rel.tag_name === "string" && rel.tag_name) {
        latest_version = rel.tag_name;
      }
    }
  } catch {
    /* fall through to tags */
  }

  if (!latest_version) {
    try {
      const tags = await githubJson<Array<{ name?: unknown }>>(
        `/repos/${encOwner}/${encRepo}/tags?per_page=1`,
      );
      const first = tags[0];
      if (first && typeof first.name === "string" && first.name) {
        latest_version = first.name;
      }
    } catch {
      latest_version = null;
    }
  }

  return { stars, latest_version, website_url, license: licenseSpdxOrName };
}

function stripMarkdownJsonFence(text: string): string {
  const t = text.trim();
  const fenced = /^```(?:json)?\s*\r?\n?([\s\S]*?)\r?\n?```$/i.exec(t);
  if (fenced?.[1]) return fenced[1].trim();
  return t;
}

function messageTextContent(msg: BaseMessage): string {
  const { content } = msg;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        if (part && typeof part === "object" && "type" in part && part.type === "text" && "text" in part) {
          return String((part as { text: string }).text);
        }
        return "";
      })
      .join("");
  }
  return String(content ?? "");
}

function parseGithubReadmeSummaryFromMessage(msg: BaseMessage): GithubReadmeSummary {
  const raw = stripMarkdownJsonFence(messageTextContent(msg));
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(
      `Summarizer returned non-JSON (Ollama format=json). First 280 chars: ${raw.slice(0, 280)}`
    );
  }
  const result = githubReadmeSummarySchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(`Summarizer JSON failed validation: ${result.error.flatten().formErrors.join("; ")}`);
  }
  return result.data;
}

/**
 * Fetches `README.md` from a GitHub repo URL (`https://github.com/owner/repo`).
 * Tries `main`, then `master`. Throws if the URL is invalid or README is missing.
 */
export async function fetchGitHubReadme(githubUrl: string): Promise<string> {
  const parsed = parseGithubRepoFromUrl(githubUrl);
  if (!parsed) {
    throw new Error("Invalid GitHub repository URL");
  }
  const { owner, repo } = parsed;

  const branches = ["main", "master"];
  for (const branch of branches) {
    const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/README.md`;
    const readmeResponse = await fetch(url);
    if (readmeResponse.ok) {
      return await readmeResponse.text();
    }
  }

  throw new Error("README.md not found in the repository's main or master branch");
}

/**
 * LangChain.js chain: strict JSON prompt → {@link ChatOllama} with `format: "json"` → Zod parse.
 * Ollama Cloud often ignores JSON-schema constrained decoding used by `withStructuredOutput`;
 * native JSON mode plus explicit instructions is more reliable on Vercel.
 *
 * Env: `OLLAMA_BASE_URL` (default `https://ollama.com`), `OLLAMA_MODEL`, `OLLAMA_API_KEY` for cloud;
 * local: `http://127.0.0.1:11434` without API key.
 */
export function createGithubReadmeSummarizerChain(): Runnable<
  GithubReadmeSummarizerChainInput,
  GithubReadmeSummary
> {
  const baseUrl = readOllamaBaseUrl();
  const model = readOllamaModel();
  const apiKey = readOllamaApiKey();

  if (isOllamaCloudApiBaseUrl(baseUrl) && !apiKey) {
    throw new Error(
      "OLLAMA_API_KEY is required for Ollama Cloud (default OLLAMA_BASE_URL). Create a key at https://ollama.com/settings/keys " +
        "or set OLLAMA_BASE_URL to a local Ollama server (e.g. http://127.0.0.1:11434) without a key."
    );
  }

  const llm = new ChatOllama({
    baseUrl,
    model,
    temperature: 0.1,
    format: "json",
    ...(apiKey ? { headers: { Authorization: `Bearer ${apiKey}` } } : {}),
  });

  const prompt = ChatPromptTemplate.fromTemplate(README_SUMMARY_PROMPT);
  const parseStep = RunnableLambda.from((msg: BaseMessage) => parseGithubReadmeSummaryFromMessage(msg));

  return prompt.pipe(llm).pipe(parseStep);
}

/** Runs the summarizer chain on raw README text. */
export async function summarizeGithubReadmeContent(readmeContent: string): Promise<GithubReadmeSummary> {
  const chain = createGithubReadmeSummarizerChain();
  return chain.invoke({ readme_content: readmeContent });
}
