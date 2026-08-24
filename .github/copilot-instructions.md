# Copilot Instructions for Petty News

This is a React Native mini-app built with **Granite.js** for the TOSS apps-in-toss platform. It transforms mundane daily activities into satirical news broadcasts using carefully crafted sentence templates.

## Quick Commands

```bash
# Development
npm run dev                    # Start dev server (uses `granite dev`)

# Build & validate
npm run build                  # Build app bundles
npm run typecheck              # TypeScript type checking
npm run lint                   # ESLint validation
npm test                       # Run Jest tests (jest --passWithNoTests)

# Single test (subset)
npm test -- path/to/file.test.ts --testNamePattern="specific test name"
```

## Architecture & Key Patterns

### Core Philosophy
- **No server transmission of generated text.** The app generates news sentences locally on each user's device from a local data bank. Only category codes and timestamps are sent to the server, never the full article text.
- **Single publish per day per device.** Enforced locally before any server transmission.
- **No user input required on home screen.** Buttons generate complete news broadcasts instantly.

### High-Level Data Flow

```
User taps category button
  ↓
createArticle() assembles random sentence combinations locally
  ↓
Broadcast screen displays with animation
  ↓
Image capture & local storage
  ↓
Optionally: server receives only category code + timestamp
  ↓
Server updates aggregation numbers & recent categories (for ticker)
```

### File Structure & Responsibilities

| Path | Purpose |
|---|---|
| `src/data/news.ts` | **Master sentence data.** All template text, category definitions, expert quotes. This is the app's content. Categories: WAKE, EAT, NOTHING, ENDURE, WASH, OUTING, CUSTOM (user input). |
| `src/data/archive.ts` | Local persistence layer. Handles date-based storage key generation and archive retrieval. |
| `src/data/characterImages.ts` | Character SVG/image data (base64). Each category has an associated expert character. |
| `src/pages/index.tsx` | Home (newsroom). Category buttons, publication status, previous day follow-up news, archive link. |
| `src/pages/article.tsx` | Broadcast screen. The final rendered news article—this is the capture target. |
| `src/pages/report.tsx` | Custom report input screen (category CUSTOM). 40-char max, validates on button press. |
| `src/pages/archive.tsx` | Saved broadcasts by date, reverse chronological. |
| `src/components/ShareCard.tsx` | Wrapper for capturing/sharing article.tsx as an image. Adds branding footer. |
| `granite.config.ts` | App configuration: appName, brand colors, permissions, plugin setup. Do **not** import from `src/` here—use base64 inline (documented in comments). |
| `jest.config.js` | Uses Granite's Jest preset. No customization needed unless adding new test patterns. |
| `eslint.config.mjs` | ESLint flat config. Ignores dist, .granite, and generated files (*.gen.ts). |

### Sentence Assembly Logic

**Function signature:**
```typescript
createArticle(category: Category, previousIndexes?: Record<string, number>): Article
```

- Selects random headline, subtitle, and anchor comment from category-specific banks
- Selects a line from the expert's bank (always the same expert per category—no randomization there)
- Avoids repeating the exact same sentence combination by tracking `previousIndexes`
- Returns full `Article` object with all fields populated for the broadcast screen

**Tone rules (CRITICAL—breaking these breaks the whole app's voice):**
- Formal news-report style, never comedic
- No emojis, ㅋㅋ, ㅎㅎ
- Never suggest the anchor is trying to be funny—absolute sincerity required
- No patronizing language: avoid "mere," "just," "only," "merely"
- Preferred tone markers: "at last," "finally," "remarkably," "in an unprecedented move," "for the first time in X years"
- Never guess age, gender, appearance, or income. Use only "a citizen" or "anonymous reporter"

### Publication State

**Key insight:** Today's publish status is determined by whether today's date appears in the local archive. No separate boolean flags. This means:
- After publishing, the home button area transitions to a locked state with a message
- If app is closed at 11:59 PM and reopened after midnight, the date has changed, buttons unlock automatically
- The date check must use local device time, not server time

## Conventions & Patterns

### TypeScript & Strictness
- `tsconfig.json` enforces strict mode: no implicit `any`, no unused variables, no implicit returns
- Always explicitly type function parameters and return values
- Use `Exclude<Category, 'CUSTOM'>` for server-only categories (CUSTOM never goes to server)

### State Management
- Use React hooks (useState, useEffect). No external state library needed.
- Local archive is read/written via `getArchive()` and `addToArchive(today, article)`
- Device UUID for daily-limit enforcement is stored locally, never transmitted

### Animation
- Broadcast publish uses a 1.8-second sequence: red flash → badge slides in → headline types → ticker flows
- **Always check `prefers-reduced-motion`.** If enabled, skip animations and show result instantly
- Use CSS or React Native's Animated API (per Granite.js patterns)

### Image Export
- Capture `article.tsx` as PNG via `ShareCard` component
- Add app branding footer: "보도블록 · 하찮은 속보" (small, bottom-center)
- This image is the **only distribution channel**—users share via OS share sheet, not in-app messaging

### Error Handling & Resilience
- Server failures are silent. If transmission fails, the local article is still published and displayed normally
- Archive read failures: fall back to empty array, app continues operating
- Server category responses: filter against whitelist (WAKE, EAT, NOTHING, ENDURE, WASH, OUTING). Unknown categories are dropped
- Aggregation numbers that seem impossible (>100M) are not displayed

### Security Notes (if server is enabled)
- RLS policy: insert-only for whitelisted categories, select-only for reads. No update/delete.
- Client validation: re-verify category against whitelist before transmit
- Disable button immediately after send (no double-tap publishing)
- Device UUID is never sent to server

## Testing Approach

- Unit tests for `createArticle()` function: verify no consecutive duplicates, correct category selection
- Integration tests for date/archive logic: confirm today/tomorrow boundary, 1-item-per-day enforcement
- Manual testing checklist in SPEC.md section 11 (Safe Area, 375px width, 40-char input, animation skip, offline mode, tab persistence)
- No E2E framework required; device testing via `granite dev`

## Design System

- **Background:** white or very light gray
- **Text:** black
- **Accent:** red only (#F04452 in brand config)—sparingly for badge and ticker
- **Typography:** Headlines use bold sans-serif (Pretendard); anchor/expert quotes use serif (Nanum Myeongjo) for weight
- **Shapes:** All hard corners. No rounded corners—they kill the news-broadcast aesthetic
- **Characters:** Black line drawing, no fill color (except the red broadcast badge)

Layout follows a "newspaper masthead" feeling: heavy strokes, ample whitespace, justified text. The comedy comes from contrast—earnest newsprint tone discussing trivial events.

## MCP Integration

This project is designed for use with **Apps-in-Toss MCP** (`@apps-in-toss/framework`):
- Enables dev-server setup, device bundling, and validation against TOSS platform policies
- Configuration is in `granite.config.ts` (not importable from src/)
- Always consult official docs for SDK APIs—do not guess or invent API signatures

No other MCP servers are needed for this project.

## Related Documentation

- **SPEC.md:** Complete feature specification including layout mockups, priority order, and QA checklist
- **BUILD_GUIDE.md:** Step-by-step workflow from console registration through bundle submission
- **news.ts header:** Detailed tone rules and example sentences for each category

## Common Gotchas

1. **Avoid modifying sentence data flippantly.** Each sentence reinforces the app's voice. Read the tone rules in news.ts before editing.
2. **Device UUID for daily limits is local-only.** Never send it to server—it's not a user identifier, just a publish-rate enforcer.
3. **granite.config.ts can't import from src/.** Use base64-inlined data for app icon/images. The comment in that file explains why.
4. **Server isn't required for MVP.** Features 1–3 in SPEC.md section 9 work entirely offline. If server delivery slips, ship without it.
5. **Dark theme is not an option.** Platform guidelines explicitly require bright, polished appearance.

## Running & Debugging

```bash
# Start dev server (Granite watches for changes)
npm run dev

# Type-check without rebuilding (fast feedback)
npm run typecheck

# Lint and fix automatically
npm run lint -- --fix

# Test in watch mode
npm test -- --watch
```

After launching dev server, connect a device or simulator and open the app via the QR code provided. Hot reload is automatic.
