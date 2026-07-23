# Nexbiy — Design System

## Core rules

1. **HeroUI first** — use `@heroui/react` components for interactive UI.
2. **Icons** — `lucide-react` only. **No emoji icons.**
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

File: `components/explore/hero-section.tsx` + `public/artworkdark1.png`

- Artwork is a **background layer** on the top hero only (not full site).
- Dark mode: uses `/artworkdark1.png`
- Light mode: soft blue gradient artwork (no light PNG was available)
- Bottom **mask/fade** into page background  
- Do not show as a plain `<img>` content block

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
- **No** mid-opacity white stops (`rgba(255,255,255,0.35)` etc.)
- Fade is **tiny** (~**56px**), only at the very bottom edge:

```css
.server-hero-banner::after {
  height: 56px;
  background: linear-gradient(to bottom, transparent 0%, var(--page-bg) 100%);
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

1. **Like** (thumbs-up + count) — toggle; toasts “Server liked” / “Like removed”  
2. **Copy Invite**  
3. **Join Server**  
4. **More** dropdown (copy / report)

**No Save / Bookmark** on server pages.

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

- Likes (already on Like button)  
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
- Community Highlights  
- FAQ  

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

- `Toast.Provider` in `components/providers.tsx`  
- Theme toggle in navbar  
- Mobile nav + filters via HeroUI `Drawer`  
- Modals via `Modal.Backdrop` / `Modal.Container` / `Modal.Dialog`  
- Listing filters: chips, checkboxes, switches, select  

## Files that own design tokens

- `app/globals.css` — tokens, utilities, listing/hero CSS  
- `components/providers.tsx` — theme + toast  
- `components/layout/site-navbar.tsx` — global chrome  
