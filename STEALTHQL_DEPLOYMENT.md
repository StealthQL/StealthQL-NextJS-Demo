# StealthQL Next.js Split Deployment

This project uses one repo for two deployment targets:

- Vercel runs the Next.js frontend and the same-origin `/api/stealthql/*` proxy.
- DigitalOcean runs the StealthQL capsule runtime behind nginx at `https://api.example.com`.
- Browser code keeps calling `/api/stealthql/*`; it never talks to the Droplet directly.

For App Router projects, the generated proxy route uses the Node.js runtime so it can reliably read server-only environment variables on Vercel.

## Vercel Environment

Set these in Vercel:

```text
NEXT_PUBLIC_STEALTHQL_API=/api/stealthql
STEALTHQL_URL=https://api.example.com
```

`STEALTHQL_URL` is server-only. Do not prefix it with `NEXT_PUBLIC_`.

Only add `STEALTHQL_SERVICE_TOKEN` to Vercel if a server route needs service-account access. Never expose service tokens to client components or browser env vars.

## Next Dev Origins

Next.js 16 may warn when local dev assets or API calls cross between `localhost` and `127.0.0.1`. If you see that warning, add this to `next.config.*`:

```js
const nextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"]
};

export default nextConfig;
```

## Capsule Auth Origins

Before production, set your deployed origins in `stealth.auth.*`:

```js
authConfig: {
  production: {
    requireHttps: true,
    allowedOrigins: ["https://app.example.com", "https://api.example.com"],
    allowedRedirectOrigins: ["https://app.example.com"]
  },
  oauth: {
    allowedCallbackOrigins: ["https://app.example.com", "https://api.example.com"]
  }
}
```

## Plan The Split

Run `npx stealthql deploy` and choose the Vercel + DigitalOcean option, or run this direct command locally before deployment:

```bash
npx stealthql deploy split \
  --frontend-url https://app.example.com \
  --backend-url https://api.example.com \
  --repo https://github.com/you/your-app.git \
  --app-name my-app \
  --email you@example.com \
  --write
```

The command validates the Next proxy route and capsule auth origins, then prints the exact Vercel env and DigitalOcean bootstrap variables.
With `--write`, it also creates `STEALTHQL_DEPLOYMENT_PLAN.md`, `stealthql.vercel.env.example`, `stealthql.digitalocean.env.example`, and `stealthql.auth-origins.snippet.js`.

## DigitalOcean Runtime

On the Droplet, use the shipped hardened bootstrap script from the installed package or repo:

```bash
APP_REPO="https://github.com/you/your-app.git" \
APP_REF="main" \
APP_NAME="my-app" \
DOMAIN="api.example.com" \
LETSENCRYPT_EMAIL="you@example.com" \
RUN_SECURITY_TESTS=true \
/root/stealthql-do-setup.sh
```

The runtime binds to `127.0.0.1:8787`; nginx is the public HTTPS entrypoint. Do not expose `:8787` directly.

## Easier Single-Droplet Option

If you do not need Vercel, run the website and capsule runtime on one Droplet:

```bash
npx stealthql deploy
```

Choose the DigitalOcean-only option, or use this direct server command:

```bash
APP_REPO="https://github.com/you/your-app.git" \
APP_NAME="my-app" \
DOMAIN="app.example.com" \
LETSENCRYPT_EMAIL="you@example.com" \
DEPLOY_WEB=true \
RUN_SECURITY_TESTS=true \
/root/stealthql-do-setup.sh
```

nginx proxies public traffic to Next.js on `127.0.0.1:3000`, and the Next proxy calls StealthQL privately on `127.0.0.1:8787`.

## Mental Model

Do not split the code by hand. The same repo contains the frontend and capsule source. Vercel uses only the proxy/client path; DigitalOcean materializes the capsule runtime and private state under `/var/lib/stealthql/<app>`.
