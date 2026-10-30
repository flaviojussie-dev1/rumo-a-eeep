import { CURSOS_EEEP, ESCOLAS_EEEP, MODALIDADES_CONFIG } from '../data/courses';
import {
  AnoEscolarKey,
  BoletimCompleto,
  ChanceResult,
  CursoData,
  DisciplinaKey,
  EscolaEEEP,
  EscolaSimulationResult,
  ModalidadeKey,
  MunicipioResidencia,
  PerfilAluno,
  SimulationSummary,
} from '../types/eeep';

/**
 * Determines whether a student qualifies for proximity in a specific school.
 * Proximity in EEEP is neighborhood-based within the municipality:
 * A student only gets proximity quota if they live in that school's municipality
 * AND their neighborhood is in the proximity zone defined by the edital.
 */
export function hasProximityForSchool(
  municipioResidencia: MunicipioResidencia,
  moraProximidadeNoMunicipio: boolean,
  escolaId: string,
  overrides?: Record<string, boolean>
): boolean {
  // If user explicitly configured an override for this school, respect it
  if (overrides && typeof overrides[escolaId] === 'boolean') {
    return overrides[escolaId];
  }

  // If student did not check proximity in their municipality, they don't have proximity
  if (!moraProximidadeNoMunicipio) {
    return false;
  }

  // Match school with corresponding municipality
  if (municipioResidencia === 'cascavel' && escolaId === 'edson_queiroz') return true;
  if (municipioResidencia === 'beberibe' && escolaId === 'pedro_queiroz') return true;
  if (municipioResidencia === 'pindoretama' && escolaId === 'jose_carlos_reboucas') return true;

  // Student from Cascavel applying to Beberibe or Pindoretama competes in Ampla Concorrência
  return false;
}

/**
 * Automatically maps user survey answers to the official EEEP quota modality key for a specific school
 */
export function determineModalidadeForSchool(
  origem: 'publica' | 'particular',
  isProximidade: boolean,
  pcd: boolean
): ModalidadeKey {
  if (pcd) return 'pcd';
  if (origem === 'publica') {
    return isProximidade ? 'pub_proximidade' : 'pub_ampla';
  } else {
    return isProximidade ? 'part_proximidade' : 'part_ampla';
  }
}

/**
 * Calculates candidate final average and tie-breaker subject averages from the 36-grade matrix
 */
export function calculateBoletimSummary(boletim: BoletimCompleto): SimulationSummary {
  const anos: AnoEscolarKey[] = ['6ano', '7ano', '8ano', '9ano'];
  const disciplinas: DisciplinaKey[] = [
    'portugues',
    'matematica',
    'ciencias',
    'historia',
    'geografia',
    'ingles',
    'artes',
    'educacao_fisica',
    'ensino_religioso',
  ];

  let sumAll = 0;
  let countFilled = 0;
  let sumPort = 0;
  let countPort = 0;
  let sumMat = 0;
  let countMat = 0;

  for (const ano of anos) {
    const anoObj = boletim[ano] || {};
    for (const disc of disciplinas) {
      const val = anoObj[disc];
      if (typeof val === 'number' && !isNaN(val) && val >= 0) {
        sumAll += val;
        countFilled++;
        if (disc === 'portugues') {
          sumPort += val;
          countPort++;
        }
        if (disc === 'matematica') {
          sumMat += val;
          countMat++;
        }
      }
    }
  }

  const totalNotas = 36;
  const isCompleto = countFilled === totalNotas;
  const mediaFinal = countFilled > 0 ? Number((sumAll / countFilled).toFixed(2)) : 0;

  return {
    mediaFinal,
    notasPreenchidas: countFilled,
    totalNotas,
    isCompleto,
  };
}

/**
 * Calculates year average for a single school year (6º, 7º, 8º or 9º)
 */
export function calculateAnoAverage(anoData: Record<DisciplinaKey, number | null>): {
  average: number;
  filled: number;
  total: number;
} {
  let sum = 0;
  let filled = 0;
  const total = 9;

  for (const key of Object.keys(anoData) as DisciplinaKey[]) {
    const val = anoData[key];
    if (typeof val === 'number' && !isNaN(val) && val >= 0) {
      sum += val;
      filled++;
    }
  }

  return {
    average: filled > 0 ? Number((sum / filled).toFixed(2)) : 0,
    filled,
    total,
  };
}

/**
 * 32-bit Mulberry PRNG for seedable deterministic pseudo-random numbers.
 * Guarantees identical output across re-renders and 100% offline determinism.
 */
function createMulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 32-bit FNV-1a hash to convert string identifiers into numerical PRNG seeds.
 */
function hashStringToSeed(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Cache of simulated Monte Carlo scenarios per course+school+modality.
 * Reusing the exact same simulated cutoffs for every candidate grade is what makes
 * the probability curve strictly monotonic: P(nota) = share of simulated cuts <= nota.
 * `lists` guarda as listas históricas reais de classificados (desc) para o bootstrap
 * de colocação projetada.
 */
interface McScenarioSet {
  pairs: [cut: number, waitlistMargin: number][];
  lists: number[][];
}
const monteCarloCache = new Map<string, McScenarioSet>();

/**
 * Box-Muller transform to sample from a Gaussian distribution N(mu, sigma^2).
 */
function sampleNormal(rng: () => number, mu: number, sigma: number): number {
  let u1 = rng();
  let u2 = rng();
  while (u1 <= 1e-7) u1 = rng();
  while (u2 <= 1e-7) u2 = rng();
  const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return mu + z * sigma;
}

/**
 * Monte Carlo simulation of admission probability (1st call + waitlist turnover)
 * Runs 5,000 stochastic scenarios per course based on historical volatility.
 */
export function calculateCourseChance(
  curso: CursoData,
  modalidade: ModalidadeKey,
  notaAluno: number,
  escola?: EscolaEEEP,
  isCidadeDoAluno: boolean = false
): ChanceResult {
  const cortesPorAno: Record<number, number> = {};
  const validCutsWithYear: { ano: number; corte: number }[] = [];
  const yearMedias: number[][] = [];

  for (const h of curso.historico) {
    const mod = h.modalidades[modalidade];
    const cut = mod?.nota_corte ?? 0;
    if (cut > 0) {
      cortesPorAno[h.ano] = cut;
      validCutsWithYear.push({ ano: h.ano, corte: cut });
      if (mod?.medias && mod.medias.length > 0) {
        yearMedias.push([...mod.medias].sort((a, b) => b - a)); // desc, min no fim
      }
    }
  }

  // Sort descending by year (most recent first)
  validCutsWithYear.sort((a, b) => b.ano - a.ano);

  // Dynamic weight decay: most recent year receives highest statistical weight
  // Weights for up to N years: [0.50, 0.30, 0.15, 0.05, ...]
  const baseWeights = [0.50, 0.30, 0.15, 0.05];
  let totalWeight = 0;
  let sumWeighted = 0;
  const validCuts: number[] = [];

  validCutsWithYear.forEach((item, index) => {
    const weight = index < baseWeights.length ? baseWeights[index] : 0.02;
    sumWeighted += item.corte * weight;
    totalWeight += weight;
    validCuts.push(item.corte);
  });

  const mediaPonderada =
    totalWeight > 0 ? Number((sumWeighted / totalWeight).toFixed(2)) : 8.5;

  const anoMaisRecente = validCutsWithYear[0]?.ano ?? new Date().getFullYear();
  const corteMaisRecente = validCutsWithYear[0]?.corte ?? 0;

  // Trend Correction with Prudential Floor (Proteção contra Falso Otimismo):
  // Se a série histórica recente for de ALTA (o corte mais recente subiu vs o anterior),
  // aplicamos piso no último corte + extrapolação suave de momentum (50% do delta, máx +0.10).
  // Se a série recente for de queda ou estabilidade, mantemos a média ponderada com decaimento.
  let corteProjetado = mediaPonderada;
  if (validCutsWithYear.length >= 2) {
    const diffRecente = Number((corteMaisRecente - validCutsWithYear[1].corte).toFixed(2));
    if (diffRecente > 0) {
      const momentum = Math.min(0.10, Number((diffRecente * 0.5).toFixed(2)));
      corteProjetado = Math.min(10.0, Number((corteMaisRecente + momentum).toFixed(2)));
    } else {
      corteProjetado = mediaPonderada;
    }
  } else if (validCutsWithYear.length === 1) {
    corteProjetado = corteMaisRecente;
  }

  // Volatility calculation (Bayesian-calibrated uncertainty floor for small samples)
  // With n=1 year, variance is undefined; we set an uncertainty floor of 0.27 (0.15 + 0.12).
  // With n=2 years, floor is 0.21 (0.15 + 0.06).
  // With n>=3 years, floor is 0.15.
  // For PCD quota (typically 1-2 vacancies), the cutoff is an individual sample with high noise,
  // so floor is set to 0.35 regardless of n.
  const isPCD = modalidade === 'pcd';
  const nYears = validCuts.length;
  const minFloor = isPCD
    ? 0.35
    : Number((0.15 + 0.12 * Math.max(0, (3 - nYears) / 2)).toFixed(2));

  let s = minFloor;
  if (nYears > 1) {
    const meanCut = validCuts.reduce((acc, val) => acc + val, 0) / nYears;
    const variance =
      validCuts.reduce((acc, val) => acc + Math.pow(val - meanCut, 2), 0) / nYears;
    s = Math.max(Math.sqrt(variance), minFloor);
  }
  s = Number(s.toFixed(3));

  const delta = Number((notaAluno - corteProjetado).toFixed(2));

  // Monte Carlo Simulation Engine:
  // Models candidate acceptance in 1st call and subsequent waiting list turnover.
  // 5,000 stochastic scenarios with deterministic Mulberry32 PRNG.
  // The seed intentionally EXCLUDES the student's grade: the same set of simulated
  // cutoffs is reused for every nota, which guarantees a strictly monotonic
  // probability curve (higher grade can never yield a lower chance).
  const NUM_SIMULATIONS = 5000;
  const scenarioKey = `${curso.id}_${escola?.id || ''}_${modalidade}`;
  let scenarios = monteCarloCache.get(scenarioKey);
  if (!scenarios) {
    const rng = createMulberry32(hashStringToSeed(scenarioKey));
    scenarios = { pairs: [], lists: yearMedias };
    for (let i = 0; i < NUM_SIMULATIONS; i++) {
      // Cutoff score in this simulated round, bounded between 5.0 and 10.0
      const rawCut = sampleNormal(rng, corteProjetado, s);
      const simulatedCut = Math.min(10.0, Math.max(5.0, rawCut));
      // Waitlist score decrease for subsequent calls (assumed SEDUC call turnover: 0.08 - 0.22 points)
      const waitlistMargin = 0.08 + rng() * 0.14;
      scenarios.pairs.push([simulatedCut, waitlistMargin]);
    }
    monteCarloCache.set(scenarioKey, scenarios);
  }

  let aprovacoes1aChamada = 0;
  let convocacoesListaEspera = 0;
  const colocacaoCenarios: number[] = [];
  for (let i = 0; i < NUM_SIMULATIONS; i++) {
    const [simulatedCut, waitlistMargin] = scenarios.pairs[i];
    if (notaAluno >= simulatedCut) {
      aprovacoes1aChamada++;
      // Colocação projetada: bootstrap — pareia o corte simulado com a lista
      // histórica real de corte mais próximo (a lista já é o pool acima do corte;
      // deslocá-la confundiria nível do corte com força dos concorrentes).
      if (scenarios.lists.length > 0) {
        let nearest = scenarios.lists[0];
        let bestDiff = Infinity;
        for (const l of scenarios.lists) {
          const diff = Math.abs(simulatedCut - l[l.length - 1]);
          if (diff < bestDiff) { bestDiff = diff; nearest = l; }
        }
        // pos = nº de médias estritamente acima da nota + 1 (busca binária na lista desc)
        let lo = 0, hi = nearest.length;
        while (lo < hi) {
          const mid = (lo + hi) >> 1;
          if (nearest[mid] > notaAluno) lo = mid + 1;
          else hi = mid;
        }
        colocacaoCenarios.push(lo + 1);
      }
    } else if (notaAluno >= simulatedCut - waitlistMargin) {
      convocacoesListaEspera++;
    }
  }

  // Colocação empírica: em qual posição a nota entraria em cada lista histórica real
  let colocMelhor = Infinity;
  let colocPior = 0;
  let colocAnos = 0;
  for (const medias of yearMedias) {
    if (notaAluno < medias[medias.length - 1]) continue; // não passaria neste ano
    const pos = medias.filter((m) => m > notaAluno).length + 1;
    colocMelhor = Math.min(colocMelhor, pos);
    colocPior = Math.max(colocPior, pos);
    colocAnos++;
  }
  const colocacaoEmpirica =
    colocAnos > 0 ? { melhor: colocMelhor, pior: colocPior, anos: colocAnos } : null;

  // Colocação projetada: percentis dos cenários bootstrap em que o aluno passa.
  // Posição é limitada (~<=50), então usamos contagem em baldes em vez de sort.
  let colocacaoProjetada: { mediana: number; p25: number; p75: number } | null = null;
  if (colocacaoCenarios.length > 0) {
    const maxPos = Math.max(...colocacaoCenarios);
    const buckets = new Array<number>(maxPos + 1).fill(0);
    for (const p of colocacaoCenarios) buckets[p]++;
    const pick = (q: number) => {
      const target = Math.min(colocacaoCenarios.length, Math.max(1, Math.ceil(q * colocacaoCenarios.length)));
      let acc = 0;
      for (let pos = 1; pos <= maxPos; pos++) {
        acc += buckets[pos];
        if (acc >= target) return pos;
      }
      return maxPos;
    };
    colocacaoProjetada = {
      mediana: pick(0.5),
      p25: pick(0.25),
      p75: pick(0.75),
    };
  }

  const rawProb1a = (aprovacoes1aChamada / NUM_SIMULATIONS) * 100;
  const rawProbEspera = (convocacoesListaEspera / NUM_SIMULATIONS) * 100;
  let rawTotal = rawProb1a + rawProbEspera;

  // Clamping: avoid false 99% certainty on single-year data or PCD sample noise
  const maxProb = isPCD ? 92 : nYears === 1 ? 95 : 99;
  const minProb = isPCD ? 8 : nYears === 1 ? 5 : 1;
  if (rawTotal > maxProb) rawTotal = maxProb;
  if (rawTotal < minProb) rawTotal = minProb;
  const probabilidade = Number(rawTotal.toFixed(1));

  // Breakdown proportions
  const prob1aChamada = Number(Math.min(rawProb1a, probabilidade).toFixed(1));
  const probListaEspera = Number(Math.max(0, probabilidade - prob1aChamada).toFixed(1));

  // Safeguard: detect when the most recent cutoff strictly exceeds the projected weighted average
  const alertaCorteRecenteSuperior = corteMaisRecente > 0 && corteMaisRecente > corteProjetado;
  const diferencaRecenteProjetado = alertaCorteRecenteSuperior
    ? Number((corteMaisRecente - corteProjetado).toFixed(2))
    : 0;

  // Unified taxonomy & status pills: single source of truth across engine, dashboard, and planner
  let faixa: 'muito_alta' | 'disputa' | 'espera' | 'baixa';
  let faixaTitulo: string;
  let faixaDescricao: string;
  let faixaCor: string;
  let badgeVariant: 'success' | 'warning' | 'orange' | 'danger';
  let statusPillText: string;
  let statusPillBg: string;
  let statusPillColor: string;
  let statusPillBorder: string;
  let recomendacao: string;

  if (probabilidade >= 85) {
    faixa = 'muito_alta';
    faixaTitulo = 'Chance Muito Alta';
    faixaDescricao = 'Média confortável acima dos cortes históricos projetados.';
    statusPillText = 'Chance muito alta';
    statusPillBg = 'bg-[#DDF3E9] text-[#0B5F45] border-[#b5e7d2]';
    statusPillColor = '#0B5F45';
    statusPillBorder = 'border-[#b5e7d2]';
    faixaCor = 'text-emerald-600';
    badgeVariant = 'success';
    recomendacao = isCidadeDoAluno
      ? `Excelente chance de vaga na sua própria cidade (${escola?.municipio ?? 'local'}), sem precisar viajar para outro município.`
      : 'Excelente chance de vaga direta na primeira chamada oficial.';
  } else if (probabilidade >= 60) {
    faixa = 'disputa';
    faixaTitulo = 'Boa Chance';
    faixaDescricao = 'Média favorável em relação aos cortes dos anos anteriores.';
    statusPillText = 'Boa chance';
    statusPillBg = 'bg-[#E4ECFF] text-[#1A45B8] border-[#c5d8ff]';
    statusPillColor = '#1A45B8';
    statusPillBorder = 'border-[#c5d8ff]';
    faixaCor = 'text-blue-600';
    badgeVariant = 'warning';
    recomendacao = isCidadeDoAluno
      ? `Boa chance de vaga na sua cidade. Vantagem de morar perto e forte possibilidade de convocação na 1ª chamada ou na lista de espera.`
      : 'Boa chance de vaga. Alta probabilidade de convocação na 1ª chamada ou na lista de vagas remanescentes (segunda chamada).';
  } else if (probabilidade >= 25) {
    faixa = 'espera';
    faixaTitulo = 'Chance Moderada';
    faixaDescricao = 'Média próxima da nota de corte; chance real na lista de espera.';
    statusPillText = 'Chance moderada';
    statusPillBg = 'bg-[#FFE8C7] text-[#7A3A00] border-[#ffd599]';
    statusPillColor = '#7A3A00';
    statusPillBorder = 'border-[#ffd599]';
    faixaCor = 'text-amber-600';
    badgeVariant = 'orange';
    recomendacao =
      'Nota próxima à linha de corte. A vaga é viável através das chamadas da lista de espera (desistências ou vagas remanescentes).';
  } else {
    faixa = 'baixa';
    faixaTitulo = 'Chance Baixa';
    faixaDescricao = 'Média abaixo da estimativa projetada e dos anos anteriores.';
    statusPillText = 'Chance baixa';
    statusPillBg = 'bg-[#FFE1E6] text-[#9B1329] border-[#ffccd5]';
    statusPillColor = '#9B1329';
    statusPillBorder = 'border-[#ffccd5]';
    faixaCor = 'text-rose-600';
    badgeVariant = 'danger';
    recomendacao =
      'Média abaixo da estimativa deste curso. Recomendamos verificar outros cursos com notas mais acessíveis ou a cota de proximidade.';
  }

  return {
    curso,
    escola,
    modalidade,
    notaAluno,
    cortesPorAno,
    corteMaisRecente,
    anoMaisRecente,
    corteProjetado,
    delta,
    probabilidade,
    probabilidadePrimeiraChamada: prob1aChamada,
    probabilidadeListaEspera: probListaEspera,
    metodoEstimativa: 'monte_carlo',
    simulacoesExecutadas: NUM_SIMULATIONS,
    faixa,
    faixaTitulo,
    faixaDescricao,
    faixaCor,
    badgeVariant,
    recomendacao,
    isCidadeDoAluno,
    volatilidadeEfetiva: s,
    anosHistoricosValidos: nYears,
    alertaCorteRecenteSuperior,
    diferencaRecenteProjetado,
    statusPillText,
    statusPillBg,
    statusPillColor,
    statusPillBorder,
    colocacaoEmpirica,
    colocacaoProjetada,
  };
}

/**
 * Simulates all courses for a single EEEP
 */
export function simulateEscola(
  escola: EscolaEEEP,
  notaAluno: number,
  perfil: PerfilAluno
): EscolaSimulationResult {
  const isProx = hasProximityForSchool(
    perfil.municipioResidencia,
    perfil.moraProximidade,
    escola.id,
    perfil.escolaProximidadeOverrides
  );

  const isCidadeDoAluno =
    perfil.municipioResidencia !== 'outro' &&
    perfil.municipioResidencia.toLowerCase() === escola.municipio.toLowerCase();

  const modalidadeEfetiva = determineModalidadeForSchool(
    perfil.origemEscola,
    isProx,
    perfil.isPCD
  );

  const cursosResults = escola.cursos
    .map((c) => calculateCourseChance(c, modalidadeEfetiva, notaAluno, escola, isCidadeDoAluno))
    // Sort by probability; ties (e.g. clamp ceiling on low-data courses) broken by
    // delta (distance above the projected cutoff), the most meaningful remaining signal.
    .sort((a, b) => b.probabilidade - a.probabilidade || b.delta - a.delta);

  return {
    escola,
    modalidadeEfetiva,
    isProximidadeAplicada: isProx,
    cursosResults,
    melhorCurso: cursosResults[0],
    isCidadeDoAluno,
  };
}

/**
 * Simulates all selected schools and ranks all opportunities
 */
export function simulateAllSelectedEscolas(
  notaAluno: number,
  perfil: PerfilAluno
): EscolaSimulationResult[] {
  const selected = ESCOLAS_EEEP.filter((e) => perfil.escolasSelecionadas.includes(e.id));
  const toSimulate = selected.length > 0 ? selected : ESCOLAS_EEEP;

  return toSimulate.map((escola) => simulateEscola(escola, notaAluno, perfil));
}

/**
 * Flattens all results across all selected schools, ranked by probability
 */
export function getUnifiedRankedChances(
  escolaResults: EscolaSimulationResult[]
): ChanceResult[] {
  const all: ChanceResult[] = [];
  for (const er of escolaResults) {
    all.push(...er.cursosResults);
  }
  return all.sort(
    (a, b) => b.probabilidade - a.probabilidade || b.delta - a.delta
  );
}

export interface OracleRecommendations {
  melhorNaCidade: ChanceResult | null;
  melhorGlobal: ChanceResult | null;
  mesmaOpcao: boolean;
  temCidadeCorrespondente: boolean;
}

/**
 * Oracle intelligence: highlights best chance in student's city vs best chance globally
 */
export function getOracleRecommendations(
  unifiedResults: ChanceResult[],
  perfil: PerfilAluno
): OracleRecommendations {
  const melhorGlobal = unifiedResults.length > 0 ? unifiedResults[0] : null;
  const opcoesNaCidade = unifiedResults.filter((r) => r.isCidadeDoAluno);
  const melhorNaCidade = opcoesNaCidade.length > 0 ? opcoesNaCidade[0] : null;

  const mesmaOpcao = Boolean(
    melhorGlobal &&
      melhorNaCidade &&
      melhorGlobal.curso.id === melhorNaCidade.curso.id &&
      melhorGlobal.escola?.id === melhorNaCidade.escola?.id
  );

  const temCidadeCorrespondente =
    perfil.municipioResidencia !== 'outro' && opcoesNaCidade.length > 0;

  return {
    melhorNaCidade,
    melhorGlobal,
    mesmaOpcao,
    temCidadeCorrespondente,
  };
}

/**
 * Generates an empty 36-grade boletim
 */
export function createEmptyBoletim(): BoletimCompleto {
  const anos: AnoEscolarKey[] = ['6ano', '7ano', '8ano', '9ano'];
  const disciplinas: DisciplinaKey[] = [
    'portugues',
    'matematica',
    'ciencias',
    'historia',
    'geografia',
    'ingles',
    'artes',
    'educacao_fisica',
    'ensino_religioso',
  ];

  const empty = {} as BoletimCompleto;
  for (const ano of anos) {
    empty[ano] = {} as Record<DisciplinaKey, number | null>;
    for (const disc of disciplinas) {
      empty[ano][disc] = null;
    }
  }
  return empty;
}

/**
 * Creates preset sample boletins for quick student testing
 */
export function createPresetBoletim(targetAverage: number): BoletimCompleto {
  const anos: AnoEscolarKey[] = ['6ano', '7ano', '8ano', '9ano'];
  const disciplinas: DisciplinaKey[] = [
    'portugues',
    'matematica',
    'ciencias',
    'historia',
    'geografia',
    'ingles',
    'artes',
    'educacao_fisica',
    'ensino_religioso',
  ];

  const totalNotas = 36;
  const targetSum = Math.round(targetAverage * totalNotas * 100) / 100;
  // Subtle variations per subject that sum to zero (+0.2, -0.2, +0.1, +0.1, -0.1, -0.1, +0.2, -0.2, 0)
  const offsets = [0.2, -0.2, 0.1, 0.1, -0.1, -0.1, 0.2, -0.2, 0];

  const flatGrades: number[] = [];
  for (let i = 0; i < totalNotas; i++) {
    const off = offsets[i % 9];
    const g = Math.min(10, Math.max(0, Number((targetAverage + off).toFixed(1))));
    flatGrades.push(g);
  }

  // Exact iterative adjustment to guarantee the arithmetic mean equals targetAverage
  let currentSum = flatGrades.reduce((a, b) => a + b, 0);
  let diff = Math.round((targetSum - currentSum) * 100) / 100;
  let idx = 0;
  while (Math.abs(diff) >= 0.05 && idx < 200) {
    const step = diff > 0 ? 0.1 : -0.1;
    const targetIdx = idx % totalNotas;
    const nextVal = Number((flatGrades[targetIdx] + step).toFixed(1));
    if (nextVal >= 0 && nextVal <= 10) {
      flatGrades[targetIdx] = nextVal;
      currentSum = flatGrades.reduce((a, b) => a + b, 0);
      diff = Math.round((targetSum - currentSum) * 100) / 100;
    }
    idx++;
  }

  const boletim = createEmptyBoletim();
  let gradeIdx = 0;
  for (const ano of anos) {
    for (const disc of disciplinas) {
      boletim[ano][disc] = flatGrades[gradeIdx++];
    }
  }
  return boletim;
}
