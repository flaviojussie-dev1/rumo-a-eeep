/**
 * Auditoria numérica do motor de cálculo (Rumo à EEEP).
 * Rodar: npx vite build --config <config com ssr: 'scripts/audit-entry.ts'> && node dist-audit/audit.mjs
 * Verifica: curvas P(nota), monotonicidade (todas as modalidades), extremos PCD,
 * determinismo do PRNG e performance do Monte Carlo.
 */
import { loadAllEscolasFromData } from '../src/data/schoolLoader';
import { calculateCourseChance, getUnifiedRankedChances, simulateAllSelectedEscolas } from '../src/utils/engine';

const escolas = loadAllEscolasFromData();
const MODS = ['pub_ampla', 'pub_proximidade', 'part_ampla', 'part_proximidade', 'pcd'] as const;

console.log('=== AUDITORIA DO MOTOR (Monte Carlo) ===\n');

// 1. Curvas P(nota) — pub_ampla, curso com corte mais alto de cada escola
console.log('--- Curvas P(nota) pub_ampla ---');
for (const esc of escolas) {
  for (const cur of esc.cursos) {
    const nAnos = (cur.historico ?? []).filter((h: any) => h.modalidades?.pub_ampla?.nota_corte > 0).length;
    const h0 = (cur.historico ?? []).find((h: any) => h.modalidades?.pub_ampla?.nota_corte > 0);
    if (!h0) continue;
    const ref = calculateCourseChance(cur, 'pub_ampla', h0.modalidades.pub_ampla.nota_corte, esc, false);
    const probs = [7.8, 8.2, 8.44, 8.71, 9.0, 9.15, 9.3, 9.5]
      .map((n) => `${n}→${calculateCourseChance(cur, 'pub_ampla', n, esc, false).probabilidade}`)
      .join('  ');
    console.log(`${esc.id.slice(0, 6)}/${cur.id.replace(/^.*_/, '')} [n=${nAnos} proj=${ref.corteProjetado} s=${ref.volatilidadeEfetiva}]`);
    console.log('   ' + probs);
  }
}

// 2. Monotonicidade: P nunca pode cair quando a nota sobe
console.log('\n--- Monotonicidade (6.00→10.00 passo 0.01, todas as modalidades) ---');
let viol = 0, totalChecks = 0, maxDip = 0;
for (const esc of escolas) {
  for (const cur of esc.cursos) {
    for (const mod of MODS) {
      let prev = -1;
      for (let n = 6.0; n <= 10.001; n += 0.01) {
        const p = calculateCourseChance(cur, mod, Math.round(n * 100) / 100, esc, false).probabilidade;
        totalChecks++;
        if (prev >= 0 && p < prev) { viol++; maxDip = Math.max(maxDip, prev - p); }
        prev = p;
      }
    }
  }
}
console.log(`quedas: ${viol}/${totalChecks} checks; maior queda = ${maxDip.toFixed(1)}pp ${viol === 0 ? '✓' : '✗ FALHA'}`);

// 3. PCD: extremos 99%/1% eliminados
console.log('\n--- PCD (notas 7.5 e 9.15) ---');
let pcdExtremos = 0;
for (const esc of escolas) {
  for (const cur of esc.cursos) {
    const p75 = calculateCourseChance(cur, 'pcd', 7.5, esc, false).probabilidade;
    const p915 = calculateCourseChance(cur, 'pcd', 9.15, esc, false).probabilidade;
    if (p75 >= 90 || p915 <= 10 || p915 >= 99) { console.log(`SUSPEITO ${cur.id}: P(7.5)=${p75} P(9.15)=${p915}`); pcdExtremos++; }
  }
}
console.log(pcdExtremos === 0 ? 'sem extremos de 99%/1% ✓' : `${pcdExtremos} casos suspeitos ✗`);

// 4. Determinismo do PRNG
const e0 = escolas[0], c0 = e0.cursos[0];
const a = calculateCourseChance(c0, 'pub_ampla', 9.15, e0, false).probabilidade;
const b = calculateCourseChance(c0, 'pub_ampla', 9.15, e0, false).probabilidade;
console.log(`\n--- Determinismo: ${a} vs ${b} → ${a === b ? 'OK ✓' : 'FALHA ✗'}`);

// 5. Desempate por delta no ranking unificado
const perfil = {
  municipioResidencia: 'outro', origemEscola: 'publica', isPCD: false, moraProximidade: false,
  escolasSelecionadas: escolas.map((e) => e.id), escolaProximidadeOverrides: {}, modalidadeSelecionada: 'pub_ampla',
} as any;
const ranked = getUnifiedRankedChances(simulateAllSelectedEscolas(9.15, perfil));
// Agrupa por valor EXATO de probabilidade: o desempate por delta vale dentro de cada grupo
const grupos = new Map<number, number[]>();
for (const r of ranked) {
  if (r.probabilidade < 95) continue;
  if (!grupos.has(r.probabilidade)) grupos.set(r.probabilidade, []);
  grupos.get(r.probabilidade)!.push(r.delta);
}
let ok = true, resumo = '';
for (const [p, deltas] of grupos) {
  const ordenado = deltas.every((d, i) => i === 0 || deltas[i - 1] >= d);
  if (!ordenado) ok = false;
  resumo += `  P=${p}% (${deltas.length} cursos): delta ${deltas.map((d) => (d > 0 ? '+' : '') + d).join(', ')} → ${ordenado ? '✓' : '✗'}\n`;
}
console.log(`\n--- Desempate por delta dentro de cada faixa de P>=95: ${ok ? 'OK ✓' : 'FALHA ✗'}`);
console.log(resumo);
console.log('Top 8 (nota 9,15):');
ranked.slice(0, 8).forEach((r, i) =>
  console.log(`  ${i + 1}. ${r.curso.nome} (${r.escola?.municipio}) P=${r.probabilidade}% delta=${r.delta > 0 ? '+' : ''}${r.delta}`)
);

// 6. Performance
const t1 = performance.now();
for (let k = 0; k < 20; k++) {
  for (const esc of escolas) for (const cur of esc.cursos) calculateCourseChance(cur, 'pub_ampla', 9.15 + k * 0.001, esc, false);
}
console.log(`\n--- Performance: ${(performance.now() - t1).toFixed(1)}ms para 20 varreduras completas (com cache de cenários)`);
