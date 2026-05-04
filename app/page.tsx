"use client";

import { useState, useEffect, useCallback } from "react";

type Verdict = "allowed" | "blocked" | null;

type SceneResult = {
  status: number;
  body: any;
  verdict: Verdict;
  summary: string;
};

type Scene = {
  id: string;
  num: string;
  tab: string;
  hint: string;
  title: string;
  description: string;
  buttonLabel: string;
  attack?: boolean;
  expected: "allowed" | "blocked";
  run: () => Promise<{ status: number; body: any }>;
};

const API = "/api/stealthql";

async function call(path: string, init?: RequestInit) {
  const res = await fetch(`${API}/${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers || {}) },
  });
  let body: any;
  try { body = await res.json(); } catch { body = null; }
  return { status: res.status, body };
}

const scenes: Scene[] = [
  {
    id: "alice",
    num: "01",
    tab: "Alice reads",
    hint: "Customer view",
    title: "Alice opens her invoice.",
    description:
      "She owns the data. She sees everything: customer, amount, status, and the private founder note.",
    buttonLabel: "Read as Alice",
    expected: "allowed",
    run: () => call("state?actor=alice&table=invoices"),
  },
  {
    id: "support-direct",
    num: "02",
    tab: "Support reads",
    hint: "The default position",
    title: "Support tries to open the same invoice.",
    description:
      "Support has no membership in Alice's org. No share. No scope. The capsule policy sees nothing it can return.",
    buttonLabel: "Read as Support",
    expected: "blocked",
    run: () => call("state?actor=support&table=invoices"),
  },
  {
    id: "share-read",
    num: "03",
    tab: "Redacted share",
    hint: "Alice grants",
    title: "Alice issues a redacted support share.",
    description:
      "Three fields only — id, customer, status. Amounts and the private note are stripped at the policy boundary, not in the UI.",
    buttonLabel: "Open share as Support",
    expected: "allowed",
    run: () =>
      call("shares/supportRedactedAcme/read?actor=support"),
  },
  {
    id: "attack-sql",
    num: "04",
    tab: "Attack: raw SQL",
    hint: "Bypass attempt",
    title: "Support tries raw SQL.",
    description:
      "Same predicate, different door. Reads still compile to the actor's policy. Empty rows.",
    buttonLabel: "Run SELECT as Support",
    attack: true,
    expected: "blocked",
    run: () =>
      call("sql?actor=support", {
        method: "POST",
        body: JSON.stringify({ sql: "select * from invoices" }),
      }),
  },
  {
    id: "attack-revoked",
    num: "05",
    tab: "Attack: revoked",
    hint: "Bypass attempt",
    title: "Support replays a revoked share.",
    description:
      "Once Alice revokes, the share id is dead. No grace window, no cache.",
    buttonLabel: "Read revoked share",
    attack: true,
    expected: "blocked",
    run: () =>
      call("shares/supportRedactedAcmeRevoked/read?actor=support"),
  },
  {
    id: "attack-expired",
    num: "06",
    tab: "Attack: expired",
    hint: "Bypass attempt",
    title: "Support replays an expired share.",
    description:
      "Time bound. The runtime checks expiresAt on every request, not at issuance.",
    buttonLabel: "Read expired share",
    attack: true,
    expected: "blocked",
    run: () =>
      call("shares/supportRedactedAcmeExpired/read?actor=support"),
  },
];

function summarize(scene: Scene, status: number, body: any): SceneResult {
  // Determine verdict
  let verdict: Verdict = null;
  let summary = "";

  if (status >= 400 || body?.error) {
    verdict = "blocked";
    summary = body?.error ?? `HTTP ${status}`;
  } else if (scene.id === "alice") {
    const rows = body?.rows ?? [];
    const sample = rows.find((r: any) => r.orgId === "org_acme");
    verdict = rows.length > 0 ? "allowed" : "blocked";
    summary = sample
      ? `Read ${rows.length} row(s) including private internalNote: "${sample.internalNote}"`
      : "No rows visible";
  } else if (scene.id === "support-direct") {
    const rows = body?.rows ?? [];
    verdict = rows.length === 0 ? "blocked" : "allowed";
    summary = rows.length === 0
      ? "Empty result. Cross-tenant read silently blocked by policy."
      : `Leaked ${rows.length} rows`;
  } else if (scene.id === "share-read") {
    const rows = body?.rows ?? [];
    const sample = rows[0];
    verdict = rows.length > 0 ? "allowed" : "blocked";
    if (sample) {
      const fields = Object.keys(sample).join(", ");
      const hasMoney = "amountCents" in sample;
      const hasNote = "internalNote" in sample;
      summary = `Got ${rows.length} row(s). Fields: ${fields}. amountCents=${hasMoney ? "leaked" : "redacted"}, internalNote=${hasNote ? "leaked" : "redacted"}.`;
    } else {
      summary = "No share content";
    }
  } else if (scene.id === "attack-sql") {
    const rows = body?.rows ?? [];
    verdict = rows.length === 0 ? "blocked" : "allowed";
    summary = `SQL compiled to: ${body?.profile?.policyPredicate ?? "n/a"}. Returned ${rows.length} rows.`;
  } else {
    verdict = "blocked";
    summary = body?.error ?? "Blocked";
  }

  return { status, body, verdict, summary };
}

function syntaxHighlight(json: any): React.ReactNode {
  const text = JSON.stringify(json, null, 2);
  if (!text) return <span className="blank">// no body</span>;
  // Trim very large bodies (handles tokens are huge)
  const trimmed = text.length > 4000 ? text.slice(0, 4000) + "\n…" : text;
  // Simple tokenizer
  const parts: React.ReactNode[] = [];
  const re = /("(?:[^"\\]|\\.)*"\s*:)|("(?:[^"\\]|\\.)*")|\b(true|false|null)\b|(-?\d+(?:\.\d+)?)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(trimmed))) {
    if (m.index > last) parts.push(trimmed.slice(last, m.index));
    if (m[1]) parts.push(<span key={i++} className="key">{m[1]}</span>);
    else if (m[2]) parts.push(<span key={i++} className="str">{m[2]}</span>);
    else if (m[3]) parts.push(<span key={i++} className="num">{m[3]}</span>);
    else if (m[4]) parts.push(<span key={i++} className="num">{m[4]}</span>);
    last = m.index + m[0].length;
  }
  parts.push(trimmed.slice(last));
  return parts;
}

type LedgerEvent = {
  eventId: string;
  actorId?: string;
  table?: string;
  shareId?: string;
  statement?: string;
  access?: string;
  rowCount?: number;
  rowIds?: string[];
  timestamp: string;
};

export default function Page() {
  const [active, setActive] = useState(0);
  const [results, setResults] = useState<Record<string, SceneResult>>({});
  const [running, setRunning] = useState<string | null>(null);
  const [ledger, setLedger] = useState<LedgerEvent[]>([]);

  const refreshLedger = useCallback(async () => {
    const res = await call("events?actor=alice&limit=12");
    if (res.body?.events) setLedger(res.body.events);
  }, []);

  useEffect(() => {
    refreshLedger();
    const t = setInterval(refreshLedger, 2500);
    return () => clearInterval(t);
  }, [refreshLedger]);

  const scene = scenes[active];
  const result = results[scene.id];

  async function runScene() {
    setRunning(scene.id);
    try {
      const { status, body } = await scene.run();
      setResults(r => ({ ...r, [scene.id]: summarize(scene, status, body) }));
      refreshLedger();
    } finally {
      setRunning(null);
    }
  }

  return (
    <div className="page">
      <div className="shell">
        {/* Hero */}
        <header className="hero">
          <span className="eyebrow">StealthQL · Live Demo</span>
          <h1>
            Support is <span className="accent">blind</span>
          </h1>
          <p className="lede">
            Your customer support team should be able to help. Not see everything.
            Watch the same database refuse to leak — even to the people who built it.
          </p>
          <div className="meta">
            <span className="dot" />
            <span>Capsule running locally · zero cloud roundtrips</span>
          </div>
        </header>

        {/* Cast */}
        <section className="section">
          <div className="section-head">
            <div className="num">The cast</div>
            <h2>
              Three actors. <span className="dim">One database. One policy boundary.</span>
            </h2>
          </div>

          <div className="actors">
            <div className="actor alice">
              <div className="avatar">A</div>
              <h3>Alice</h3>
              <div className="role">Admin · Acme Labs</div>
              <ul>
                <li><span className="check">●</span> Reads invoices in her org</li>
                <li><span className="check">●</span> Sees private internalNote</li>
                <li><span className="check">●</span> Can issue shares to support</li>
              </ul>
            </div>

            <div className="actor support">
              <div className="avatar">S</div>
              <h3>Support</h3>
              <div className="role">Platform engineer</div>
              <ul>
                <li><span className="x">●</span> No membership in any org</li>
                <li><span className="x">●</span> No billing scope</li>
                <li><span className="check">●</span> May read scoped shares only</li>
              </ul>
            </div>

            <div className="actor bob">
              <div className="avatar">B</div>
              <h3>Bob</h3>
              <div className="role">Member · Beta Works</div>
              <ul>
                <li><span className="check">●</span> Reads invoices in his org</li>
                <li><span className="x">●</span> Cannot read Acme's data</li>
                <li><span className="check">●</span> Different tenant entirely</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Theatre */}
        <section className="section">
          <div className="section-head">
            <div className="num">The proof</div>
            <h2>
              Six tries. <span className="dim">Watch the policy hold.</span>
            </h2>
          </div>

          <div className="theatre">
            <div className="scene-tabs">
              {scenes.map((s, i) => (
                <button
                  key={s.id}
                  className={`scene-tab${i === active ? " active" : ""}`}
                  onClick={() => setActive(i)}
                >
                  <span className="num-mini">{s.num}</span>
                  {s.tab}
                </button>
              ))}
            </div>

            <div className="scene-body">
              <div className="scene-left">
                <div className="hint">{scene.hint}</div>
                <h3>{scene.title}</h3>
                <p>{scene.description}</p>
                <div className="run-button">
                  <button
                    className={`run${scene.attack ? " attack" : ""}`}
                    onClick={runScene}
                    disabled={running !== null}
                  >
                    {running === scene.id ? "Running…" : scene.buttonLabel}
                    <span aria-hidden>→</span>
                  </button>
                </div>
              </div>

              <div className="scene-right">
                <div className="term-head">
                  <div className="term-dots">
                    <span /><span /><span />
                  </div>
                  <div className="term-title">stealthql · {scene.id}</div>
                  <div className={`term-status ${result?.verdict ?? "idle"}`}>
                    {result?.verdict === "allowed" ? "200 OK"
                     : result?.verdict === "blocked" ? "BLOCKED"
                     : "READY"}
                  </div>
                </div>

                {result ? (
                  <>
                    <div className={`verdict ${result.verdict ?? ""}`}>
                      <div className="verdict-icon">
                        {result.verdict === "allowed" ? "✓" : "✕"}
                      </div>
                      <div>{result.summary}</div>
                    </div>
                    <div className="term-output">
                      {syntaxHighlight(result.body)}
                    </div>
                  </>
                ) : (
                  <div className="term-output">
                    <span className="req">// click "{scene.buttonLabel}" to fire this request</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Audit ledger */}
        <section className="section">
          <div className="section-head">
            <div className="num">The receipt</div>
            <h2>
              Every read is signed. <span className="dim">Hash-chained. Tamper-evident.</span>
            </h2>
          </div>

          <div className="ledger">
            <div className="ledger-head">
              <span className="pulse" />
              <h4>Audit ledger · live</h4>
            </div>
            <div className="ledger-body">
              {ledger.length === 0 && (
                <div className="ledger-row" style={{ color: "var(--ink-faint)" }}>
                  <span className="when">—</span>
                  <span className="who">—</span>
                  <span className="what">no events yet — run a scene above</span>
                  <span />
                </div>
              )}
              {ledger.map(e => {
                const rows = e.rowCount ?? e.rowIds?.length ?? 0;
                const blocked = rows === 0 &&
                  (e.statement === "select" || e.access === "read");
                const ts = new Date(e.timestamp);
                const time = ts.toLocaleTimeString([], {
                  hour: "2-digit", minute: "2-digit", second: "2-digit"
                });
                const target = e.shareId ? `share:${e.shareId}` : (e.table ?? "—");
                const op = e.access ?? e.statement ?? "—";
                return (
                  <div key={e.eventId} className="ledger-row">
                    <span className="when">{time}</span>
                    <span className="who">{(e.actorId ?? "?").replace(/_\d+$/, "")}</span>
                    <span className="what">{op} · {target} · {rows} row(s)</span>
                    <span className={`badge ${blocked ? "blocked" : "allowed"}`}>
                      {blocked ? "blocked" : "allowed"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <footer className="footer">
          <strong>support-is-blind</strong> · built on <strong>StealthQL</strong> · every
          policy decision compiled into SQL, every share bounded in time, every read
          recorded in a hash-chained ledger.
        </footer>
      </div>
    </div>
  );
}
