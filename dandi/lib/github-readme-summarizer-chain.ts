import { ChatPromptTemplate } from "@langchain/core/prompts";
import type { Runnable } from "@langchain/core/runnables";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";

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
 * LangChain.js chain: prompt template → {@link ChatOpenAI} with structured output
 * (`summary`, `cool_facts`). Requires `OPENAI_API_KEY`; optional `OPENAI_MODEL` (default `gpt-4o-mini`).
 */
export function createGithubReadmeSummarizerChain(): Runnable<
  GithubReadmeSummarizerChainInput,
  GithubReadmeSummary
> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey?.trim()) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const modelName = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
  const llm = new ChatOpenAI({
    model: modelName,
    apiKey,
    temperature: 0.2,
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
