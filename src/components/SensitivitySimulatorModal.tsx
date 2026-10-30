import React, { useState } from 'react';
import { X, Sliders, TrendingUp, Sparkles, Check, ArrowRight, Building2 } from 'lucide-react';
import { ESCOLAS_EEEP } from '../data/courses';
import { PerfilAluno } from '../types/eeep';
import { simulateAllSelectedEscolas, getUnifiedRankedChances } from '../utils/engine';

interface SensitivitySimulatorModalProps {
  currentNota: number;
  perfil: PerfilAluno;
  onClose: () => void;
  onApplyNota: (newNota: number) => void;
}

export const SensitivitySimulatorModal: React.FC<SensitivitySimulatorModalProps> = ({
  currentNota,
  perfil,
  onClose,
  onApplyNota,
}) => {
  const [simulatedNota, setSimulatedNota] = useState<number>(currentNota);

  const deltaTotal = Number((simulatedNota - currentNota).toFixed(2));

  // Current simulation
  const currentEscolaSim = simulateAllSelectedEscolas(currentNota, perfil);
  const currentUnified = getUnifiedRankedChances(currentEscolaSim);

  // Future simulated
  const futureEscolaSim = simulateAllSelectedEscolas(simulatedNota, perfil);
  const futureUnified = getUnifiedRankedChances(futureEscolaSim);

  const combinedItems = futureUnified.map((simResult) => {
    const curResult = currentUnified.find(
      (c) => c.curso.id === simResult.curso.id && c.escola?.id === simResult.escola?.id
    );
    const curProb = curResult?.probabilidade ?? simResult.probabilidade;
    const diffProb = Number((simResult.probabilidade - curProb).toFixed(1));

    return {
      id: `${simResult.escola?.id}_${simResult.curso.id}`,
      nome: simResult.curso.nome,
      escolaNome: simResult.escola?.nome,
      municipio: simResult.escola?.municipio,
      currentProb: curProb,
      simulatedProb: simResult.probabilidade,
      diffProb,
      corteProjetado: simResult.corteProjetado,
    };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-[20px] bg-white border border-line shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-line p-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-[14px] bg-folgado-bg text-folgado-fill">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-ink">
                Simulador de Sensibilidade & Metas
              </h3>
              <p className="text-xs text-muted">
                Veja o impacto de pequenas variações na sua média final nas 3 EEEPs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-[10px] p-1.5 text-muted hover:bg-page:bg-navy-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-6">
          {/* Interactive Slider Card */}
          <div className="rounded-[14px] bg-page p-4 border border-line/70">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-xs font-bold text-ink">
                  Média Simulada:
                </span>
                <span className="ml-2 text-2xl font-black text-folgado-fg">
                  {simulatedNota.toFixed(2)}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-muted block">Variação vs Atual</span>
                <span
                  className={`text-xs font-bold ${
                    deltaTotal >= 0
                      ? 'text-folgado-fg'
                      : 'text-abaixo-fg'
                  }`}
                >
                  {deltaTotal >= 0 ? `+${deltaTotal.toFixed(2)}` : deltaTotal.toFixed(2)}
                </span>
              </div>
            </div>

            <input
              type="range"
              min="6.0"
              max="10.0"
              step="0.01"
              value={simulatedNota}
              onChange={(e) => setSimulatedNota(parseFloat(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />

            <div className="flex justify-between text-[10px] text-muted mt-1">
              <span>6.00</span>
              <span>7.00</span>
              <span>8.00</span>
              <span>9.00</span>
              <span>10.00</span>
            </div>

            {/* Quick offset buttons */}
            <div className="mt-3 flex flex-wrap gap-1.5 pt-3 border-t border-line/60">
              <span className="text-xs font-medium text-muted mr-1 self-center">
                Ajuste Rápido:
              </span>
              {[-0.2, -0.1, -0.05, -0.01, 0, +0.01, +0.05, +0.1, +0.2].map((offset) => (
                <button
                  key={offset}
                  onClick={() =>
                    setSimulatedNota(
                      Math.min(10, Math.max(0, Number((currentNota + offset).toFixed(2))))
                    )
                  }
                  className="rounded-md bg-white px-2 py-0.5 text-xs font-medium text-ink border border-line hover:border-folgado-fill"
                >
                  {offset === 0 ? 'Atual' : offset > 0 ? `+${offset}` : `${offset}`}
                </button>
              ))}
            </div>
          </div>

          {/* Comparison Matrix */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">
              Impacto Direto nas Chances por Escola & Curso
            </h4>
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {combinedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-[14px] border border-line/80 p-3 bg-white"
                >
                  <div>
                    <h5 className="text-xs font-bold text-ink">
                      {item.nome}
                    </h5>
                    <span className="text-[11px] text-muted flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-muted" />
                      {item.escolaNome} ({item.municipio}) • Corte: {item.corteProjetado.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted line-through">
                          {item.currentProb}%
                        </span>
                        <ArrowRight className="w-3 h-3 text-muted" />
                        <span className="text-sm font-black text-ink">
                          {item.simulatedProb}%
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold block ${
                          item.diffProb >= 0
                            ? 'text-folgado-fg'
                            : 'text-abaixo-fg'
                        }`}
                      >
                        {item.diffProb >= 0 ? `+${item.diffProb}%` : `${item.diffProb}%`}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-line p-4 bg-page">
          <button
            onClick={onClose}
            className="rounded-[14px] px-4 py-2 text-xs font-semibold text-muted hover:text-ink"
          >
            Fechar
          </button>
          <button
            onClick={() => {
              onApplyNota(simulatedNota);
              onClose();
            }}
            className="flex items-center gap-1.5 rounded-[14px] bg-folgado-fill px-4 py-2 text-xs font-bold text-white hover:bg-folgado-fill shadow-sm"
          >
            <Check className="w-4 h-4" />
            Adotar Esta Média na Simulação
          </button>
        </div>
      </div>
    </div>
  );
};
