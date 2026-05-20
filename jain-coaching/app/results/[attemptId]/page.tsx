"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SiteHeader } from "@/app/components/SiteHeader";

type ResultData = {
  score: number;
  maxScore: number;
  timeSpentSeconds: number;
  violationCount: number;
  subjectAccuracy: Record<string, number>;
  benchmark: {
    avgScore: number;
    avgTimeSeconds: number;
    subjectAccuracy: Record<string, number>;
  } | null;
};

export default function ResultsPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const [data, setData] = useState<ResultData | null>(null);

  useEffect(() => {
    if (!attemptId) return;
    fetch(`/api/attempts/${attemptId}/result`)
      .then((r) => r.json())
      .then(setData);
  }, [attemptId]);

  if (!data) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-4xl px-4 py-12">Loading results…</main>
      </>
    );
  }

  const accuracyData = Object.entries(data.subjectAccuracy).map(([subject, acc]) => ({
    subject,
    you: Math.round(acc * 100),
    average: Math.round((data.benchmark?.subjectAccuracy?.[subject] ?? 0.6) * 100),
  }));

  const speedData = [
    {
      label: "You",
      minutes: Math.round(data.timeSpentSeconds / 60),
    },
    {
      label: "Avg student",
      minutes: Math.round((data.benchmark?.avgTimeSeconds ?? 2400) / 60),
    },
  ];

  const comparisonData = [
    { name: "Score", you: data.score, average: data.benchmark?.avgScore ?? 65 },
    {
      name: "Accuracy %",
      you: data.maxScore ? (data.score / data.maxScore) * 100 : 0,
      average: 62,
    },
  ];

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-bold">Performance breakdown</h1>
        <p className="mt-2 text-gray-400">
          Score: <strong className="text-[var(--accent)]">{data.score}</strong> / {data.maxScore}
          {" · "}
          Time: {Math.floor(data.timeSpentSeconds / 60)}m {data.timeSpentSeconds % 60}s
          {data.violationCount > 0 && (
            <span className="text-amber-400"> · {data.violationCount} violations</span>
          )}
        </p>

        <section className="card mt-8">
          <h2 className="font-medium">Subject accuracy</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={accuracyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3a4d" />
                <XAxis dataKey="subject" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" unit="%" />
                <Tooltip contentStyle={{ background: "#1a222d", border: "1px solid #2d3a4d" }} />
                <Legend />
                <Bar dataKey="you" name="You" fill="#c9a227" />
                <Bar dataKey="average" name="Global avg" fill="#4b5563" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card mt-6">
          <h2 className="font-medium">Speed vs average</h2>
          <div className="mt-4 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={speedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3a4d" />
                <XAxis dataKey="label" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" label={{ value: "min", angle: -90, position: "insideLeft" }} />
                <Tooltip contentStyle={{ background: "#1a222d", border: "1px solid #2d3a4d" }} />
                <Bar dataKey="minutes" fill="#c9a227" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card mt-6">
          <h2 className="font-medium">Performance vs global average</h2>
          <div className="mt-4 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3a4d" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ background: "#1a222d", border: "1px solid #2d3a4d" }} />
                <Legend />
                <Line type="monotone" dataKey="you" name="You" stroke="#c9a227" strokeWidth={2} />
                <Line type="monotone" dataKey="average" name="Global avg" stroke="#6b7280" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <Link href="/tests" className="btn-primary mt-8 inline-block">
          Back to tests
        </Link>
      </main>
    </>
  );
}
