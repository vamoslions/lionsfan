/* =========================================================
   VAMOS LIONS · simulation.js
   - 타석(PA) 단위 몬테카를로 야구 시뮬레이션
   - 실제 확인 기록이 없는 값은 리그 평균 가정값 사용
   - 결과는 통계적 추정치이며 실제 경기 예측이 아님
   ========================================================= */
(function () {
  "use strict";

  const DATA = window.LIONS_DATA || {};
  const CFG = DATA.simulation || {};
  const PRIORS = CFG.priors || {};
  const POSITIONS = ["C", "1B", "2B", "3B", "SS", "LF", "CF", "RF", "DH"];
  const DEFAULT_ORDER = ["CF", "RF", "LF", "DH", "1B", "C", "3B", "SS", "2B"];

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const num = (value, fallback) => (Number.isFinite(Number(value)) ? Number(value) : fallback);

  function meta(name) {
    return (DATA.playerMeta && DATA.playerMeta[name]) || {};
  }

  function positionsOf(name) {
    const list = meta(name).positions;
    return Array.isArray(list) && list.length ? list : [];
  }

  function hashSeed(text) {
    let h = 1779033703 ^ String(text).length;
    for (let i = 0; i < String(text).length; i += 1) {
      h = Math.imul(h ^ String(text).charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return function () {
      h = Math.imul(h ^ (h >>> 16), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      return (h ^= h >>> 16) >>> 0;
    };
  }

  function makeRng(seed) {
    let a = hashSeed(seed)();
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---------- 선수 프로필 ---------- */
  function batterProfile(name) {
    const sample = (CFG.batterSamples && CFG.batterSamples[name]) || {};
    const hasFull = Number.isFinite(Number(sample.obp)) && Number.isFinite(Number(sample.slg));
    const obp = hasFull ? Number(sample.obp) : num(PRIORS.obp, 0.335);
    const slg = hasFull ? Number(sample.slg) : num(PRIORS.slg, 0.400);
    const avg = Number.isFinite(Number(sample.avg))
      ? Number(sample.avg)
      : clamp(obp * 0.78, 0.15, 0.40);
    return {
      name,
      obp,
      slg,
      avg,
      status: hasFull ? "confirmed" : sample.status === "partial" ? "partial" : "prior",
      source: hasFull ? sample.source || "확인 기록" : sample.source || "리그 평균 가정",
      sample,
    };
  }

  function pitcherProfile(name) {
    const sample = (CFG.pitcherSamples && CFG.pitcherSamples[name]) || {};
    const priorEra = num(PRIORS.pitcherEra, 4.2);
    const hasEra = Number.isFinite(Number(sample.era));
    const era = hasEra ? Number(sample.era) : priorEra;
    const blend = hasEra ? (sample.status === "partial" ? 0.25 : 0.6) : 0;
    const factor = clamp(1 + ((era - priorEra) / priorEra) * blend, 0.72, 1.32);
    return {
      name,
      era,
      factor,
      hasEra,
      status: hasEra ? sample.status || "partial" : "prior",
      source: hasEra ? sample.source || "확인 기록" : "리그 평균 가정",
    };
  }

  /* ---------- 타석 확률 ---------- */
  function outcomeRates(profile, pitcherFactor) {
    const p = {
      obp: num(PRIORS.obp, 0.335),
      slg: num(PRIORS.slg, 0.400),
      avg: num(PRIORS.avg, 0.260),
      kRate: num(PRIORS.kRate, 0.205),
      hbpRate: num(PRIORS.hbpRate, 0.012),
    };
    const adjustedObp = clamp(profile.obp * pitcherFactor, 0.20, 0.55);
    const adjustedSlg = clamp(profile.slg * pitcherFactor, 0.22, 0.75);
    const avg = clamp(profile.avg * (0.6 + pitcherFactor * 0.4), 0.14, 0.42);
    const hbp = p.hbpRate;
    const bb = clamp(adjustedObp - avg - hbp, 0.025, 0.145);
    const iso = Math.max(0, adjustedSlg - avg);
    const hr = clamp(iso * 0.17, 0.004, 0.075);
    const triple = clamp(iso * 0.015, 0, 0.014);
    const double = clamp(iso - hr * 3 - triple * 2, 0.01, 0.12);
    const single = clamp(avg - hr - double - triple, 0.06, 0.24);
    const strikeout = clamp(p.kRate + (p.obp - adjustedObp) * 0.2, 0.11, 0.32);
    const out = clamp(1 - bb - hbp - single - double - triple - hr - strikeout, 0.16, 0.55);
    return { bb, hbp, single, double, triple, hr, strikeout, out };
  }

  function genericLineup(teamShort) {
    return Array.from({ length: 9 }, (_, i) => ({
      name: `${teamShort || "상대"} ${i + 1}번`,
      position: DEFAULT_ORDER[i],
      generic: true,
    }));
  }

  /* ---------- 주루 ---------- */
  function emptyBases() {
    return [null, null, null];
  }

  function scoreRunner(agg, runner, isUserBatting) {
    if (!isUserBatting || !runner || runner.generic) return;
    const row = agg.batters.get(runner.name);
    if (row) row.runs += 1;
  }

  function walkAdvance(bases, batter, agg) {
    const [first, second, third] = bases;
    let runs = 0;
    if (first && second && third) {
      scoreRunner(agg, third, true);
      runs += 1;
      bases[2] = second;
      bases[1] = first;
      bases[0] = batter;
    } else if (first && second) {
      bases[2] = second;
      bases[1] = first;
      bases[0] = batter;
    } else if (first) {
      bases[1] = first;
      bases[0] = batter;
    } else {
      bases[0] = batter;
    }
    return runs;
  }

  function singleAdvance(bases, batter, agg, rng) {
    const [first, second, third] = bases;
    let runs = 0;
    if (third) {
      scoreRunner(agg, third, true);
      runs += 1;
      bases[2] = null;
    }
    if (second) {
      if (rng() < 0.52) {
        scoreRunner(agg, second, true);
        runs += 1;
        bases[1] = null;
      } else {
        bases[2] = second;
        bases[1] = null;
      }
    }
    if (first) {
      bases[1] = first;
    }
    bases[0] = batter;
    return runs;
  }

  function doubleAdvance(bases, batter, agg, rng) {
    const [first, second, third] = bases;
    bases[0] = null;
    bases[1] = null;
    bases[2] = null;
    let runs = 0;
    if (third) {
      scoreRunner(agg, third, true);
      runs += 1;
    }
    if (second) {
      scoreRunner(agg, second, true);
      runs += 1;
    }
    if (first) {
      if (rng() < 0.45) {
        scoreRunner(agg, first, true);
        runs += 1;
      } else {
        bases[2] = first;
      }
    }
    bases[1] = null;
    bases[0] = null;
    bases[1] = batter;
    return runs;
  }

  function tripleAdvance(bases, batter, agg) {
    let runs = 0;
    bases.forEach((runner) => {
      if (runner) {
        scoreRunner(agg, runner, true);
        runs += 1;
      }
    });
    bases[0] = null;
    bases[1] = null;
    bases[2] = batter;
    return runs;
  }

  function homerAdvance(bases, batter, agg) {
    let runs = 1;
    scoreRunner(agg, batter, true);
    bases.forEach((runner) => {
      if (runner) {
        scoreRunner(agg, runner, true);
        runs += 1;
      }
    });
    bases[0] = null;
    bases[1] = null;
    bases[2] = null;
    return runs;
  }

  /* ---------- 절반 이닝 ---------- */
  function playHalfInning(lineup, pitcher, agg, isUserBatting, teamFactor, homeBoost) {
    const bases = emptyBases();
    let outs = 0;
    let runs = 0;
    let index = agg.nextIndex || 0;
    const ratesCache = lineup.map((batter) => outcomeRates(batterProfile(batter.name), pitcher.factor * teamFactor));

    while (outs < 3) {
      const slot = index % 9;
      const batter = lineup[slot];
      const rates = ratesCache[slot];
      const row = isUserBatting ? agg.batters.get(batter.name) : null;
      if (row) row.pa += 1;

      const boost = homeBoost || 1;
      const r = agg.rng();
      let outcome;
      let threshold = 0;
      const scaled = {
        bb: rates.bb * boost,
        hbp: rates.hbp,
        single: rates.single * boost,
        double: rates.double * boost,
        triple: rates.triple * boost,
        hr: rates.hr * boost,
        strikeout: rates.strikeout,
      };
      Object.keys(scaled).forEach((key) => {
        if (outcome) return;
        threshold += scaled[key];
        if (r < threshold) outcome = key;
      });
      if (!outcome) outcome = "out";

      let rbi = 0;
      if (outcome === "bb" || outcome === "hbp") {
        rbi = walkAdvance(bases, batter, agg);
      } else if (outcome === "single") {
        rbi = singleAdvance(bases, batter, agg, agg.rng);
        if (row) row.hits += 1;
      } else if (outcome === "double") {
        rbi = doubleAdvance(bases, batter, agg, agg.rng);
        if (row) {
          row.hits += 1;
          row.doubles += 1;
        }
      } else if (outcome === "triple") {
        rbi = tripleAdvance(bases, batter, agg);
        if (row) {
          row.hits += 1;
          row.triples += 1;
        }
      } else if (outcome === "hr") {
        rbi = homerAdvance(bases, batter, agg);
        if (row) {
          row.hits += 1;
          row.hr += 1;
        }
      } else if (outcome === "strikeout") {
        outs += 1;
        if (!isUserBatting) agg.pitcher.k += 1;
        else agg.oppPitcher.k += 1;
      } else {
        /* 일반 아웃: 병살/희생플라이/땅볼 진루를 단순 확률로 처리 */
        const first = bases[0];
        const third = bases[2];
        if (first && outs < 2 && agg.rng() < 0.16) {
          outs += 2;
          bases[0] = null;
        } else {
          outs += 1;
          if (third && outs < 3 && agg.rng() < 0.3) {
            scoreRunner(agg, third, isUserBatting);
            rbi += 1;
            bases[2] = null;
          }
        }
      }

      if (row) {
        row.rbi += rbi;
        if (outcome === "bb" || outcome === "hbp") row.reached += 1;
      }
      runs += rbi;
      index += 1;
      agg.nextIndex = index;
    }

    if (!isUserBatting) {
      agg.pitcher.outs += 3;
      agg.pitcher.runs += runs;
      agg.pitcher.games += 1;
    } else {
      agg.oppPitcher.outs += 3;
      agg.oppPitcher.runs += runs;
    }
    return runs;
  }

  function createAggregate(lineup, pitcherName) {
    const batters = new Map();
    lineup.forEach((batter) => {
      batters.set(batter.name, {
        name: batter.name,
        position: batter.position,
        pa: 0,
        hits: 0,
        doubles: 0,
        triples: 0,
        hr: 0,
        runs: 0,
        rbi: 0,
        reached: 0,
      });
    });
    return {
      wins: 0,
      losses: 0,
      ties: 0,
      runsFor: 0,
      runsAgainst: 0,
      scores: new Map(),
      batters,
      pitcher: { name: pitcherName, outs: 0, k: 0, runs: 0, games: 0 },
      oppPitcher: { outs: 0, k: 0, runs: 0 },
      nextIndex: 0,
    };
  }

  function simulateOne(agg, lineup, pitcherName, opponent) {
    const userPitcher = pitcherProfile(pitcherName);
    const oppPitcher = pitcherProfile(`${opponent.short} 선발`);
    const oppLineup = genericLineup(opponent.short);
    const oppStrength = clamp(num(opponent.pct, 0.55) / 0.55, 0.9, 1.18);
    const homeBoost = clamp(1 + num(CFG.homeAdvantage, 0.018), 1, 1.05);

    let userIndex = 0;
    let opponentIndex = 0;
    let userRuns = 0;
    let oppRuns = 0;

    for (let inning = 0; inning < 9; inning += 1) {
      agg.nextIndex = userIndex;
      userRuns += playHalfInning(lineup, oppPitcher, agg, true, 1, homeBoost);
      userIndex = agg.nextIndex;
      agg.nextIndex = opponentIndex;
      oppRuns += playHalfInning(oppLineup, userPitcher, agg, false, oppStrength, 1);
      opponentIndex = agg.nextIndex;
    }

    let extra = 0;
    while (userRuns === oppRuns && extra < 3) {
      agg.nextIndex = userIndex;
      userRuns += playHalfInning(lineup, oppPitcher, agg, true, 1, homeBoost);
      userIndex = agg.nextIndex;
      agg.nextIndex = opponentIndex;
      oppRuns += playHalfInning(oppLineup, userPitcher, agg, false, oppStrength, 1);
      opponentIndex = agg.nextIndex;
      extra += 1;
    }

    agg.runsFor += userRuns;
    agg.runsAgainst += oppRuns;
    const scoreKey = `${userRuns}-${oppRuns}`;
    agg.scores.set(scoreKey, (agg.scores.get(scoreKey) || 0) + 1);
    if (userRuns > oppRuns) agg.wins += 1;
    else if (userRuns < oppRuns) agg.losses += 1;
    else agg.ties += 1;
  }

  function finalize(agg, iterations, metaInfo) {
    const games = Math.max(1, iterations);
    const winRate = agg.wins / games;
    const lossRate = agg.losses / games;
    const drawRate = agg.ties / games;
    const avgFor = agg.runsFor / games;
    const avgAgainst = agg.runsAgainst / games;

    const scoreList = Array.from(agg.scores.entries())
      .map(([score, count]) => ({ score, count, rate: count / games }))
      .sort((a, b) => b.count - a.count);

    const batters = Array.from(agg.batters.values()).map((row) => {
      const gamesPlayed = games;
      const perGame = (value) => value / gamesPlayed;
      return {
        ...row,
        avg: row.pa ? row.hits / row.pa : null,
        runsPerGame: perGame(row.runs),
        rbiPerGame: perGame(row.rbi),
        contribution: perGame(row.runs * 0.7 + row.rbi + row.hits * 0.12 + row.hr * 0.5),
      };
    });

    const topPlayers = [...batters].sort((a, b) => b.contribution - a.contribution).slice(0, 3);
    const pitcher = {
      name: agg.pitcher.name,
      ip: agg.pitcher.outs / 3 / games,
      k: agg.pitcher.k / games,
      runs: agg.pitcher.runs / games,
      era: agg.pitcher.outs ? (agg.pitcher.runs * 27) / agg.pitcher.outs : null,
    };
    const oppPitcher = {
      ip: agg.oppPitcher.outs / 3 / games,
      k: agg.oppPitcher.k / games,
      runs: agg.oppPitcher.runs / games,
      era: agg.oppPitcher.outs ? (agg.oppPitcher.runs * 27) / agg.oppPitcher.outs : null,
    };

    const coverage = metaInfo.coverage;
    const factors = [];
    if (coverage.confirmed + coverage.partial < 9) {
      factors.push({
        type: "down",
        label: "타자 실측 데이터 부족",
        detail: `9명 중 완전한 OBP·SLG 기록은 ${coverage.confirmed}명. 나머지는 리그 평균 가정값을 사용했습니다.`,
      });
    }
    const koo = batterProfile("구자욱");
    if (koo.status === "confirmed") {
      factors.push({
        type: "up",
        label: "구자욱 출루·장타",
        detail: `OBP ${koo.obp.toFixed(3)} · SLG ${koo.slg.toFixed(3)}. 리그 평균 가정치보다 높아 타선 기대 득점을 끌어올립니다.`,
      });
    }
    const sp = pitcherProfile(metaInfo.pitcher);
    if (sp.hasEra) {
      factors.push({
        type: sp.era < num(PRIORS.pitcherEra, 4.2) ? "up" : "down",
        label: `${metaInfo.pitcher} 포스트시즌 ERA`,
        detail: `${sp.source} ERA ${sp.era.toFixed(2)}. 소표본이라 25%만 반영했습니다.`,
      });
    } else {
      factors.push({
        type: "neutral",
        label: "선발 투수 실측 ERA 없음",
        detail: "선발의 정규시즌 ERA·WHIP·이닝 데이터가 없어 리그 평균 가정값을 사용했습니다.",
      });
    }
    if (metaInfo.opponent.pct >= 0.6) {
      factors.push({
        type: "down",
        label: `${metaInfo.opponent.name} 팀 승률`,
        detail: `2026 정규시즌 승률 ${metaInfo.opponent.pct.toFixed(3)}. 상대 공격력을 승률 기반으로 보정했습니다.`,
      });
    }
    factors.push({
      type: "up",
      label: "홈 어드밴티지",
      detail: `라팍 홈 경기 보정 +${(num(CFG.homeAdvantage, 0.018) * 100).toFixed(1)}%를 적용했습니다.`,
    });

    return {
      iterations: games,
      winRate,
      lossRate,
      drawRate,
      avgFor,
      avgAgainst,
      runDiff: avgFor - avgAgainst,
      scores: scoreList.slice(0, 5),
      expectedScore: `${avgFor.toFixed(1)} : ${avgAgainst.toFixed(1)}`,
      batters,
      topPlayers,
      pitcher,
      oppPitcher,
      factors,
      coverage,
      opponent: metaInfo.opponent,
      pitcherName: metaInfo.pitcher,
      dataAsOf: CFG.asOf || DATA.meta?.lastUpdated || "",
      generatedAt: new Date().toISOString(),
    };
  }

  function dataSummary(lineup, pitcherName) {
    let confirmed = 0;
    let partial = 0;
    let prior = 0;
    lineup.forEach((batter) => {
      const profile = batterProfile(batter.name);
      if (profile.status === "confirmed") confirmed += 1;
      else if (profile.status === "partial") partial += 1;
      else prior += 1;
    });
    const sp = pitcherProfile(pitcherName);
    return {
      confirmed,
      partial,
      prior,
      pitcher: sp.status,
      pitcherSource: sp.source,
      total: lineup.length,
    };
  }

  function normalizeLineup(lineup) {
    const seen = new Set();
    const normalized = [];
    for (let i = 0; i < 9; i += 1) {
      const item = lineup[i];
      if (!item || !item.name || seen.has(item.name)) {
        normalized.push({ name: null, position: DEFAULT_ORDER[i], empty: true });
      } else {
        seen.add(item.name);
        normalized.push({
          name: item.name,
          position: item.position || (positionsOf(item.name)[0] || DEFAULT_ORDER[i]),
        });
      }
    }
    return normalized;
  }

  function simulate(options) {
    const opts = options || {};
    const iterations = clamp(num(opts.iterations, CFG.iterations || 10000), 100, 20000);
    const lineup = normalizeLineup(opts.lineup || []).map((item, index) => ({
      name: item.name || `빈 슬롯 ${index + 1}`,
      position: item.position,
    }));
    const opponent = opts.opponent || (CFG.opponents && CFG.opponents[0]) || { name: "상대 팀", short: "상대", pct: 0.55 };
    const pitcherName = opts.pitcher || "선발 투수";
    const seed = `${CFG.seed || "vamos"}-${opts.seed || ""}-${lineup.map((b) => b.name).join("|")}-${pitcherName}-${opponent.short}-${iterations}`;
    const agg = createAggregate(lineup, pitcherName);
    agg.rng = makeRng(seed);
    for (let i = 0; i < iterations; i += 1) simulateOne(agg, lineup, pitcherName, opponent);
    const coverage = dataSummary(lineup, pitcherName);
    return finalize(agg, iterations, { coverage, pitcher: pitcherName, opponent });
  }

  function simulateAsync(options, onProgress) {
    const opts = options || {};
    const iterations = clamp(num(opts.iterations, CFG.iterations || 10000), 100, 20000);
    const lineup = normalizeLineup(opts.lineup || []).map((item, index) => ({
      name: item.name || `빈 슬롯 ${index + 1}`,
      position: item.position,
    }));
    const opponent = opts.opponent || (CFG.opponents && CFG.opponents[0]) || { name: "상대 팀", short: "상대", pct: 0.55 };
    const pitcherName = opts.pitcher || "선발 투수";
    const seed = `${CFG.seed || "vamos"}-${opts.seed || ""}-${lineup.map((b) => b.name).join("|")}-${pitcherName}-${opponent.short}-${iterations}`;
    const agg = createAggregate(lineup, pitcherName);
    agg.rng = makeRng(seed);
    const coverage = dataSummary(lineup, pitcherName);
    const chunkSize = 500;

    return new Promise((resolve) => {
      let done = 0;
      function chunk() {
        const end = Math.min(iterations, done + chunkSize);
        for (; done < end; done += 1) simulateOne(agg, lineup, pitcherName, opponent);
        if (onProgress) onProgress(done / iterations);
        if (done < iterations) {
          setTimeout(chunk, 0);
        } else {
          resolve(finalize(agg, iterations, { coverage, pitcher: pitcherName, opponent }));
        }
      }
      chunk();
    });
  }

  /* ---------- 추천 타순: 후보 순열을 짧게 시뮬레이션 ---------- */
  function lineupScore(lineup) {
    return lineup.reduce((sum, item) => {
      const profile = batterProfile(item.name);
      return sum + profile.obp * 1.8 + profile.slg * 0.8;
    }, 0);
  }

  function recommend(options) {
    const opts = options || {};
    const lineup = normalizeLineup(opts.lineup || []);
    const filled = lineup.filter((item) => item.name);
    if (filled.length < 9) return null;
    const opponent = opts.opponent || (CFG.opponents && CFG.opponents[0]) || { name: "상대 팀", short: "상대", pct: 0.55 };
    const pitcherName = opts.pitcher || "선발 투수";

    const byScore = [...lineup].sort((a, b) => {
      const pa = batterProfile(a.name);
      const pb = batterProfile(b.name);
      return (pb.obp * 1.8 + pb.slg * 0.8) - (pa.obp * 1.8 + pa.slg * 0.8);
    });
    const byPower = [...lineup].sort((a, b) => batterProfile(b.name).slg - batterProfile(a.name).slg);
    const traditional = [
      byScore[1], byScore[0], byScore[2], byScore[4], byScore[3],
      byScore[5], byScore[6], byScore[7], byScore[8],
    ].filter(Boolean);
    const candidates = [
      { label: "현재 타순", order: lineup },
      { label: "출루·장타 순", order: byScore },
      { label: "장타 중심", order: byPower },
      { label: "전통형 1-2-3-4", order: traditional },
      { label: "현재 타순 역순", order: [...lineup].reverse() },
    ];

    const scored = candidates.map((candidate) => {
      const result = simulate({
        lineup: candidate.order,
        pitcher: pitcherName,
        opponent,
        iterations: 320,
        seed: `recommend-${candidate.label}`,
      });
      return {
        ...candidate,
        winRate: result.winRate,
        avgFor: result.avgFor,
        score: result.winRate - result.lossRate,
      };
    }).sort((a, b) => b.score - a.score || b.avgFor - a.avgFor);

    const best = scored[0];
    const current = scored.find((candidate) => candidate.label === "현재 타순");
    return {
      label: best.label,
      lineup: best.order,
      winRate: best.winRate,
      avgFor: best.avgFor,
      deltaWin: best.winRate - (current ? current.winRate : 0),
      deltaRuns: best.avgFor - (current ? current.avgFor : 0),
      candidates: scored.map((candidate) => ({
        label: candidate.label,
        winRate: candidate.winRate,
        avgFor: candidate.avgFor,
      })),
    };
  }

  window.LIONS_SIM = {
    simulate,
    simulateAsync,
    recommend,
    dataSummary,
    batterProfile,
    pitcherProfile,
    positionsOf,
    POSITIONS,
    DEFAULT_ORDER,
    CFG,
  };
})();
