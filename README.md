# Billion

People share real, verified bills. Sponsors pay them — and the money goes **directly to the biller**, never to a personal account. Launching in the United States.

See [ROADMAP.md](ROADMAP.md) for milestones, stack decisions and open questions.

## Stack

Next.js (App Router) · TypeScript · PostgreSQL · Prisma · Node 22

## Getting started

Requirements: Node 22 (`nvm use`), Docker.

```bash
npm install                # also runs `prisma generate`
cp .env.example .env
npm run db:up              # starts Postgres on localhost:5432
npm run db:migrate -- --name init   # creates the first migration and applies it
npm run dev                # http://localhost:3000
```

Check it's working: <http://localhost:3000/api/health> should return `{"status":"ok","database":"ok"}`.

## Scripts

| Command              | What it does                             |
| -------------------- | ---------------------------------------- |
| `npm run dev`        | Start the dev server                     |
| `npm run build`      | Production build                         |
| `npm run lint`       | ESLint                                   |
| `npm run typecheck`  | TypeScript, no emit                      |
| `npm test`           | Unit tests (Node's built-in test runner) |
| `npm run format`     | Prettier                                 |
| `npm run db:migrate` | Create/apply Prisma migrations           |
| `npm run db:studio`  | Browse the database                      |

## Project layout

```
prisma/schema.prisma     Data model: users, billers, bills, sponsorships, payouts, bill events
src/domain/              Pure business rules, no framework code — money, bill lifecycle, sponsorship
src/lib/                 Shared infrastructure (database client)
src/app/                 Next.js routes and pages
```

## Core rules (enforced in `src/domain`)

- **Money is integer cents.** Use `parseDollars` / `formatCents`; never floats.
- **Bills follow a strict lifecycle:** draft → submitted → under review → verified → funded → payment sent → paid, with rejected, cancelled, expired and payment-failed branches. Use `transition()` for every status change.
- **Only verified bills accept sponsorships**, and a sponsorship can never exceed what is still owed.
