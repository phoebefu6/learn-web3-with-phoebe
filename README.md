# Learn Web3 with Phoebe

**What public, adversarial, retractable data does to a data or AI project.** Sixteen 45-minute
sessions. Not a technology tour, and no coins anywhere.

Live: https://phoebefu6.github.io/learn-web3-with-phoebe/

Larkfield is a team that decided to build on public chain data. Everything that happened next
happened to their pipeline. The upside is real and it is not the one in the marketing: no access
negotiation, no SLA, no backfill request, no gatekeeper, and the full history available to anyone
who wants it.

The bill arrives in three places, and all three are data problems rather than blockchain ones.

- **The unit of identity is an address, not a person.** About 1,000 active addresses stand for
  **304** real parties. The standard co-spend heuristic gets that to **696**, still 2.3 times the
  truth.
- **Part of the population is manufactured by people paid to move the number.** Four operators
  running 60 addresses each are indistinguishable from 240 people by address count alone.
- **The source can withdraw what it already told you.** A plain append-only loader ends up with
  **511** rows, **5.75 percent** of the warehouse, describing history the chain no longer has,
  and nothing errors.

## Two tracks

**Leader, six sessions, no code.** The data is public now; the user count that is not one;
numbers people are paid to move; you cannot take it back; what actually gets better; and scoping
a project on this.

**Practitioner, ten sessions, hands on.** Reading a chain as a dataset; the indexer is the
product; addresses are not people; measuring the clustering; Sybils and adversarial counts;
reorgs hit your warehouse; designing for retraction; ML on public adversarial data; the bench
that fooled itself; and a capstone bench driving both engines.

## The numbers are computed, not asserted

`assets/w3-live.js` holds both benches. Every figure quoted on any page was computed from it
before the page existed, and the frozen tables live in `materials/official-course-map.md` with
the seed convention needed to reproduce them.

- **The error runs one way only.** Across **1,365** settings of world, operator size and operator
  discipline, the number of clusters holding two real parties is **0**. So a clustered count is a
  **ceiling** on distinct parties and a floor on nothing, and the course refuses the phrasing
  "about N parties" throughout.
- **The cleaning step has a slope of 1 against the population it exists to catch.** Adding ten
  addresses to each operator adds 40 addresses and 40 clusters. The slope only falls below 1 when
  an operator is both small and careless: at 10 addresses each it needs 70 percent discipline to
  hold the slope at 1, at 20 it needs 40, and at 40 or more it never drops.
- **Cleaning raises the contamination as a proportion.** Operators hold 24.4 percent of addresses
  and **34.3 percent** of clusters, against a truth of 1.3 percent, because honest addresses merge
  and manufactured ones do not.
- **The warehouse damage is one subtraction.** Measured over 4 seeds, 5 depths and every lag, 60
  combinations in all: about **169 orphaned rows per block of reorganisation depth minus loader
  lag**, roughly 1.9 percent of the warehouse each, while a block of lag holds back about **42**
  rows regardless of depth.

## The bench was wrong once, and that is session 9

An earlier version bundled the finality lag and the retracting loader behind one parameter, so any
lag above zero also switched on deletion. It reported that a 1 block lag eliminated every wrong
row against a 3 block reorganisation, which is false and would have taught that a token precaution
is sufficient.

All three self test properties passed under the faulty code, because they probed a lag of 0 and a
lag of 6 and both endpoints look identical whichever mechanism is doing the work. A fourth
property was added, *a lag shallower than the reorganisation still orphans rows*, which returns
**259** on the real engine and **0** on the faulty one. There are five now and the engine runs
them on every page load.

## What is not here

Chain mechanics, including how a reorganisation happens, are assumed from
[learn blockchain with phoebe](https://phoebefu6.github.io/learn-blockchain-with-phoebe/).
Probabilistic record linkage lives in
[learn entity resolution with phoebe](https://phoebefu6.github.io/learn-entity-resolution-with-phoebe/).
Legal obligations live in learn GDPR with phoebe.

**No cryptocurrency, no price, no token, no trading, and nothing here is investment advice. No
figure in this course describes a real network:** the population is generated so that the truth
is knowable, and only the algorithms run over it are the ordinary ones.

## Running it

Static HTML, CSS and JavaScript. No build step.

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000/

Part of [Learn with Phoebe](https://phoebefu6.github.io/learn-with-phoebe/) · by Phoebe Fu
