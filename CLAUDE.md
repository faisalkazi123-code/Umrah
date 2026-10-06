# CLAUDE.md

# Umrah Companion App — Claude Code Master Instructions

## 1. PROJECT PURPOSE

Build a production-ready, mobile-first **Umrah companion application** based on the supplied:

`Umrah Guide.pdf`

The PDF is the primary source of truth for religious content.

This application must NOT be a PDF viewer.

Transform the guide into a structured, interactive experience where a pilgrim can follow Umrah step-by-step:

```text
Preparation
    ↓
Ihram
    ↓
Niyyah
    ↓
Talbiyah
    ↓
Enter Masjid Al-Haram
    ↓
Tawaf — 7 Circuits
    ↓
After Tawaf
    ↓
Sa'ee — 7 Circuits
    ↓
Shaving / Trimming
    ↓
Umrah Complete
```

The app should also provide:

- Dua library
- Umrah checklist
- Madinah information
- Hajj types
- Footnotes
- Offline access
- Arabic/English
- Progress tracking
- Tawaf counter
- Sa'ee counter
- Audio architecture
- Accessibility features

## 2. CRITICAL RULE FOR CLAUDE CODE

Do not build only a visual prototype.

Every important button and workflow must work.

Do not leave:
- Fake buttons
- Placeholder APIs
- Fake counters
- Fake authentication
- Lorem ipsum
- Hard-coded mock progress
- Placeholder religious content
- Broken navigation
- TODO implementations for core features

If a feature is displayed as functional, implement it.

## 3. FIRST ACTION — INSPECT BEFORE MODIFYING

Before changing code:

1. Inspect the complete repository.
2. Identify the existing technology stack.
3. Inspect `package.json`.
4. Inspect routing.
5. Inspect database configuration.
6. Inspect authentication.
7. Inspect existing components.
8. Inspect existing styles.
9. Inspect environment configuration.
10. Inspect PWA configuration if present.
11. Inspect tests.
12. Inspect the supplied Umrah Guide.
13. Identify unused/duplicate code.
14. Identify security concerns.
15. Identify architectural conflicts.

Do NOT immediately replace the existing project.

Preserve working functionality unless replacement is technically justified.

## 4. TECHNOLOGY STACK

Preferred stack:

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query
- Zustand

### Backend
- Node.js
- TypeScript
- Express

### Database
- PostgreSQL
- Drizzle ORM

### Validation
- Zod

### Testing
- Vitest
- React Testing Library
- Playwright

### PWA
- Web App Manifest
- Service Worker
- Offline cache
- IndexedDB

If the repository already contains an equivalent modern stack, prefer adapting it instead of rewriting everything.

## 5. MOBILE APP STRATEGY

Build the first version as a high-quality PWA.

Architecture must allow later packaging for:
- Google Play
- Apple App Store

Prefer an architecture compatible with Capacitor if native store packaging is required later.

## 6. PRODUCT DESIGN PRINCIPLES

The application is used while someone may be physically performing Umrah.

Prioritize:
- Large touch targets
- Very clear instructions
- Short screens
- One primary action
- High readability
- Minimal distraction
- Fast access to Dua
- Easy recovery from mistakes
- Offline reliability

Avoid:
- Dense dashboards
- Tiny text
- Long forms
- Excessive menus
- Complex animations
- Gamification
- Advertisements
- Popups that interrupt rituals
- Unnecessary registration

## 7. BRANDING

Use a temporary configurable application name until the final brand name is approved.

```ts
export const APP_CONFIG = {
  name: "Umrah Companion",
  shortName: "Umrah",
};
```

Centralize:
- Logo
- App icon
- Theme
- Contact information
- Version
- Support link
- Privacy link
- Terms link

## 8. DESIGN DIRECTION

Create a premium, calm Islamic visual language.

Suggested design:

```text
Background: Warm off-white / soft neutral
Primary: Deep green
Accent: Muted gold
Cards: White / subtle elevated surface
Text: Dark charcoal
```

Dark mode should use soft dark neutrals rather than pure black.

## 9. DESIGN SYSTEM

Build reusable components:

```text
AppShell
TopBar
BottomNavigation
DesktopSidebar
PrimaryButton
SecondaryButton
IconButton
Card
StageCard
InstructionCard
GenderInstructionCard
ProgressBar
CircularProgress
RoundProgress
ChecklistItem
DuaCard
DuaViewer
AudioPlayer
ConfirmationDialog
BottomSheet
Toast
OfflineBanner
LanguageSwitcher
ThemeSwitcher
FontSizeSelector
LoadingSkeleton
ErrorState
EmptyState
```

## 10. MAIN NAVIGATION

Mobile bottom navigation:

```text
Home
Journey
Duas
Checklist
More
```

## 11. FIRST-LAUNCH FLOW

```text
Splash → Language → Welcome → Start Umrah
```

Allow `Continue as Guest`. Account registration must NOT be required.

## 12. HOME

Route: `/`

Show current journey state, current stage, progress, and a large `Continue Umrah` button.

If no journey exists, show `Start Umrah`.

Secondary actions:
- Duas
- Checklist
- Guide

## 13. CORE JOURNEY

Route: `/journey`

Stages:

```text
01 Ihram
02 Tawaf
03 Sa'ee
04 Shaving / Trimming
05 Complete
```

Statuses:
- NOT_STARTED
- IN_PROGRESS
- COMPLETED

## 14. RELIGIOUS CONTENT INTEGRITY

THIS IS A CRITICAL REQUIREMENT.

The supplied guide is the source of truth.

Claude must NOT:
- Invent Dua
- Rewrite Arabic religious text
- Generate missing Arabic
- Change translations
- Invent religious rulings
- Change gender-specific guidance
- Silently correct source material
- Add religious recommendations from general knowledge

If content is unclear in the PDF, DO NOT GUESS. Flag it for review.

## 15. SOURCE TRACEABILITY

Every religious content record must support:

```text
sourceDocument
sourceSection
sourcePage
sourceReference
reviewStatus
```

## 16. ARABIC EXTRACTION

If Arabic extraction from the supplied PDF is damaged or incorrectly ordered, do not automatically publish it.

Mark it `needs_review`.

Religious text accuracy is more important than automatically filling every field.

## 17. DATABASE SCHEMA

Create normalized tables for:

- users
- guest_sessions
- journeys
- stages
- steps
- duas
- checklist_items
- journey_checklist
- tawaf_progress
- saee_progress
- bookmarks
- content_versions

Use UUIDs for externally referenced records.

## 18. IHRAM

Route: `/journey/ihram`

Interactive checklist based on the supplied guide:

```text
□ Remove unwanted hair
□ Trim nails
□ Make ghusl
□ Make wudhu
□ Put on Ihram clothing
```

Show men's and women's guidance separately.

## 19. NIYYAH

Route: `/journey/ihram/niyyah`

Display:
- Arabic
- Transliteration
- Meaning
- Listen, if verified audio exists
- Mark Complete

## 20. TALBIYAH

Route: `/journey/ihram/talbiyah`

Display:
- Arabic
- Transliteration
- Meaning
- Audio

Show gender instructions separately.

## 21. ENTERING MASJID AL-HARAM

Route: `/journey/haram`

Display source instruction, relevant Dua, and `Start Tawaf`.

## 22. TAWAF STATE MACHINE

Do NOT implement Tawaf as seven unrelated checkboxes.

States:

```text
NOT_STARTED
ROUND_1
ROUND_2
ROUND_3
ROUND_4
ROUND_5
ROUND_6
ROUND_7
COMPLETED
```

Only sequential transitions are allowed.

## 23. TAWAF SCREEN

Route: `/journey/tawaf`

Example:

```text
TAWAF

Circuit
  3 / 7

● ● ● ○ ○ ○ ○

Current guidance

[ Read Dua ]
[ Complete Circuit ]
```

For circuits 1–3, surface source guidance regarding brisk walking for men.
For circuits 4–7, automatically show normal walking guidance.

## 24. TAWAF COMPLETION CONTROL

When `Complete Circuit` is pressed, ask for confirmation.

After completion, allow `Undo` for the latest circuit.

Provide a separate `Reset Tawaf` action with confirmation.

## 25. AFTER TAWAF

Route: `/journey/tawaf/complete`

Show source-based checklist:

```text
□ Cover right shoulder
□ Offer 2 rakaats
□ Drink Zamzam
□ Make Dua
```

Then `Start Sa'ee`.

## 26. SA'EE STATE MACHINE

States:

```text
NOT_STARTED
ROUND_1
ROUND_2
ROUND_3
ROUND_4
ROUND_5
ROUND_6
ROUND_7
COMPLETED
```

Direction rules:

```text
1 Safa → Marwah
2 Marwah → Safa
3 Safa → Marwah
4 Marwah → Safa
5 Safa → Marwah
6 Marwah → Safa
7 Safa → Marwah
```

Final destination must be Al-Marwah.

Create and test a pure `getSaeeDirection(round)` function.

## 27. SA'EE UI

Route: `/journey/saee`

Show:
- Current round
- Current location
- Destination
- Visual direction
- Progress
- Read Dua
- Complete Round

Show green-light guidance for men clearly and separately.

## 28. SA'EE COMPLETION

After round 7:

```text
✓ Sa'ee Complete

Next:
Shaving / Trimming
```

## 29. SHAVING / TRIMMING

Route: `/journey/completion`

Show separate source instructions for men and women.

Require confirmation before `Complete Umrah`.

## 30. UMRAH COMPLETE

Route: `/journey/complete`

```text
Alhamdulillah

UMRAH COMPLETE

✓ Ihram
✓ Tawaf
✓ Sa'ee
✓ Shaving / Trimming

[ Review Journey ]
[ View Duas ]
[ Checklist ]
```

Do not use gamification, confetti, points, badges, or game sounds.

## 31. DUA LIBRARY

Route: `/duas`

Categories:
- Ihram
- Talbiyah
- Masjid Al-Haram
- Tawaf
- Sa'ee
- Leaving Masjid Al-Haram

Functions:
- Search
- Category filter
- Bookmark
- Audio
- Large Arabic reader

## 32. CHECKLIST

Route: `/checklist`

Sections:
- Before Ihram
- Ihram
- Tawaf
- Sa'ee
- Completion

Persist every checkbox immediately.

## 33. MADINAH GUIDE

Route: `/guide/madinah`

Use only relevant source content initially.

Include source information about:
- Masjid Al-Nabawi
- Masjid Quba

Do not expand with unsourced religious claims.

## 34. HAJJ TYPES

Route: `/guide/hajj-types`

Cards:
- TAMATTU
- QIRAAN
- IFRAAD

Use descriptions from the supplied guide.

## 35. REMINDERS

Route: `/guide/reminders`

```text
□ Pay all debts
□ Redress all wrongs
□ Write your will
```

## 36. FOOTNOTES

Route: `/guide/footnotes`

Include source footnotes concerning:
- Hajarul-Aswad
- Touching/kissing Black Stone
- Dua during Tawaf
- Ruknul-Yamani

## 37. LANGUAGE SUPPORT

MVP:
- English
- Arabic

Architecture must support later:
- Urdu
- Hindi
- Malayalam
- Bengali
- Indonesian
- Turkish

Use proper i18n.

## 38. ARABIC RTL

When Arabic is selected, use proper RTL at document/layout level.

Test navigation, arrows, margins, buttons, cards, and long Arabic text.

## 39. ACCESSIBILITY

Design for:
- Elderly pilgrims
- Poor eyesight
- One-handed operation
- Screen readers

Important actions should have at least 44px touch areas; prefer 48–56px for primary ritual actions.

Support Small, Medium, Large, and Extra Large text.

## 40. OFFLINE-FIRST

Core functionality must work without internet:

- Home
- Journey
- Ihram
- Niyyah
- Talbiyah text
- Tawaf
- Sa'ee
- Duas
- Checklist
- Completion
- Guide content

Use IndexedDB for structured offline state.

Use localStorage only for small preferences such as language, theme, font size, and onboarding status.

## 41. PROGRESS RECOVERY

If the user closes or restarts the app during Tawaf or Sa'ee, restore the exact progress.

Never automatically restart the journey.

## 42. PWA

Implement:
- manifest.webmanifest
- service worker
- offline caching
- installability
- icons
- splash support
- standalone mode

Keep architecture compatible with Capacitor for future Android/iOS packaging.

## 43. API

Implement:

```text
GET    /api/health
GET    /api/stages
GET    /api/stages/:key
GET    /api/steps
GET    /api/steps/:key
GET    /api/duas
GET    /api/duas/:key
GET    /api/checklist
GET    /api/journeys/current
POST   /api/journeys
PATCH  /api/journeys/:id
PATCH  /api/journeys/:id/tawaf
PATCH  /api/journeys/:id/saee
PATCH  /api/checklist/:id
GET    /api/bookmarks
POST   /api/bookmarks
DELETE /api/bookmarks/:id
```

Use Zod for every write endpoint.

Backend must reject invalid Tawaf/Sa'ee state transitions.

## 44. AUTHENTICATION

MVP must support guest usage.

Architecture can allow future:
- Phone OTP
- Email
- Apple
- Google

Do not delay the core Umrah journey for authentication.

## 45. PRIVACY

Core tracking must not require:
- Exact location
- Contacts
- Camera
- Microphone
- Personal identity

Do not request permissions without a feature that clearly needs them.

## 46. SECURITY

Audit:
- XSS
- SQL injection
- CSRF
- Broken access control
- IDOR
- Unsafe uploads
- Exposed secrets
- Hard-coded API keys
- Weak authentication
- Excessive error details
- Debug endpoints

Use:
- Helmet
- Rate limiting
- Zod
- ORM parameterization
- Secure cookies where applicable
- Correct CORS
- Environment variables

Create `.env.example`.

## 47. ADMIN PANEL

Create protected `/admin`.

Sections:
- Dashboard
- Umrah Steps
- Duas
- Checklist
- Translations
- Audio
- Content Versions
- Settings

Religious content workflow:

```text
Edit → Save Draft → Review → Publish
```

Published religious content should be archived/versioned rather than casually deleted.

## 48. TESTING

Write unit tests for:
- Tawaf state machine
- Tawaf invalid transitions
- Tawaf Undo
- Sa'ee state machine
- All seven Sa'ee directions
- Progress calculation
- Checklist persistence
- Language switching

Playwright must test the full journey from Start Umrah through Umrah Complete.

## 49. PERSISTENCE TEST

Automated test:

```text
Start Tawaf
Complete 4 circuits
Refresh
```

Expected:
`4 circuits completed; next = Circuit 5`

Do the equivalent test for Sa'ee.

## 50. OFFLINE TEST

After initial caching, disable network and verify:
- Journey loads
- Tawaf works
- Sa'ee works
- Duas load
- Checklist loads
- Progress saves
- Restart restores progress

## 51. UI QA

Inspect every screen for:
- Consistent spacing
- Font size
- Button size
- Alignment
- Card padding
- Icon consistency
- Contrast
- Overflow
- Long Arabic text
- Small phones
- Tablets
- Landscape
- Dark mode
- RTL

## 52. REMOVE UNUSED CODE

Before production release, search for:
- Dead components
- Old routes
- Previous experimental implementations
- Unused dependencies
- Duplicate CSS
- Debug logs
- Commented-out old code
- Temporary scripts
- Fake data
- Test credentials
- Old database models
- Unused imports
- Abandoned API endpoints

Verify references before deletion and run tests afterward.

## 53. PERFORMANCE

Optimize for congested mobile networks:
- Code splitting
- Lazy routes
- Image optimization
- Font optimization
- Appropriate caching
- Minimal bundle size

Do not preload the entire audio library.

## 54. SETTINGS

Route: `/settings`

Include:
- Language
- Text Size
- Theme: System / Light / Dark
- Audio
- Offline Content
- Reset Journey
- About
- Privacy
- Terms

Reset Journey must require confirmation and should not reset bookmarks/settings.

## 55. CODE QUALITY

Use strict TypeScript.

Avoid `any` unless unavoidable and documented.

Keep ritual business logic outside UI components.

Suggested domain structure:

```text
/domain
  /journey
    journeyMachine.ts
    journeyTypes.ts
  /tawaf
    tawafMachine.ts
    tawafTypes.ts
  /saee
    saeeMachine.ts
    saeeDirection.ts
    saeeTypes.ts
```

## 56. MIGRATIONS & SEED DATA

All schema changes require migrations.

Create structured seed data from the supplied guide, for example:

```text
/server/seed/content/
  ihram.json
  tawaf.json
  saee.json
  duas.json
  checklist.json
  madinah.json
  hajj-types.json
  footnotes.json
```

Keep religious content reviewable outside React source code.

## 57. REQUIRED COMMANDS

Ensure these work:

```bash
npm install
npm run dev
npm run build
npm run start
npm run test
npm run test:e2e
npm run lint
npm run typecheck
npm run db:migrate
npm run db:seed
```

## 58. IMPLEMENTATION PHASES

### Phase 1 — Foundation
- Architecture
- Design system
- Database
- Routing
- Local storage
- PWA foundation
- i18n

### Phase 2 — Content
- Structured source content
- Flag uncertain Arabic for review

### Phase 3 — Core Journey
- Home
- Journey
- Ihram
- Niyyah
- Talbiyah
- Masjid Al-Haram

### Phase 4 — Tawaf
- State machine
- Counter
- Guidance
- Dua
- Confirmation
- Undo
- Reset
- Persistence
- Tests

### Phase 5 — Sa'ee
- State machine
- Direction logic
- Counter
- Guidance
- Dua
- Undo
- Persistence
- Tests

### Phase 6 — Completion
- Shaving/trimming
- Umrah Complete
- Journey summary

### Phase 7 — Library
- Dua library
- Search
- Bookmarks
- Checklist
- Madinah
- Hajj types
- Footnotes

### Phase 8 — Offline
- IndexedDB
- Service worker
- Cache
- Offline restart
- Progress recovery

### Phase 9 — Arabic
- Arabic UI
- RTL
- Responsive RTL
- Arabic typography

### Phase 10 — Admin
- Content management
- Versioning
- Draft/publish
- Audit trail

### Phase 11 — Security & Cleanup
- Frontend/backend/API/database/admin audit
- Remove unnecessary code from previous modifications

### Phase 12 — Release QA

Run:

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
```

Then manually test Mobile, Tablet, Desktop, Arabic, English, RTL, Dark Mode, Offline, and Refresh Recovery.

## 59. CLAUDE CODE WORKING RULE

After every major modification:

1. Run relevant tests.
2. Run TypeScript checks.
3. Check console/build errors.
4. Fix failures before moving forward.
5. Check responsive UI.
6. Check Arabic/RTL impact.
7. Check offline impact.
8. Check security impact.
9. Remove obsolete code caused by the modification.
10. Report exactly what changed.

Never say a feature is complete unless verified.

If something remains incomplete, explicitly list it under `Remaining Work`.

## 60. DEFINITION OF DONE

The MVP is not complete until:

```text
✓ App loads
✓ Mobile UI works
✓ English works
✓ Arabic/RTL works
✓ Guest mode works
✓ Ihram works
✓ Niyyah works
✓ Talbiyah works
✓ Tawaf counter works
✓ Tawaf cannot exceed 7
✓ Tawaf cannot skip circuits
✓ Tawaf progress survives restart
✓ Sa'ee counter works
✓ Sa'ee direction is correct
✓ Sa'ee cannot exceed 7
✓ Sa'ee ends at Marwah
✓ Sa'ee progress survives restart
✓ Shaving/trimming works
✓ Umrah completion works
✓ Dua library works
✓ Checklist works
✓ Offline core journey works
✓ PWA works
✓ Database migrations work
✓ Seed works
✓ API validation works
✓ Security checks completed
✓ No placeholder religious content
✓ No fake functionality
✓ No exposed credentials
✓ No critical console errors
✓ TypeScript passes
✓ Tests pass
✓ Production build succeeds
```

## 61. FINAL PRE-RELEASE AUDIT

Before Google Play or Apple App Store packaging, perform a repository-wide review of:

### Security
Authentication, authorization, admin access, APIs, database, secrets, dependencies, validation, sessions.

### UI
Every screen, mobile, tablet, dark mode, Arabic, RTL, large text, long Dua content.

### Database
Indexes, foreign keys, migrations, credentials, backup documentation.

### Code
Remove dead code, duplicate components, old UI, unused APIs, obsolete database fields, unused dependencies, debug code, temporary files, and previous experiments.

Run the full test suite after cleanup.

## 62. STARTING INSTRUCTION

Start by inspecting the entire repository and supplied `Umrah Guide.pdf`.

Do not immediately write code.

First determine:
- Current architecture
- Existing functionality
- Missing functionality
- Database state
- UI state
- Security issues
- PWA state
- Test coverage
- Content structure

Then implement Phase 1 through Phase 4 first:

```text
Foundation
    ↓
Source Content
    ↓
Core Journey
    ↓
Tawaf
```

The first milestone succeeds only when a user can:

```text
Open App
   ↓
Start Umrah
   ↓
Complete Ihram Preparation
   ↓
Read Niyyah
   ↓
Read Talbiyah
   ↓
Enter Masjid Al-Haram
   ↓
Start Tawaf
   ↓
Complete all 7 circuits
```

and Tawaf progress survives an application restart.

After this milestone passes tests, continue with Sa'ee and the remaining phases.
