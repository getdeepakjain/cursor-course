import { handleGithubSummarizer } from "@/lib/github-summarizer-handler";

export async function GET(request: Request) {
  return handleGithubSummarizer(request);
}

export async function POST(request: Request) {
  return handleGithubSummarizer(request);
}
