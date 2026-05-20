export default function ViolationPage() {
  return (
    <main className="focus-mode flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="card max-w-md">
        <h1 className="text-xl font-bold text-red-400">Test terminated</h1>
        <p className="mt-4 text-gray-400">
          Your attempt was ended because proctoring violations exceeded the allowed
          threshold (5 events). Tab switches, copy/paste, window blur, and exiting
          fullscreen are monitored during focus mode.
        </p>
        <a href="/tests" className="btn-primary mt-8 inline-block">
          Return to catalog
        </a>
      </div>
    </main>
  );
}
