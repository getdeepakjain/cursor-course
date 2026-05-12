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
  const match = githubUrl.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)(\/.*)?$/);
  if (!match) {
    throw new Error("Invalid GitHub repository URL");
  }
  const [, owner, repo] = match;

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
