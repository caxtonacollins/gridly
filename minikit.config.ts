const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');

/**
 * MiniApp configuration object. Must follow the Farcaster MiniApp specification.
 *
 * @see {@link https://miniapps.farcaster.xyz/docs/guides/publishing}
 */
export const minikitConfig = {
  accountAssociation: {
    header: "",
    payload: "",
    signature: ""
  },
  miniapp: {
    version: "1.0.0",
    name: "Gridly", 
    subtitle: "Daily puzzle", 
    description: "One grid. One try. Every day.",
    iconUrl: `${ROOT_URL}/logo.svg`,
    screenshotUrls: [`${ROOT_URL}/screenshot-portrait.png`],
    heroImageUrl: `${ROOT_URL}/og/default.png`,
    splashImageUrl: `${ROOT_URL}/og/default.png`,
    splashBackgroundColor: "#020617",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "games",
    tags: ["puzzle", "daily", "casual", "games"],
    tagline: "",
    ogTitle: "Gridly — Daily Puzzle",
    ogDescription: "One grid. One try. Every day.",
    ogImageUrl: `${ROOT_URL}/api/og`,
  },
} as const;

