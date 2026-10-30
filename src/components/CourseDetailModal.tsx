import React from 'react';
import { X, Briefcase, GraduationCap, MapPin, BookOpen, Clock, Building2, CheckCircle } from 'lucide-react';
import { MODALIDADES_CONFIG } from '../data/courses';
import { CursoData, ModalidadeKey } from '../types/eeep';

interface CourseDetailModalProps {
  curso: CursoData | null;
  onClose: () => void;
}

export const CourseDetailModal: React.FC<CourseDetailModalProps> = ({
  curso,
  onClose,
}) => {
  if (!curso) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl rounded-[20px] bg-white border border-line shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line p-5 bg-page/50">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-folgado-fg">
              {curso.categoria} • EEEP Ensino Médio Integrado
            </span>
            <h3 className="text-xl font-black text-ink mt-0.5">
              {curso.nome}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-[10px] p-1.5 text-muted hover:bg-page:bg-navy-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-ink">
          {/* Overview text */}
          <p className="text-base leading-relaxed text-ink">
            {curso.descricao}
          </p>

          {/* Quick stats strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-[14px] border border-line/80 p-3 bg-page">
              <span className="text-[10px] text-muted block font-semibold uppercase">
                Duração Total
              </span>
              <strong className="text-sm font-bold text-ink flex items-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-folgado-fill" />
                3 Anos (4.500h)
              </strong>
            </div>

            <div className="rounded-[14px] border border-line/80 p-3 bg-page">
              <span className="text-[10px] text-muted block font-semibold uppercase">
                Regime Escolar
              </span>
              <strong className="text-sm font-bold text-ink flex items-center gap-1 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-folgado-fill" />
                Tempo Integral
              </strong>
            </div>

            <div className="rounded-[14px] border border-line/80 p-3 bg-page">
              <span className="text-[10px] text-muted block font-semibold uppercase">
                Vagas por Turma
              </span>
              <strong className="text-sm font-bold text-ink flex items-center gap-1 mt-0.5">
                <GraduationCap className="w-3.5 h-3.5 text-folgado-fill" />
                45 Alunos
              </strong>
            </div>

            <div className="rounded-[14px] border border-line/80 p-3 bg-page">
              <span className="text-[10px] text-muted block font-semibold uppercase">
                Estágio Remunerado
              </span>
              <strong className="text-sm font-bold text-folgado-fg flex items-center gap-1 mt-0.5">
                <Briefcase className="w-3.5 h-3.5" />
                Bolsa Estadual
              </strong>
            </div>
          </div>

          {/* Perfil & Mercado Ceará */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-[14px] border border-line p-4 bg-white">
              <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink mb-2">
                <GraduationCap className="w-4 h-4 text-folgado-fill" />
                Perfil do Profissional Formado
              </h4>
              <p className="text-xs leading-relaxed text-muted">
                {curso.perfilProfissional}
              </p>
            </div>

            <div className="rounded-[14px] border border-line p-4 bg-white">
              <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink mb-2">
                <MapPin className="w-4 h-4 text-folgado-fill" />
                Mercado de Trabalho no Ceará
              </h4>
              <p className="text-xs leading-relaxed text-muted">
                {curso.mercadoTrabalhoCeara}
              </p>
            </div>
          </div>

          {/* Estágio Supervisionado */}
          <div className="rounded-[14px] border border-folgado-fill/20 bg-folgado-fill/5 p-4">
            <h4 className="text-xs font-bold text-folgado-fg flex items-center gap-2 mb-1">
              <Briefcase className="w-4 h-4 text-folgado-fill" />
              Estágio Curricular Obrigatório no 3º Ano
            </h4>
            <p className="text-xs text-ink">
              {curso.estagioSupervisionado} Os alunos realizam atividades práticas diretamente em empresas, órgãos governamentais ou hospitais parceiros da SEDUC-CE, preparando para inserção imediata no mercado.
            </p>
          </div>

          {/* Disciplinas Técnicas de Destaque */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-2.5">
              Disciplinas Técnicas Principais
            </h4>
            <div className="flex flex-wrap gap-2">
              {curso.disciplinasDestaque.map((disc, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 rounded-[10px] bg-page px-3 py-1 text-xs font-medium text-ink border border-line/80"
                >
                  <BookOpen className="w-3.5 h-3.5 text-folgado-fill" />
                  {disc}
                </span>
              ))}
            </div>
          </div>

          {/* Full Historical Cutoff Breakdown */}
          <div>
            {(() => {
              const availableYears = Array.from(new Set(curso.historico.map((h) => h.ano))).sort((a, b) => a - b);
              const latestYear = availableYears[availableYears.length - 1];

              return (
                <>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-2.5">
                    Histórico Completo de Cortes por Modalidade ({availableYears.join(', ')})
                  </h4>
                  <div className="overflow-x-auto rounded-[14px] border border-line">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-page text-ink font-bold">
                        <tr>
                          <th className="p-3">Modalidade</th>
                          <th className="p-3 text-center">Vagas</th>
                          {availableYears.map((yr) => (
                            <th key={yr} className="p-3 text-center">Corte {yr}</th>
                          ))}
                          <th className="p-3 text-center">Média do Último Ano</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line">
                        {(Object.keys(MODALIDADES_CONFIG) as ModalidadeKey[]).map((mKey) => {
                          const mInfo = MODALIDADES_CONFIG[mKey];
                          const hLatest = curso.historico.find((h) => h.ano === latestYear)?.modalidades[mKey];

                          return (
                            <tr key={mKey} className="hover:bg-page/50:bg-navy-2/40">
                              <td className="p-3 font-semibold text-ink">
                                {mInfo.shortLabel}
                              </td>
                              <td className="p-3 text-center text-muted">
                                {hLatest && hLatest.vagas > 0 ? hLatest.vagas : '—'}
                              </td>
                              {availableYears.map((yr) => {
                                const hYear = curso.historico.find((h) => h.ano === yr)?.modalidades[mKey];
                                const isLatest = yr === latestYear;
                                return (
                                  <td
                                    key={yr}
                                    className={`p-3 text-center ${
                                      isLatest
                                        ? 'font-bold text-folgado-fg'
                                        : 'text-ink font-medium'
                                    }`}
                                  >
                                    {hYear && hYear.nota_corte > 0 ? hYear.nota_corte.toFixed(2) : '—'}
                                  </td>
                                );
                              })}
                              <td className="p-3 text-center text-muted">
                                {hLatest && hLatest.media_modalidade > 0 ? hLatest.media_modalidade.toFixed(2) : '—'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              );
            })()}
            {curso.notaHistorico && (
              <p className="mt-2 text-xs text-muted italic bg-page p-2.5 rounded-[10px] border border-line/60">
                ℹ️ {curso.notaHistorico}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-line p-4 bg-page flex justify-end">
          <button
            onClick={onClose}
            className="rounded-[14px] bg-navy px-5 py-2 text-xs font-bold text-white hover:opacity-90"
          >
            Fechar Detalhes
          </button>
        </div>
      </div>
    </div>
  );
};
