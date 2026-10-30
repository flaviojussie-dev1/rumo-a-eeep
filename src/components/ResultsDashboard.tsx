import React, { useState } from 'react';
import {
  TrendingUp,
  Award,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertTriangle,
  Info,
  Share2,
  Sliders,
  Activity,
  Cpu,
  Compass,
  Sprout,
  BarChart3,
  Building2,
  MapPin,
  Briefcase,
  Layers,
  ShieldCheck,
  Star,
  Zap,
  Plus,
  ChevronDown,
} from 'lucide-react';
import { ESCOLAS_EEEP, MODALIDADES_CONFIG } from '../data/courses';
import {
  ChanceResult,
  CursoData,
  EscolaEEEP,
  EscolaSimulationResult,
  ModalidadeKey,
  PerfilAluno,
} from '../types/eeep';
import { getOracleRecommendations } from '../utils/engine';

interface ResultsDashboardProps {
  notaFinal: number;
  escolaResults: EscolaSimulationResult[];
  unifiedResults: ChanceResult[];
  perfil: PerfilAluno;
  onOpenCourseDetail: (curso: CursoData) => void;
  onOpenReport: () => void;
  onOpenSensitivity: () => void;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  notaFinal,
  escolaResults,
  unifiedResults,
  perfil,
  onOpenCourseDetail,
  onOpenReport,
  onOpenSensitivity,
}) => {
  const [activeTab, setActiveTab] = useState<string>('todas'); // 'todas' | 'minha_cidade' | 'comparador' | escolaId
  const [filter, setFilter] = useState<'todos' | 'altas' | 'disputa'>('todos');
  const [openCards, setOpenCards] = useState<Record<string, boolean>>({});

  const toggleCard = (id: string) => {
    setOpenCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Oracle intelligence
  const oracle = getOracleRecommendations(unifiedResults, perfil);

  // Identify active items to show
  let displayedResults: ChanceResult[] = [];
  let currentEscolaInfo: EscolaSimulationResult | undefined;

  if (activeTab === 'todas') {
    displayedResults = unifiedResults;
  } else if (activeTab === 'minha_cidade') {
    displayedResults = unifiedResults.filter((r) => r.isCidadeDoAluno);
  } else {
    currentEscolaInfo = escolaResults.find((er) => er.escola.id === activeTab);
    displayedResults = currentEscolaInfo ? currentEscolaInfo.cursosResults : unifiedResults;
  }

  const hasNota = notaFinal > 0;

  // Filter by probability and status classification (active only when grade is entered)
  const filteredResults = displayedResults.filter((res) => {
    if (!hasNota) return true;
    if (filter === 'altas') return res.probabilidade >= 60;
    if (filter === 'disputa') return res.probabilidade >= 25 && res.probabilidade < 60;
    return true;
  });

  // Summary counts derived directly from unified engine classification
  const altaCount = hasNota ? unifiedResults.filter((r) => r.statusPillText === 'Chance muito alta').length : 0;
  const boaCount = hasNota ? unifiedResults.filter((r) => r.statusPillText === 'Boa chance').length : 0;
  const disputaCount = hasNota ? unifiedResults.filter((r) => r.statusPillText === 'Chance moderada').length : 0;
  const totalBons = altaCount + boaCount;

  // Dynamically extract the historical years present in the dataset
  const anosDisponiveis = Array.from(
    new Set(unifiedResults.flatMap((r) => Object.keys(r.cortesPorAno || {}).map(Number)))
  ).sort((a, b) => a - b);

  const anosTexto =
    anosDisponiveis.length > 1
      ? `${anosDisponiveis[0]} a ${anosDisponiveis[anosDisponiveis.length - 1]}`
      : anosDisponiveis.length === 1
        ? `${anosDisponiveis[0]}`
        : 'anos anteriores';

  let summaryTitle = '';
  let summarySub = '';

  if (!hasNota) {
    summaryTitle = 'Seu resultado aparecerá aqui';
    summarySub = 'Informe sua média de notas no Passo 2 acima para o sistema calcular suas chances em cada escola e curso.';
  } else if (totalBons === 0 && disputaCount === 0) {
    summaryTitle = 'Média abaixo do histórico e da estimativa';
    summarySub = `Sua média de ${notaFinal.toFixed(2).replace('.', ',')} ficou abaixo dos cortes anteriores (${anosTexto}) e da estimativa projetada para estes cursos. Como a concorrência real varia a cada processo seletivo, você ainda pode concorrer ou avaliar outras cotas e escolas.`;
  } else if (totalBons === 0 && disputaCount > 0) {
    summaryTitle = disputaCount === 1
      ? 'Em 1 curso você tem chance moderada (lista de espera)'
      : `Em ${disputaCount} cursos você tem chance moderada (lista de espera)`;
    summarySub = `Sua média de ${notaFinal.toFixed(2).replace('.', ',')} está próxima da estimativa desses cursos. A aprovação é viável pelas chamadas seguintes.`;
  } else if (altaCount > 0) {
    summaryTitle = `Em ${altaCount} curso(s) sua nota tem margem muito favorável`;
    summarySub = `Sua média de ${notaFinal.toFixed(2).replace('.', ',')} supera com folga a estimativa projetada e o histórico registrado (${anosTexto}). ${disputaCount > 0 ? `Outros ${disputaCount} curso(s) têm chance moderada.` : ''}`;
  } else {
    summaryTitle = `Em ${totalBons} curso(s) você tem boas chances de vaga`;
    summarySub = `Sua média de ${notaFinal.toFixed(2).replace('.', ',')} é competitiva em relação à estimativa projetada e ao histórico das escolas (${anosTexto}).`;
  }

  const getCourseIcon = (categoria: string, nome: string) => {
    if (nome.includes('Enfermagem')) return <Activity className="w-5 h-5 text-abaixo-fg" />;
    if (nome.includes('Informática')) return <Cpu className="w-5 h-5 text-cyan-600" />;
    if (nome.includes('Turismo') || nome.includes('Hospedagem')) return <Compass className="w-5 h-5 text-disputa-fill" />;
    if (nome.includes('Agroindústria') || nome.includes('Agronegócio') || nome.includes('Meio Ambiente')) return <Sprout className="w-5 h-5 text-folgado-fill" />;
    if (nome.includes('Segurança')) return <ShieldCheck className="w-5 h-5 text-disputa-fill" />;
    if (nome.includes('Edificações')) return <Building2 className="w-5 h-5 text-disputa-fill" />;
    if (nome.includes('Eletrotécnica')) return <Zap className="w-5 h-5 text-yellow-600" />;
    return <Briefcase className="w-5 h-5 text-indigo-600" />;
  };

  return (
    <section className="space-y-3.5">
      {/* Harmonious Summary Card */}
      <div className="rounded-[20px] bg-white p-4 sm:p-5 border border-line/60 shadow-xs flex flex-col gap-3.5">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-navy text-sm font-bold text-white"
          >
            3
          </span>
          <h2 className="font-display text-xl font-bold text-ink">
            Seu resultado
          </h2>
        </div>

        <div>
          <h3 className="font-display font-bold text-[18px] sm:text-[19px] leading-snug text-ink">
            {summaryTitle}
          </h3>
          <p className="mt-1 text-xs sm:text-sm leading-relaxed text-muted">
            {summarySub}
          </p>
        </div>

        {hasNota && (
          <div className={`flex items-start gap-2 p-2.5 rounded-[12px] text-xs leading-relaxed border ${totalBons === 0 && disputaCount === 0
              ? 'bg-amber-50/70 border-amber-200/60 text-amber-900'
              : 'bg-blue-50/70 border-blue-200/60 text-blue-900'
            }`}>
            <Info className={`w-4 h-4 flex-none mt-0.5 ${totalBons === 0 && disputaCount === 0 ? 'text-amber-600' : 'text-blue-600'
              }`} />
            <span>
              <strong>Simulação informativa:</strong> Os resultados abaixo são estimativas calculadas com base no histórico oficial ({anosTexto}). A nota de corte real só é definida após o encerramento das inscrições pela SEDUC-CE.
            </span>
          </div>
        )}

        {/* Oracle highlights in compact format (only when grade is provided and viable) */}
        {hasNota && (() => {
          if (!oracle.melhorGlobal || oracle.melhorGlobal.probabilidade < 25) {
            return null;
          }

          // Caso 1: Na cidade do aluno há chance viável (>= 25%)
          if (oracle.melhorNaCidade && oracle.melhorNaCidade.probabilidade >= 25) {
            return (
              <div className="flex items-center justify-between gap-2.5 p-2.5 sm:p-3 rounded-[14px] bg-page text-xs border border-line/60">
                <div className="flex items-start gap-2 min-w-0 flex-1">
                  <MapPin className="w-4 h-4 text-navy flex-none mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] text-muted font-medium block leading-none mb-1">
                      Melhor opção na sua cidade
                    </span>
                    <strong className="text-ink font-bold text-xs sm:text-sm block leading-snug">
                      {oracle.melhorNaCidade.curso.nome}
                    </strong>
                  </div>
                </div>
                <div className="flex-none text-right">
                  <span
                    className={`inline-flex items-center font-bold px-2.5 py-1 rounded-full text-xs border ${
                      oracle.melhorNaCidade.probabilidade >= 60
                        ? 'bg-emerald-50 text-folgado-fg border-emerald-200/60'
                        : 'bg-amber-50 text-disputa-fg border-amber-200/60'
                    }`}
                  >
                    {oracle.melhorNaCidade.probabilidade}% chance
                  </span>
                </div>
              </div>
            );
          }

          // Caso 2: Na cidade do aluno a chance é baixa (< 25%), mas há boas chances na região!
          if (oracle.melhorGlobal && oracle.melhorGlobal.probabilidade >= 60) {
            return (
              <div className="flex items-center justify-between gap-2.5 p-2.5 sm:p-3 rounded-[14px] bg-page text-xs border border-line/60">
                <div className="flex items-start gap-2 min-w-0 flex-1">
                  <Sparkles className="w-4 h-4 text-gold flex-none mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] text-muted font-medium block leading-none mb-1">
                      Sua maior chance na região
                    </span>
                    <strong className="text-ink font-bold text-xs sm:text-sm block leading-snug">
                      {oracle.melhorGlobal.curso.nome}{' '}
                      <span className="font-semibold text-muted text-xs">
                        ({oracle.melhorGlobal.escola?.municipio})
                      </span>
                    </strong>
                  </div>
                </div>
                <div className="flex-none text-right">
                  <span className="inline-flex items-center font-bold px-2.5 py-1 rounded-full text-xs bg-emerald-50 text-folgado-fg border-emerald-200/60">
                    {oracle.melhorGlobal.probabilidade}% chance
                  </span>
                </div>
              </div>
            );
          }

          return null;
        })()}

        {/* Quick Actions (only when grade is provided) */}
        {hasNota ? (
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-line/60">
            <button
              type="button"
              onClick={onOpenSensitivity}
              className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-white px-3.5 py-1.5 text-xs font-semibold text-ink transition hover:border-navy active:scale-95"
            >
              <Sliders className="h-3.5 w-3.5 text-navy" />
              <span>Simular Cenários</span>
            </button>
            <button
              type="button"
              onClick={onOpenReport}
              className="inline-flex items-center gap-1.5 rounded-full bg-navy px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-navy-2 active:scale-95"
            >
              <Share2 className="h-3.5 w-3.5 text-gold" />
              <span>Relatório Oficial</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-2.5 rounded-[12px] bg-page text-xs border border-line/60 text-muted">
            <span className="text-navy font-bold text-sm">💡</span>
            <span>Você pode digitar sua média diretamente no Passo 2 ou usar a calculadora de 36 notas do boletim.</span>
          </div>
        )}
      </div>

      {/* Step 4: Cursos Disponíveis Card */}
      <div className="rounded-[20px] bg-white p-4 sm:p-5 border border-line/60 shadow-xs flex flex-col gap-3.5">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-navy text-sm font-bold text-white"
          >
            4
          </span>
          <h2 className="font-display text-xl font-bold text-ink">
            Cursos disponíveis
          </h2>
        </div>
        <p className="text-sm leading-snug text-muted">
          45 vagas por curso em tempo integral. A confiabilidade indica quantos anos de dados oficiais sustentam a projeção.
        </p>

        {/* 4 School chips: Todas + 3 Escolas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('todas')}
            className={`min-h-[50px] p-2 rounded-[14px] border-[1.5px] transition flex flex-col items-center justify-center text-center ${activeTab === 'todas'
                ? 'border-navy bg-navy text-white shadow-xs font-bold'
                : 'border-line-strong bg-page/60 text-ink hover:border-navy hover:bg-page'
              }`}
          >
            <span className="text-xs sm:text-sm font-bold leading-tight">Todas as EEEPs</span>
            <span className="text-[11px] opacity-75">12 cursos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('edson_queiroz')}
            className={`min-h-[50px] p-2 rounded-[14px] border-[1.5px] transition flex flex-col items-center justify-center text-center ${activeTab === 'edson_queiroz'
                ? 'border-navy bg-navy text-white shadow-xs font-bold'
                : 'border-line-strong bg-page/60 text-ink hover:border-navy hover:bg-page'
              }`}
          >
            <span className="text-xs sm:text-sm font-bold leading-tight">Cascavel</span>
            <span className="text-[11px] opacity-75">Edson Queiroz</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pedro_queiroz')}
            className={`min-h-[50px] p-2 rounded-[14px] border-[1.5px] transition flex flex-col items-center justify-center text-center ${activeTab === 'pedro_queiroz'
                ? 'border-navy bg-navy text-white shadow-xs font-bold'
                : 'border-line-strong bg-page/60 text-ink hover:border-navy hover:bg-page'
              }`}
          >
            <span className="text-xs sm:text-sm font-bold leading-tight">Beberibe</span>
            <span className="text-[11px] opacity-75">Pedro de Queiroz</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('jose_carlos_reboucas')}
            className={`min-h-[50px] p-2 rounded-[14px] border-[1.5px] transition flex flex-col items-center justify-center text-center ${activeTab === 'jose_carlos_reboucas'
                ? 'border-navy bg-navy text-white shadow-xs font-bold'
                : 'border-line-strong bg-page/60 text-ink hover:border-navy hover:bg-page'
              }`}
          >
            <span className="text-xs sm:text-sm font-bold leading-tight">Pindoretama</span>
            <span className="text-[11px] opacity-75">J. Carlos Rebouças</span>
          </button>
        </div>

        {/* 3 Level Filter Pills (when grade is entered) + Tabela Comparativa Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          {hasNota ? (
            <div className="grid grid-cols-3 gap-2 flex-1">
              <button
                type="button"
                onClick={() => setFilter('todos')}
                aria-pressed={filter === 'todos'}
                className={`min-h-[38px] rounded-full border-[1.5px] px-2 text-xs font-semibold transition flex items-center justify-center ${filter === 'todos'
                    ? 'border-navy bg-navy text-white font-bold'
                    : 'border-line-strong bg-page/60 text-navy hover:border-navy hover:bg-page'
                  }`}
              >
                Todos · {displayedResults.length}
              </button>
              <button
                type="button"
                onClick={() => setFilter('altas')}
                aria-pressed={filter === 'altas'}
                className={`min-h-[38px] rounded-full border-[1.5px] px-2 text-xs font-semibold transition flex items-center justify-center ${filter === 'altas'
                    ? 'border-navy bg-navy text-white font-bold'
                    : 'border-line-strong bg-page/60 text-navy hover:border-navy hover:bg-page'
                  }`}
              >
                Boas chances · {displayedResults.filter((r) => r.probabilidade >= 60).length}
              </button>
              <button
                type="button"
                onClick={() => setFilter('disputa')}
                aria-pressed={filter === 'disputa'}
                className={`min-h-[38px] rounded-full border-[1.5px] px-2 text-xs font-semibold transition flex items-center justify-center ${filter === 'disputa'
                    ? 'border-navy bg-navy text-white font-bold'
                    : 'border-line-strong bg-page/60 text-navy hover:border-navy hover:bg-page'
                  }`}
              >
                Chance moderada · {displayedResults.filter((r) => r.probabilidade >= 25 && r.probabilidade < 60).length}
              </button>
            </div>
          ) : (
            <div className="flex-1 flex items-center text-xs text-muted">
              <span>{displayedResults.length} cursos disponíveis (notas de corte projetadas para 45 vagas)</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setActiveTab(activeTab === 'comparador' ? 'todas' : 'comparador')}
            className={`min-h-[38px] px-3.5 rounded-full border-[1.5px] text-xs font-semibold transition flex items-center justify-center gap-1.5 shrink-0 ${activeTab === 'comparador'
                ? 'border-navy bg-navy text-white font-bold shadow-xs'
                : 'border-line bg-page/60 text-muted hover:border-line-strong hover:text-ink'
              }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>{activeTab === 'comparador' ? 'Voltar para Lista' : 'Tabela Comparativa'}</span>
          </button>
        </div>

        {/* COMPARATOR VIEW MODE */}
        {activeTab === 'comparador' && (
          <div className="rounded-[20px] border border-line bg-white p-5 shadow-sm space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line pb-3">
              <div>
                <h4 className="text-base font-bold text-ink flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-folgado-fill" />
                  Tabela Comparativa de Vagas & Cortes (Cascavel, Beberibe e Pindoretama)
                </h4>
                <p className="text-xs text-muted">
                  {hasNota
                    ? `Veja como a sua média (${notaFinal.toFixed(2).replace('.', ',')}) se posiciona em cada uma das 3 EEEPs`
                    : 'Veja as notas de corte históricas e projetadas de cada curso nas 3 EEEPs'}
                </p>
              </div>
              {hasNota && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-folgado-fg">
                  Sua Nota: {notaFinal.toFixed(2).replace('.', ',')}
                </span>
              )}
            </div>

            {(() => {
              const matrixYears = Array.from(
                new Set(unifiedResults.flatMap((r) => Object.keys(r.cortesPorAno || {}).map(Number)))
              ).sort((a, b) => a - b);
              const displayMatrixYears = matrixYears;

              return (
                <div className="overflow-x-auto rounded-[14px] border border-line">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-page text-ink font-bold">
                      <tr>
                        <th className="p-3">Escola EEEP</th>
                        <th className="p-3">Município</th>
                        <th className="p-3">Origem dos Dados</th>
                        <th className="p-3">Sua Cota</th>
                        <th className="p-3">Curso Ofertado</th>
                        {displayMatrixYears.map((yr) => (
                          <th key={yr} className="p-3 text-center">Corte {yr}</th>
                        ))}
                        <th className="p-3 text-center">Corte Projetado</th>
                        <th className="p-3 text-center">Diferença da estimativa</th>
                        <th className="p-3 text-center">Probabilidade</th>
                        <th className="p-3 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {unifiedResults.map((item, idx) => {
                        const modInfo = MODALIDADES_CONFIG[item.modalidade];
                        const isOficial = item.escola?.tipoBase === 'oficial';
                        return (
                          <tr
                            key={idx}
                            className={`hover:bg-page transition ${item.isCidadeDoAluno ? 'bg-folgado-bg/40' : ''
                              }`}
                          >
                            <td className="p-3 font-semibold text-ink">
                              <div className="flex items-center gap-1.5">
                                {item.escola?.nome}
                                {item.isCidadeDoAluno && (
                                  <span className="inline-flex items-center gap-0.5 rounded-full bg-folgado-bg text-folgado-fg px-1.5 py-0.2 text-[9px] font-bold">
                                    <MapPin className="w-2.5 h-2.5" />
                                    Sua Cidade
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-3 text-muted font-medium">
                              {item.escola?.municipio}
                            </td>
                            <td className="p-3">
                              {isOficial ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-provavel-fg">
                                  <ShieldCheck className="w-3 h-3 text-provavel-fg" />
                                  {item.escola?.descricaoBase || 'Base Oficial'}
                                </span>
                              ) : (
                                <span className="text-[10px] text-muted">
                                  Estimativa CREDE 09
                                </span>
                              )}
                            </td>
                            <td className="p-3">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${modInfo.badgeColor}`}
                              >
                                {modInfo.shortLabel}
                              </span>
                            </td>
                            <td className="p-3 font-bold text-ink">
                              {item.curso.nome}
                            </td>
                            {displayMatrixYears.map((yr) => {
                              const val = item.cortesPorAno?.[yr];
                              return (
                                <td key={yr} className="p-3 text-center text-muted">
                                  {val && val > 0 ? val.toFixed(2) : '—'}
                                </td>
                              );
                            })}
                            <td className="p-3 text-center font-bold text-ink">
                              {item.corteProjetado.toFixed(2)}
                            </td>
                            <td
                              className={`p-3 text-center font-bold ${hasNota
                                  ? item.delta >= 0
                                    ? 'text-folgado-fg'
                                    : 'text-abaixo-fg'
                                  : 'text-muted font-normal'
                                }`}
                            >
                              {hasNota
                                ? item.delta >= 0
                                  ? `+${item.delta.toFixed(2).replace('.', ',')}`
                                  : item.delta.toFixed(2).replace('.', ',')
                                : '—'}
                            </td>
                            <td className="p-3 text-center">
                              {hasNota ? (
                                <span className={`font-black text-sm ${item.faixaCor}`}>
                                  {item.probabilidade}%
                                </span>
                              ) : (
                                <span className="text-muted font-normal text-xs">—</span>
                              )}
                            </td>
                            <td className="p-3 text-center">
                              <button
                                type="button"
                                onClick={() => onOpenCourseDetail(item.curso)}
                                className="text-[11px] font-semibold text-folgado-fg hover:underline"
                              >
                                Detalhes
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>
        )}

        {/* CARDS ACCORDION LIST (ALL OR SPECIFIC SCHOOL) */}
        {activeTab !== 'comparador' && (
          <div className="rounded-[20px] bg-white border border-line divide-y divide-line overflow-hidden shadow-xs animate-in fade-in duration-200">
            {filteredResults.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted">
                Nenhum curso encontrado para este filtro com a sua média atual.
              </div>
            ) : (
              filteredResults.map((item) => {
                const {
                  curso,
                  escola,
                  modalidade,
                  probabilidade,
                  delta,
                  corteProjetado,
                  cortesPorAno,
                  faixaCor,
                  recomendacao,
                  isCidadeDoAluno,
                } = item;

                const modInfo = MODALIDADES_CONFIG[modalidade];
                const courseUniqueId = `${escola?.id}_${curso.id}`;

                // Confidence dots
                const validYearsCount = Object.keys(cortesPorAno || {}).filter(
                  (yr) => (cortesPorAno[Number(yr)] || 0) > 0
                ).length;
                const confidenceDots = Math.min(3, Math.max(1, validYearsCount));

                // Visual ruler calculations
                const clamp = (val: number, min: number, max: number) =>
                  Math.min(Math.max(val, min), max);
                const youLeftPct = clamp(50 + (delta / 0.6) * 50, 6, 94);
                const fillLeft = delta >= 0 ? '50%' : `${youLeftPct}%`;
                const fillWidth = `${Math.abs(youLeftPct - 50)}%`;
                const fillBg = delta >= 0 ? '#2F9E75' : '#DC4A63';

                // Status pill levels & colors derived directly from unified engine classification
                const pillBg = item.statusPillBg;
                const pillText = item.statusPillText;
                const pillColor = item.statusPillColor;

                const isOpen = !!openCards[courseUniqueId];
                const deltaSign = delta > 0 ? '+' : delta < 0 ? '−' : '';
                const deltaFormatted = `${deltaSign}${Math.abs(delta).toFixed(2).replace('.', ',')}`;

                return (
                  <div
                    key={courseUniqueId}
                    className={`transition-colors ${isCidadeDoAluno ? 'bg-[#FAFCFF]' : ''}`}
                  >
                    {/* Accordion Row Header */}
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => toggleCard(courseUniqueId)}
                      className="w-full min-h-[58px] text-left p-3.5 sm:p-4 flex items-start gap-3 hover:bg-page/70 transition active:bg-page"
                    >
                      {/* Left: Course details & badges */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-display font-bold text-[15px] sm:text-[16px] text-ink leading-tight">
                          {curso.nome}
                        </h4>

                        <div className="flex items-center gap-1.5 text-xs text-muted mt-1 leading-snug flex-wrap">
                          <span>{escola?.municipio}</span>
                          <span>•</span>
                          <span>{escola?.nome}</span>
                          {isCidadeDoAluno && (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-folgado-bg text-folgado-fg px-1.5 py-0.2 text-[10px] font-bold">
                              <MapPin className="w-2.5 h-2.5" />
                              Sua Cidade
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          {hasNota && (
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold border ${pillBg}`}
                            >
                              {delta >= 0 ? (
                                <CheckCircle2 className="w-3 h-3 shrink-0" />
                              ) : (
                                <AlertTriangle className="w-3 h-3 shrink-0" />
                              )}
                              {pillText}
                            </span>
                          )}

                          <span
                            className={`inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold border ${modInfo.badgeColor}`}
                          >
                            {modInfo.shortLabel}
                          </span>
                        </div>
                      </div>

                      {/* Right: Delta margin or Cutoff */}
                      <div className="flex-none text-right flex flex-col items-end">
                        {hasNota ? (
                          <>
                            <span
                              className="font-display font-black text-[18px] sm:text-[21px] leading-tight"
                              style={{ color: pillColor }}
                            >
                              {deltaFormatted}
                            </span>
                            <span className="text-[11px] text-muted leading-tight mt-0.5">
                              {delta >= 0 ? 'acima da estimativa' : 'abaixo da estimativa'}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="font-display font-bold text-[17px] sm:text-[19px] leading-tight text-ink">
                              {corteProjetado.toFixed(2).replace('.', ',')}
                            </span>
                            <span className="text-[11px] text-muted leading-tight mt-0.5">
                              corte estimado
                            </span>
                          </>
                        )}

                        {/* Confidence Dots */}
                        <div
                          className="flex items-center gap-1 mt-2"
                          title={`${validYearsCount} ano(s) de dados históricos`}
                        >
                          {[1, 2, 3].map((dot) => (
                            <span
                              key={dot}
                              className={`w-2 h-2 rounded-full border border-navy ${dot <= confidenceDots ? 'bg-navy' : 'bg-transparent'
                                }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Chevron Toggle */}
                      <div className="flex-none text-muted pt-0.5">
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-navy' : ''
                            }`}
                        />
                      </div>
                    </button>

                    {/* Accordion Body: Visual Ruler & Action Details */}
                    {isOpen && (
                      <div className="px-3.5 sm:px-5 pb-4 pt-1 flex flex-col gap-3.5 bg-page/35 border-t border-line/60 animate-in fade-in duration-150">
                        {/* Visual Ruler or Note Pending Banner */}
                        {!hasNota ? (
                          <div className="mt-2 rounded-[14px] bg-white p-3.5 border border-line text-xs text-muted flex items-center gap-2">
                            <span className="text-navy font-bold text-sm">ℹ️</span>
                            <span>
                              Para comparar sua nota com a régua e ver a chance estimada, <strong>informe sua média no Passo 2</strong>.
                            </span>
                          </div>
                        ) : (
                          <div
                            className="mt-2 rounded-[14px] bg-white p-3 border border-line"
                            role="img"
                            aria-label={`Régua: Você ${notaFinal.toFixed(2)} vs Corte ${corteProjetado.toFixed(2)}`}
                          >
                            <div className="relative h-14 pt-0 select-none">
                              {/* Student Label */}
                              <div
                                className="absolute top-0 text-[11px] font-extrabold text-ink whitespace-nowrap transition-all duration-300 -translate-x-1/2"
                                style={{ left: `${youLeftPct}%` }}
                              >
                                Você {notaFinal.toFixed(2).replace('.', ',')}
                              </div>

                              {/* Ruler Track */}
                              <div className="absolute left-0 right-0 top-5 h-2 rounded-full bg-track" />

                              {/* Fill Range */}
                              <div
                                className="absolute top-5 h-2 rounded-full transition-all duration-300"
                                style={{ left: fillLeft, width: fillWidth, backgroundColor: fillBg }}
                              />

                              {/* Cutoff Needle */}
                              <div className="absolute left-1/2 top-3.5 w-0.5 h-5 -ml-[1px] bg-navy rounded" />

                              {/* Student Circle Pin */}
                              <div
                                className="absolute top-3.5 w-4.5 h-4.5 -ml-[9px] rounded-full bg-[#FFC93C] border-2 border-navy shadow-xs transition-all duration-300"
                                style={{ left: `${youLeftPct}%` }}
                              />

                              {/* Cutoff Label */}
                              <div className="absolute left-1/2 top-9 -translate-x-1/2 whitespace-nowrap text-[11px] font-semibold text-muted">
                                Corte estimado {corteProjetado.toFixed(2).replace('.', ',')}
                              </div>
                            </div>

                            <div className="mt-1 flex items-center justify-between text-xs pt-1 border-t border-line/60">
                              <span className="text-muted text-[11px]">
                                Chance estimada: <strong className={`font-black ${faixaCor}`}>{probabilidade}%</strong>
                              </span>
                              <span
                                className={`text-[11px] font-bold ${delta >= 0 ? 'text-folgado-fg' : 'text-abaixo-fg'
                                  }`}
                              >
                                {delta >= 0
                                  ? `+${delta.toFixed(2).replace('.', ',')} acima da estimativa`
                                  : `${Math.abs(delta).toFixed(2).replace('.', ',')} abaixo da estimativa`}
                              </span>
                            </div>

                            {item.probabilidadePrimeiraChamada !== undefined && (
                              <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] bg-page/70 px-2.5 py-1.5 rounded-[8px] border border-line/60">
                                <span className="text-muted">
                                  1ª Chamada: <strong className="text-ink">{item.probabilidadePrimeiraChamada}%</strong>
                                </span>
                                <span className="text-muted/60">•</span>
                                <span className="text-muted">
                                  Lista de Espera: <strong className="text-ink">+{item.probabilidadeListaEspera}%</strong>
                                </span>
                                <span className="text-[10px] text-muted/70 ml-auto hidden sm:inline">
                                  (Monte Carlo: 5.000 simulações)
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Historical Cuts Row */}
                        <div>
                          <div className="flex items-center justify-between text-[11px] font-bold text-muted uppercase tracking-wider mb-1.5">
                            <span>Histórico de Notas de Corte ({escola?.municipio})</span>
                            <span className="font-normal normal-case">
                              Sua Nota: {hasNota ? notaFinal.toFixed(2).replace('.', ',') : 'Não informada'}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 text-center text-xs">
                            {Object.keys(cortesPorAno || {}).sort().map((yrStr) => {
                              const yr = Number(yrStr);
                              const cut = cortesPorAno[yr];
                              return (
                                <div
                                  key={yr}
                                  className="flex-1 min-w-[50px] rounded-[10px] bg-white p-1.5 border border-line"
                                >
                                  <span className="text-[10px] text-muted block">{yr}</span>
                                  <strong className="text-ink font-display text-xs">
                                    {cut > 0 ? cut.toFixed(2).replace('.', ',') : '—'}
                                  </strong>
                                </div>
                              );
                            })}
                            <div className="flex-1 min-w-[60px] rounded-[10px] bg-folgado-bg p-1.5 border border-folgado-fill/20">
                              <span className="text-[10px] text-folgado-fg block font-semibold">
                                Projetado
                              </span>
                              <strong className="text-folgado-fg font-display text-xs">
                                {corteProjetado.toFixed(2).replace('.', ',')}
                              </strong>
                            </div>
                          </div>
                          {curso.notaHistorico && (
                            <p className="text-[11px] text-muted italic mt-1.5">
                              ℹ️ {curso.notaHistorico}
                            </p>
                          )}
                          {item.alertaCorteRecenteSuperior && (
                            <div className="mt-2 p-2.5 rounded-[12px] bg-amber-50 border border-amber-200/80 text-amber-900 text-[11px] leading-relaxed flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 text-amber-600 flex-none mt-0.5" />
                              <div>
                                <strong className="font-bold text-amber-950">Atenção ao último processo seletivo:</strong>{' '}
                                Em {item.anoMaisRecente}, a nota de corte subiu para{' '}
                                <strong>{item.corteMaisRecente.toFixed(2).replace('.', ',')}</strong> (+{item.diferencaRecenteProjetado.toFixed(2).replace('.', ',')} em relação à média). Recomenda-se considerar essa nota mais recente como referência segura.
                              </div>
                            </div>
                          )}
                          {item.anosHistoricosValidos === 1 && (
                            <div className="mt-1.5 p-2 rounded-[10px] bg-blue-50/70 border border-blue-200/60 text-blue-900 text-[11px] leading-relaxed flex items-start gap-1.5">
                              <span className="text-blue-600 font-bold flex-none">ℹ️</span>
                              <span>Este curso possui apenas 1 ano de histórico oficial. A projeção é uma estimativa inicial.</span>
                            </div>
                          )}
                        </div>

                        {/* Recommendation */}
                        <div className="text-xs text-ink bg-white p-2.5 rounded-[12px] border border-line leading-relaxed">
                          <strong className="text-navy font-bold">
                            Orientação:
                          </strong>{' '}
                          {hasNota ? recomendacao : 'Informe sua média no Passo 2 para receber a análise individual deste curso.'}
                        </div>

                        {/* Actions: Syllabus */}
                        <div className="pt-2 border-t border-line/60 flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => onOpenCourseDetail(curso)}
                            className="w-full sm:w-auto min-h-[42px] px-4 py-2 rounded-[12px] border border-line-strong text-xs font-semibold text-ink hover:border-navy hover:bg-white flex items-center justify-center gap-1.5 transition active:scale-95"
                          >
                            <Info className="w-3.5 h-3.5 text-navy" />
                            <span>Ver Grade Curricular</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }))}
          </div>
        )}
      </div>
    </section>
  );
};
