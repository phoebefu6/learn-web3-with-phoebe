# Official course map - learn-web3-with-phoebe

Bucket `emrg`, difficulty d3, 16 sessions, Leader 6 + Practitioner 10.
**Every session is 45 minutes, on both tracks.**

**Scope, set by Phoebe 2026-09-22: the data and AI angle.** Not a tour of the web3 stack. The
question is what a public, adversarial, unfixable, pseudonymous dataset does to the way data and
AI work is normally done, and where that is genuinely valuable rather than merely different.
Setting: **Larkfield**, a company whose product issues on-chain rewards, and whose data team has
to report how many people are using it.

---

## The seam

| Subject | Owner | This course |
|---|---|---|
| Hashes, blocks, chains, mining, Merkle proofs, consensus, smart contracts as a mechanism | `learn-blockchain-with-phoebe` (emrg d2, LIVE) | **Assumed, never re-taught.** Blockchain is the prerequisite and already hands tokens, dapps and the wider stack here from its p9. Its p8 says losing-branch entries "leave the accepted history without ever being invalid, and nothing built so far raises an alarm" - this course is what happens next, in the warehouse. |
| Coins, wallets, money, price, markets | `learn-crypto-with-phoebe` (emrg d2, PLANNED) | Not taught. **No price, no market, no token valuation, no investment advice.** |
| Trading, signals, backtesting | `learn-quant-trading-with-phoebe` (PLANNED) | Not taught. |
| Probabilistic record linkage: Fellegi-Sunter, blocking, string comparison, master data | `learn-entity-resolution-with-phoebe` (LIVE, 6 sessions) | **Named, not re-taught.** That course links records by fuzzy attributes. Here the evidence is transaction structure and the linkage is deterministic, so the craft is different even though the problem rhymes. |
| Idempotency, late-arriving data, restatement, append-only loads | `learn-data-engineering`, `learn-analytics-engineering`, `learn-data-modeling` | The general patterns are named and pointed at. What is taught here is the chain-specific twist: the upstream can **retract** history, which those courses do not have to handle. |
| Right to erasure and data subject rights | `learn-gdpr-with-phoebe` | Named. The twist taught here is that erasure is not merely hard on a chain, it is structurally unavailable, and what that does to a design review. |

**Estate vocabulary check before this build.** `smart contract` **0**, `dapp` **0**, `gas fee`
**0**, `on-chain` **0**, `Nakamoto coefficient` **0**, `governance token` **0**, `DAO` **0**,
`sybil` **0**, `address clustering` **0**, `union-find` **0**, `indexer` **0**,
`adversarial data` **0**.

Three apparent collisions were checked individually and are not collisions. `token` returns 133
pages, all of it LLM tokenisation. `validator` returns 36, all of it data validation. **`reorg`
returns 14 and every one is the organisational sense**, a company reorganisation, in
`learn-ai-leadership` and `learn-data-access-control`. Chain reorganisations appear only in
`learn-blockchain`.

---

## Frozen canon - Larkfield

Computed in node from `assets/w3-live.js` before any page quoted a number. Both benches are
deterministic generators plus real algorithms run over what they produce. **No figure here
describes any real network, and no page may imply otherwise.**

### The engine is checked, not assumed

`selfTest()` runs **five** properties on load, all passing. Properties 4 and 5 were added after
the conflation fault described under Bench B; the first three all passed against the faulty code.

| Property | Result |
|---|---|
| With no co-spends, clustering leaves every address its own entity | 105 addresses, 105 entities |
| A finality lag deeper than the reorg orphans nothing | 0 orphaned rows |
| With no lag, a reorg does orphan rows | 380 orphaned rows |
| **A lag shallower than the reorg still orphans rows** | **259 orphaned rows** (0 under the fault) |
| A retracting loader corrects instead of orphaning | 0 orphaned, 380 corrected |

Any page stating a count of these properties must say **five**. Pages describing the historical
episode may say three, in the past tense, about what the harness held at the time.

### How to reproduce these numbers

**The seed convention is part of the canon.** Bench A uses **world seed `s` and transaction seed
`s + 1`**:

```
W3.makeWorld({ people: 300, sybils: 4, sybilAddrs: 60, seed: s })
W3.makeTransactions(world, { transactions: 4000, coSpendRate: 0.25, sybilDiscipline: 0.97, seed: s + 1 })
```

Bench B uses a single `seed` passed straight to `runPipeline`. An agent had to recover the Bench A
convention by brute force because this section did not exist; anything quoting these tables should
read it here instead.

### Bench A - what an active address count is counting

A world of **300 people** holding one to four addresses each, plus **4 operators** each running
60 addresses on purpose. So the truth is **304 entities**. Transactions that spend from two
addresses at once are the only evidence of common control; ordinary people do that 25 percent of
the time, operators avoid it 97 percent of the time. 4,000 transactions.

| Seed | Addresses seen | True entities | Clustering says | Still split | Wrongly merged |
|---|---|---|---|---|---|
| 11 | 982 | 304 | 696 | 392 | **0** |
| 101 | 981 | 304 | 676 | 372 | **0** |
| 2024 | 988 | 304 | 688 | 384 | **0** |
| 7 | 1,025 | 304 | 707 | 403 | **0** |
| 55555 | 993 | 304 | 696 | 392 | **0** |

**Three numbers, and the third is the point.** The naive count is about **1,000 active
addresses**, roughly **3.2 times** the truth of 304. The standard co-spend heuristic brings it to
**676 to 707**, which is still about **2.3 times** the truth. It removes about half the error and
does not fix it.

**The error runs in one direction only.** Across all five seeds the number of wrongly merged
clusters is **0**. The heuristic never fuses two real people; it only fails to join addresses
that belong together. So the clustered figure is a **ceiling on the entity count and a floor on
nothing**, which is exactly what you need to know before quoting it to anyone.

**Operator discipline barely matters, and the reason is not what it first looks like.** Varying
how carefully the operators avoid co-spending, from 50 percent to 100 percent, moves the
clustered count only from 666 to 697 on seed 11: a swing of **31** against a total excess of
**392**.

**Be precise about what that does and does not show.** Decomposed on seed 11 at discipline 0.97,
the 392 excess splits as **235 from the operators** (239 clusters against 4 real ones) and
**157 from ordinary holders** (457 against 300). So operators are the **larger** share of the
error, not the smaller one. Even at maximum carelessness, with discipline at 0, the excess only
falls to **339**.

The defensible claim is therefore about **behaviour, not blame**: only 31 of the 392 responds to
how carefully the operators act, because most of their excess comes from simply holding many
addresses that never need to be spent together at all. **An earlier version of this section said
most of the gap was ordinary people rather than operators, which the decomposition does not
support.** Pages must make the narrow claim.

### Derived quantities, for the pages that need them

All follow from the parameters and seed convention above. Listed so pages quote rather than
re-derive.

| Seed | Rows at input grain | Multi-input transactions | Addresses ever spent | Spent more than once | Successful merges | Clusters |
|---|---|---|---|---|---|---|
| 11 | 4,447 | 447 | 787 | 706 | **286** | 696 |
| 101 | 4,473 | 473 | 779 | 708 | 305 | 676 |
| 2024 | 4,489 | 489 | 791 | 720 | 300 | 688 |
| 7 | 4,511 | 511 | 827 | 743 | 318 | 707 |
| 55555 | 4,466 | 466 | 790 | 720 | 297 | 696 |

**The identity worth teaching: addresses minus successful merges equals clusters.** On seed 11,
982 - 286 = 696. Every union that succeeds removes exactly one entity from the count, which is
why the clustered figure can only ever fall as more transactions arrive, never rise.

Note that only about **787 of the 982 addresses ever appear as a spend input at all** on seed 11.
The rest are seen only as recipients, so the co-spend heuristic has no evidence about them
whatsoever. That is a second reason the clustered count overstates entities, separate from
operators, and it is worth naming wherever the 2.3x gap is discussed.

### What clustering does to the operator share, which is the wrong way round

| Seed | Clusters containing an operator | Total clusters | Operator share |
|---|---|---|---|
| 11 | 239 | 696 | **34.3%** |
| 101 | 238 | 676 | 35.2% |
| 2024 | 240 | 688 | 34.9% |
| 7 | 240 | 707 | 33.9% |
| 55555 | 237 | 696 | 34.1% |

At address level the operators hold **240 of 982**, which is **24.4%**. After clustering they hold
about **34.3%**. The truth is **4 of 304**, which is **1.3%**.

**The cleanup step makes the contamination worse as a proportion.** Ordinary people's addresses
merge when they co-spend, so their entity count falls; operator addresses mostly do not merge,
because avoiding co-spends is the one thing an operator is careful about. Clustering therefore
shrinks the honest population faster than the manufactured one. A model or a metric computed on
clustered entities is more operator-weighted than one computed on raw addresses, which is the
opposite of what a cleaning step is assumed to do, and it is worth stating wherever clustering is
presented as an improvement.

### Bench B - the reorg the warehouse never heard about

200 blocks, about 40 rows each, a 3 block reorganisation every 50 blocks, so 4 reorgs. A plain
append-only loader writes every block as it arrives.

| Finality lag | Orphaned rows | Share of the warehouse | Rows held back |
|---|---|---|---|
| 0 | **511** | **5.75%** | 0 |
| 1 | 346 | 3.99% | 44 |
| 2 | 172 | 2.03% | 84 |
| 3 | **0** | 0.00% | 125 |
| 4 | 0 | 0.00% | 168 |
| 6 | 0 | 0.00% | 249 |
| 12 | 0 | 0.00% | 497 |

**A naive loader ends up with 5.75 percent of its rows describing history the chain no longer
has, and nothing errors.** Stable across seeds: 5.65 to 5.75 percent over seeds 5, 42, 777 and
20260922.

**A lag shallower than the reorg is the dangerous middle.** A one block lag still leaves 3.99
percent wrong. It feels like a precaution and buys partial protection, which is worse than none
because it is mistaken for safety.

**The lag has to match the reorg depth, and going deeper buys nothing.** At lag 3 the wrong rows
reach zero. At lag 6 and 12 they are also zero, and the only difference is 249 and 497 rows held
back from the report. **You cannot pick the lag without knowing the reorg depth, and that is the
input nobody writes down.**

**The self test missed this, and that is recorded too.** The original three properties probed a
lag of 0 and a lag of 6 against a depth 3 reorg, which are both endpoints where a lag and a
retracting loader behave identically, so **all three passed against the faulty code**. A fourth
property was added: *a lag shallower than the reorg still orphans rows*, which returns **259** on
the real engine and **0** on the faulty one. Run against a reintroduced fault, the three original
properties still pass and only the fourth fails. A fifth property now also checks that a
retracting loader corrects rather than orphans.

**Retraction is the other defence and it is separate.** A loader that removes rows when their
blocks are replaced corrects all 511 at lag 0, and at lag 3 there is nothing to correct because
nothing wrong was ever loaded. **An early version of this bench conflated the two and made a one
block lag look like a fix for a three block reorg.** Holding rows back and retracting them are
different mechanisms; that near-miss is taught in p9.

### The slope, measured (added for p10)

Operator addresses pass through the co-spend heuristic untouched. Rebuilding the same world with
ten more addresses per operator and differencing the two answers:

| Operator size | Extra addresses | Extra clusters | Slope |
|---|---|---|---|
| 10 -> 20 | 40 | 40 | **1.00** |
| 40 -> 50 | 40 | 40 | **1.00** |
| 60 -> 70 | 40 | 40 | **1.00** |
| 90 -> 100 | 40 | 40 | **1.00** |

At discipline 0.97 the slope is 1.00 on all five seeds at every size (one 0.97 on seed 2024 at
size 60). Over the full control space, 5 seeds x sizes 10 to 120 x discipline 0 to 100, the slope
runs **0.55 to 1.05** and only falls below 0.95 when an operator is both small and careless:
size 10 needs **70 percent** discipline to hold the slope at 1, size 20 needs **40**, size 30
needs **25**, and size 40 or more never drops. Ordinary holders, by contrast, give a slope of
**0.61 to 0.96**.

**Wrongly merged clusters are 0 across all 1,365 settings tested** (5 seeds x 13 sizes x 21
discipline steps). This is the strongest form of the ceiling claim in the course.

**Discipline figures, and which range each one uses.** p5 owns the 31: discipline 0.5 to 1.0 on
seed 11 moves 666 to 697. The full slider, 0 to 1.0, moves 643 to 697, which is **54**. From 0.97
to 0 alone it is **53**, and 49 to 59 across the five seeds. Pages must say which range they
swept; p10 quotes 31 for the plausible half and 54 for the whole travel.

### Bench B as one subtraction (added for p10)

Measured over **4 seeds x 5 depths (1, 2, 3, 4, 6) x every lag, 60 combinations with a non-zero
shortfall**. Orphaned rows are predicted by `shortfall = max(0, depth - lag)` alone:

| Quantity | Measured range | Mean |
|---|---|---|
| Orphaned rows per block of shortfall | 166.5 to 173.0 | **168.8** |
| Share of the warehouse per block of shortfall | 1.77% to 2.03% | **1.92%** |
| Rows held back per block of lag, any depth | 40.5 to 44.0 | **41.9** |

So a block of waiting removes about **169** wrong rows and costs about **42** held ones, until
the lag reaches the depth, after which the 42 keeps being paid and the 169 is zero. The held-back
cost does not depend on the depth at all; only the benefit does.

Selected grid cells, seed 5, retraction off:

| Depth | Lag | Orphaned | Share | Held |
|---|---|---|---|---|
| 3 | 0 | 511 | 5.75% | 0 |
| 3 | 1 | 346 | 3.99% | 44 |
| 3 | 3 | 0 | 0.00% | 125 |
| 6 | 3 | **508** | **5.80%** | 123 |
| 6 | 6 | 0 | 0.00% | 249 |

The depth 6 / lag 3 row is the one p10 uses: a lag you had proved sufficient becomes insufficient
with nothing on your side having changed, and no signal in your own pipeline can tell you.

## Coverage per session

`✓` taught to working depth. `◐` named and handed on.

### Leader track

| Session | Covers | Depth |
|---|---|---|
| a1 The data is public now | What changes when the dataset is shared, permanent and not yours | ✓ |
| a2 The user count that is not one | 1,000 addresses, 304 entities, and the 690 in between | ✓ |
| a3 Numbers people are paid to move | Adversarial data: the metric and the incentive live in the same place | ✓ |
| a4 You cannot take it back | Immutability against correction, restatement and erasure | ✓ |
| a5 What actually gets better | Where a shared ledger genuinely beats a database for a data team | ✓ |
| a6 Scoping a project on this | What to ask before agreeing to build on it | ✓ |
| Hashes, blocks, consensus | Handed to `learn-blockchain` | ◐ |
| Coins, price, markets | Handed to `learn-crypto` | ◐ |

### Practitioner track

| Session | Covers | Depth |
|---|---|---|
| p1 Reading a chain as a dataset | What the rows are, what a schema means when you do not own it | ✓ |
| p2 The indexer is the product | Raw chain data to queryable tables, and why that pipeline is the work | ✓ |
| p3 Addresses are not people | The co-spend heuristic, union find, and what it can and cannot resolve | ✓ |
| p4 Measuring the clustering | Ceiling and floor, the zero wrongly-merged result, reporting the bound | ✓ |
| p5 Sybils and adversarial counts | Operators, and why discipline barely moved the number | ✓ |
| p6 Reorgs hit your warehouse | 5.75 percent wrong and silent; the lag table | ✓ |
| p7 Designing for retraction | Lag against retraction, the two defences and their costs | ✓ |
| p8 ML on public adversarial data | Training where the features and the model are both visible | ✓ |
| p9 The bench that fooled itself | The lag-and-retraction conflation, and how it was caught | ✓ |
| p10 The Larkfield bench | Both benches live, driven by the reader | ✓ |
| Record linkage craft | Pointed at `learn-entity-resolution` | ◐ |
| Idempotency and late-arriving data | Pointed at `learn-data-engineering` | ◐ |

## Not covered, by design

- **Chain mechanics.** `learn-blockchain` is the prerequisite.
- **Any coin, price, market or wallet, and any investment advice.** `learn-crypto`.
- **Named networks, protocols, platforms, indexing vendors or client software.** None can be
  verified from here and all of them move faster than a course.
- **Real network statistics of any kind.** Every figure in this course comes from the generator
  in `assets/w3-live.js`.
- **Probabilistic record linkage.** `learn-entity-resolution`.

## Re-verify before delivery

Both benches are seeded and deterministic. If `w3-live.js` is edited, run `selfTest()` first,
then re-run the canon harness across **at least four seeds** and update every number here before
touching a page. **A defence that looks like it works must be tested against the thing it is
meant to stop** - the lag defence appeared to solve a three block reorg at a one block lag until
lag and retraction were separated.
