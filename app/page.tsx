"use client";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Gradient Orbs */}
      <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-purple-600/30 blur-[160px]" />
      <div className="absolute top-1/3 -right-40 h-[500px] w-[500px] rounded-full bg-cyan-500/20 blur-[160px]" />
      <div className="absolute bottom-0 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-blue-500/20 blur-[140px]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-3xl">
        {/* Logo */}
        <h1 className="text-6xl md:text-7xl font-semibold tracking-tight mb-6">
          v
          <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Ai
          </span>
          lam
        </h1>

        {/* Tagline */}
        <p className="text-xl md:text-2xl text-gray-300 mb-10">
          Totally end-to-end encrypted,
          <br className="hidden md:block" />
          privacy-preserving AI conversations.
        </p>

        {/* Email Capture */}
        <form
          className="flex w-full max-w-md items-center gap-3 mb-8"
          onSubmit={async (e) => {
            e.preventDefault();

            const form = e.currentTarget;
            const email = (form.elements.namedItem("email") as HTMLInputElement)
              .value;

            const res = await fetch("/api/waitlist", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email }),
            });

            const data = await res.json();
            alert(data.message || data.error);
            form.reset();
          }}
        >
          <input
            name="email"
            type="email"
            required
            placeholder="Enter your email for early access"
            className="flex-1 rounded-xl bg-white/10 border border-white/15 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />

          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 px-5 py-3 font-semibold text-black hover:opacity-90 transition"
          >
            Join
          </button>
        </form>

        {/* Secondary CTA */}
        <a
          href="/chat"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500/20 to-cyan-500/20 px-5 py-2.5 text-sm text-white backdrop-blur-md transition hover:from-purple-500/30 hover:to-cyan-500/30"
        >
          Try the confidential chat →
        </a>

        {/* Trust badges */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
          <span>🔐 Zero data retention</span>
          <span>🧠 Encrypted inference</span>
          <span>🕳️ Blind compute</span>
          <span>🚫 No tracking</span>
        </div>

        {/* Footer line */}
        <p className="mt-10 text-xs text-gray-500 max-w-xl">
          vAIlam is architected so even we cannot access your conversations.
          Privacy isn’t a setting — it’s the default.
        </p>
      </div>
      <section className="relative mx-auto max-w-5xl px-6 py-24 text-center">
        <h2 className="mb-4 text-4xl font-semibold">How VeilAI Works</h2>
        <p className="mb-16 text-gray-400">
          Privacy is enforced by architecture — not promises.
        </p>

        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <div className="mb-4 text-3xl">🔐</div>
            <h3 className="mb-2 text-lg font-medium">Client-side Encryption</h3>
            <p className="text-sm text-gray-400">
              Your message is encrypted before it ever leaves your device.
              Plaintext is never transmitted.
            </p>
          </div>

          <div>
            <div className="mb-4 text-3xl">🕳️</div>
            <h3 className="mb-2 text-lg font-medium">Blind Inference</h3>
            <p className="text-sm text-gray-400">
              Encrypted data is processed in a way that prevents human or
              system-level inspection.
            </p>
          </div>

          <div>
            <div className="mb-4 text-3xl">🚫</div>
            <h3 className="mb-2 text-lg font-medium">Zero Retention</h3>
            <p className="text-sm text-gray-400">
              No logs. No training. No recovery. Once the response is delivered,
              the data is gone.
            </p>
          </div>
        </div>
        <div className="mt-16 text-center">
          <a
            href="/blog/confidential-ai"
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3 text-sm text-gray-300 transition hover:border-white/40 hover:text-white"
          >
            Read more about how VeilAI works
            <span className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </a>
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-6 py-24">
        <h2 className="mb-12 text-center text-4xl font-semibold">
          Frequently Asked Questions
        </h2>

        <div className="grid gap-6 md:grid-cols-2">
          {[
            {
              q: "Can VeilAI read my conversations?",
              a: "No. Conversations are end-to-end encrypted. VeilAI is technically incapable of accessing message content.",
            },
            {
              q: "Are chats stored anywhere?",
              a: "No. Messages are processed transiently and discarded immediately after a response is generated.",
            },
            {
              q: "Is my data used for training?",
              a: "Never. VeilAI does not train models on user conversations — by policy and by architecture.",
            },
            {
              q: "What if VeilAI is breached?",
              a: "There is nothing meaningful to steal. Encrypted payloads and zero retention eliminate exposure.",
            },
            {
              q: "Who is VeilAI built for?",
              a: "Anyone who needs to think, reason, or write privately — founders, developers, researchers, and individuals.",
            },
            {
              q: "Do I need an account?",
              a: "No signup is required to chat. Privacy should not depend on identity.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:bg-white/10"
            >
              <h3 className="mb-2 text-sm font-medium text-white">{item.q}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
