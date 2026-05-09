export interface BlogSection {
  title: string
  body: string[]
  bullets?: string[]
  code?: {
    language: string
    content: string
  }
}

export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  category: string
  readTime: string
  date: string
  tags: string[]
  featured?: boolean
  sections: BlogSection[]
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "mttr-investigation-gap",
    title: "MTTR math: where teams lose the most time",
    excerpt:
      "Investigation is the hidden tax in every incident. See how LogiScout shortens the manual loop of digging through logs, copying context, and correlating deployments.",
    category: "Incident strategy",
    readTime: "5 min read",
    date: "May 2026",
    tags: ["MTTR", "Investigation", "Workflow"],
    featured: true,
    sections: [
      {
        title: "The investigation gap",
        body: [
          "Most teams can detect incidents quickly, but investigation still happens by hand. Engineers jump between log dashboards, copy snippets into an LLM, and request more context over and over. Every hop slows the path to a fix.",
          "The delay is not only time. Context decays each time you switch tools, and the evidence trail becomes fragmented across tabs, pasted snippets, and mental notes.",
          "LogiScout targets that gap by automating the steps that drain time: collecting evidence, enriching it, and presenting the right slices to the model.",
          "That means the first answer already includes correlation IDs, likely culprit services, and the raw log evidence that a responder would otherwise fetch manually.",
        ],
      },
      {
        title: "The manual loop LogiScout removes",
        body: [
          "Without automation, teams repeat the same sequence: scan logs, copy raw output, paste into ChatGPT, then request more context and repeat. Each step introduces delay and error.",
          "The slowest part is the second and third loops: finding the right traces and validating them across services or deployments. That is where incident time gets lost.",
          "LogiScout replaces the loop with a single prompt. The system already holds processed evidence from logs and code changes, so the answer is grounded and immediate.",
          "Because the pipeline pre-processes logs continuously, there is no costly context build step when an incident begins.",
        ],
        bullets: [
          "Pre-process logs as they arrive, not during the incident",
          "Enrich traces with severity, fingerprints, and outcomes",
          "Index only the 5 percent that matter for fast retrieval",
          "Fetch raw logs on demand for evidence-backed responses",
          "Attach recent commit summaries to explain regressions",
        ],
      },
      {
        title: "MTTR is still a math problem",
        body: [
          "LogiScout cuts investigation time directly. When that segment shrinks, MTTR drops even if detection and resolution stay constant.",
          "In practice, it also reduces back-and-forth between teams. Shared evidence and a single answer format mean less time aligning on what actually happened.",
        ],
        code: {
          language: "text",
          content: "MTTR = Time to Detect + Time to Investigate + Time to Resolve\n                              ^\n                       LogiScout targets this",
        },
      },
      {
        title: "What this looks like in an incident",
        body: [
          "A responder asks a natural language question and receives a structured answer with the specific logs, the correlated request flow, and the most relevant recent code changes.",
          "Instead of spending the first 15 minutes assembling context, the team starts with a credible hypothesis and evidence in hand.",
        ],
      },
    ],
  },
  {
    slug: "seven-component-pipeline",
    title: "A seven-component pipeline built for signal",
    excerpt:
      "From SDKs to Kafka, ClickHouse, Qdrant, and the RAG server. A bird's-eye view of how LogiScout moves data from live logs to evidence-backed answers.",
    category: "Architecture",
    readTime: "7 min read",
    date: "May 2026",
    tags: ["Pipeline", "Kafka", "Qdrant"],
    sections: [
      {
        title: "Why a pipeline instead of a monolith",
        body: [
          "LogiScout is designed as seven deployable components so each stage can scale independently. Log capture and storage have different performance needs than AI response generation.",
          "A monolith tends to over-provision the most expensive parts (LLM calls and vector search) just to keep up with ingestion. The pipeline prevents that.",
        ],
      },
      {
        title: "The seven components",
        body: [
          "The pipeline starts with SDKs that capture logs and correlation IDs, then moves through Kafka and ClickHouse for durable storage. A separate ingestion pipeline enriches and filters logs before indexing them in Qdrant. Finally, the RAG server and dashboard serve responses to the user.",
          "Each component speaks a clear contract: raw logs are immutable in ClickHouse, summaries live in Qdrant, and the RAG server is responsible for retrieval and response logic.",
        ],
        bullets: [
          "Logger SDKs (Python, Node.js) for structured capture",
          "Kafka Stream Server to broker and validate payloads",
          "ClickHouse for raw log storage",
          "Logs Ingestion Pipeline for enrichment and gating",
          "Commit Ingestion Pipeline for code change context",
          "RAG Server for intent, retrieval, and answers",
          "Dashboard for chat, projects, and live logs",
        ],
      },
      {
        title: "End-to-end flow",
        body: [
          "Logs arrive in real time, land in ClickHouse, and then the ingestion pipeline promotes only high-signal traces into Qdrant. When an incident question arrives, the response pipeline retrieves those signals and enriches them with raw logs before answering.",
          "This division is critical: it allows low-latency ingestion without blocking on AI, while still providing evidence-rich answers when needed.",
        ],
        code: {
          language: "text",
          content: "SDKs -> Kafka -> ClickHouse -> Enrichment -> Qdrant -> RAG -> Dashboard",
        },
      },
      {
        title: "Why this scales",
        body: [
          "Kafka decouples ingestion from storage, ClickHouse handles high write volume, and Qdrant stays lean by indexing only promoted traces.",
          "As traffic grows, you scale ingestion and storage independently from the response pipeline and keep cost predictable.",
        ],
      },
    ],
  },
  {
    slug: "two-phase-retrieval",
    title: "Two-phase retrieval: vector search plus raw logs",
    excerpt:
      "Why we combine semantic search with ClickHouse enrichment. The result is precise retrieval plus full-fidelity evidence for the LLM.",
    category: "AI pipeline",
    readTime: "6 min read",
    date: "May 2026",
    tags: ["RAG", "ClickHouse", "Evidence"],
    sections: [
      {
        title: "Phase one: semantic search",
        body: [
          "The response pipeline first embeds the user question and searches Qdrant for relevant trace summaries and commit summaries. This narrows the universe to the most likely evidence.",
          "Because the summaries are structured around outcomes, services, and normalized messages, the search is resilient to noisy wording in the question.",
        ],
      },
      {
        title: "Phase two: raw log enrichment",
        body: [
          "Once we have matching correlation IDs, LogiScout fetches complete raw logs from ClickHouse in a batched query. The LLM then receives the full context, not just a summary.",
          "This avoids the common failure mode where a model makes conclusions from partial evidence. The raw logs confirm what actually happened.",
        ],
        bullets: [
          "Qdrant finds the right traces quickly",
          "ClickHouse provides full raw evidence",
          "The answer is grounded in actual logs",
          "Batching keeps enrichment fast and predictable",
        ],
      },
      {
        title: "Answer generation with guardrails",
        body: [
          "The answer generator formats logs, commits, and postmortems into a structured prompt. It is instructed to reference evidence and to state when data is insufficient.",
          "This is why the output stays consistent: summary, findings, likely root cause, and recommendations with evidence citations.",
        ],
      },
      {
        title: "Why two phases beats one",
        body: [
          "Pure vector search misses details. Pure raw-log search is too slow and noisy. Two-phase retrieval gives you speed and fidelity at the same time.",
          "The system finds the right traces in milliseconds and then loads the full log context only for those traces.",
        ],
      },
    ],
  },
  {
    slug: "gatekeeper-signal",
    title: "Gatekeeper logic that keeps only 5 percent",
    excerpt:
      "The enrichment pipeline promotes only high-signal traces. See the tiered decision system that drops noise while preserving new or risky patterns.",
    category: "Ingestion",
    readTime: "6 min read",
    date: "May 2026",
    tags: ["Enrichment", "Gatekeeper", "Signals"],
    sections: [
      {
        title: "Why gatekeeping matters",
        body: [
          "Most logs are healthy and repetitive. Indexing everything would bloat the vector database and slow retrieval. The gatekeeper keeps only what matters.",
          "By design, only about 5 percent of traces are promoted, which keeps search fast and affordable without losing critical signals.",
        ],
      },
      {
        title: "Promotion tiers",
        body: [
          "The gatekeeper evaluates cheap checks first, then escalates to deeper analysis only when needed. This keeps the pipeline fast and predictable.",
          "It treats new fingerprints and deploy windows as higher risk, which surfaces regressions early even if the logs are not yet severe.",
        ],
        bullets: [
          "Severity gate: high severity or server errors",
          "Content scan: suspicious keywords or error types",
          "Cold start: new endpoints build a baseline",
          "Deploy window: recent commit plus failure",
          "Fingerprint change: new trace pattern for an endpoint",
          "Default: drop healthy, repetitive traces",
        ],
      },
      {
        title: "The result: higher signal, faster search",
        body: [
          "By promoting only about 5 percent of traces, LogiScout keeps Qdrant lean. Retrieval stays fast, and the AI focuses on evidence that reflects real incidents.",
          "The outcome is a smaller, higher quality knowledge base that improves both relevance and response time.",
        ],
      },
      {
        title: "Operational impact",
        body: [
          "Gatekeeping is the difference between a search index that grows without bound and one that remains usable as traffic scales.",
          "It also makes incident reviews cleaner because the system highlights meaningful traces rather than flooding teams with noise.",
        ],
      },
    ],
  },
]

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug)
}
