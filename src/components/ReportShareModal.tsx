import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Printer,
  Sparkles,
  Download,
  BookmarkCheck,
  Building2,
} from 'lucide-react';
import { MODALIDADES_CONFIG } from '../data/courses';
import { ChanceResult, ModalidadeKey, SimulationSummary } from '../types/eeep';
import { shareContent } from '../utils/share';

interface ReportShareModalProps {
  notaFinal: number;
  modalidade: ModalidadeKey;
  summary: SimulationSummary;
  results: ChanceResult[];
  onClose: () => void;
}

export const ReportShareModal: React.FC<ReportShareModalProps> = ({
  notaFinal,
  modalidade,
  summary,
  results,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [savedLocal, setSavedLocal] = useState(false);

  const modalidadeInfo = MODALIDADES_CONFIG[modalidade];

  const reportText = `📊 *Rumo à EEEP — Relatório de Simulação Multiescolas*
-------------------------------------------
👤 *Média do Candidato:* ${notaFinal.toFixed(2).replace('.', ',')} / 10,00
🏛️ *Escolas:* Cascavel, Beberibe & Pindoretama (CREDE 09)

🎯 *Chances Estimadas por Curso:*
${results
  .map(
    (r) =>
      `${r.isCidadeDoAluno ? '📍 ' : '• '}*${r.curso.nome}* (${r.escola?.municipio ?? ''}): ${r.probabilidade}% [${r.faixaTitulo}] • Corte: ${r.corteProjetado.toFixed(2).replace('.', ',')}`
  )
  .join('\n')}

💡 *Simulado no app Rumo à EEEP (Ceará)*`;

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = async () => {
    await shareContent({
      title: 'Relatório Oficial — Rumo à EEEP',
      text: reportText,
      url: 'https://flaviojussie-dev1.github.io/rumo-a-eeep/',
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveToLocalStorage = () => {
    try {
      const dataToSave = {
        date: new Date().toISOString(),
        notaFinal,
        modalidade,
        summary,
        results: results.map((r) => ({
          cursoId: r.curso.id,
          escolaId: r.escola?.id,
          probabilidade: r.probabilidade,
          faixa: r.faixa,
        })),
      };
      localStorage.setItem('eeep_orienta_last_simulation', JSON.stringify(dataToSave));
      setSavedLocal(true);
      setTimeout(() => setSavedLocal(false), 3000);
    } catch {
      // Ignored
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-[20px] bg-white border border-line shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line p-5 bg-folgado-bg">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[14px] bg-folgado-fill text-white shadow-sm">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-ink">
                Relatório de Orientação Multiescolas
              </h3>
              <p className="text-xs text-muted">
                Compartilhe o comparativo entre Cascavel, Beberibe e Pindoretama
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Printable Report Card */}
          <div
            id="printable-report"
            className="rounded-[14px] border border-line p-5 bg-page/50 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-folgado-fg">
                  Rumo à EEEP • CREDE 09
                </span>
                <h4 className="text-base font-black text-ink">
                  Resumo de Candidatura Multiescolas
                </h4>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-muted block">Média Geral</span>
                <span className="text-xl font-black text-folgado-fg">
                  {notaFinal.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-muted block">Escolas Incluídas:</span>
                <strong className="text-ink">
                  Cascavel, Beberibe & Pindoretama
                </strong>
              </div>
              <div>
                <span className="text-muted block">Total de Vagas por Turma:</span>
                <strong className="text-ink">
                  45 Alunos por Sala
                </strong>
              </div>
            </div>


            {/* Courses summary */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted block">
                Classificação das Melhores Oportunidades:
              </span>
              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {results.map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded-[10px] bg-white border border-line text-xs"
                  >
                    <div>
                      <span className="font-semibold text-ink">
                        {r.curso.nome}
                      </span>
                      <span className="block text-[10px] text-muted">
                        {r.escola?.nome} ({r.escola?.municipio})
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-muted">
                        Corte: {r.corteProjetado.toFixed(2)}
                      </span>
                      <span className={`font-black ${r.faixaCor}`}>
                        {r.probabilidade}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              onClick={handleWhatsAppShare}
              className="flex items-center justify-center gap-2 rounded-[14px] bg-folgado-fill px-4 py-2.5 text-xs font-bold text-white hover:bg-folgado-fill shadow-sm transition active:scale-95"
            >
              <Share2 className="w-4 h-4" />
              Enviar no WhatsApp
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 rounded-[14px] border border-line bg-white px-4 py-2.5 text-xs font-bold text-ink hover:bg-track transition active:scale-95"
            >
              {copied ? <Check className="w-4 h-4 text-folgado-fill" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copiado!' : 'Copiar Texto'}
            </button>

            <button
              onClick={handleSaveToLocalStorage}
              className="flex items-center justify-center gap-2 rounded-[14px] border border-line bg-white px-4 py-2.5 text-xs font-bold text-ink hover:bg-track transition active:scale-95"
            >
              <BookmarkCheck className="w-4 h-4 text-folgado-fill" />
              {savedLocal ? 'Salvo no Celular!' : 'Salvar no PWA'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-line p-4 bg-page flex justify-between items-center">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink"
          >
            <Printer className="w-4 h-4" />
            Imprimir Relatório
          </button>
          <button
            onClick={onClose}
            className="rounded-[14px] bg-navy px-5 py-2 text-xs font-bold text-white hover:opacity-90"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
