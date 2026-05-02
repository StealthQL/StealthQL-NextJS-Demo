# StealthQL Agent Instructions

This project uses StealthQL. Read this before changing database, auth, API, storage, share, or backend code.

## What StealthQL Is

StealthQL is a repo-native backend capsule runtime.

The backend is not a hosted dashboard project. It is defined by files in the repo, compiled into a signed capsule, and run by a local runtime.

The source of truth is:

- `stealth.schema.js` / `stealth.schema.mjs` for tables, columns, indexes, and tenant fields.
- `stealth.auth.js` / `stealth.auth.mjs` for actors, auth config, policies, field masks, function policies, and data visibility.
- `stealth.functions.js` / `stealth.functions.mjs` for backend functions.
- `stealth.storage.js` / `stealth.storage.mjs` for storage buckets and policies.
- `stealth.sync.js` / `stealth.sync.mjs` for sync shapes.
- `stealth.shares.js` / `stealth.shares.mjs` for table/row shares, proposal mode, and CSV round trips.
- `stealth.compliance.js` / `stealth.compliance.mjs` for SOC 2, HIPAA, GDPR, data-class, and evidence-pack mappings.
- `stealth.seeds.js` / `stealth.seeds.mjs` for local seed data.
- `stealth.policy.test.js` / `stealth.policy.test.mjs` for behavior tests.
- `.stealthql/capsule.json` is generated. Do not hand-edit it or commit `.stealthql/`.

Private runtime state does not belong in the repo. Local database state, auth tokens, ledgers, and storage blobs live in the OS app-data runtime directory by default, or in `STEALTHQL_DATA_DIR` if explicitly set. Keep `STEALTHQL_DATA_DIR` outside the project and outside deployment artifacts.

## Product Surface

StealthQL offers:

- Local PGlite-backed capsule runtime.
- Schema/auth/policy source files.
- Generated TypeScript client types.
- Local auth emulator, magic links, recovery codes, invites, and org selection.
- Policy-bound row handles for safe mutations.
- Service clients for trusted server jobs.
- Backend functions with side-effect ports for email, SMS, webhooks, payments, and AI.
- Storage buckets with read/write policies.
- Sync shapes for app-facing data access.
- Table/row shares, proposal mode, CSV round trips, and portals.
- Compliance evidence packs through `stealth.compliance.*` and `npx stealthql audit-report`.
- Backend time-capsule snapshots through `npx stealthql snapshot create/inspect/restore`.
- Policy and security tests.
- Export/eject ownership bundles.
- DigitalOcean self-host and split/single deploy plans.

## What StealthQL Is Not

Do not assume this project has or needs:

- GraphQL schema files.
- GraphQL resolvers.
- Apollo Server.
- Prisma.
- Supabase client setup.
- Firebase config.
- A hosted database URL for local dev.
- SQL migrations pasted into a dashboard.

If the user explicitly asks for GraphQL, Prisma, Supabase, or another framework, ask how it should coexist with StealthQL before adding it. Otherwise, use StealthQL's existing client and runtime.

## For AI coding agents

If you are Codex, Claude Code, Cursor, Cline, Roo, or another coding agent, treat this file as the repo's canonical backend contract.

If you are upgrading StealthQL or updating a consumer app across StealthQL versions, read `CHANGELOG.md` before editing app code, schema requests, auth policies, service clients, or deploy scripts.

Do not replace StealthQL with GraphQL, Prisma, Supabase, Firebase, or a generic ORM unless the user explicitly asks.
Cursor: .cursor/rules/*.mdc other ai's can read it it applies to them as well.

## Runtime Model

Local runtime:

```text
npx stealthql dev prints the active URL
```

Run it with:

```powershell
npm run dev:stealth
# or
npx stealthql dev
```

By default StealthQL tries port 8787. If that port is already running, the CLI asks whether to start this capsule on another free port. Scripts can use `--port auto` or `--auto-port` to avoid prompts.

The dev server watches capsule source files and hot-reloads schema, auth, policies, functions, storage, sync, shares, compliance mappings, and seeds without resetting local data. Use `--no-watch` only when you want to disable this.

Core HTTP endpoints are under:

```text
/_stealthql/*
```

In Next.js, browser code should usually call the same-origin proxy:

```text
/api/stealthql/*
```

The generated proxy reads `STEALTHQL_URL` from the dev script in local dev and from server-only Vercel env in production, so app code does not need CORS, fixed ports, or backend credentials.

## Auth and Business Context

Email is an identity credential, not a tenant boundary. A user may belong to more than one business. Session actors include `activeOrgId`, `activeMembership`, membership-scoped `roles`, and separate `platformRoles`; tenant policies should compare app rows to `actor.activeOrgId`, not broadly to every `actor.orgIds` value.

Use this policy shape for normal org-scoped app data:

```js
{ eq: ["row.orgId", "actor.activeOrgId"] }
```

Use the active membership for tenant-admin checks:

```js
{ includes: ["actor.activeMembership.roles", "admin"] }
```

Generated SaaS capsules include a `authConfig.memberContract` mapping for membership management. Preserve this contract when changing auth/schema:

- `users`: `id`, `email`, `phone`, `name`, `status`, `signedUpAt`, `emailVerifiedAt`, `phoneVerifiedAt`, `twoFactorRequired`, `suspendedAt`, `disabledAt`.
- `memberships`: `userId`, `orgId`, `role`, `status`, `joinedAt`, `invitedAt`, `suspendedAt`, `disabledAt`, `twoFactorRequired`.
- Normal statuses are `invited`, `active`, `suspended`, `disabled`, and `deleted`.
- Suspended/disabled/deleted users and suspended/disabled/removed/revoked/inactive memberships must not mint sessions.
- If `twoFactorRequired` is true on the user or active membership, magic-link verification should return `requiresSecondFactor`; finish with `stealth.auth.verifyRecoveryFactors(...)`.

Magic-link auth returns `requiresOrgSelection: true` when an email maps to multiple businesses. The UI must ask the user which business to enter, then call:

```js
await stealth.auth.verifyMagicLink(token, { orgId: "org_acme" });
```

If a user cannot receive email, use one-time recovery codes instead of adding passwords or raw actor impersonation. Recovery codes may be issued by the signed-in user for themselves, an active org admin for a member in that org, local dev, or a trusted service account with `provisioning:write`, then verified with `stealth.auth.verifyRecoveryCode(...)`.

For stronger recovery or 2FA-style flows, use distinct factors: magic link, SMS, and TOTP/Google Authenticator-compatible codes. Prefer `stealth.auth.verifyRecoveryFactors(...)` with two verified factors over any single-factor recovery shortcut. SMS delivery goes through the locked `ctx.ports`/runtime port model; do not hand-roll Twilio fetches in app code.

## How To Use StealthQL In Next.js

Use the provided client. Do not invent GraphQL endpoints.
The npm package ships TypeScript declarations for `stealthql`, `stealthql/next/client`, `stealthql/next/server`, and the backwards-compatible `stealthql/next` entry. Do not add broad `declare module "*.js"` workarounds. In TypeScript Next.js apps, `npx stealthql setup next --typescript` generates `.ts` / `.tsx` proxy, lib, and demo files.

Public typed imports:

- `stealthql`: root exports.
- `stealthql/next/client`: browser-safe Next.js client helper for Client Components.
- `stealthql/next/server`: Next.js server client and proxy helpers for route handlers, API routes, Server Components, and server actions.
- `stealthql/next`: compatibility entry that re-exports both sides; prefer the split entries in new code.
- `stealthql/client`: generic browser, mobile, Vite, Expo, SvelteKit, Astro, and Remix client helper.
- `stealthql/react-native`: React Native / Expo client helper for absolute runtime URLs and bearer tokens.
- `stealthql/server`: generic server and proxy helpers.
- `stealthql/vite`: Vite dev-server proxy adapter.
- `stealthql/sveltekit`: SvelteKit request-handler proxy adapter.
- `stealthql/astro`: Astro endpoint proxy adapter.
- `stealthql/schema`: typed capsule authoring helpers such as `defineSchema`, `defineAuth`, `defineStorage`, `defineSync`, `defineShares`, and `defineSeeds`.
- `stealthql/types`: shared TypeScript types only.

If Next.js dev warns about cross-origin local resources from `127.0.0.1`, add `allowedDevOrigins: ["127.0.0.1", "localhost"]` to `next.config.*`.

For Vite, SvelteKit, Astro, Expo web, Remix, or other non-Next clients, import `createStealthClient` from `stealthql/client` and keep browser calls relative to `/_stealthql/*`. In local dev, run `npx stealthql dev --port auto --auto-port --port-file .stealthql/runtime.json`; use `stealthql/vite`, `stealthql/sveltekit`, or `stealthql/astro` server-side adapters to proxy `/_stealthql/*`. Use `--strict-port` when a proxy expects a fixed port and should fail loudly. `stealthVite()` resolves relative `runtimeFile` paths from the Vite config directory first, then from `process.cwd()` for compatibility. In Astro/SvelteKit dev, prefer `stealthVite()` because those frameworks run on Vite; use `createStealthAstroHandler()` / `createStealthSvelteKitHandler()` for explicit framework endpoint routes. See `docs/VITE_INTEGRATION.md`.

For React Native or Expo native apps, import `createStealthReactNativeClient` from `stealthql/react-native`. Pass an absolute `baseUrl` such as `http://10.0.2.2:8787` for the Android emulator, `http://127.0.0.1:8787` for the iOS simulator, or the production API/proxy origin. Use `token` or `getToken` for real mobile sessions; do not ship raw local actors in mobile production code.

Use `stealthql/schema` for typed capsule files or `.mjs` IntelliSense:

```js
import { defineSchema } from "stealthql/schema";

export default defineSchema({
  name: "my-app",
  tables: {
    projects: {
      columns: {
        id: { type: "text", primary: true },
        name: { type: "text", required: true }
      }
    }
  }
});
```

StealthQL validates and canonicalizes mutation inputs from the compiled schema. Prefer specific column types (`email`, `phone`, `url`, `status`, `money`, `checkbox`) instead of storing everything as generic text. Normal text is NFC-normalized and trimmed, `longText` preserves surrounding whitespace unless configured otherwise, emails/statuses are lowercased, URLs are canonicalized HTTP(S), integer-like form strings become numbers, boolean-like form strings become booleans, and `enum`/`minLength`/`maxLength`/`emptyAsNull`/`case` options are enforced. Do not HTML-escape before storage; escape at render boundaries.

Every `npx stealthql capsule build` emits `.stealthql/client.d.ts`. When TypeScript includes that file, `stealthql/next/client`, `stealthql/next`, and `stealthql/client` imports become schema-aware: bad table names, unknown mutation fields, missing required insert fields, and wrong scalar types should fail type-checking. If a project has a narrow `tsconfig.json` `include`, add `.stealthql/**/*.d.ts`.

Do not treat IDs as the security boundary. Text `id` values are generated as opaque `prefix_<random>` strings from `crypto.randomUUID()` when omitted on insert, which avoids sequential enumeration, but IDOR prevention must come from actor resolution and policies.

Use policy-bound row handles for user mutations. Query results include `$key` for UI identity and `$handles` for action-specific capabilities. Production user update/delete mutations should send `handle` instead of trusting raw ids:

```js
const { rows } = await stealth.query("projects");
await stealth.mutate("projects", "update", {
  handle: rows[0].$handles.update,
  patch: {
    visibility: "public"
  }
});
```

Do not put row handles in URLs or logs. Use `$key` for React keys and cache identity; use `$handles.update` / `$handles.delete` only when performing that action. A read handle must not be used for update, and an update handle must not be used for delete. Handles are sealed, short-lived, session-bound when possible, policy/capsule-bound, and destructive handles are single-use. If trusted server code truly needs raw-id mutation, use `stealth.unsafe.mutateById(...)`; never use it for browser/mobile user flows.

Do not use local actors such as `alice`, `bob`, or `support` as service accounts in signup, Stripe webhooks, cron jobs, background workers, or production server routes. Use a service account and `createStealthServiceClient`:

```js
import { createStealthServiceClient } from "stealthql/server";

const stealth = createStealthServiceClient({
  token: process.env.STEALTHQL_SERVICE_TOKEN,
  serviceAccount: "system"
});
```

Service accounts live in `stealth.auth.*` under `serviceAccounts` and should be scoped with explicit `scopes`. Preferred production vocabulary is `provisioning:write`, `projects:read`, `projects:write`, `projects:delete`, `billing:read`, `billing:write`, `billing:delete`, `share:issue`, and `share:manage`. For generated custom tables, use the generated table scopes such as `jobs:read` and `jobs:write`, or `data:read` / `data:write` only for deliberate cross-table service work.

`serviceAccount` is the service actor hint, for example `"roofpo_service"` becomes `service:roofpo_service`. The bearer token remains the authority, but the hint keeps server-side URLs and request bodies from falling back to `actor=anonymous`.

Zod is optional. If the app uses Zod, keep StealthQL as the schema source of truth and bind Zod validators to generated types from `./.stealthql/client.js` with `satisfies z.ZodType<InsertInput<"table">>`.

Local demo only. Do not use `actor: "alice"` in production code.

```js
import { createStealthNextClient } from "stealthql/next/client";

const stealth = createStealthNextClient({ actor: "alice" });

const projects = await stealth.query("projects");
const result = await stealth.sql("select id, name from projects;");

await stealth.mutate("projects", "insert", {
  id: "proj_new",
  orgId: "org_acme",
  ownerId: "user_alice",
  name: "New Project",
  visibility: "private"
});

await stealth.auth.signInAs("alice");
await stealth.call("createProject", { name: "From function" });
```

For Server Components, server actions, or API routes, use the server client and forward request headers so StealthQL resolves the actor from a real session cookie, bearer token, or share token. Do not hardcode `actor: "alice"` in deployed routes.

```js
import { headers } from "next/headers";
import { createStealthServerClient } from "stealthql/next/server";

const stealth = createStealthServerClient({
  headers: await headers()
});
const projects = await stealth.query("projects");
```

Available client areas:

- `stealth.query(table)`
- `stealth.shape(shape)`
- `stealth.sql(sql)`
- `stealth.mutate(table, action, input)`
- `stealth.call(functionName, input)`
- `stealth.auth.*`
- `stealth.storage.*`
- `stealth.shares()`
- `stealth.readShare(id)`
- `stealth.proposals()`
- `stealth.acceptProposal(...)`
- `stealth.rejectProposal(...)`
- `stealth.exportShareCsv(...)`
- `stealth.importShareCsv(...)`
- `stealth.scope.describe()`
- `stealth.memory.recall(...)`
- `stealth.memory.forget(...)`

Compliance reports:

- Use `stealth.compliance.*` to map tables, storage buckets, shares, functions, and data classes to SOC 2, HIPAA Security Rule, and GDPR control references.
- Run `npx stealthql audit-report --framework soc2-cc7 --out evidence/soc2-cc7` to generate JSON/Markdown evidence packs from the capsule, policies, data visibility, and hash-chained ledger.
- Treat audit reports as evidence/readiness packs, not automatic certification or legal advice.

Data placement:

- `stealth.auth.*` `dataVisibility` should describe where sensitive data may exist, not only who can read it.
- Use `mayExistOn` with keys `server`, `mobileDevice`, `browserCache`, `aiPrompt`, `supportExport`, `evidencePacket`, and `externalShare`.
- For emails, phones, addresses, notes, payment IDs, tokens, signatures, and private documents, set `aiPrompt: false` and `supportExport: false` unless the user explicitly asks for those destinations.
- Do not put data with `mayExistOn.externalShare === false` into shares, portals, CSV exports, or signable packets.
- Backend AI calls must use `ctx.ports.ai.complete(...)`, `ctx.ports.ai.embed(...)`, or `ctx.ports.ai.classify(...)`; do not hand-roll OpenAI/Anthropic/fetch calls inside functions.
- Include `sources: [{ table, row }]` on AI port calls when prompt text is derived from rows. The runtime uses those sources to block or redact fields with `aiReadable: false`, `mayExistOn.aiPrompt: false`, or provider-class restrictions.
- Use `aiReadable` provider matrices for model placement: `localDevice`, `privateCloud`, `hostedCloud`, `vendorAgent`, `support`, `modelTraining`, and `redactedExtract`.

Agent/MCP runtime foundation:

- The MCP server is a separate product; apps should not hand-roll MCP logic inside app routes.
- Use `stealth.auth.*` `agentAccounts` for AI/MCP agents. Agents are not users, service accounts, or share principals.
- Agent sessions are short-lived bearer sessions created through `/_stealthql/auth/agent-session` by a configured issuer, platform admin, or service actor with `agent:issue`, `agent:write`, or `provisioning:write`.
- Revoke live agent sessions through `/_stealthql/auth/agent-session/revoke`; do not wait for TTL expiry when an agent task, key, or operator is no longer trusted.
- Never use `actor: "agent:name"` or a hand-built `{ type: "agent" }` object. Agent authority only exists when the runtime resolves a live `agent_...` session token.
- Agent actors carry `agentName`, `agentSessionId`, `taskId`, `scopeShareId`, `trustClass`, `keyId`, and key fingerprint metadata. Keep those fields in audit/provenance events.
- Use `stealth.scope.describe()` or `GET /_stealthql/scope/describe` to discover the policy-scoped tool surface instead of hardcoding agent tools.
- Use `stealth.memory.recall()` / `stealth.memory.forget()` for agent memory. It is a filtered ledger view with tombstones, not a separate vector database by default.
- Use mutation `dryRun: true` before risky agent writes; dry-runs record decisions without changing materialized state.
- Do not give agents service tokens as their normal identity. Scope agents through shares, policies, rate limits, and AI-port placement rules.

Backend snapshots:

- Use `npx stealthql snapshot create --as-of <iso-date> --out snapshots/bug.stealthql-snapshot.json.gz` to capture capsule source, compiled capsule, generated client files, and the ledger prefix up to a time.
- Use `npx stealthql snapshot restore <file> --out tmp/repro` to reproduce a backend locally.
- Use `npx stealthql query <table> --actor <actor> --as-of <iso-date>` for V1 historical reads. V1 uses current capsule policy over historical ledger data and does not return mutation handles.
- Snapshot V1 does not include storage blobs; do not promise full file-object replay until a storage-inclusive format exists.

## When the user asks for database or auth changes

Prefer the schema-request workflow:

1. Read this file and inspect the machine contract:

```powershell
npx stealthql schema spec
```

If the user gives a plain app idea, create an LLM prompt first:

```powershell
npx stealthql schema prompt --idea "Describe the app" --out STEALTHQL_SCHEMA_PROMPT.md
```

2. Write or update `stealth.schema.request.json`.

Keep `stealth.schema.request.json` in the app root only while it is the active schema request. Packaged samples live under `examples/`; do not treat an example request as the applied backend if `stealth.schema.*` says something else.

3. Preview the generated backend:

```powershell
npx stealthql schema preview --file stealth.schema.request.json
```

4. Apply and test:

```powershell
npx stealthql schema apply --file stealth.schema.request.json --test
```

This preserves the current local database by default and applies additive schema changes in place. It only rebuilds from seeds when the user explicitly passes `--reset`. The `--test` run uses an isolated temporary materializer, so policy/security tests should not wipe the developer's working local data.

When schema apply regenerates `stealth.seeds.*`, existing seed rows with the same `id` are preserved and new columns receive generated defaults. Do not overwrite realistic user-edited seed data with placeholder sample values.

5. Run the app:

```powershell
npm run dev:stealth
```

## When The User Asks To Build A Feature

1. Use the existing StealthQL client from `stealthql/next/client`.
2. Read table names from `stealth.schema.js` / `stealth.schema.mjs` or from `stealth.schema.request.json` if the schema is being designed.
3. Use local actors like `alice`, `bob`, `support`, and `anonymous` for local dev.
4. For auth UI, call `stealth.auth.signInAs`, `stealth.auth.signInWithMagicLink`, `stealth.auth.verifyMagicLink`, `stealth.auth.createRecoveryCode`, `stealth.auth.verifyRecoveryCode`, `stealth.auth.requestSmsCode`, `stealth.auth.createTotpEnrollment`, `stealth.auth.verifyTotpEnrollment`, `stealth.auth.verifyRecoveryFactors`, `stealth.auth.getSession`, or `stealth.auth.inviteMember`.
5. For app UI reads, prefer `stealth.query(table)`, `stealth.shape(shape)`, generated clients, and functions. Treat `stealth.sql(sql)` as a local/admin/dev tool unless the user explicitly asks for a SQL-powered feature.
6. For writes, use `stealth.mutate(table, action, input)`; do not bypass policy checks.
7. For reusable app data, define shapes in `stealth.sync.*` and use `stealth.shape(name)`.
8. For backend behavior, define functions in `stealth.functions.*`; functions receive `ctx.actor`, `ctx.query`, `ctx.mutate`, `ctx.ports`, capsule metadata, and mode. Use functions for multi-row or cross-role actions, such as "insert an audit/event row as the user, then update a protected aggregate field under policy," instead of doing two browser mutations.
9. For email, SMS, webhooks, payments, AI, and other side effects, use `ctx.ports`; do not hand-roll production/local side-effect branches.
10. For files, define buckets in `stealth.storage.*` and use `stealth.storage.*` instead of custom upload tables unless the user asks.
11. For share workflows, use `stealth.readShare`, `stealth.proposals`, `stealth.acceptProposal`, `stealth.rejectProposal`, `stealth.exportShareCsv`, and `stealth.importShareCsv`. CSV imports should become proposals, not direct mutations.
12. After changing schema/auth/policies/functions/storage/sync/shares, run tests.

Shares are delegated owner grants. The owner must be allowed to create/read the shared resource, then the recipient receives only the share-scoped fields, filters, grants, expiration, revocation state, and proposal permissions. Proposal objects expose canonical `proposalId` plus an `id` alias for UI code. Do not model shares as full org membership for the recipient. Hosted share portals should exchange the `share_token` URL parameter once for a share-scoped HttpOnly cookie, then remove the token from the URL. Portal proposal/CSV requests should rely on that cookie, not actor fields or long-lived URL tokens. Signable shares with `lockAfterSign: true` intentionally keep rows locked across dev sessions until the runtime state is reset or the share/signature state changes.

Security tests are part of the product. Do not skip them. They should catch tenant leaks, share leaks, hidden-field exposure, raw-ID mutation bugs, row-handle misuse, CSV proposal safety, and production deployment misconfigurations.

Production auth note: local actor impersonation is disabled outside local mode. A trusted server route may mint a session, create a magic link, issue a recovery code, request an SMS code, or start TOTP enrollment only with a verified session/admin path or a service account token that has `provisioning:write`. Use `createStealthServiceClient()` or forward `Authorization: Bearer <service-token>` from server code. Do not ask the browser to send `actor: "alice"` or body fields like `bypassLocalGate`; the runtime ignores body-provided bypass flags.

## DigitalOcean Droplet Deployment

If the user asks to deploy to DigitalOcean, read:

- `docs/DIGITALOCEAN_DEPLOYMENT.md`
- `docs/DIGITALOCEAN_SINGLE_DROPLET.md` when the website and capsule runtime are on one Droplet
- `docs/VERCEL_DIGITALOCEAN_SPLIT.md` when the frontend is on Vercel
- `scripts/digitalocean-ubuntu-setup.sh`

Deployment model:

```text
internet -> nginx :443/:80 -> 127.0.0.1:<STEALTHQL_PORT> -> stealthql runtime
```

Do not expose the StealthQL runtime port publicly. The runtime should bind locally and nginx should be the public entrypoint.

For the common split deployment, do not separate the capsule into a hand-maintained second repo. Use one repo with two targets:

- Vercel deploys the Next.js frontend and generated `/api/stealthql/*` proxy.
- DigitalOcean deploys the same repo as the StealthQL runtime.
- Vercel sets server-only `STEALTHQL_URL=https://api.example.com`.
- Browser code keeps using `/api/stealthql/*`, not the DigitalOcean URL.

Plan it with:

```powershell
npx stealthql deploy
```

or directly:

```powershell
npx stealthql deploy split --frontend-url https://app.example.com --backend-url https://api.example.com --write
```

For the easiest single-Droplet deployment, run `npx stealthql deploy` and choose the DigitalOcean-only option, or use `npx stealthql deploy single --domain https://app.example.com --repo <repo> --write`. Use one repo and set `DEPLOY_WEB=true`. nginx should proxy public traffic to the Next.js service on `127.0.0.1:3000`; the Next proxy should call the StealthQL runtime privately on `127.0.0.1:8787`. Do not expose the runtime directly.

Before deployment:

```powershell
npx stealthql capsule build
npx stealthql test policies
npx stealthql test security
npx stealthql deploy self
```

Important Droplet variables:

- `APP_REPO`: Git repo to clone on the server.
- `APP_REF`: branch/tag/ref, default `main`.
- `APP_NAME`: service/app name.
- `DOMAIN`: public hostname for nginx/TLS.
- `LETSENCRYPT_EMAIL`: email for certbot.
- `STEALTHQL_PORT`: local runtime port, default `8787`.
- `STEALTHQL_DATA_DIR`: private runtime data directory, default `/var/lib/stealthql/<app>`.
- `STEALTHQL_BACKUP_DIR`: root-only local pre-deploy backup directory, default `/var/backups/stealthql/<app>`.
- `USE_RELEASES=true`: deploy into timestamped releases and point `/opt/stealthql/apps/<app>` at the active release.
- `RUN_SECURITY_TESTS=true`: run the long security suite during deploy.
- `RESTRICT_OUTBOUND=true`: block service outbound network access except loopback. Only use this when the capsule does not need email, webhooks, payments, OAuth, or external APIs.

Preferred agent flow:

```bash
/root/stealthql-do-setup.sh plan
/root/stealthql-do-setup.sh
/root/stealthql-do-setup.sh doctor
```

The agent should fill in variables and run the audited script. It should not improvise SSH, firewall, nginx, certbot, systemd, chmod/chown, backup, or runtime-state commands as root.

Security invariants for Droplets:

- Runtime data must stay outside the repo, normally under `/var/lib/stealthql/<app>`.
- App source should be root-owned; the `stealthql` service user can read source but should not rewrite it.
- Timestamped releases should live under `/opt/stealthql/releases/<app>` and the active app path should be a symlink.
- The service should run as the unprivileged `stealthql` user under systemd.
- Writable runtime paths should be narrow: `STEALTHQL_DATA_DIR` and log/cache directories. The source checkout and generated capsule artifacts should be read-only to the runtime service after deploy.
- Keep nginx, ufw, fail2ban, unattended upgrades, and TLS enabled.
- Deployed routes must use real sessions/tokens. Never hardcode local actors like `alice` in production routes.
- Do not put service tokens in `NEXT_PUBLIC_*` or any frontend-visible environment variable.
- Do not expose `:8787`; public traffic must go through nginx on `:80` and `:443`.
- Do not weaken SSRF guards. `STEALTHQL_URL` is server-only and must be loopback for local/single-Droplet mode or public HTTPS for split deployments. Webhook port URLs must be public HTTPS by default. Private proxy or webhook targets require the explicit env escape hatches `STEALTHQL_ALLOW_PRIVATE_PROXY_URLS=true` or `STEALTHQL_ALLOW_PRIVATE_WEBHOOK_URLS=true`.
- If the server is compromised as the app user, data protection relies on least privilege and narrow write paths. If root is compromised, rotate secrets and restore from trusted off-box backups.

Production red flags:

- `actor: "alice"`, `actor: "bob"`, or another local actor in deployed code.
- `STEALTHQL_URL` exposed through `NEXT_PUBLIC_*`.
- Browser code calling the runtime URL directly instead of `/api/stealthql/*`.
- The StealthQL runtime port exposed publicly.
- Empty `authConfig.production.allowedOrigins` or redirect/callback origins before deployment.
- Share proposal or CSV requests posting actor fields in production portals.
- Raw-id update/delete from browser or mobile code.
- `STEALTHQL_DATA_DIR` inside the repo or deploy artifact.

## Rules for agents

- Do not look for GraphQL unless the user explicitly asks for GraphQL.
- Do not add Apollo, Prisma, tRPC, Supabase, Firebase, or ORM setup just because this is a backend.
- Do not edit `.stealthql/capsule.json`; rebuild it with `npx stealthql capsule build`.
- Do not commit `.stealthql/`, `stealthql-export/`, `backups/`, local state JSON, auth state, ledgers, or storage blobs.
- `stealth.project.json` is a non-secret stable project identity. Keep it with the project; do not put private data in it.
- Keep private runtime state outside the repo. If `STEALTHQL_DATA_DIR` is used, it must point outside the project.
- Use friendly names in `stealth.schema.request.json`; StealthQL sanitizes them into safe identifiers.
- Mark sensitive fields with `"private": true`.
- For user-facing search on large tables, declare `searchIndexes` in `stealth.schema.*` and use `stealth.search(table, query)`; do not build broad SQL `LIKE` scans for app search.
- Use narrow service scopes. Preferred production scopes include `provisioning:write`, `projects:read`, `projects:write`, `projects:delete`, `billing:read`, `billing:write`, `billing:delete`, `share:issue`, and `share:manage`.
- Use `email`, `money`, `status`, `checkbox`, `date`, `url`, `text`, or `longText` as column types.
- Use `actor.activeOrgId` for tenant policies and generated mutations. Do not use `actor.orgIds` as the default app-data boundary unless the user explicitly wants a cross-business view.
- When an email belongs to multiple businesses, magic-link verification must include an `orgId`; otherwise it should show an org picker and must not mint a session.
- Do not bypass generated policy tests.
- Do not paste SQL into a dashboard. Generate the capsule and run the tests locally.
- After applying schema changes, verify with `npx stealthql test policies` and `npx stealthql test security`; these use isolated temporary data by default. Use `npx stealthql test security --smoke` for fast local iteration and the full command for release/CI checks. Use `--live` only when the user explicitly wants to test against the current local runtime data.
- Do not run `stealthql dev --reset`, `npm run stealth:reset`, or `schema apply --reset` unless the user explicitly asks to discard and rebuild local data from seeds.
- Do not hardcode `actor: "alice"`, `actor: "bob"`, or any local actor in deployed API routes. Local actor selection is for local development only; deployed routes must forward sessions/tokens.
- Before self-hosted or hosted production, configure explicit `authConfig.production.allowedOrigins` and any redirect/callback origins. Empty production origins should block deployment readiness.
- For DigitalOcean deployment, use `docs/DIGITALOCEAN_DEPLOYMENT.md` and `scripts/digitalocean-ubuntu-setup.sh`; do not invent a public `:8787` deployment.
- For Vercel frontend plus DigitalOcean runtime, use `docs/VERCEL_DIGITALOCEAN_SPLIT.md` and `npx stealthql deploy split --frontend-url ... --backend-url ... --write`. Keep browser calls on `/api/stealthql/*`; set server-only `STEALTHQL_URL` in Vercel.
- For single-Droplet web plus runtime, use `docs/DIGITALOCEAN_SINGLE_DROPLET.md` and set `DEPLOY_WEB=true`.
- If Cursor is confused, summarize this as: "StealthQL is a local backend capsule. Use `stealthql/next/client` for browser code and `stealthql/next/server` for server code, not GraphQL."

## Example request

```json
{
  "format": "stealthql.schema-request",
  "version": 1,
  "mode": "custom",
  "appName": "Client Portal",
  "tables": [
    {
      "name": "Clients",
      "searchIndexes": {
        "default": [
          "Name"
        ]
      },
      "columns": [
        {
          "name": "Name",
          "type": "text",
          "required": true,
          "indexed": true
        },
        {
          "name": "Email",
          "type": "email",
          "private": true
        },
        {
          "name": "Status",
          "type": "status",
          "defaultValue": "active"
        }
      ]
    },
    {
      "name": "Projects",
      "searchIndexes": {
        "default": [
          "Name"
        ]
      },
      "columns": [
        {
          "name": "Name",
          "type": "text",
          "required": true
        },
        {
          "name": "Client Id",
          "type": "text",
          "required": true,
          "indexed": true
        },
        {
          "name": "Budget",
          "type": "money"
        },
        {
          "name": "Internal Notes",
          "type": "longText",
          "private": true
        }
      ]
    }
  ],
  "serviceAccounts": []
}
```
