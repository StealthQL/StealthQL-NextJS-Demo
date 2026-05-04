"use client";

import { useEffect, useState } from "react";
import type { StealthRow } from "stealthql/next/client";

type TableState = Record<string, StealthRow[]>;

export default function StealthqlDemo() {
  const [actor, setActor] = useState("alice");
  const [state, setState] = useState<TableState>({});
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    fetch(`/api/demo/tables-${actor}`, { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json().catch(() => null);
        if (!response.ok) throw new Error(payload?.error ?? response.statusText);
        return payload;
      })
      .then((payload) => setState(payload.tables ?? {}))
      .catch((nextError: unknown) => setError(nextError instanceof Error ? nextError.message : String(nextError)));
  }, [actor]);

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: 32 }}>
      <h1>StealthQL database and auth are wired</h1>
      <p>Local actor: <strong>{actor}</strong></p>
      <button onClick={() => setActor("alice")}>Alice admin</button>{" "}
      <button onClick={() => setActor("bob")}>Bob member</button>
      {error ? <pre>{error}</pre> : null}
      {Object.entries(state).map(([table, rows]) => (
        <section key={table}>
          <h2>{table}</h2>
          <pre>{JSON.stringify(rows, null, 2)}</pre>
        </section>
      ))}
    </main>
  );
}
