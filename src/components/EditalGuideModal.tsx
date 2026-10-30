import React from 'react';
import {
  X,
  FileCheck2,
  BookOpen,
  Users2,
  CheckCircle2,
} from 'lucide-react';
import { DISCIPLINAS_CONFIG } from '../data/courses';

interface EditalGuideModalProps {
  onClose: () => void;
}

export const EditalGuideModal: React.FC<EditalGuideModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl rounded-[20px] bg-white border border-line shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line p-5 bg-folgado-bg">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[14px] bg-folgado-fill text-white shadow-sm">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-ink">
                Guia Oficial do Edital EEEP (Ceará)
              </h3>
              <p className="text-xs text-muted">
                Regras de cálculo, cotas de vagas e documentação obrigatória
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

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-ink">
          {/* Section 1: Calculation formula */}
          <section className="rounded-[14px] border border-line p-4 bg-page/70">
            <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-folgado-fg mb-2">
              <BookOpen className="w-4 h-4" />
              1. Cálculo Oficial da Média Final (4 Anos × 9 Matérias)
            </h4>
            <p className="text-xs text-muted mb-3">
              O processo seletivo das Escolas Estaduais de Educação Profissional avalia o desempenho dos 4 anos finais do Ensino Fundamental (<strong>6º, 7º, 8º e 9º Anos</strong>) nas seguintes 9 disciplinas obrigatórias:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-medium">
              {DISCIPLINAS_CONFIG.map((d, i) => (
                <div
                  key={d.key}
                  className="p-2 rounded-[10px] border bg-white border-line text-ink"
                >
                  {i + 1}. {d.label}
                </div>
              ))}
            </div>

            <div className="mt-3 rounded-[10px] bg-folgado-bg p-2.5 text-xs text-folgado-fg font-medium">
              Fórmula: <code className="font-mono font-bold">Média Final = (Soma das 36 Notas) ÷ 36</code>. A nota final é calculada com duas casas decimais com arredondamento padrão do edital.
            </div>
          </section>

          {/* Section 2: Distribution of Vacancies (Turma de 45) */}
          <section className="rounded-[14px] border border-line p-4 bg-page/70">
            <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink mb-2">
              <Users2 className="w-4 h-4 text-folgado-fill" />
              2. Distribuição das Vagas por Turma (45 Vagas)
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-start justify-between p-2 rounded-[10px] bg-white border border-line">
                <div>
                  <strong className="text-ink">
                    Escola Pública (80% das vagas = 36 vagas)
                  </strong>
                  <p className="text-muted text-[11px]">
                    Subdivididas em Ampla Concorrência (~24 a 26 vagas) e Cota de Proximidade (~10 a 12 vagas para residentes do entorno da escola).
                  </p>
                </div>
              </div>

              <div className="flex items-start justify-between p-2 rounded-[10px] bg-white border border-line">
                <div>
                  <strong className="text-ink">
                    Escola Particular (20% das vagas = 9 vagas)
                  </strong>
                  <p className="text-muted text-[11px]">
                    Subdivididas em Ampla Particular (~6 a 7 vagas) e Proximidade Particular (~2 a 3 vagas).
                  </p>
                </div>
              </div>

              <div className="flex items-start justify-between p-2 rounded-[10px] bg-folgado-bg border border-folgado-fill/20">
                <div>
                  <strong className="text-folgado-fg">
                    Regra da Cota de Proximidade em Múltiplas Escolas
                  </strong>
                  <p className="text-muted text-[11px] mt-0.5">
                    A cota de proximidade é restrita aos bairros e distritos do município sede de cada escola. Se você mora em um bairro contemplado em Cascavel, você concorre na cota de proximidade na EEEP Edson Queiroz; contudo, se você também se inscrever na EEEP Pedro de Queiroz (Beberibe) ou EEEP Prof. José Carlos Rebouças (Pindoretama), sua inscrição nessas outras cidades será avaliada pela Ampla Concorrência, onde você disputa igualmente com todos os demais candidatos.
                  </p>
                </div>
              </div>

              <div className="flex items-start justify-between p-2 rounded-[10px] bg-white border border-line">
                <div>
                  <strong className="text-ink">
                    Reserva PCD (Até 5% = 2 vagas reservadas)
                  </strong>
                  <p className="text-muted text-[11px]">
                    Candidatos com deficiência comprovada por laudo médico recente.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Documentação para Matrícula */}
          <section className="rounded-[14px] border border-line p-4 bg-page/70">
            <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink mb-2">
              <CheckCircle2 className="w-4 h-4 text-folgado-fill" />
              3. Documentação Obrigatória para Inscrição e Matrícula
            </h4>
            <ul className="list-disc list-inside space-y-1 text-xs text-muted">
              <li>Histórico Escolar do Ensino Fundamental (ou declaração oficial de conclusão com as notas dos 4 anos);</li>
              <li>Certidão de Nascimento ou RG do estudante + CPF;</li>
              <li>RG e CPF do responsável legal;</li>
              <li>Comprovante de residência atualizado (conta de luz, água ou declaração com CEP da cota de proximidade);</li>
              <li>Laudo médico com CID (exclusivo para inscritos na cota PCD);</li>
              <li>2 fotos 3x4 recentes e cartão de vacinação atualizado.</li>
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="border-t border-line p-4 bg-page flex justify-end">
          <button
            onClick={onClose}
            className="rounded-[14px] bg-navy px-5 py-2 text-xs font-bold text-white hover:opacity-90"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
