# Religious content

These JSON files are the single source of religious content for both the app bundle
(offline) and the database seed. They are kept outside React code so they can be
reviewed independently.

**Source of truth:** `Umrah Guide.pdf` (not yet supplied to the repository).

## Review status

| Status            | Meaning                                                                 | Shown in app                                   |
| ----------------- | ----------------------------------------------------------------------- | ---------------------------------------------- |
| `awaiting_source` | Not yet transcribed from the guide. All text fields are `null`.         | Title only, with an "awaiting source" notice   |
| `needs_review`    | Text exists but is not yet verified against the guide.                  | Instructions/checklist labels with a badge; **dua Arabic/transliteration/meaning are never shown** |
| `approved`        | Verified against the guide; `sourcePage` set.                           | Fully                                          |

Every record carries `source.sourceDocument`, `sourceSection`, `sourcePage`, `sourceReference`.

## Current state

No text has been transcribed from the guide yet. Checklist labels and section titles come
from the item names listed in `CLAUDE.md` and are marked `needs_review` / `awaiting_source`.

## Rules (CLAUDE.md §14–16)

- Do not invent dua, rulings, or translations. Copy exactly from the guide.
- If Arabic extracted from the PDF is damaged or misordered, keep it `needs_review`.
- Only move a record to `approved` after checking it against the guide page and
  filling `sourcePage`.

`npm run test` validates these files against `shared/content/schema.ts`.
