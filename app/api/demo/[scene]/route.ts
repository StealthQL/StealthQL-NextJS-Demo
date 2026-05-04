import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type DemoActor = "alice" | "bob" | "support";

type DemoScene = {
  actor: DemoActor;
  method?: "GET" | "POST";
  path: string;
  body?: Record<string, unknown>;
};

type DemoRouteContext = {
  params: Promise<{ scene: string }>;
};

const STEALTHQL_URL = process.env.STEALTHQL_URL ?? "http://127.0.0.1:8787";
const SERVICE_TOKEN = process.env.STEALTHQL_SERVICE_TOKEN ?? "";

const scenes: Record<string, DemoScene> = {
  alice: {
    actor: "alice",
    path: "state?table=invoices",
  },
  "support-direct": {
    actor: "support",
    path: "state?table=invoices",
  },
  "share-read": {
    actor: "support",
    path: "shares/supportRedactedAcme/read",
  },
  "attack-sql": {
    actor: "support",
    method: "POST",
    path: "sql",
    body: { sql: "select * from invoices" },
  },
  "attack-revoked": {
    actor: "support",
    path: "shares/supportRedactedAcmeRevoked/read",
  },
  "attack-expired": {
    actor: "support",
    path: "shares/supportRedactedAcmeExpired/read",
  },
  ledger: {
    actor: "alice",
    path: "events?limit=12",
  },
};

const tableNames = ["organizations", "memberships", "projects", "invoices"];

export async function GET(_request: Request, context: DemoRouteContext) {
  const { scene } = await context.params;
  if (scene === "tables-alice") return readTablesAs("alice");
  if (scene === "tables-bob") return readTablesAs("bob");

  const selected = scenes[scene];
  if (!selected) {
    return NextResponse.json({ error: "Unknown demo scene." }, { status: 404 });
  }

  return runScene(selected);
}

async function readTablesAs(actor: DemoActor) {
  const session = await sessionFor(actor);
  if (session.ok === false) return json(session.body, session.status);

  const entries = await Promise.all(
    tableNames.map(async (table) => {
      const response = await runtimeFetch(`state?table=${encodeURIComponent(table)}`, {
        actor,
        accessToken: session.accessToken,
      });
      const body = await readJson(response);
      return [body?.table ?? table, body?.rows ?? []] as const;
    }),
  );
  return json({ tables: Object.fromEntries(entries) }, 200);
}

async function runScene(scene: DemoScene) {
  const session = await sessionFor(scene.actor);
  if (session.ok === false) return json(session.body, session.status);

  const response = await runtimeFetch(scene.path, {
    actor: scene.actor,
    accessToken: session.accessToken,
    method: scene.method,
    body: scene.body,
  });
  return json(await readJson(response), response.status);
}

async function sessionFor(actor: DemoActor): Promise<
  | { ok: true; accessToken: string | null }
  | { ok: false; status: number; body: Record<string, unknown> }
> {
  if (!SERVICE_TOKEN) {
    if (isLocalStealthUrl(STEALTHQL_URL)) return { ok: true, accessToken: null };
    return {
      ok: false,
      status: 500,
      body: {
        error:
          "STEALTHQL_SERVICE_TOKEN is required for this production demo route so it can mint a verified demo session instead of sending raw actors from the browser.",
      },
    };
  }

  const response = await fetch(runtimeUrl("auth/sign-in-as"), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${SERVICE_TOKEN}`,
    },
    body: JSON.stringify({ actor }),
    cache: "no-store",
  });
  const body = await readJson(response);
  if (!response.ok || typeof body?.accessToken !== "string") {
    return { ok: false, status: response.status, body: body ?? { error: "Failed to mint demo session." } };
  }
  return { ok: true, accessToken: body.accessToken };
}

async function runtimeFetch(
  path: string,
  options: {
    actor: DemoActor;
    accessToken: string | null;
    method?: "GET" | "POST";
    body?: Record<string, unknown>;
  },
) {
  const method = options.method ?? "GET";
  const url = runtimeUrl(path);
  const body = options.body ? { ...options.body } : {};
  if (!options.accessToken) {
    if (method === "GET") {
      url.searchParams.set("actor", options.actor);
    } else {
      body.actor = options.actor;
    }
  }

  return fetch(url, {
    method,
    headers: {
      "content-type": "application/json",
      ...(options.accessToken ? { authorization: `Bearer ${options.accessToken}` } : {}),
    },
    body: method === "GET" ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
}

function runtimeUrl(path: string): URL {
  return new URL(`/_stealthql/${path.replace(/^\/+/u, "")}`, `${STEALTHQL_URL.replace(/\/+$/u, "")}/`);
}

async function readJson(response: Response): Promise<any> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function json(body: unknown, status: number) {
  return NextResponse.json(body ?? null, { status });
}

function isLocalStealthUrl(value: string): boolean {
  try {
    const hostname = new URL(value).hostname;
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
  } catch {
    return false;
  }
}
