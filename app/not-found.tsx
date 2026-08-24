import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-6 py-16">
      <p className="text-3xl" aria-hidden>
        🍃
      </p>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-navy-900">
        There&rsquo;s nothing at this address
      </h1>
      <p className="muted mt-2">
        The page may have moved, or the link may be out of date. Nothing has gone wrong with
        your account and nothing has been lost.
      </p>

      <nav aria-label="Where to go instead" className="mt-7 space-y-2">
        <Link
          href="/student/home"
          className="flex min-h-14 items-center gap-3 rounded-2xl border border-navy-200 bg-white px-4 hover:border-teal-300 hover:bg-teal-50/50"
        >
          <span aria-hidden className="text-xl">
            🏠
          </span>
          <span>
            <span className="block font-medium text-navy-900">Student home</span>
            <span className="muted block text-sm">Check-in, community, journal, support</span>
          </span>
        </Link>
        <Link
          href="/counsellor/dashboard"
          className="flex min-h-14 items-center gap-3 rounded-2xl border border-navy-200 bg-white px-4 hover:border-pro-300 hover:bg-pro-50/50"
        >
          <span aria-hidden className="text-xl">
            ▦
          </span>
          <span>
            <span className="block font-medium text-navy-900">Counsellor dashboard</span>
            <span className="muted block text-sm">Alerts, cases, moderation, analytics</span>
          </span>
        </Link>
        <Link
          href="/"
          className="flex min-h-14 items-center gap-3 rounded-2xl border border-navy-200 bg-white px-4 hover:border-navy-300 hover:bg-navy-50"
        >
          <span aria-hidden className="text-xl">
            ↩️
          </span>
          <span>
            <span className="block font-medium text-navy-900">Start again</span>
            <span className="muted block text-sm">The MindEase landing page</span>
          </span>
        </Link>
      </nav>

      <p className="muted mt-8 text-sm">
        If you were on your way to get help,{" "}
        <Link
          href="/student/help"
          className="font-medium text-teal-800 underline underline-offset-2"
        >
          the help page is here
        </Link>
        .
      </p>
    </main>
  );
}
