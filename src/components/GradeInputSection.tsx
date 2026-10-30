import React, { useState } from 'react';
import {
  Zap,
  Calculator,
  RotateCcw,
  Sparkles,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { ANOS_ESCOLARES, DISCIPLINAS_CONFIG } from '../data/courses';
import {
  AnoEscolarKey,
  BoletimCompleto,
  DisciplinaKey,
  PerfilAluno,
  SimulationSummary,
} from '../types/eeep';
import { calculateAnoAverage, createEmptyBoletim, createPresetBoletim } from '../utils/engine';

interface GradeInputSectionProps {
  perfil: PerfilAluno;
  boletim: BoletimCompleto;
  summary: SimulationSummary;
  onChangePerfil: (updated: Partial<PerfilAluno>) => void;
  onChangeBoletim: (updated: BoletimCompleto) => void;
}

export const GradeInputSection: React.FC<GradeInputSectionProps> = ({
  perfil,
  boletim,
  summary,
  onChangePerfil,
  onChangeBoletim,
}) => {
  const [activeAnoTab, setActiveAnoTab] = useState<AnoEscolarKey>('6ano');
  const [viewMode, setViewMode] = useState<'tabs' | 'all'>('tabs');

  const [localGradeText, setLocalGradeText] = useState(
    () => String(perfil.notaRapida || '').replace('.', ',')
  );

  // Sync if external changes occur
  React.useEffect(() => {
    if (perfil.notaRapida !== undefined && perfil.notaRapida !== null) {
      setLocalGradeText(String(perfil.notaRapida).replace('.', ','));
    }
  }, [perfil.notaRapida]);

  // Fast mode handlers
  const handleFastGradeChange = (valStr: string) => {
    setLocalGradeText(valStr);
    const sanitized = valStr.trim().replace(',', '.');
    if (sanitized === '') {
      onChangePerfil({ notaRapida: '' });
      return;
    }
    const parsed = parseFloat(sanitized);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 10) {
      onChangePerfil({ notaRapida: sanitized });
    }
  };

  const handleBlur = () => {
    const sanitized = localGradeText.trim().replace(',', '.');
    if (sanitized === '') {
      onChangePerfil({ notaRapida: '' });
      setLocalGradeText('');
      return;
    }
    const parsed = parseFloat(sanitized);
    if (isNaN(parsed) || parsed < 0) {
      onChangePerfil({ notaRapida: '' });
      setLocalGradeText('');
    } else if (parsed > 10) {
      onChangePerfil({ notaRapida: '10.00' });
      setLocalGradeText('10,00');
    } else {
      const fixed = parsed.toFixed(2);
      onChangePerfil({ notaRapida: fixed });
      setLocalGradeText(fixed.replace('.', ','));
    }
  };

  const applyFastPreset = (grade: number) => {
    const fixed = grade.toFixed(2);
    onChangePerfil({ notaRapida: fixed });
    setLocalGradeText(fixed.replace('.', ','));
  };

  const adjustFastGrade = (amount: number) => {
    const current = parseFloat(String(perfil.notaRapida || '8.00').replace(',', '.')) || 8.00;
    const updated = Math.min(10, Math.max(0, Number((current + amount).toFixed(2))));
    const fixed = updated.toFixed(2);
    onChangePerfil({ notaRapida: fixed });
    setLocalGradeText(fixed.replace('.', ','));
  };

  // Complete calculator handlers
  const handleGradeCellChange = (
    ano: AnoEscolarKey,
    disc: DisciplinaKey,
    rawVal: string
  ) => {
    const sanitized = rawVal.replace(',', '.');
    let numVal: number | null = null;
    if (sanitized !== '') {
      const parsed = parseFloat(sanitized);
      if (!isNaN(parsed)) {
        numVal = Math.min(10, Math.max(0, Number(parsed.toFixed(1))));
      }
    }

    const updated = {
      ...boletim,
      [ano]: {
        ...boletim[ano],
        [disc]: numVal,
      },
    };
    onChangeBoletim(updated);
  };

  const handleFillAno = (ano: AnoEscolarKey, value: number) => {
    const currentAno = { ...boletim[ano] };
    for (const d of DISCIPLINAS_CONFIG) {
      currentAno[d.key] = value;
    }
    onChangeBoletim({
      ...boletim,
      [ano]: currentAno,
    });
  };

  const handleClearAno = (ano: AnoEscolarKey) => {
    const currentAno = { ...boletim[ano] };
    for (const d of DISCIPLINAS_CONFIG) {
      currentAno[d.key] = null;
    }
    onChangeBoletim({
      ...boletim,
      [ano]: currentAno,
    });
  };

  const handleClearAllBoletim = () => {
    onChangeBoletim(createEmptyBoletim());
  };

  const handleApplyBoletimPreset = (target: number) => {
    onChangeBoletim(createPresetBoletim(target));
  };

  const currentNumericGrade =
    parseFloat(String(perfil.notaRapida || '0').replace(',', '.')) || 0;

  return (
    <section
      id="media"
      className="scroll-mt-24 rounded-[20px] bg-white p-4 sm:p-5 border border-line/60 shadow-xs"
    >
      {/* Header and Toggle */}
      <div className="flex flex-col gap-3.5">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-bold text-white"
          >
            2
          </span>
          <h2 className="font-display text-xl font-bold text-ink">
            Sua média final
          </h2>
        </div>
        <p className="text-sm leading-snug text-muted">
          {perfil.modoNota === 'rapido'
            ? 'Sua média de notas do 6º ao 9º ano (de 0 a 10).'
            : 'Preencha as notas do boletim de cada ano para o sistema calcular sua média oficial.'}
        </p>

        {/* Mode Switcher */}
        <div className="flex items-center rounded-[14px] bg-page p-1">
          <button
            type="button"
            onClick={() => onChangePerfil({ modoNota: 'rapido' })}
            className={`flex items-center gap-1.5 rounded-[10px] px-3 py-2 text-sm font-bold transition-all ${
              perfil.modoNota === 'rapido'
                ? 'bg-white text-ink shadow-sm'
                : 'text-muted hover:text-ink'
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            Modo Rápido
          </button>
          <button
            type="button"
            onClick={() => onChangePerfil({ modoNota: 'boletim' })}
            className={`flex items-center gap-1.5 rounded-[10px] px-3 py-2 text-sm font-bold transition-all ${
              perfil.modoNota === 'boletim'
                ? 'bg-white text-ink shadow-sm'
                : 'text-muted hover:text-ink'
            }`}
          >
            <Calculator className="h-3.5 w-3.5" />
            Calculadora 36 Notas
          </button>
        </div>
      </div>

      {/* FAST MODE CONTENT: Tactile 48px Display + Range Slider */}
      {perfil.modoNota === 'rapido' && (
        <div className="mt-4 space-y-3.5 animate-in fade-in duration-200">
          {/* Tactile Big Input with -0.01 and +0.01 (Centesimal Precision) */}
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => adjustFastGrade(-0.01)}
              aria-label="Diminuir 0,01"
              className="w-16 flex-none rounded-[16px] border-[1.5px] border-line-strong bg-white text-base font-bold text-ink transition active:scale-95 hover:border-navy"
              style={{ height: 56 }}
            >
              −0,01
            </button>

            <div className="max-w-[200px] flex-1">
              <input
                aria-label="Média final do candidato"
                inputMode="decimal"
                placeholder="Ex: 8,50"
                value={localGradeText}
                onChange={(e) => handleFastGradeChange(e.target.value)}
                onBlur={handleBlur}
                className="h-[72px] w-full rounded-[16px] border-2 border-navy bg-field text-center font-display text-[40px] font-extrabold text-ink focus:outline-none placeholder:text-muted/40 placeholder:text-[26px]"
              />
            </div>

            <button
              type="button"
              onClick={() => adjustFastGrade(0.01)}
              aria-label="Aumentar 0,01"
              className="w-16 flex-none rounded-[16px] border-[1.5px] border-line-strong bg-white text-base font-bold text-ink transition active:scale-95 hover:border-navy"
              style={{ height: 56 }}
            >
              +0,01
            </button>
          </div>

          {/* Quick Adjustment Chips for faster jumping */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-xs">
            <button
              type="button"
              onClick={() => adjustFastGrade(-0.10)}
              className="px-2.5 py-1 rounded-full border border-line bg-page text-muted hover:text-ink hover:border-navy transition text-[11px] font-semibold"
            >
              −0,10
            </button>
            <button
              type="button"
              onClick={() => adjustFastGrade(-0.05)}
              className="px-2.5 py-1 rounded-full border border-line bg-page text-muted hover:text-ink hover:border-navy transition text-[11px] font-semibold"
            >
              −0,05
            </button>
            <span className="text-[10px] text-muted/60 px-1 font-medium">Ajuste rápido</span>
            <button
              type="button"
              onClick={() => adjustFastGrade(0.05)}
              className="px-2.5 py-1 rounded-full border border-line bg-page text-muted hover:text-ink hover:border-navy transition text-[11px] font-semibold"
            >
              +0,05
            </button>
            <button
              type="button"
              onClick={() => adjustFastGrade(0.10)}
              className="px-2.5 py-1 rounded-full border border-line bg-page text-muted hover:text-ink hover:border-navy transition text-[11px] font-semibold"
            >
              +0,10
            </button>
          </div>

          {/* Range Slider (6.00 to 10.00 with 0.01 precision) */}
          <div className="space-y-1 px-1">
            <input
              type="range"
              min="6.00"
              max="10.00"
              step="0.01"
              value={Math.min(10, Math.max(6, currentNumericGrade))}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                applyFastPreset(val);
              }}
              aria-label="Ajustar média de 6 a 10"
              className="h-11 w-full cursor-pointer accent-navy"
            />
            <div className="flex justify-between text-xs font-medium text-muted">
              <span>6,00</span>
              <span>10,00</span>
            </div>
          </div>
        </div>
      )}

      {/* COMPLETE CALCULATOR CONTENT */}
      {perfil.modoNota === 'boletim' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Summary Metric Ribbon */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-[20px] bg-page p-4 border border-line/70">
            {/* Final Average */}
            <div className="rounded-[14px] bg-white p-4 shadow-xs border border-line/50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                Média Final EEEP
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-black text-folgado-fg">
                  {summary.mediaFinal.toFixed(2)}
                </span>
                <span className="text-xs text-muted">/ 10</span>
              </div>
              <p className="text-[10px] text-muted mt-1">
                Média aritmética de todas as 9 disciplinas dos 4 anos
              </p>
            </div>

            {/* Progress */}
            <div className="rounded-[14px] bg-white p-4 shadow-xs border border-line/50">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                  Notas Lançadas
                </span>
                <span className="text-xs font-semibold text-muted">
                  {Math.round((summary.notasPreenchidas / summary.totalNotas) * 100)}%
                </span>
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-black text-ink">
                  {summary.notasPreenchidas}
                </span>
                <span className="text-xs text-muted">/ {summary.totalNotas}</span>
              </div>
              <div className="w-full bg-track h-2 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-folgado-fill h-full transition-all duration-300"
                  style={{
                    width: `${(summary.notasPreenchidas / summary.totalNotas) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Status */}
            <div className="rounded-[14px] bg-white p-4 shadow-xs border border-line/50 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                  Status do Boletim
                </span>
                <div className="flex items-center gap-2 mt-1.5">
                  {summary.isCompleto ? (
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-folgado-fg">
                      <CheckCircle className="w-4 h-4 text-folgado-fill" />
                      Boletim Completo (36/36)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-disputa-fg">
                      <AlertCircle className="w-4 h-4 text-disputa-fill" />
                      Faltam {summary.totalNotas - summary.notasPreenchidas} notas
                    </span>
                  )}
                </div>
              </div>
              <p className="text-[10px] text-muted mt-1">
                {summary.isCompleto
                  ? 'Pronto para simulação oficial em todas as escolas'
                  : 'A média atual reflete as notas inseridas até o momento'}
              </p>
            </div>
          </div>

          {/* Quick Actions & Presets */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-muted">
                Preencher Amostra:
              </span>
              <button
                type="button"
                onClick={() => handleApplyBoletimPreset(8.5)}
                className="rounded-[10px] border border-line bg-white px-2.5 py-1 font-medium text-ink hover:bg-page transition"
              >
                Média ~8.5
              </button>
              <button
                type="button"
                onClick={() => handleApplyBoletimPreset(9.2)}
                className="rounded-[10px] border border-line bg-white px-2.5 py-1 font-medium text-ink hover:bg-page transition"
              >
                Média ~9.2
              </button>
              <button
                type="button"
                onClick={() => handleApplyBoletimPreset(9.6)}
                className="rounded-[10px] border border-line bg-white px-2.5 py-1 font-medium text-ink hover:bg-page transition"
              >
                Média ~9.6
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode(viewMode === 'tabs' ? 'all' : 'tabs')}
                className="rounded-[10px] border border-line bg-white px-2.5 py-1 font-medium text-ink hover:bg-page transition"
              >
                {viewMode === 'tabs' ? 'Ver Todos os 4 Anos' : 'Navegar por Abas'}
              </button>
              <button
                type="button"
                onClick={handleClearAllBoletim}
                className="flex items-center gap-1 rounded-[10px] border border-abaixo-bg bg-abaixo-bg px-2.5 py-1 font-medium text-abaixo-fg hover:bg-abaixo-bg transition"
              >
                <RotateCcw className="w-3 h-3" />
                Limpar Tudo
              </button>
            </div>
          </div>

          {/* TAB VIEW MODE */}
          {viewMode === 'tabs' && (
            <div className="space-y-4">
              {/* Year Tab Bar */}
              <div className="grid grid-cols-4 gap-2 border-b border-line pb-2">
                {ANOS_ESCOLARES.map((ano) => {
                  const anoStats = calculateAnoAverage(boletim[ano.key]);
                  const isActive = activeAnoTab === ano.key;
                  return (
                    <button
                      key={ano.key}
                      type="button"
                      onClick={() => setActiveAnoTab(ano.key)}
                      className={`relative flex flex-col items-center justify-center p-3 rounded-[14px] border text-center transition-all ${
                        isActive
                          ? 'border-folgado-fill bg-folgado-bg text-folgado-fg shadow-xs'
                          : 'border-line bg-white text-ink hover:border-line-strong'
                      }`}
                    >
                      <span className="text-xs font-black">{ano.short}</span>
                      <span className="text-[11px] font-bold text-ink mt-0.5">
                        {anoStats.filled > 0 ? anoStats.average.toFixed(2) : '—'}
                      </span>
                      <span className="text-[9px] text-muted">
                        {anoStats.filled}/9 notas
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Active Year Table */}
              <div className="rounded-[14px] border border-line bg-white p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-line">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-ink">
                      Notas do {ANOS_ESCOLARES.find((a) => a.key === activeAnoTab)?.label}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-folgado-bg text-folgado-fg">
                      Média: {calculateAnoAverage(boletim[activeAnoTab]).average.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs">
                    <button
                      type="button"
                      onClick={() => handleFillAno(activeAnoTab, 9.0)}
                      className="rounded bg-page px-2 py-1 text-[11px] font-medium text-muted hover:bg-track"
                    >
                      Preencher 9.0
                    </button>
                    <button
                      type="button"
                      onClick={() => handleClearAno(activeAnoTab)}
                      className="rounded bg-page px-2 py-1 text-[11px] font-medium text-muted hover:bg-track"
                    >
                      Zerar Ano
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {DISCIPLINAS_CONFIG.map((disc) => {
                    const gradeVal = boletim[activeAnoTab][disc.key];
                    const inputVal =
                      typeof gradeVal === 'number' && !isNaN(gradeVal)
                        ? gradeVal.toString()
                        : '';
                    return (
                      <div
                        key={disc.key}
                        className="flex items-center justify-between p-2.5 rounded-[14px] border border-line/80 bg-page transition-colors"
                      >
                        <div className="flex flex-col pr-2">
                          <span className="text-xs font-semibold text-ink">
                            {disc.label}
                          </span>
                        </div>

                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={inputVal}
                          onChange={(e) =>
                            handleGradeCellChange(activeAnoTab, disc.key, e.target.value)
                          }
                          placeholder="0.0"
                          className="w-16 rounded-[10px] border border-line-strong bg-white px-2 py-1.5 text-center text-sm font-bold text-ink focus:border-folgado-fill focus:outline-none"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ALL YEARS VIEW MODE */}
          {viewMode === 'all' && (
            <div className="overflow-x-auto rounded-[14px] border border-line">
              <table className="w-full text-left text-xs">
                <thead className="bg-page text-ink">
                  <tr>
                    <th className="p-3 font-bold">Disciplina Obrigatória</th>
                    {ANOS_ESCOLARES.map((ano) => (
                      <th key={ano.key} className="p-3 font-bold text-center">
                        {ano.short}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {DISCIPLINAS_CONFIG.map((disc) => (
                    <tr
                      key={disc.key}
                      className="hover:bg-page"
                    >
                      <td className="p-2.5 font-medium text-ink">
                        <span>{disc.label}</span>
                      </td>
                      {ANOS_ESCOLARES.map((ano) => {
                        const gradeVal = boletim[ano.key][disc.key];
                        const inputVal =
                          typeof gradeVal === 'number' && !isNaN(gradeVal)
                            ? gradeVal.toString()
                            : '';
                        return (
                          <td key={ano.key} className="p-2 text-center">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="10"
                              value={inputVal}
                              onChange={(e) =>
                                handleGradeCellChange(ano.key, disc.key, e.target.value)
                              }
                              placeholder="0.0"
                              className="w-14 rounded-md border border-line-strong bg-white px-1.5 py-1 text-center text-xs font-bold text-ink focus:border-folgado-fill focus:outline-none"
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {/* Year Averages Row */}
                  <tr className="bg-page/70 font-bold">
                    <td className="p-3 text-ink">
                      Média Anual (9 Matérias)
                    </td>
                    {ANOS_ESCOLARES.map((ano) => (
                      <td
                        key={ano.key}
                        className="p-3 text-center text-folgado-fg text-sm font-black"
                      >
                        {calculateAnoAverage(boletim[ano.key]).average.toFixed(2)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
