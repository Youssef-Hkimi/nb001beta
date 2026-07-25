# Nexbiy — Design System

## Core rules

1. **HeroUI first** — use `@heroui/react` components for interactive UI.
2. **Icons** — `lucide-react` for general UI. Iconify is allowed for branded/platform marks (Discord, X, GitHub, Roblox). **No emoji UI icons.**
3. **Theme** — light + soft charcoal dark via `next-themes` + `class` on `<html>`.
4. **Motion** — hover ~180–250ms; theme surfaces ~500–700ms; respect `prefers-reduced-motion`.
5. **Never pitch-black dark mode.**

## Brand colors

| Token | Value | Use |
|--------|--------|-----|
| Primary | `#629BF8` | Accent, primary buttons, links, active states |
| Secondary | `#82B0F9` | Gradients, softer accent, highlights |

Gradient text utility: `.nexus-gradient-text`  
CTA gradient cards: `from-[#629BF8] to-[#82B0F9]`

> Legacy internal `nexus-*` CSS tokens remain in place for compatibility; they are implementation details, not the public brand name.

Rewards accent: blend `#c0fc1c` (gift lime) with `#2596be` (reward blue). Use this accent only for Rewards navigation/effects, not as a replacement for the main Nexbiy blue.

## Light mode

Defined in `app/globals.css` (`:root`):

| Role | Value |
|------|--------|
| Page background | `#FFFFFF` (`--page-bg`, `--background`) |
| Soft background | `#F5F9FF` (`--nexus-soft`, surface-secondary) |
| Cards | `#FFFFFF` |
| Border | `#E6EEF8` |
| Text | `#102033` |
| Muted | `#64748B` |

## Dark mode

Defined under `.dark` / `[data-theme="dark"]`:

| Role | Value |
|------|--------|
| Page background | `#2D2E33` (`--page-bg`, `--background`) |
| Soft surface | `#323339` |
| Card | `rgba(45, 46, 51, 0.82)` (`.nexus-card`) |
| Elevated card | `rgba(50, 51, 57, 0.92)` (`.nexus-card-elevated`) |
| Border | `rgba(255,255,255,0.10)` |
| Text | `#F8FAFC` |
| Muted | `#B8BEC9` |

**Do not** use pure `#000` or near-black page backgrounds.

## CSS variables (important)

```css
:root {
  --page-bg: #ffffff;
  /* + HeroUI semantic tokens: --background, --surface, --accent, --border, --muted, ... */
}

.dark {
  --page-bg: #2d2e33;
}
```

Theme tokens are also mapped into HeroUI’s semantic variables so components pick up brand colors.

## Listing card geometry (Explore + Servers)

Implemented via classes in `app/globals.css` + `components/cards/server-card.tsx`:

| Element | Radius / size |
|---------|----------------|
| Server listing card | **~15px** (`.server-listing-card`) |
| Card banner top corners | **~13px** (`.server-listing-banner`) |
| Server icon (avatar) | **~13px rounded square** (`.server-listing-icon`) — **not** a full circle |
| Listing grid gap | **20–24px** (`.server-listing-grid`) |
| Listing shell max-width | **1600px**, tighter horizontal padding (`.server-listing-shell`) |

### Grid breakpoints

- Mobile: 1 column  
- Tablet (`sm+`): 2 columns  
- Desktop (`xl+`): 3 columns  

### Join button on cards

- **Not** full-width (`flex-1` removed).
- Compact: ~`min-w-[7.5rem] px-4` next to View.

### Hover (cards)

- Slight lift (`.hover-lift`)
- Soft border highlight toward accent  
- **No** heavy glow

## Explore hero artwork

File: `components/explore/hero-section.tsx`

- Artwork is a background layer on the top hero only.
- Theme pairs: `ChillDark.webp` / `ChillLight.webp` and `disdark.webp` / `dislight.webp`.
- The pair rotates every 15 minutes and light/dark artwork must stay positionally synchronized.
- Use the shared `.blended-artwork` bottom mask so artwork blends into `--page-bg`.
- Preserve readable hero title/subtitle contrast without hiding the characters under a heavy white wash.
- Category marquee sits below the search area with enough breathing room.
- Do not render hero art as a plain content `<img>`.

## Server detail hero banner (critical)

Files:

- CSS: `.server-hero-banner`, `.server-hero-profile`, `.server-hero-avatar` in `app/globals.css`
- Art: `lib/server-banner.ts` (SVG data-URL scenes per slug)
- UI: `components/server/server-detail-view.tsx`

### Required behavior

- Banner is **sharp and fully visible**
- `background-size: cover`, `background-position: center`
- **No** `filter: blur()`, **no** `backdrop-blur` on the banner
- **No** heavy dark overlay, **no** full-banner wash
- Use the shared theme-aware `.listing-hero-fade` / hero wrapper overlay.
- Fade begins near the bottom and resolves smoothly into `--page-bg`; it must not form a pale/foggy horizontal line.
- Never use a CSS mask on uploaded banner pixels when the overlay version is available; masks caused light-mode blur/fog.

```css
.hero-image-wrapper::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(to bottom, transparent 0 62%, color-mix(in srgb, var(--page-bg) 50%, transparent) 81%, var(--page-bg) 100%);
}
```

- Profile content sits **below** the banner on `var(--page-bg)`
- Only the **avatar** slightly overlaps the banner bottom (`.server-hero-avatar`)
- Text/actions are **not** inside the fade zone

### Banner art

- Do **not** use plain single-hue gradients as the main banner (looks cheap / “purple block”).
- Use `getServerBannerUrl(slug, hue)` cinematic SVG scenes.
- Lofi Girl: cozy dark blue/purple/warm accents — not flat magenta.

## Server detail content rules

### Hero actions (order)

1. **Vote** (thumbs-up + count) — owners/users can vote again after a six-hour cooldown
2. **Copy Invite**  
3. **Join Server**  
4. **More** dropdown (copy / report)

**No Like, Save, or Bookmark wording** on public listing pages.

### About card

- Title + short subtitle + long description only  
- **No** metadata boxes (Created/Region/Language/etc.) inside About  

### Right sidebar — Server Stats

Include:

- Total Members  
- Online Now  
- Monthly Growth  
- Join Clicks  

**Do not** include:

- Votes (already shown on the Vote button)
- Review score / progress / reviews count  

**Server Details** inside same card (simple icons, **no** square icon backgrounds):

- Created (`createdAt`)  
- Region  

Language stays in the **hero** metadata row only.

### Server detail pages must NOT include

- Reviews / comments / write review  
- Review score UI  
- Community Rules section  
- Gallery / server screenshots  

Gallery/upload previews are for **bot** flows later, not server profiles.

### Server detail left column (current)

- About this server  
- Atmosphere  
- What you can do here (features)  

Do not add FAQ, Community Highlights, Contact Owner, reviews, gallery, or rules to server pages.

## Listing creation and editing

- Server and bot forms share the description formatter: bold, italic, heading, link, and bullet list.
- The large formatted preview is collapsed initially and expands only by user choice.
- Server media uses icon + 960×320 banner side by side where space allows.
- Uploaded banners are cropped/repositioned to the required aspect ratio rather than displayed at their source ratio.
- If no banner is supplied, use a selectable banner color; icon upload should suggest a matching dominant color.
- Live preview must update without nested cards or oversized shells.
- Missing required fields scroll into view, focus, and receive a red error state.
- Server ID is required and explained with a help tooltip.

## Verification and status

- Listing owners cannot choose a verified badge. Nexbiy awards it after eligibility review.
- Use the shared stroke verification icon. Tooltip content is exactly **“Verified”** and remains inline-safe inside text.
- Passing listing review produces a **Live** status, not a Safe badge.
- **Safe** is a separate staff-awarded reputation badge for established listings with a strong record. It is never granted automatically by review or verification.
- Status chips include Live, Pending Review, Draft, Paused, Suspended, and Coming Soon where appropriate.
- The widget guide modal uses the Cloudinary video and the path **Server Settings → Engagement → Widget**.
- Widget-disabled reminders are compact and persistent until verification succeeds.

## Modals, alerts, and toasts

- Use HeroUI compound components.
- Toast placement for events/changes is **top center**.
- Success-publish dialogs are stable controlled overlays; they close only from the X unless a navigation action intentionally leaves the page.
- Clicking text, links, or buttons inside a modal must not flicker or dismiss it.
- Destructive flows use `AlertDialog` and explicit irreversible-action copy.
- Avoid stacked surfaces that create doubled or clipped corners in dark mode.

## Rewards motion

- Gift sprite: `https://res.cloudinary.com/zux0o0wz/image/upload/v1784727487/GifBox4_xqmmme.webp`.
- Gift rain covers the full page viewport, not an inner card.
- Use `requestAnimationFrame` for smooth motion and preserve mouse repulsion after refresh and toggle cycles.
- The effect fades in/out smoothly and has a visible Show gifts toggle.
- Current public rewards effect is hover/repulsion only; do not reintroduce drag-and-drop physics.
- Respect `prefers-reduced-motion`.

## HeroUI composition rules (learned the hard way)

### Checkbox / Switch (v3.2+)

Control must live **inside** Content (the clickable part):

```tsx
<Switch isSelected={...} onChange={...} aria-label="...">
  <Switch.Content>
    <Switch.Control>
      <Switch.Thumb />
    </Switch.Control>
  </Switch.Content>
</Switch>

<Checkbox isSelected={...} onChange={...}>
  <Checkbox.Content>
    <Checkbox.Control>
      <Checkbox.Indicator />
    </Checkbox.Control>
    Label text
  </Checkbox.Content>
</Checkbox>
```

### Dropdown

`Dropdown.Trigger` **already renders a button**.  
**Never** nest `<Button>` inside `Dropdown.Trigger` (hydration error: button inside button).

```tsx
<Dropdown.Trigger aria-label="More" className="button button--ghost button--icon-only">
  <MoreHorizontal className="size-4" />
</Dropdown.Trigger>
```

### Tabs.Indicator

`Tabs.Indicator` uses React `SharedElement` and can crash without a transition provider:

```
<SharedElement> must be rendered inside a <SharedElementTransition>
```

**Prefer** a HeroUI Button tab strip (see `/dashboard/new`) instead of `Tabs.Indicator`.

### Next.js Link + HeroUI Button

Do not `render={(props) => <Link {...props} />}` (type/event mismatches).  
Use `components/ui/link-button.tsx` (`router.push`).

### formatCount

Always safe for undefined/null (guards added in `lib/format.ts`). Prefer still passing real numbers.

## Component patterns used

- `Toast.Provider` in `components/providers.tsx` with top-center placement
- Theme toggle in navbar  
- Inbox next to the account menu; no global header search for now
- Mobile nav + filters via HeroUI `Drawer`; menu appears only at the mobile breakpoint
- Modals via `Modal.Backdrop` / `Modal.Container` / `Modal.Dialog`  
- Listing filters: chips, checkboxes, switches, select  

## Files that own design tokens

- `app/globals.css` — tokens, utilities, listing/hero CSS  
- `components/providers.tsx` — theme + toast  
- `components/layout/site-navbar.tsx` — global chrome  
