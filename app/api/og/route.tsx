import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date") || "";
  const result = url.searchParams.get("result") || "";

  const title = `Gridly — ${date}`;
  const subtitle =
    result === "win" ? "Solved" : result === "loss" ? "Tried" : "Play";

  const svg = `
  <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#ffffff" />
    <rect x="60" y="60" width="1080" height="510" rx="12" fill="#f8fafc" stroke="#e6eefc" stroke-width="2"/>
    <text x="100" y="150" font-size="48" font-family="Inter, system-ui, Arial" fill="#0f172a">${title}</text>
    <text x="100" y="210" font-size="28" font-family="Inter, system-ui, Arial" fill="#64748b">${subtitle}</text>
    <g transform="translate(100,260)">
      ${renderGrid(result)}
    </g>
    <text x="100" y="580" font-size="16" font-family="Inter, system-ui, Arial" fill="#94a3b8">gridly • One puzzle • One try</text>
  </svg>
  `;

  return new NextResponse(svg, {
    headers: { "content-type": "image/svg+xml" },
  });
}

function renderGrid(result: string) {
  // Simple 4x4 representation: show a green cell if win, red if loss, otherwise empty grid
  const size = 4;
  const cells = [] as string[];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const x = c * 36;
      const y = r * 36;
      let fill = "#f1f5f9";
      if (result === "win" && r === 1 && c === 1) fill = "#22C55E"; // highlight sample cell
      if (result === "loss" && r === 1 && c === 2) fill = "#ef4444"; // sample
      cells.push(
        `<rect x="${x}" y="${y}" width="32" height="32" rx="6" fill="${fill}" />`
      );
    }
  }
  return cells.join("\n");
}
