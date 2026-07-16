function svgDataUrl(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}`;
}

export function getBotBannerUrl(slug: string, hue: string) {
  const h = Number(hue) || 215;
  const accent = `hsl(${h} 72% 60%)`;
  const secondary = `hsl(${(h + 38) % 360} 68% 64%)`;
  const bg = `hsl(${h} 38% 12%)`;

  return svgDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1600" height="520" viewBox="0 0 1600 520">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${bg}"/>
          <stop offset="0.52" stop-color="hsl(${h} 45% 22%)"/>
          <stop offset="1" stop-color="hsl(${(h + 25) % 360} 40% 14%)"/>
        </linearGradient>
        <radialGradient id="glow" cx="70%" cy="28%" r="55%">
          <stop offset="0" stop-color="${secondary}" stop-opacity=".42"/>
          <stop offset="1" stop-color="${secondary}" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="1600" height="520" fill="url(#bg)"/>
      <rect width="1600" height="520" fill="url(#glow)"/>
      <g fill="none" stroke="${accent}" stroke-opacity=".4" stroke-width="2">
        <path d="M80 355 H420 L510 265 H790 L900 155 H1250"/>
        <path d="M230 130 H570 L650 210 H1040 L1140 310 H1510"/>
      </g>
      <g fill="${accent}">
        <circle cx="420" cy="355" r="8"/><circle cx="790" cy="265" r="8"/>
        <circle cx="900" cy="155" r="8"/><circle cx="650" cy="210" r="8"/>
        <circle cx="1140" cy="310" r="8"/>
      </g>
      <g opacity=".16" fill="#fff">
        <rect x="1040" y="90" width="300" height="190" rx="28"/>
        <rect x="1090" y="135" width="180" height="14" rx="7"/>
        <rect x="1090" y="175" width="120" height="14" rx="7"/>
        <rect x="1090" y="215" width="210" height="14" rx="7"/>
      </g>
      <text x="90" y="105" fill="#fff" fill-opacity=".2" font-family="system-ui" font-size="30" font-weight="700">${slug.toUpperCase()}</text>
    </svg>
  `);
}

export function getBotAvatarUrl(name: string, hue: string) {
  const initials = name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const h = Number(hue) || 215;

  return svgDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
      <defs><linearGradient id="a" x1="0" y1="0" x2="1" y2="1"><stop stop-color="hsl(${h} 76% 62%)"/><stop offset="1" stop-color="hsl(${(h + 38) % 360} 64% 42%)"/></linearGradient></defs>
      <rect width="512" height="512" rx="116" fill="url(#a)"/>
      <rect x="96" y="126" width="320" height="260" rx="92" fill="#fff" fill-opacity=".16"/>
      <text x="256" y="300" text-anchor="middle" fill="#fff" font-family="system-ui" font-size="128" font-weight="800">${initials}</text>
    </svg>
  `);
}

export function getBotGalleryImageUrl(name: string, index: number, hue: string) {
  const titles = ["Command Preview", "Dashboard", "Setup Screen", "Automations", "Analytics", "Feature Panel"];
  const title = titles[index % titles.length];
  const h = (Number(hue) || 215) + index * 9;

  return svgDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
      <rect width="1200" height="675" fill="hsl(${h % 360} 34% 13%)"/>
      <rect x="54" y="50" width="1092" height="575" rx="30" fill="hsl(${h % 360} 32% 20%)" stroke="hsl(${h % 360} 68% 62%)" stroke-opacity=".35"/>
      <rect x="54" y="50" width="230" height="575" rx="30" fill="#fff" fill-opacity=".05"/>
      <circle cx="105" cy="105" r="18" fill="hsl(${h % 360} 72% 62%)"/>
      <rect x="145" y="93" width="90" height="18" rx="9" fill="#fff" fill-opacity=".35"/>
      <g fill="#fff" fill-opacity=".12">
        <rect x="94" y="170" width="150" height="18" rx="9"/><rect x="94" y="220" width="118" height="18" rx="9"/><rect x="94" y="270" width="136" height="18" rx="9"/>
      </g>
      <text x="340" y="150" fill="#fff" font-family="system-ui" font-size="42" font-weight="750">${title}</text>
      <text x="340" y="198" fill="#fff" fill-opacity=".58" font-family="system-ui" font-size="24">${name} interface preview</text>
      <g fill="#fff" fill-opacity=".08" stroke="#fff" stroke-opacity=".08">
        <rect x="340" y="250" width="750" height="92" rx="20"/><rect x="340" y="370" width="355" height="180" rx="20"/><rect x="735" y="370" width="355" height="180" rx="20"/>
      </g>
      <rect x="375" y="281" width="260" height="16" rx="8" fill="hsl(${h % 360} 72% 62%)" fill-opacity=".75"/>
      <rect x="375" y="310" width="520" height="11" rx="6" fill="#fff" fill-opacity=".2"/>
    </svg>
  `);
}
