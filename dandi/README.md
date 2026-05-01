This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://127.0.0.1:3333](http://127.0.0.1:3333) with your browser (the dev server defaults to **port 3333** because **3000** is often blocked on Windows by Hyper-V / excluded TCP ranges).

### `EACCES: permission denied … :3000` (Windows)

If you need port 3000 specifically, try `npm run dev:3000` after checking Windows has not reserved that port (run **PowerShell as Administrator**):

```powershell
netsh interface ipv4 show excludedportrange protocol=tcp
```

If `3000` falls inside an excluded range, either change the exclusion or keep using port **3333** (`npm run dev`).

To use another port once: `npx cross-env PORT=8080 next dev --hostname 127.0.0.1`.

To listen on every interface (e.g. phone on same Wi‑Fi), use `npm run dev:lan`.

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
