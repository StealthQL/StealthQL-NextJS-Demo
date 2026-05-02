import { proxyStealthRequest } from "stealthql/next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type StealthRouteContext = {
  params: Promise<{ path: string[] }>;
};

export function GET(request: Request, context: StealthRouteContext) {
  return proxyStealthRequest(request, context.params);
}

export function POST(request: Request, context: StealthRouteContext) {
  return proxyStealthRequest(request, context.params);
}

export function PUT(request: Request, context: StealthRouteContext) {
  return proxyStealthRequest(request, context.params);
}

export function PATCH(request: Request, context: StealthRouteContext) {
  return proxyStealthRequest(request, context.params);
}

export function DELETE(request: Request, context: StealthRouteContext) {
  return proxyStealthRequest(request, context.params);
}
