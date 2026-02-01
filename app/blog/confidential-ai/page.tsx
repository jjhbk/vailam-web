export default function ConfidentialAI() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-28 text-white">
      {/* Header */}
      <header className="mb-20">
        <h1 className="mb-6 text-5xl font-semibold tracking-tight">
          Confidential AI Conversations
        </h1>
        <p className="text-lg text-gray-400">
          Why Trusted Execution Environments are the only practical solution for
          private LLM inference.
        </p>
      </header>

      {/* Intro */}
      <section className="mb-20 space-y-6 text-gray-300 leading-relaxed">
        <p>
          Most AI chat systems were designed for convenience, not
          confidentiality.
        </p>

        <p>
          Messages are sent in plaintext, decrypted in memory, logged for
          debugging, and often retained indefinitely. This makes traditional AI
          chats fundamentally incompatible with sensitive use cases.
        </p>

        <p>
          vAilam is built on a different assumption:
          <span className="text-white">
            {" "}
            servers should not be trusted with user data.
          </span>
        </p>
      </section>
      <section className="my-32">
        <h2 className="mb-8 text-3xl font-medium">
          vAilam Confidential Inference Architecture
        </h2>

        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#070707] p-6">
          <svg
            viewBox="0 0 900 420"
            className="w-full text-white"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Client */}
            <rect
              x="40"
              y="150"
              width="200"
              height="120"
              rx="12"
              fill="#0f172a"
            />
            <text
              x="140"
              y="180"
              textAnchor="middle"
              fill="#e5e7eb"
              fontSize="14"
            >
              User Device
            </text>
            <text
              x="140"
              y="205"
              textAnchor="middle"
              fill="#9ca3af"
              fontSize="12"
            >
              Encrypts message
            </text>
            <text
              x="140"
              y="225"
              textAnchor="middle"
              fill="#9ca3af"
              fontSize="12"
            >
              Client-side
            </text>

            {/* Arrow to server */}
            <line
              x1="240"
              y1="210"
              x2="360"
              y2="210"
              stroke="#38bdf8"
              strokeWidth="2"
            />
            <polygon points="360,210 350,205 350,215" fill="#38bdf8" />
            <text
              x="300"
              y="195"
              textAnchor="middle"
              fill="#38bdf8"
              fontSize="11"
            >
              Encrypted payload
            </text>

            {/* Server */}
            <rect
              x="360"
              y="90"
              width="480"
              height="260"
              rx="16"
              fill="#020617"
              stroke="#1f2933"
            />

            <text
              x="600"
              y="120"
              textAnchor="middle"
              fill="#e5e7eb"
              fontSize="14"
            >
              vAilam Server
            </text>

            {/* TEE boundary */}
            <rect
              x="420"
              y="150"
              width="360"
              height="160"
              rx="14"
              fill="none"
              stroke="#22d3ee"
              strokeWidth="2"
              strokeDasharray="6 4"
            />

            <text
              x="600"
              y="165"
              textAnchor="middle"
              fill="#22d3ee"
              fontSize="12"
            >
              Trusted Execution Environment (TEE)
            </text>

            {/* Inside TEE */}
            <text
              x="600"
              y="205"
              textAnchor="middle"
              fill="#e5e7eb"
              fontSize="13"
            >
              LLM Inference
            </text>
            <text
              x="600"
              y="230"
              textAnchor="middle"
              fill="#9ca3af"
              fontSize="11"
            >
              Plaintext exists only here
            </text>

            {/* Arrow back */}
            <line
              x1="360"
              y1="245"
              x2="240"
              y2="245"
              stroke="#38bdf8"
              strokeWidth="2"
            />
            <polygon points="240,245 250,240 250,250" fill="#38bdf8" />
            <text
              x="300"
              y="270"
              textAnchor="middle"
              fill="#38bdf8"
              fontSize="11"
            >
              Encrypted response
            </text>
          </svg>
        </div>

        <p className="mt-6 text-sm text-gray-400 max-w-2xl">
          Plaintext is decrypted only inside the Trusted Execution Environment.
          Outside the enclave, memory is encrypted and inaccessible to the OS,
          hypervisor, cloud provider, or operators.
        </p>
      </section>

      {/* Divider */}
      <div className="my-20 h-px w-full bg-white/10" />

      {/* Problem */}
      <section className="mb-20">
        <h2 className="mb-6 text-3xl font-medium">The Core Privacy Failure</h2>

        <div className="space-y-6 text-gray-300 leading-relaxed">
          <p>
            To generate a response, a language model must process your prompt in
            plaintext.
          </p>

          <p>
            In most systems, this plaintext exists in normal server memory. That
            means it is accessible to operating systems, hypervisors,
            administrators, monitoring tools, and attackers after a breach.
          </p>

          <p className="text-white">
            Encryption in transit is irrelevant once data is decrypted in
            memory.
          </p>
        </div>
      </section>

      {/* Pull quote */}
      <blockquote className="my-24 border-l-2 border-cyan-400 pl-6 text-xl text-gray-200">
        Privacy failures don’t happen on the network. They happen in memory.
      </blockquote>

      {/* TEE explanation */}
      <section className="mb-20">
        <h2 className="mb-6 text-3xl font-medium">
          Trusted Execution Environments
        </h2>

        <div className="space-y-6 text-gray-300 leading-relaxed">
          <p>
            A Trusted Execution Environment (TEE) is a hardware-backed secure
            enclave that isolates code and data from the rest of the system.
          </p>

          <p>
            Memory inside the enclave is encrypted. Execution is isolated. Even
            privileged software cannot inspect what happens inside.
          </p>

          <p className="text-white">
            The server runs the computation — but cannot see the data.
          </p>
        </div>
      </section>

      {/* How vAilam uses TEEs */}
      <section className="mb-20">
        <h2 className="mb-6 text-3xl font-medium">
          Confidential LLM Inference in vAilam
        </h2>

        <ol className="space-y-4 text-gray-300 list-decimal list-inside">
          <li>Messages are encrypted on the client</li>
          <li>Encrypted data is transmitted to the server</li>
          <li>Decryption happens only inside a TEE</li>
          <li>The LLM runs entirely within the enclave</li>
          <li>Responses are encrypted before leaving the enclave</li>
          <li>No plaintext is logged or stored</li>
        </ol>
      </section>

      {/* Why not FHE */}
      <section className="mb-20">
        <h2 className="mb-6 text-3xl font-medium">
          Why Not Fully Homomorphic Encryption?
        </h2>

        <div className="space-y-6 text-gray-300 leading-relaxed">
          <p>
            Techniques like fully homomorphic encryption and secure multi-party
            computation are theoretically elegant.
          </p>

          <p>
            In practice, they are far too slow and expensive for real-time large
            language model inference.
          </p>

          <p className="text-white">
            TEEs provide the best balance between confidentiality, performance,
            and deployability today.
          </p>
        </div>
      </section>

      {/* Closing */}
      <section className="space-y-6 text-gray-300 leading-relaxed">
        <p>vAilam does not rely on privacy policies or promises.</p>

        <p className="text-white">
          Confidentiality is enforced by architecture. If the system cannot see
          your data, it cannot misuse it.
        </p>
      </section>
    </article>
  );
}
