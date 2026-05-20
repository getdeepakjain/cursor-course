"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/app/components/SiteHeader";
import type { TestTrack } from "@/lib/types";

export default function OnboardingPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [track, setTrack] = useState<TestTrack>("class_9_12");
  const [classLevel, setClassLevel] = useState("10");
  const [schoolName, setSchoolName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsappConsent, setWhatsappConsent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const u = session?.user as { profileComplete?: boolean } | undefined;
    if (u?.profileComplete) router.replace("/enrollments");
  }, [session, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName,
        age: Number(age),
        track,
        classLevel: track === "class_9_12" ? Number(classLevel) : undefined,
        schoolName,
        phone,
        whatsappConsent,
      }),
    });
    if (!res.ok) {
      setError("Please fill all required fields correctly.");
      return;
    }
    await update({ profileComplete: true });
    router.push("/enrollments");
    router.refresh();
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-lg px-4 py-12">
        <div className="card">
          <h1 className="text-xl font-semibold">Complete your profile</h1>
          <p className="mt-2 text-sm text-gray-400">
            Required before you can enroll for exams. Email and WhatsApp updates are sent for
            registration and enrollment actions.
          </p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <input className="input-field" placeholder="Full name *" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            <input className="input-field" type="number" min={10} max={25} placeholder="Age *" value={age} onChange={(e) => setAge(e.target.value)} required />
            <label className="block text-sm text-gray-400">Track *</label>
            <select className="input-field" value={track} onChange={(e) => setTrack(e.target.value as TestTrack)}>
              <option value="class_9_12">Class 9–12 (NCERT)</option>
              <option value="jee_main">JEE Main</option>
              <option value="jee_advanced">JEE Advanced</option>
            </select>
            {track === "class_9_12" && (
              <>
                <label className="block text-sm text-gray-400">Your class *</label>
                <select className="input-field" value={classLevel} onChange={(e) => setClassLevel(e.target.value)}>
                  {[9, 10, 11, 12].map((c) => (
                    <option key={c} value={c}>
                      Class {c}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500">
                  Class 9–10: Mathematics & Science. Class 11–12: Mathematics, Physics & Chemistry.
                </p>
              </>
            )}
            <input className="input-field" placeholder="School name *" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} required />
            <input className="input-field" placeholder="Phone number *" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={whatsappConsent} onChange={(e) => setWhatsappConsent(e.target.checked)} />
              I consent to WhatsApp notifications for enrollment and exam updates
            </label>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button type="submit" className="btn-primary w-full">Save & continue</button>
          </form>
        </div>
      </main>
    </>
  );
}
