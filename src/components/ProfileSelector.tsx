import React from 'react';
import {
  MapPin,
  Info,
  Building2,
  CheckSquare,
  Square,
  Sparkles,
  Home,
  School,
  ShieldCheck,
  Accessibility,
} from 'lucide-react';
import { ESCOLAS_EEEP, MODALIDADES_CONFIG } from '../data/courses';
import { MunicipioResidencia, PerfilAluno } from '../types/eeep';
import { hasProximityForSchool, determineModalidadeForSchool } from '../utils/engine';

interface ProfileSelectorProps {
  perfil: PerfilAluno;
  onChangePerfil: (updated: Partial<PerfilAluno>) => void;
}

/** Chip pill do protótipo: selecionado = Navy sólido; livre = branco com borda #8A95A6. */
const chip = (on: boolean) =>
  `min-h-[44px] rounded-full border-[1.5px] px-4 text-[15px] font-semibold transition-all ${
    on
      ? 'border-navy bg-navy text-white'
      : 'border-line-strong bg-white text-navy hover:border-navy'
  }`;

export const ProfileSelector: React.FC<ProfileSelectorProps> = ({
  perfil,
  onChangePerfil,
}) => {
  const toggleEscola = (escolaId: string) => {
    const current = [...perfil.escolasSelecionadas];
    const exists = current.includes(escolaId);
    let updated: string[];
    if (exists) {
      if (current.length === 1) return; // keep at least 1
      updated = current.filter((id) => id !== escolaId);
    } else {
      updated = [...current, escolaId];
    }
    onChangePerfil({ escolasSelecionadas: updated });
  };

  const selectAllEscolas = () => {
    onChangePerfil({
      escolasSelecionadas: ESCOLAS_EEEP.map((e) => e.id),
    });
  };

  // Find school corresponding to student's municipality
  const escolaDoMunicipio = ESCOLAS_EEEP.find(
    (e) => e.municipio.toLowerCase() === perfil.municipioResidencia.toLowerCase()
  );

  return (
    <section className="rounded-[20px] bg-white p-4 sm:p-5 border border-line/60 shadow-xs">
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-navy text-sm font-bold text-white"
        >
          1
        </span>
        <h2 className="font-display text-xl font-bold text-ink">
          Sobre você
        </h2>
      </div>
      <p className="mt-2 text-sm leading-snug text-muted">
        Qualquer estudante do Ceará pode se inscrever. A cota de proximidade atende quem mora no município da escola e em bairro atendido pelo edital; para os demais, aplica-se a ampla concorrência.
      </p>

      {/* Escolas em Avaliação */}
      <div className="mt-5">
        <div className="flex items-center justify-between gap-2">
          <label className="text-[15px] font-semibold text-ink">
            Escolas EEEP alvo ({perfil.escolasSelecionadas.length} de {ESCOLAS_EEEP.length})
          </label>
          <button
            type="button"
            onClick={selectAllEscolas}
            className="inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-line-strong bg-white px-3 py-1.5 text-xs font-semibold text-navy transition hover:border-navy"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Marcar as 3
          </button>
        </div>

        <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-3 gap-2">
          {ESCOLAS_EEEP.map((escola) => {
            const isSelected = perfil.escolasSelecionadas.includes(escola.id);
            const isProx = hasProximityForSchool(
              perfil.municipioResidencia,
              perfil.moraProximidade,
              escola.id,
              perfil.escolaProximidadeOverrides
            );
            const modalidadeEscola = determineModalidadeForSchool(
              perfil.origemEscola,
              isProx,
              perfil.isPCD
            );
            const modInfo = MODALIDADES_CONFIG[modalidadeEscola];
            const isHometown =
              escola.municipio.toLowerCase() === perfil.municipioResidencia.toLowerCase();

            return (
              <button
                key={escola.id}
                type="button"
                onClick={() => toggleEscola(escola.id)}
                className={`relative flex flex-col justify-between rounded-[14px] border-[1.5px] p-3 text-left transition-all ${
                  isSelected
                    ? 'border-navy bg-white shadow-2xs'
                    : 'border-line bg-page/50 opacity-60 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between gap-1 w-full mb-1">
                  <span className="text-[13px] font-bold text-ink leading-tight">
                    {escola.municipio}
                  </span>
                  <div className="text-navy flex-none">
                    {isSelected ? (
                      <CheckSquare className="h-4 w-4" />
                    ) : (
                      <Square className="h-4 w-4 text-line-strong" />
                    )}
                  </div>
                </div>
                <div className="text-[11px] text-muted truncate">
                  {escola.nome.replace('EEEP ', '')}
                </div>
                <div className="mt-2 flex items-center justify-between gap-1 pt-1.5 border-t border-line/60">
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${modInfo.badgeColor}`}
                  >
                    {modInfo.shortLabel}
                  </span>
                  {isHometown && (
                    <span className="text-[9px] font-bold text-navy bg-gold/30 px-1.5 py-0.5 rounded">
                      Sua Cidade
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Município de origem */}
      <div className="mt-5">
        <label className="mb-2.5 block text-[15px] font-semibold text-ink">
          <Home className="mr-1.5 inline h-4 w-4 text-navy" />
          Onde você mora?
        </label>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { key: 'cascavel', label: 'Cascavel' },
              { key: 'beberibe', label: 'Beberibe' },
              { key: 'pindoretama', label: 'Pindoretama' },
              { key: 'outro', label: 'Outro município do CE' },
            ] as { key: MunicipioResidencia; label: string }[]
          ).map((mun) => (
            <button
              key={mun.key}
              type="button"
              aria-pressed={perfil.municipioResidencia === mun.key}
              onClick={() =>
                onChangePerfil({
                  municipioResidencia: mun.key,
                  moraProximidade: false,
                  escolaProximidadeOverrides: {},
                })
              }
              className={chip(perfil.municipioResidencia === mun.key)}
            >
              {mun.label}
            </button>
          ))}
        </div>
        <p className="mt-2.5 text-sm leading-snug text-muted">
          {perfil.municipioResidencia !== 'outro'
            ? 'Se você morar em bairro atendido pela cota, ative a opção abaixo para ver as notas de proximidade.'
            : 'Candidatos de outros municípios do Ceará concorrem pela ampla concorrência em todas as escolas.'}
        </p>
      </div>

      {/* Rede de Ensino */}
      <div className="mt-5">
        <label className="mb-2.5 block text-[15px] font-semibold text-ink">
          <School className="mr-1.5 inline h-4 w-4 text-navy" />
          Onde você cursou o ensino fundamental?
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { key: 'publica', label: 'Escola pública', sub: '80% das vagas' },
              { key: 'particular', label: 'Escola particular', sub: '20% das vagas' },
            ] as const
          ).map((op) => {
            const on = perfil.origemEscola === op.key;
            return (
              <button
                key={op.key}
                type="button"
                aria-pressed={on}
                onClick={() => onChangePerfil({ origemEscola: op.key })}
                className={`flex min-h-[56px] flex-col items-center justify-center gap-0.5 rounded-[14px] border-[1.5px] px-2.5 py-2 text-center transition-all ${
                  on
                    ? 'border-navy bg-navy text-white'
                    : 'border-line-strong bg-white text-navy hover:border-navy'
                }`}
              >
                <span className="text-[15px] font-semibold">{op.label}</span>
                <span className={`text-xs font-medium ${on ? 'text-white/80' : 'text-muted'}`}>
                  {op.sub}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cota de Proximidade */}
      {perfil.municipioResidencia !== 'outro' && escolaDoMunicipio && (
        <div
          onClick={() => onChangePerfil({ moraProximidade: !perfil.moraProximidade })}
          className={`mt-5 rounded-[14px] border-[1.5px] p-4 cursor-pointer transition-all ${
            perfil.moraProximidade
              ? 'border-navy bg-navy/5 shadow-xs'
              : 'border-line bg-page hover:border-line-strong'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-semibold text-ink">
                Você mora em bairro da cota de proximidade?
              </div>
              <p className="mt-1 text-[13px] leading-snug text-muted">
                O edital da {escolaDoMunicipio.nome} destina cotas exclusivas (~25% das vagas) para estudantes dos bairros do entorno de {escolaDoMunicipio.municipio}.
              </p>
            </div>
            {/* Single Toggle Switch */}
            <button
              type="button"
              role="switch"
              aria-checked={perfil.moraProximidade}
              aria-label="Ativar cota de proximidade"
              onClick={(e) => {
                e.stopPropagation();
                onChangePerfil({ moraProximidade: !perfil.moraProximidade });
              }}
              className={`relative inline-flex h-7 w-12 flex-none cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                perfil.moraProximidade ? 'bg-navy' : 'bg-gray-300'
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  perfil.moraProximidade ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          <p className="mt-2.5 flex items-start gap-1.5 text-[13px] leading-snug text-muted">
            <Info className="mt-0.5 h-3.5 w-3.5 flex-none text-line-strong" />
            <span>
              <strong>Importante:</strong> ao simular vagas nas EEEPs das outras cidades, você concorrerá na <strong>Ampla Concorrência</strong> daquelas escolas.
            </span>
          </p>
        </div>
      )}
      {perfil.municipioResidencia === 'outro' && (
        <div className="mt-5 rounded-[14px] border-[1.5px] border-line bg-page p-4">
          <p className="text-sm leading-snug text-muted-2">
            Como você reside fora de Cascavel, Beberibe e Pindoretama, sua inscrição nas 3 EEEPs concorrerá integralmente pelas vagas de <strong>Ampla Concorrência</strong> (da rede pública ou particular).
          </p>
        </div>
      )}

      {/* PCD */}
      <div
        onClick={() => onChangePerfil({ isPCD: !perfil.isPCD })}
        className={`mt-5 flex items-center justify-between gap-3 rounded-[14px] border-[1.5px] p-3.5 cursor-pointer transition-all ${
          perfil.isPCD
            ? 'border-navy bg-navy/5 shadow-xs'
            : 'border-line bg-page hover:border-line-strong'
        }`}
      >
        <div className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5 text-[15px] font-semibold text-ink">
            <Accessibility className="h-4 w-4 text-navy" />
            Candidato com deficiência (PCD)
          </span>
          <p className="mt-0.5 text-[13px] leading-snug text-muted">
            2 vagas reservadas por turma, com laudo médico.
          </p>
        </div>
        {/* Single Toggle Switch */}
        <button
          type="button"
          role="switch"
          aria-checked={perfil.isPCD}
          aria-label="Ativar cota PCD"
          onClick={(e) => {
            e.stopPropagation();
            onChangePerfil({ isPCD: !perfil.isPCD });
          }}
          className={`relative inline-flex h-7 w-12 flex-none cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            perfil.isPCD ? 'bg-navy' : 'bg-gray-300'
          }`}
        >
          <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
              perfil.isPCD ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </section>
  );
};
