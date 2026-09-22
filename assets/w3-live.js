/* w3-live.js - two benches for a data team working against a public chain.

   Neither is a simulation of a real network and neither uses real network
   data. Both are deterministic generators plus real algorithms run over
   what they produce, so every figure on these pages is computed here.

   Bench A: what an on-chain "active user" count is actually counting.
   Bench B: what a chain reorganisation does to a warehouse that already
            reported the numbers.
*/
(function (root) {
  "use strict";

  function mulberry(seed) {
    var t = seed >>> 0;
    return function () {
      t += 0x6D2B79F5;
      var r = Math.imul(t ^ (t >>> 15), 1 | t);
      r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---------- union find, the whole of the clustering ---------- */
  function UF(n) {
    var p = new Array(n), r = new Array(n).fill(0), i;
    for (i = 0; i < n; i++) p[i] = i;
    function find(x) { while (p[x] !== x) { p[x] = p[p[x]]; x = p[x]; } return x; }
    function union(a, b) {
      a = find(a); b = find(b);
      if (a === b) return false;
      if (r[a] < r[b]) { var t = a; a = b; b = t; }
      p[b] = a; if (r[a] === r[b]) r[a]++;
      return true;
    }
    return { find: find, union: union, size: function () { return n; } };
  }

  /* ---------- Bench A: Larkfield's active address count ----------
     A world of real people, each holding one or more addresses, plus a
     handful of operators running many addresses on purpose. Transactions
     that spend from several addresses at once reveal common control, which
     is the only evidence the clustering gets. */
  function makeWorld(opts) {
    opts = opts || {};
    var people = opts.people == null ? 300 : opts.people;
    var sybils = opts.sybils == null ? 4 : opts.sybils;
    var sybilAddrs = opts.sybilAddrs == null ? 60 : opts.sybilAddrs;
    var maxAddrs = opts.maxAddrs == null ? 4 : opts.maxAddrs;
    var rnd = mulberry(opts.seed == null ? 11 : opts.seed);

    var addresses = [], owner = [], i, j, k;
    // ordinary people, one to maxAddrs addresses each
    for (i = 0; i < people; i++) {
      var count = 1 + Math.floor(rnd() * maxAddrs);
      for (j = 0; j < count; j++) { addresses.push("p" + i + "-" + j); owner.push("person-" + i); }
    }
    // operators, many addresses each, deliberately
    for (k = 0; k < sybils; k++) {
      for (j = 0; j < sybilAddrs; j++) { addresses.push("s" + k + "-" + j); owner.push("operator-" + k); }
    }
    return { addresses: addresses, owner: owner, people: people, sybils: sybils };
  }

  /* Produce transactions. A co-spend links every input address in one
     transaction. `coSpendRate` is how often an owner happens to spend from
     two of their own addresses together, which is the only thing that
     leaves a trace. `sybilDiscipline` is how carefully an operator avoids
     doing that. */
  function makeTransactions(world, opts) {
    opts = opts || {};
    var n = opts.transactions == null ? 4000 : opts.transactions;
    var coSpendRate = opts.coSpendRate == null ? 0.25 : opts.coSpendRate;
    var sybilDiscipline = opts.sybilDiscipline == null ? 0.97 : opts.sybilDiscipline;
    var rnd = mulberry(opts.seed == null ? 23 : opts.seed);

    var byOwner = {};
    world.owner.forEach(function (o, idx) { (byOwner[o] = byOwner[o] || []).push(idx); });
    var owners = Object.keys(byOwner);

    var txs = [];
    for (var t = 0; t < n; t++) {
      var o = owners[Math.floor(rnd() * owners.length)];
      var mine = byOwner[o];
      var isOperator = o.indexOf("operator-") === 0;
      var wantCoSpend = isOperator ? (rnd() > sybilDiscipline) : (rnd() < coSpendRate);
      var inputs = [mine[Math.floor(rnd() * mine.length)]];
      if (wantCoSpend && mine.length > 1) {
        var second = mine[Math.floor(rnd() * mine.length)];
        if (second !== inputs[0]) inputs.push(second);
      }
      txs.push(inputs);
    }
    return txs;
  }

  /* The heuristic: addresses spent together in one transaction are treated
     as one entity. That is all it is, and it is the standard one. */
  function clusterByCoSpend(world, txs) {
    var uf = UF(world.addresses.length), links = 0;
    txs.forEach(function (inputs) {
      for (var i = 1; i < inputs.length; i++) if (uf.union(inputs[0], inputs[i])) links++;
    });
    var roots = {};
    for (var a = 0; a < world.addresses.length; a++) roots[uf.find(a)] = true;
    return { uf: uf, entities: Object.keys(roots).length, links: links };
  }

  /* How good was the clustering, against the truth the generator knows?
     Reported as the two errors that matter to a data team: addresses that
     should have been merged and were not, and entities wrongly merged. */
  function scoreClustering(world, cl) {
    var byCluster = {}, a;
    for (a = 0; a < world.addresses.length; a++) {
      var r = cl.uf.find(a);
      (byCluster[r] = byCluster[r] || []).push(a);
    }
    var trueOwners = {};
    world.owner.forEach(function (o) { trueOwners[o] = true; });
    var mixed = 0, keys = Object.keys(byCluster);
    keys.forEach(function (k) {
      var seen = {};
      byCluster[k].forEach(function (idx) { seen[world.owner[idx]] = true; });
      if (Object.keys(seen).length > 1) mixed++;
    });
    return {
      addresses: world.addresses.length,
      trueEntities: Object.keys(trueOwners).length,
      clustered: cl.entities,
      mixedClusters: mixed,
      stillSplit: cl.entities - Object.keys(trueOwners).length
    };
  }

  /* ---------- Bench B: the reorg the warehouse missed ----------
     Blocks arrive, rows are written, a report is published. Then a branch
     of depth d is replaced. Rows from the replaced blocks are now describing
     history that no longer exists, and nothing in a plain append-only load
     notices. */
  function runPipeline(opts) {
    opts = opts || {};
    var blocks = opts.blocks == null ? 200 : opts.blocks;
    var rowsPerBlock = opts.rowsPerBlock == null ? 40 : opts.rowsPerBlock;
    var reorgDepth = opts.reorgDepth == null ? 3 : opts.reorgDepth;
    var reorgEvery = opts.reorgEvery == null ? 50 : opts.reorgEvery;
    var finalityLag = opts.finalityLag == null ? 0 : opts.finalityLag;
    /* Holding rows back and retracting them are two different defences and
       an earlier version of this conflated them, which made a lag of one
       block look like it solved a three block reorg. They are separate. */
    var retract = !!opts.retract;
    var rnd = mulberry(opts.seed == null ? 5 : opts.seed);

    var written = 0, orphaned = 0, reorgs = 0, corrected = 0;
    var canonical = [];
    var warehouse = [];

    function releaseSettled(h) {
      for (var q = 0; q < canonical.length; q++) {
        var c = canonical[q];
        if (!c.loaded && h - c.height >= finalityLag) {
          c.loaded = true;
          warehouse.push({ height: c.height, rows: c.rows });
          written += c.rows;
        }
      }
    }

    for (var h = 1; h <= blocks; h++) {
      var rows = rowsPerBlock + Math.floor(rnd() * 5);
      canonical.push({ height: h, rows: rows, loaded: false });
      releaseSettled(h);

      if (h % reorgEvery === 0 && h > reorgDepth) {
        reorgs++;
        var from = h - reorgDepth + 1;
        for (var i = canonical.length - 1; i >= 0; i--) if (canonical[i].height >= from) canonical.splice(i, 1);
        for (var j = warehouse.length - 1; j >= 0; j--) {
          if (warehouse[j].height >= from) {
            /* These rows were already loaded and the chain has replaced the
               blocks they came from. A retracting loader removes them; a
               plain append-only one simply keeps them, wrong and unflagged. */
            if (retract) { corrected += warehouse[j].rows; warehouse.splice(j, 1); }
            else orphaned += warehouse[j].rows;
          }
        }
        for (var k2 = from; k2 <= h; k2++) {
          var r2 = rowsPerBlock + Math.floor(rnd() * 5);
          canonical.push({ height: k2, rows: r2, loaded: false });
        }
        releaseSettled(h);
      }
    }
    var warehouseRows = warehouse.reduce(function (a, r) { return a + r.rows; }, 0);
    var heldRows = canonical.reduce(function (a, c) { return a + (c.loaded ? 0 : c.rows); }, 0);
    return {
      blocks: blocks, reorgs: reorgs, reorgDepth: reorgDepth,
      finalityLag: finalityLag, retract: retract,
      rowsWritten: written,
      orphanedRows: orphaned,
      correctedRows: corrected,
      rowsStillHeld: heldRows,
      warehouseRows: warehouseRows,
      wrongRowShare: warehouseRows ? Math.round((orphaned / warehouseRows) * 10000) / 10000 : 0
    };
  }

  /* ---------- self test ----------
     Two properties that must hold or nothing built on these means anything.
     Checked rather than assumed. */
  function selfTest() {
    var out = [];

    // 1. clustering can never report more entities than addresses, and with
    //    no co-spends at all it must report exactly one entity per address.
    var w = makeWorld({ people: 40, sybils: 1, sybilAddrs: 5, seed: 3 });
    var none = clusterByCoSpend(w, makeTransactions(w, { transactions: 500, coSpendRate: 0, sybilDiscipline: 1, seed: 4 }));
    out.push({
      name: "no co-spends leaves every address its own entity",
      expected: w.addresses.length, got: none.entities, ok: none.entities === w.addresses.length
    });

    // 2. a pipeline with a finality lag deeper than the reorg must never
    //    orphan a row.
    var safe = runPipeline({ blocks: 120, reorgDepth: 3, reorgEvery: 40, finalityLag: 6, seed: 9 });
    out.push({
      name: "a finality lag deeper than the reorg orphans nothing",
      expected: 0, got: safe.orphanedRows, ok: safe.orphanedRows === 0
    });

    // 3. with no lag, a reorg must orphan something.
    var naive = runPipeline({ blocks: 120, reorgDepth: 3, reorgEvery: 40, finalityLag: 0, seed: 9 });
    out.push({
      name: "with no lag a reorg does orphan rows",
      expected: "> 0", got: naive.orphanedRows, ok: naive.orphanedRows > 0
    });

    /* 4. The property the first three missed. Probing only lag 0 and a lag
       deeper than the reorg tests both endpoints, and at both endpoints a
       lag and a retracting loader look the same. A lag that is shallower
       than the reorg but greater than zero is the only setting that tells
       them apart, and the original three all passed under the faulty
       wiring that conflated them. */
    var shallow = runPipeline({ blocks: 120, reorgDepth: 3, reorgEvery: 40, finalityLag: 1, retract: false, seed: 9 });
    out.push({
      name: "a lag shallower than the reorg still orphans rows",
      expected: "> 0", got: shallow.orphanedRows, ok: shallow.orphanedRows > 0
    });

    // 5. retraction alone, at no lag, must correct rather than orphan.
    var retracting = runPipeline({ blocks: 120, reorgDepth: 3, reorgEvery: 40, finalityLag: 0, retract: true, seed: 9 });
    out.push({
      name: "a retracting loader corrects instead of orphaning",
      expected: "0 orphaned, > 0 corrected",
      got: retracting.orphanedRows + " orphaned, " + retracting.correctedRows + " corrected",
      ok: retracting.orphanedRows === 0 && retracting.correctedRows > 0
    });

    return { ok: out.every(function (o) { return o.ok; }), results: out };
  }

  root.W3 = {
    makeWorld: makeWorld,
    makeTransactions: makeTransactions,
    clusterByCoSpend: clusterByCoSpend,
    scoreClustering: scoreClustering,
    runPipeline: runPipeline,
    selfTest: selfTest
  };
})(typeof window !== "undefined" ? window : globalThis);

if (typeof module !== "undefined" && module.exports) {
  module.exports = (typeof window !== "undefined" ? window : globalThis).W3;
}
