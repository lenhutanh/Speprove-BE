# Data Persistence

How the backend stores data: MongoDB through Mongoose, Redis for short-lived state, and the rules for repositories, transactions and indexes. The collections and their fields are in the [data dictionary](./06-data-dictionary.md).

## 1. Stores

| Store | Holds | Access |
| :--- | :--- | :--- |
| MongoDB (replica set) | All business data: accounts, content, attempts, payments, credit ledger, sessions, voice rooms | Mongoose models, only through repositories |
| Redis | Job queues (BullMQ), cache, OTP and pending registration, OAuth state, socket tickets, rate-limit counters | `CacheService`, `QueueRegistry`, `RateLimiterService` |
| Cloudinary | Uploaded audio and images (the `File` collection keeps the metadata and URL) | `src/modules/file/adapters/storage` |

1.1. MongoDB must be a **replica set**: payment and credit use multi-document transactions, which a standalone server does not support.
1.2. One database per environment (`DATABASE_NAME`). A seed script that deletes collections must never point to a shared database.

## 2. Models

2.1. A model is a Mongoose schema in `<module>/<module>.model.ts`, exported as `models.X || model(...)`.
2.2. Every schema spreads `BASE_SCHEMA_CONTENT` (`deletedAt`, default `null`) and uses `BASE_SCHEMA_OPTIONS`: `timestamps: true` (`createdAt`, `updatedAt`) and `toJSON` with virtuals and no `__v`.
2.3. Statuses and kinds are numbers from `*.constants.ts` (for example `STATUS` in `status.constants.ts`: `ACTIVE 1`, `PENDING 0`, `PROCESSING 2`, `LOCKED -1`, `DELETED -2`, `REJECTED -3`, `FAILED -4`; `ATTEMPT_STATUS`: `PENDING 0`, `PROCESSING 1`, `DONE 2`, `FAILED 3`).
2.4. A secret field is `select: false` (`Account.password`).
2.5. References between modules are stored as ids (`ObjectId` with `ref`). Reading the other module's data goes through its service, not `.populate()` ([layers and modules](../07-development-guides/02-layers-and-modules.md), section 3).

## 3. Repositories

3.1. A repository extends `BaseRepository<T>` (`src/core/persistence/base.repository.ts`) and implements the module's `I<Name>Repository` interface, registered under a token in `di.constants.ts`.
3.2. `BaseRepository` offers: `findById`, `findOne`, `findMany`, `paginate`, `count`, `exists`, `create`, `createMany`, `updateById`, `updateOne`, `updateMany`, `softDeleteById`, `restoreById`, `hardDeleteById`, `hardDeleteMany`, `bulkWrite`, `withTransaction`.
3.3. Reads return plain objects (`lean`) by default; pass `lean: false` when a Mongoose document is needed.
3.4. A model with a `deletedAt` path is filtered by soft delete: queries add `deletedAt: null` unless `includeSoftDeleted` is set. Delete with `softDeleteById`; use `hardDelete*` only for data that must disappear.
3.5. `paginate` caps the page size at 100.
3.6. A custom query goes in the module's repository, not in the service.

## 4. Transactions

4.1. A write that changes more than one document runs in `withTransaction(async (session) => ...)` and passes `{ session }` to every repository call inside.
4.2. Used today for: payment confirmation (status change and credit grant), the scoring aggregation and refund in `speaking-analysis.service.ts`, account creation through Google sign-in, and the import of forecast topics and questions.
4.3. **The balance invariant:** `Account.balance` and the `CreditLog` ledger change together in one transaction, and a charge is conditional on enough balance so two parallel requests cannot make it negative. The rules are in [payment and credit](../04-business-logic/02-payment-and-credit.md).
4.4. A transaction contains database work only. Calls to a third-party service happen before or after it.

## 5. Indexes

5.1. Indexes are declared in the model (`unique`, `index`, `schema.index`). The application does not create or drop indexes by a migration; Mongoose builds them at startup (its default; `autoIndex` is not disabled).
5.2. A unique constraint is the last defence against a race (duplicate email, duplicate session id, duplicate order code). The service also checks first to give a clear error; the index catches what the check misses and surfaces as `409` (`RES_002`).
5.3. `Session` has a TTL index on `expiresAt` that removes expired sessions.
5.4. Do not add an index that a compound index already covers by prefix. The audit found 75 secondary indexes, 8 of them redundant, and one duplicate on `Payment.orderCode` (finding F15).

## 6. Redis Keys

| Prefix | Content | TTL |
| :--- | :--- | :--- |
| `register:<email>` | Pending registration (email, hashed password) | 300 s |
| `verify:<email>` | OTP | 180 s |
| `reset-password-token:<token>` | Email allowed to reset the password | 300 s |
| `google-oauth-state:<state>` | Google sign-in state | 300 s |
| `socket-ticket:<ticket>` | User id for a socket handshake | 30 s |
| `rl:str:*`, `rl:fst:*` | Rate-limit state (strict and fast limiters) | twice the window |

6.1. Keys are built with `buildRedisKey({ PREFIX }, suffix)` so a prefix lives in one constants file.
6.2. Nothing in Redis is the only copy of business data. Redis can be flushed without losing accounts, payments or attempts; pending registrations and OTPs are lost, which is acceptable.

## 7. Data Changes

7.1. A change to a schema that existing documents do not satisfy needs a script that updates them, run per environment, and a note in the pull request. Mongoose does not migrate data.
7.2. Reference data (groups, permissions, voices, credit packages) comes from the seed; see the warning in [local setup](../02-getting-started/01-setup-local-env.md), section 6.
