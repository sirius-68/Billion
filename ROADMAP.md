# Billion roadmap

Billion lets people submit real, verified bills (rent, utilities, medical, tuition) and lets sponsors pay them. Money goes **directly to the biller**, never to the person who submitted the bill. Launch market: United States.

## Guiding principles

1. **Funds go to billers, not people.** This is the core trust promise and it keeps us out of person-to-person money transfer.
2. **Avoid holding customer funds** wherever possible. Use a licensed payments partner so Billion is not itself a money transmitter (see Open questions).
3. **Verify before listing.** A bill is never shown to sponsors until it has been verified.
4. **Money is integer cents.** No floating point anywhere money is stored or computed.
5. **Every state change is recorded.** Bills move through an explicit lifecycle, and each transition is logged.

## Stack (decided in Milestone 0)

| Concern                 | Choice                                              | Why                                                                                 |
| ----------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------- |
| App                     | Next.js (App Router) + TypeScript                   | One codebase for the public site, the dashboards and the API routes; easy to deploy |
| Database                | PostgreSQL via Prisma                               | Relational data with strong consistency for money; typed client and migrations      |
| Payments (sponsor side) | Stripe                                              | Card/ACH collection, receipts, refunds, strong US coverage                          |
| Payments (biller side)  | **Open — see below**                                | Paying arbitrary billers is a different rail from collecting cards                  |
| Auth                    | Auth.js (NextAuth) with email magic links           | Low friction for submitters and sponsors                                            |
| File storage            | S3-compatible bucket                                | Bill documents uploaded for verification                                            |
| Hosting                 | Vercel (app) + managed Postgres (Neon/Supabase/RDS) | Low ops burden at the start                                                         |

## Milestones

### Milestone 0 — Foundation ✅ (this PR)

- Roadmap and stack decisions (this file)
- Next.js app skeleton with a placeholder landing page and `/api/health`
- Prisma schema for users, billers, bills, sponsorships, payouts and the bill event log
- Domain core with tests: money in cents, bill lifecycle state machine, sponsorship rules
- Local Postgres via Docker Compose, `.env.example`
- CI: lint, typecheck, unit tests, Prisma schema validation, production build

**Done when:** CI is green on `main` and a new developer can run the app locally from the README.

### Milestone 1 — Accounts and bill submission

- Sign-in with email magic links; roles: submitter, sponsor, admin
- Submit a bill: biller, account reference, amount due, due date, uploaded document
- Submitter dashboard showing each bill's status
- Server-side validation using the domain rules from M0

### Milestone 2 — Verification

- Admin review queue: view document, approve or reject with a reason
- Biller directory (name, payment details, verification status)
- Bill event log visible to admins
- Automatic expiry of bills past their due date

### Milestone 3 — Sponsorship

- Public browse page of verified bills (with privacy controls on what the submitter shares)
- Sponsor checkout with Stripe; full or partial sponsorship
- Funding progress; bill moves to _funded_ when fully covered
- Refunds to sponsors when a bill is cancelled, rejected or expires

### Milestone 4 — Paying billers

- Integration with the chosen biller-payment rail
- Payout tracking and reconciliation; bill moves to _paid_ on confirmation
- Receipts to sponsors and confirmation to the submitter

### Milestone 5 — Trust, safety and launch

- Fraud checks (duplicate bills, document tampering, velocity limits)
- Terms, privacy policy, state-by-state compliance review
- Monitoring, alerting, audit exports
- Public launch in the US

## Open questions

- **Biller-payment rail.** Options include a bill-pay API provider, virtual cards, or mailed checks. Needs coverage of small billers (landlords, local clinics) and must not require Billion to hold funds.
- **Money transmission.** Confirm with counsel that the chosen flow (sponsor → payments partner → biller) does not make Billion a money transmitter in any US state.
- **Tax treatment.** Are sponsorships gifts? Do we issue receipts with any tax language? (Not tax-deductible unless Billion becomes or partners with a charity.)
- **Privacy.** How much of a bill and of the submitter's story is public by default?
- **Fees.** Platform fee on sponsorships, covered by sponsor, or donation-supported?
