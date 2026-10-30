import React from 'react';
import {
  X,
  HelpCircle,
  ShieldCheck,
  GraduationCap,
  FileText,
  Sparkles,
} from 'lucide-react';

interface AboutModalProps {
  onClose: () => void;
  anosTexto?: string;
}

export const AboutModal: React.FC<AboutModalProps> = ({ onClose, anosTexto }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-[20px] bg-white border border-line shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line p-4 sm:p-5 bg-navy text-white">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gold/20 text-gold">
              <HelpCircle className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                Como Calculamos as Estimativas
              </h3>
              <p className="text-xs text-[#C5D2E6]">
                Metodologia, segurança e transparência
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-full p-1.5 text-[#C5D2E6] hover:bg-white/10 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-sm text-ink">
          {/* Metodologia de Cálculo */}
          <section className="space-y-2.5">
            <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-navy">
              <Sparkles className="w-4 h-4 text-gold" />
              1. Base de Dados e Simulação Monte Carlo
            </h4>
            <p className="text-xs text-muted leading-relaxed">
              O simulador executa <strong>5.000 iterações estocásticas (Método de Monte Carlo)</strong> diretamente no seu navegador para cada curso e cota. O modelo projeta a nota de corte a partir do histórico oficial {anosTexto ? `(${anosTexto})` : 'dos anos anteriores'} das EEEPs de Cascavel, Beberibe e Pindoretama com <strong>piso prudencial inviolável</strong> (a estimativa nunca fica abaixo do último edital realizado, protegendo contra falso otimismo) e calcula três referências seguras:
            </p>

            <div className="grid grid-cols-1 gap-1.5 pt-1">
              <div className="rounded-xl bg-page p-2 border border-line text-xs">
                <strong className="text-ink">1. Limiar de Espera (≥ 25%):</strong> nota mínima para ter viabilidade matemática real em vagas remanescentes e desistências.
              </div>
              <div className="rounded-xl bg-page p-2 border border-line text-xs">
                <strong className="text-navy">2. Corte Estimado:</strong> valor de referência com piso no último edital e ponderação histórica.
              </div>
              <div className="rounded-xl bg-emerald-50/80 p-2 border border-emerald-200/80 text-xs">
                <strong className="text-emerald-800">3. Nota Segura (≥ 85%):</strong> nota em que 85% dos cenários simulados garantem aprovação direta na 1ª chamada.
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 pt-1">
              <div className="rounded-xl bg-[#ddf3e9]/70 p-2.5 border border-[#c1e7d6] text-xs">
                <strong className="text-[#0b5f45]">Chance muito alta (≥ 85%):</strong> sua média supera as estimativas com ampla margem de aprovação direta.
              </div>
              <div className="rounded-xl bg-[#e4ecff]/70 p-2.5 border border-[#ccdcfc] text-xs">
                <strong className="text-[#1a45b8]">Boa chance (60% a 84%):</strong> média favorável e competitiva para convocação na primeira chamada ou início da lista.
              </div>
              <div className="rounded-xl bg-[#ffe8c7]/70 p-2.5 border border-[#fed69b] text-xs">
                <strong className="text-[#7a3a00]">Chance moderada (25% a 59%):</strong> sua média está próxima da estimativa, com chance real de convocação na lista de espera (vagas remanescentes).
              </div>
              <div className="rounded-xl bg-[#ffe1e6]/70 p-2.5 border border-[#ffccd5] text-xs">
                <strong className="text-[#9b1329]">Chance baixa (&lt; 25%):</strong> média abaixo da estimativa projetada e dos anos anteriores.
              </div>
            </div>
            <p className="text-[11px] text-muted italic">
              * O cálculo é 100% determinístico e reproduzível no seu aparelho, sem variações entre telas. Cursos com 1 ano de histórico recebem intervalo de confiança ajustado.
            </p>
          </section>

          {/* Privacidade e Segurança */}
          <section className="space-y-2 rounded-xl bg-emerald-50/60 border border-emerald-200/60 p-3.5">
            <h4 className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              2. Privacidade Total (100% Offline)
            </h4>
            <p className="text-xs text-emerald-950/80 leading-relaxed">
              Nenhum dado pessoal, nome ou nota sai do seu dispositivo. Todos os cálculos são feitos localmente no seu navegador, sem envio para servidores externos, em total conformidade com a LGPD.
            </p>
          </section>

          {/* Aviso Legal */}
          <section className="space-y-1.5 rounded-xl bg-page p-3.5 border border-line">
            <h4 className="flex items-center gap-1.5 text-xs font-bold text-ink">
              <FileText className="w-4 h-4 text-navy" />
              3. Aviso Legal e Independência
            </h4>
            <p className="text-xs text-muted leading-relaxed">
              Ferramenta educacional independente, baseada nos editais públicos da SEDUC-CE. Não substitui as publicações e convocações oficiais da Secretaria da Educação do Ceará.
            </p>
          </section>

          {/* Autoria */}
          <div className="pt-3 border-t border-line flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-navy" />
              <span className="font-semibold text-ink">
                Desenvolvido por: <strong className="text-navy">Prof. Me. Flávio Jussiê</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-full bg-navy text-white text-xs font-semibold hover:bg-navy-2 transition"
            >
              Entendi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

