# Local Setup

1. Install dependencies: `npm install`
2. Copy environment sample: `copy .env.example .env.local`
3. Start Supabase locally if available: `supabase start`
4. Apply migrations: `supabase db reset`
5. Run the app: `npm run dev`

Useful checks: `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`, `npm run test:e2e`.

No real secrets belong in the repository. `SUPABASE_SERVICE_ROLE_KEY` is server-only and must never be exposed with `NEXT_PUBLIC_`.
