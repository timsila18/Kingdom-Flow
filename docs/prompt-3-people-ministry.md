# Prompt 3 People Ministry Engine

Prompt 3 adds a central people-ministry model for members, households, visitors, first-timers, new converts, follow-up, consent, transfers, duplicates, imports, exports, public forms, QR codes and activity signals.

## Core Model

`people` is the central profile table. A person progresses through lifecycle events instead of being duplicated as visitor, new convert and member. Lifecycle history remains append-only.

## Privacy

Child records, restricted identifiers, private notes, consent state and sensitive exports are protected by explicit permission keys. Public forms can insert submissions but cannot read people records.

## Follow-Up

New converts and visitors can create follow-up assignments and tasks. Assignment selection considers worker capacity, branch, language and availability. The default operational target is first human assignment within 24 hours.

## Consent

Consent is granular by type: phone, SMS, WhatsApp, email, announcements, programme invitations, pastoral follow-up, prayer requests, photographs/media, emergency contact and data sharing. Withdrawal affects only the selected consent type.

## Transfers And Duplicates

Transfers update branch history without duplicating people. Duplicate review preserves source identifiers and requires authorized manual confirmation.

## Subscription Counting

`person_activity_signals` prepares Prompt 12 monthly-active-person calculations. Records alone do not count; only eligible activity signals do.

## Extension Rule

Future modules must call the Prompt 2 authority engine and Prompt 3 people services before reading, mutating, exporting or assigning person records.
