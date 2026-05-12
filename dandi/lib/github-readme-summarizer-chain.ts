import { ChatPromptTemplate } from "@langchain/core/prompts";
import type { Runnable } from "@langchain/core/runnables";
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

const README_SUMMARY_PROMPT = `Summarize this GitHub repository from this README file content.

README:
{readme_content}`;

export type GithubReadmeSummarizerChainInput = {
  readme_content: string;
};

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
 * LangChain.js chain: prompt template → {@link ChatOllama} with structured output
 * (`summary`, `cool_facts`). Defaults to [Ollama Cloud](https://docs.ollama.com/cloud):
 * `OLLAMA_BASE_URL` (`https://ollama.com` — no `/api`; the client adds `/api/…`), `OLLAMA_MODEL` (`gpt-oss:20b-cloud`),
 * `OLLAMA_API_KEY` (Bearer). For a local daemon, set `OLLAMA_BASE_URL=http://127.0.0.1:11434` and
 * omit `OLLAMA_API_KEY`.
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
    temperature: 0.2,
    ...(apiKey ? { headers: { Authorization: `Bearer ${apiKey}` } } : {}),
  });

  const structuredLlm = llm.withStructuredOutput(githubReadmeSummarySchema, {
    name: "github_readme_summary",
  });

  const prompt = ChatPromptTemplate.fromTemplate(README_SUMMARY_PROMPT);
  return prompt.pipe(structuredLlm);
}

/** Runs the summarizer chain on raw README text. */
export async function summarizeGithubReadmeContent(readmeContent: string): Promise<GithubReadmeSummary> {
  const chain = createGithubReadmeSummarizerChain();
  return chain.invoke({ readme_content: readmeContent });
}
