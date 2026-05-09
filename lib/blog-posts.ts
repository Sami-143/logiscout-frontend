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
          "LogiScout targets that gap by automating the steps that drain time: collecting evidence, enriching it, and presenting the right slices to the model.",
        ],
      },
      {
        title: "The manual loop LogiScout removes",
        body: [
          "Without automation, teams repeat the same sequence: scan logs, copy raw output, paste into ChatGPT, then request more context and repeat. Each step introduces delay and error.",
          "LogiScout replaces the loop with a single prompt. The system already holds processed evidence from logs and code changes, so the answer is grounded and immediate.",
        ],
        bullets: [
          "Pre-process logs as they arrive, not during the incident",
          "Enrich traces with severity, fingerprints, and outcomes",
          "Index only the 5 percent that matter for fast retrieval",
          "Fetch raw logs on demand for evidence-backed responses",
        ],
      },
      {
        title: "MTTR is still a math problem",
        body: [
          "LogiScout cuts investigation time directly. When that segment shrinks, MTTR drops even if detection and resolution stay constant.",
        ],
        code: {
          language: "text",
          content: "MTTR = Time to Detect + Time to Investigate + Time to Resolve\n                              ^\n                       LogiScout targets this",
        },
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
        ],
      },
      {
        title: "The seven components",
        body: [
          "The pipeline starts with SDKs that capture logs and correlation IDs, then moves through Kafka and ClickHouse for durable storage. A separate ingestion pipeline enriches and filters logs before indexing them in Qdrant. Finally, the RAG server and dashboard serve responses to the user.",
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
        ],
        code: {
          language: "text",
          content: "SDKs -> Kafka -> ClickHouse -> Enrichment -> Qdrant -> RAG -> Dashboard",
        },
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
        ],
      },
      {
        title: "Phase two: raw log enrichment",
        body: [
          "Once we have matching correlation IDs, LogiScout fetches complete raw logs from ClickHouse in a batched query. The LLM then receives the full context, not just a summary.",
        ],
        bullets: [
          "Qdrant finds the right traces quickly",
          "ClickHouse provides full raw evidence",
          "The answer is grounded in actual logs",
        ],
      },
      {
        title: "Answer generation with guardrails",
        body: [
          "The answer generator formats logs, commits, and postmortems into a structured prompt. It is instructed to reference evidence and to state when data is insufficient.",
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
        ],
      },
      {
        title: "Promotion tiers",
        body: [
          "The gatekeeper evaluates cheap checks first, then escalates to deeper analysis only when needed. This keeps the pipeline fast and predictable.",
        ],
        bullets: [
          "Severity gate: high severity or server errors",
          "Content scan: suspicious keywords or error types",
          "Cold start: new endpoints build a baseline",
          "Deploy window: recent commit plus failure",
          "Fingerprint change: new trace pattern for an endpoint",
        ],
      },
      {
        title: "The result: higher signal, faster search",
        body: [
          "By promoting only about 5 percent of traces, LogiScout keeps Qdrant lean. Retrieval stays fast, and the AI focuses on evidence that reflects real incidents.",
        ],
      },
    ],
  },
]

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug)
}
