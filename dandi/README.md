This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Install dependencies (from this folder):

```bash
yarn install
```

Run the development server:

```bash
yarn dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000) with your browser (`yarn dev` uses **port 3000** by default).

### Ollama (GitHub README summarizer)

Summaries use **[Ollama Cloud](https://docs.ollama.com/cloud)** by default (HTTPS + API key; no local GPU required).

1. Create an **[Ollama API key](https://ollama.com/settings/keys)** and set **`OLLAMA_API_KEY`** in the server environment (e.g. `.env.local` for dev, Vercel project env for production).
2. Defaults: **`OLLAMA_BASE_URL`** = `https://ollama.com` (do not add `/api`; the client appends it), **`OLLAMA_MODEL`** = `gpt-oss:20b-cloud`. Adjust **`OLLAMA_MODEL`** to a cloud model your account supports.
3. **Local Ollama instead:** set **`OLLAMA_BASE_URL=http://127.0.0.1:11434`**, omit **`OLLAMA_API_KEY`**, run **`ollama serve`**, and **`ollama pull`** the model you set in **`OLLAMA_MODEL`**.

On **Vercel**, set **`OLLAMA_API_KEY`** (and optional overrides) in the project environment; the server calls Ollama’s API over the public internet.

### Ollama TLS / corporate proxy

If the summarizer returns **503** and logs or the JSON **`detail`** (in development) mention **self-signed certificate**, **certificate chain**, or **TLS**, your machine or network is intercepting HTTPS to `ollama.com` (common with corporate proxies or antivirus HTTPS scanning).

**Options:**

1. **Trust the corporate root CA in Node** — export your organization’s root certificate as a PEM file, then before `yarn dev` (PowerShell example):

   ```powershell
   $env:NODE_EXTRA_CA_CERTS="C:\path\to\corp-root-ca.pem"
   yarn dev
   ```

   On macOS/Linux: `export NODE_EXTRA_CA_CERTS=/path/to/corp-root-ca.pem`.

2. **Use local Ollama** — set **`OLLAMA_BASE_URL=http://127.0.0.1:11434`**, remove **`OLLAMA_API_KEY`**, run **`ollama serve`**, and use a locally pulled **`OLLAMA_MODEL`** so traffic stays on localhost and avoids that TLS path to the public internet.

### `yarn audit` / `yarn install` — self-signed certificate in certificate chain

On corporate networks or with HTTPS-scanning antivirus, Yarn may fail with **`self-signed certificate in certificate chain`** when talking to the npm registry.

This repo’s **`.yarnrc`** sets **`strict-ssl false`** so Yarn trusts the registry through your network’s TLS inspection (dev convenience).

**Stricter option (recommended for long-term):** export your organization’s root CA, then point Node at it:

```powershell
# From dandi/
.\scripts\export-windows-ca-bundle.ps1
$env:NODE_EXTRA_CA_CERTS = (Resolve-Path .\certs\windows-root-bundle.pem).Path
yarn audit
```

You can set **`NODE_EXTRA_CA_CERTS`** in your user environment variables so every terminal session picks it up. If you use a single PEM from IT instead of the script, set that path directly.

### `EACCES: permission denied …` on a port (Windows)

Hyper-V, WSL, or Docker can **reserve TCP ranges** so binding to `127.0.0.1` fails with **EACCES**. List reserved ports (**PowerShell as Administrator**):

```powershell
netsh interface ipv4 show excludedportrange protocol=tcp
```

- If **3000** is blocked, try **`yarn dev:3456`** or **`yarn dev:3333`**, then set **`NEXTAUTH_URL`** and Google’s redirect URI to that origin.
- **3333** is blocked on some machines; **`yarn dev:3456`** is a common fallback.

To use another port once: `npx cross-env PORT=8080 next dev --hostname 127.0.0.1`.

To listen on every interface (e.g. phone on same Wi‑Fi), use `yarn dev:lan`.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
