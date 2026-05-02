# StealthQL DX Log — building "support-is-blind"

Built by Claude Code as a one-shot demo on `stealthql@0.2.10` + Next.js 16.2.4.
Total wall-clock: ~25 minutes from `npm install stealthql` to a polished page.
Logging the friction, in order, while it's fresh.

## What worked beautifully

- **`npx stealthql setup next --typescript`** is the single best onboarding moment in the package. It produced a working capsule, a SaaS schema, three actors, demo shares (including a deliberately-revoked and a deliberately-expired one), the API proxy, and a demo page in one command. Nothing else in the JS/Next ecosystem matches that.
- **Default capsule is already a security demo.** The seed shipped with `acmeInvoicesForBob`, `revokableInvoiceForBob`, `expiredInvoiceForBob`, plus `users.email` field-mask policy and `invoices.internalNote` admin-only field policy. I dropped 3 support-principal shares in and was 80% done.
- **`policyPredicate` in the response `profile`** is a killer feature. Surfacing the compiled SQL predicate ("`(\"orgId\" = $1) or (false)`") in the API response makes the boundary visible. I literally pasted it on the demo screen — it sells the product.
- **The hash-chained ledger "just worked"** as a demo prop. Each block lives at `/_stealthql/events`, support's blocked SELECT shows up immediately, share reads carry `rowIds` and `previousHash`. Showing "every read is signed" was a 30-line component.
- **`proxyStealthRequest`** was zero-config. I never had to think about CORS, body-forwarding, or method routing. The generated `app/api/stealthql/[...path]/route.ts` is correct on first try.
- **Determinism.** Same capsule hash on every rebuild, deterministic policy predicate, deterministic test data. Demos love this.

## Friction points (rank-ordered, severity in brackets)

### 1. PGlite materializer holds the lock past process death [high]

Symptom — when I killed `npx stealthql dev` ungracefully (Bash background termination on Windows), the next start failed with:

```
Error: PGlite materializer is already open for local at .../pglite by PID 46456.
Stop that runtime or use an isolated STEALTHQL_DATA_DIR before running another command.
```

`PID 46456` no longer existed. I had to `Stop-Process -Id 46456` to clear the stale lock file.

The error message is *good* (it tells you what to do), but the recovery is bad: a watcher process should clean up its own lockfile on exit, and the runtime should detect a dead PID and either steal the lock or hint at `--force-unlock` rather than make the dev manually `Stop-Process`. **This will absolutely bite users on Windows after a Ctrl-C followed by a quick re-run.**

Suggested fix: on `acquireMaterializerLock`, if the holder PID is not running, log a warning and reclaim. Or expose `stealthql doctor unlock` / `stealthql dev --force-unlock`.

### 2. `--port 8787` doesn't actually mean 8787 [medium]

Running `npx stealthql dev --port 8787` while another runtime owned 8787 silently moved to 53270 and just printed:

```
Port 8787 is already in use; using 53270 for this capsule.
```

But the Next proxy was configured against `STEALTHQL_URL=http://127.0.0.1:8787` — so my browser calls 404'd until I noticed. The README says the CLI "asks whether to start this capsule on another free port" — in non-TTY mode (e.g. running under a script or background tool), it doesn't ask, it just moves.

`--strict-port` does the right thing (fail loudly), but it should arguably be the **default** when `--port N` is passed explicitly. "I asked for 8787" is a strong intent signal. Auto-picking-a-port should be opt-in via `--port auto` or `--auto-port`.

Bonus: when the helper script `scripts/stealth-next-dev.mjs` writes the picked port to `.stealthql/runtime.json`, the Next proxy doesn't read that file — it reads `STEALTHQL_URL` env. So there's a port-discovery channel mismatch. Either make `proxyStealthRequest` fall back to `runtime.json`, or make the helper script export `STEALTHQL_URL` to the Next subprocess.

### 3. `/_stealthql/shares/{id}` (no action) returns generic "Not found" [low]

The actual share-read URL is `/_stealthql/shares/{id}/read`. I tried the bare `/shares/{id}` first because that's what every REST API in the world returns. Instead of a 404 with a hint like `{"error":"Use /shares/{id}/read|preview|audit|export.csv"}`, I got `{"error":"Not found"}`. Cost me one round-trip to grep the runtime source.

### 4. Audit event shape is inconsistent between SQL and share reads [low]

```js
// SQL select event
{ statement: "select", table: "invoices", rowCount: 0, ... }
// share read event
{ access: "read", shareId: "...", table: "invoices", rowIds: ["inv_acme_001"], rowCount: undefined }
```

So a UI rendering "events" has to write `e.rowCount ?? e.rowIds?.length ?? 0`. Picking one canonical field (probably `rowCount` for both, plus `rowIds` when available) would let consumers render the ledger with a single line.

### 5. `/_stealthql/events?actor=alice` only returns events that are *about* support, not about Alice [medium]

I expected an admin actor to see *all* events in their capsule (including their own reads). Instead, Alice's own normal reads aren't logged at all in what's returned to her, and what *is* returned is a filtered subset I can't fully predict from the docs.

This is probably correct privacy behavior (don't leak other tenants' events), but the rule isn't documented — README only says "an append-only ledger in the private runtime-data directory." Whether `/_stealthql/events` returns *my* writes, *blocked* attempts against me, or *all events visible to my policy* is something I had to discover by experiment.

A short paragraph in the README on what each actor sees from `/events` would save real time.

### 6. The phrase "Repo-native backend capsule for Next.js" is opaque on first read [low]

I had to read three docs before I understood the value prop: **policy-bounded mutations + share-grants + ledger, stitched into a Next.js-native runtime**. The README's "What StealthQL is not" list (no GraphQL, no Prisma, no Supabase) is honest and useful, but the README's first 200 words spend more time on what it *isn't* than what it *uniquely is*.

For a 30-second pitch, I'd lead with the demo I just built: "Support is blind. Same database. Different actor. Watch the policy hold." The seed capsule literally produces that demo — so the value prop *is* a demo.

### 7. Schema/auth/share/seeds are JSON-shaped JS objects [low]

`stealth.schema.mjs` is a deeply-nested JSON object exported from a `.mjs` file. It's machine-friendly, and the helpers `defineSchema` / `defineAuth` from `stealthql/schema` give type hints, but for a human author the nesting is dense (e.g. `policies.invoices.read.any[0].eq[0]`). A short tutorial showing the same policy expressed in the JSON dialect side-by-side with prose ("read invoices when row.orgId equals actor.activeOrgId, OR actor has billing:read scope") would help newcomers feel grounded in the policy DSL.

## Tiny nits

- The `stealth-next-dev.mjs` helper writes `.stealthql/runtime.json` but the proxy doesn't read it — see #2.
- `npm run dev:stealth` from the generated package.json uses `concurrently` but it's not in `devDependencies`; the user has to add it (or the helper script). I added it.
- Running `stealthql setup next` after I'd already written my own `package.json` with custom scripts re-wrote my scripts (added `stealth:dev`, `stealth:reset`, etc.) — fine, but a `--no-modify-scripts` flag would respect existing setups.
- `npx stealthql capsule build` prints a hash — adding the *previous* hash too would make rebuild diffs visible. ("Capsule rebuilt: abcd → efgh — 2 schema changes, 3 share changes.")

## What I'd ship next, if I were on the team

1. **Fix the lockfile recovery** (#1). This is the single biggest "I tried it and walked away" risk on Windows.
2. **`--port N` should imply `--strict-port` by default.** And/or wire `runtime.json` into the proxy.
3. **One-line policy DSL prose mode** in the README — show what each policy clause means in English next to the JSON.
4. **Ship the "support-is-blind" preset.** The default `saas` preset is great. A `saas-with-support-shares` or `support-boundary` preset would be a 60-second demo any sales/security team could run.

## Net

This is a thoughtful product. The hard parts (deterministic capsule, hash-chained ledger, policy → SQL compilation, share principals) are all *done*, and they all work. The friction is in the seams — port discovery, stale lockfiles, error message hints. Polish those and StealthQL becomes the rare backend tool you can hand a non-author and they can use it the same hour.

— Claude Code, 2026-05-01
