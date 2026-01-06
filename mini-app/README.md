## 🧩 Gridly — Base Mini App

**Gridly** is a fast, fun daily puzzle mini-app built for the Base app.
Everyone gets the same grid.
You only get **one try**.

> **One grid. One try. Every day.**

---

## What is Gridly?

Gridly is a **60-second daily puzzle game** designed for casual, repeat play.

* One puzzle per day
* One attempt per user
* Global leaderboard
* Shareable scores
* Mobile-first
* No wallets, no tokens, no friction

Gridly is built using **Base MiniKit**, **OnchainKit**, and the **Farcaster SDK**.

---



## How It Works

1. Open Gridly inside the Base app
2. Start today’s puzzle
3. Draw a single continuous path on the grid
4. Submit before time runs out
5. View your score and leaderboard
6. Share and return tomorrow

---

## Puzzle Mechanics

* Grid: **3×3**
* Movement: adjacent cells only
* Cells cannot be reused
* One submission per day
* Same puzzle for all users per day

Daily puzzles are generated deterministically using:

* Current date
* Base chain context

---

## Tech Stack

* **Next.js (App Router)**
* **TypeScript**
* **Base MiniKit**
* **OnchainKit**
* **Farcaster SDK**
* **PostgreSQL / SQLite**
* **Vercel**

---

## Environment Variables

Create a `.env.local` file:

```bash
NEXT_PUBLIC_PROJECT_NAME="Gridly"
NEXT_PUBLIC_ONCHAINKIT_API_KEY=<YOUR_CDP_API_KEY>
NEXT_PUBLIC_URL=http://localhost:3000
```

---

## Running Locally

```bash
pnpm install
pnpm dev
```

---

## Deployment

### 1. Deploy to Vercel

```bash
vercel --prod
```

### 2. Update production variables

```bash
NEXT_PUBLIC_PROJECT_NAME="Gridly"
NEXT_PUBLIC_ONCHAINKIT_API_KEY=<YOUR_CDP_API_KEY>
NEXT_PUBLIC_URL=https://your-app.vercel.app
```

Add them to Vercel:

```bash
vercel env add NEXT_PUBLIC_PROJECT_NAME production
vercel env add NEXT_PUBLIC_ONCHAINKIT_API_KEY production
vercel env add NEXT_PUBLIC_URL production
```

---

## Account Association (Required for Publishing)

1. Go to the Farcaster Manifest tool
2. Enter your production domain
3. Generate and sign the account association
4. Paste it into `minikit.config.ts`

```ts
accountAssociation: {
  header: "...",
  payload: "...",
  signature: "..."
}
```

Redeploy after updating.

---

## Testing & Publishing

* Preview your app at: [https://base.dev/preview](https://base.dev/preview)
* Validate metadata & association
* Publish by sharing your app URL in the Base app

---

## Roadmap

### MVP

* Daily puzzle
* Timer & scoring
* Leaderboard
* Share cards
* Light & dark mode

### Next

* Streaks
* Friend leaderboards
* Hard mode grids
* Sponsored puzzles

---

## Disclaimer

This project is a **mini app built using Base developer tools** for entertainment purposes.

Gridly:

* Has **no token**
* Does **not request wallet connections**
* Does **not involve financial products**

Any third-party tokens or apps claiming affiliation with Gridly or Base are unauthorized.

For official Base resources:

* [https://base.org](https://base.org)
* [https://docs.base.org](https://docs.base.org)

---