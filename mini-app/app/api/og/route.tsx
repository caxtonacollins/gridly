import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date") || "";
  const result = url.searchParams.get("result") || "";

  // Calculate responsive dimensions
  const isMobile = !!request.headers.get('user-agent')?.match(/(iPhone|iPod|iPad|Android|BlackBerry|Windows Phone)/i);
  const viewBox = isMobile ? '0 0 375 630' : '0 0 1200 630';
  const cardPadding = isMobile ? 20 : 60;
  const cardWidth = isMobile ? 335 : 1080;
  const logoSize = isMobile ? 36 : 48;
  const titleSize = isMobile ? 24 : 32;
  const dateSize = isMobile ? 14 : 18;
  const badgeSize = isMobile ? 14 : 16;
  const footerSize = isMobile ? 14 : 16;

  // Dark theme colors
  const backgroundColor = '#0a0a0a';
  const cardBackgroundColor = '#171717';
  const cardBorderColor = '#2a2a2a';
  const textColor = '#f5f5f5';
  const secondaryTextColor = '#a3a3a3';

  const svg = `
  <svg width="100%" height="100%" viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
    <!-- Background -->
    <rect width="100%" height="100%" fill="${backgroundColor}" />
    
    <!-- Centered container -->
    <g transform="translate(${isMobile ? 20 : (1200 - cardWidth) / 2}, ${isMobile ? 20 : 60})">
      <!-- Card container with subtle shadow -->
      <defs>
        <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="8" result="blur" />
          <feOffset in="blur" dx="0" dy="4" result="offsetBlur" />
          <feComponentTransfer in="offsetBlur" result="shadow">
            <feFuncA type="linear" slope="0.05" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode in="shadow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      <!-- Card background -->
      <rect width="${cardWidth}" height="${isMobile ? 590 : 510}" rx="16" 
            fill="${cardBackgroundColor}" stroke="${cardBorderColor}" 
            stroke-width="1" stroke-linejoin="round" filter="url(#cardShadow)" />
      
      <!-- Logo and title -->
      <g transform="translate(20, 20)">
        <image href="${new URL(request.url).origin}/logo.png" x="0" y="0" width="${logoSize}" height="${logoSize}" />
        <text x="${logoSize + 12}" y="${logoSize * 0.7}" font-size="${titleSize}" 
              font-family="Inter, system-ui, Arial" font-weight="600" fill="${textColor}">
          Gridly
        </text>
        <text x="${logoSize + 12}" y="${logoSize * 0.7 + titleSize * 0.8}" 
              font-size="${dateSize}" font-family="Inter, system-ui, Arial" fill="${secondaryTextColor}">
          ${date}
        </text>
      </g>
      
      <!-- Status badge -->
      <g transform="translate(20, 100)">
        <rect x="0" y="0" width="${isMobile ? '100' : '120'}" height="${isMobile ? '32' : '36'}" rx="16" 
              fill="${result === 'win' ? '#14532d' : '#7f1d1d'}" 
              stroke="${result === 'win' ? '#22c55e' : '#ef4444'}" 
              stroke-width="1" />
        <text x="${isMobile ? '50' : '60'}" y="${isMobile ? '20' : '22'}" 
              font-size="${badgeSize}" font-family="Inter, system-ui, Arial" 
              font-weight="500" text-anchor="middle" 
              fill="${result === 'win' ? '#86efac' : '#fca5a5'}">
          ${result === 'win' ? 'Solved' : result === 'loss' ? 'Failed' : 'Play'}
        </text>
      </g>
      
      <!-- Grid -->
      <g transform="translate(${(cardWidth - (isMobile ? 280 : 400)) / 2}, ${isMobile ? 180 : 180})">
        ${renderGrid(result, isMobile)}
      </g>

      <!-- Footer -->
      <text x="${cardWidth / 2}" y="${isMobile ? 550 : 470}" 
            font-size="${footerSize}" font-family="Inter, system-ui, Arial" 
            fill="${secondaryTextColor}" letter-spacing="0.5"
            text-anchor="middle">
        gridly.app • One puzzle • One try
      </text>
    </g>
  </svg>
  `;

  return new NextResponse(svg, {
    headers: { "content-type": "image/svg+xml" },
  });
}

function renderGrid(result: string, isMobile: boolean = false) {
  // 4x4 grid with theme colors and better responsive sizing
  const size = 4;
  const maxGridWidth = isMobile ? 280 : 400; // Max width for the grid
  const cellGap = isMobile ? 6 : 12;
  const cellSize = Math.min(80, (maxGridWidth - (cellGap * (size - 1))) / size);
  const gridWidth = (cellSize * size) + (cellGap * (size - 1));
  const cells = [];

  // Grid container with centered alignment
  cells.push(`
    <g transform="translate(${(maxGridWidth - gridWidth) / 2}, 0)">
      <!-- Grid background -->
      <rect x="0" y="0" width="${gridWidth}" height="${gridWidth}" fill="#1e1e1e" rx="12" />
  `);

  // Grid cells
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const x = c * (cellSize + cellGap);
      const y = r * (cellSize + cellGap);

      let fill = "#2a2a2a";
      let border = "#3d3d3d";

      // Highlight cells based on result
      if (result === 'win' && r === 1 && c === 1) {
        fill = "#14532d";
        border = "#22c55e";
      } else if (result === 'loss' && r === 1 && c === 2) {
        fill = "#7f1d1d";
        border = "#ef4444";
      }

      cells.push(`
        <rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" 
              rx="8" fill="${fill}" stroke="${border}" stroke-width="1.5" stroke-opacity="0.8" />
      `);
    }
  }

  // Close the grid container group
  cells.push('</g>');

  return cells.join("\n");
}
