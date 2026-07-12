# Prompt 5 - Cells, Fellowships and Small Groups

Prompt 5 adds a complete small-groups foundation using denomination-neutral canonical keys and tenant-specific display labels.

Implemented foundations:

- group types, group register, hierarchy, branch/unit reporting, public discovery and join policy;
- leadership assignments with narrow group permissions instead of broad branch access;
- group membership, join requests, transfers and history-preserving handovers;
- meeting schedules, meeting types, attendance capture categories and offline-queue architecture fields;
- first-timer and new-convert capture linked to the existing people and follow-up engines;
- configurable report templates, versioned meeting reports, correction and locking states;
- safe prayer, pastoral and welfare referral summaries without confidential case contents;
- giving categories, meeting giving totals, finance handover and correction tables;
- private operational group-health labels with no spiritual scoring or public ranking;
- growth and multiplication readiness recommendations with approval placeholders;
- group directory, map, QR code, communication-reminder and analytics foundations.

The implementation intentionally records group giving as totals only by default. Individual giving history, accounting posting, payment-destination reconciliation and full stewardship workflows remain reserved for Prompts 9 and 10.

The UI lives under `/workspace/kings-grace/groups` with sections for leader workspace, supervising pastor review, directory, map, attendance, reports, giving, handover, health, growth, multiplication, QR codes and analytics.

The engine is pure TypeScript and covered by `src/lib/groups-engine.test.ts`. The database migration is `20260712053541_small_groups_cells_fellowships.sql`.
