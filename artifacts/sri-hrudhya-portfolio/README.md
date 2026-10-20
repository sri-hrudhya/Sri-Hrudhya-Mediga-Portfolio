# Sri Hrudhya Mediga — Portfolio

A responsive, single-page portfolio built with React, Vite, Tailwind CSS, and Framer Motion. All portfolio content lives in `src/data.ts`; the text resume download is generated from that same source.

## Run locally

From this directory:

```sh
pnpm install
pnpm dev
```

Create a production build with `pnpm build`.

## Deploy to Vercel

1. Import this repository into Vercel and choose the portfolio directory (`artifacts/sri-hrudhya-portfolio`) as the project root.
2. Use the Vite framework preset. Set the install command to `pnpm install`, build command to `pnpm build`, and output directory to `dist`.
3. Deploy. No environment variables or backend services are required.
4. To update portfolio details or project links, edit `src/data.ts` and redeploy. Project link buttons render only for valid, non-placeholder HTTPS URLs. DataLens links are unset until the real URLs are supplied; PolicyAssist has its GitHub repository link, while PrediX, VisionAI, and TruHire have no project link buttons.

The contact form opens a prefilled `mailto:` draft in the visitor's email application; this site does not send or store messages.
