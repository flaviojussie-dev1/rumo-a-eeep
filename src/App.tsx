/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { GraduationCap, HelpCircle } from 'lucide-react';
import { AboutModal } from './components/AboutModal';
import { CourseDetailModal } from './components/CourseDetailModal';
import { EditalGuideModal } from './components/EditalGuideModal';
import { GradeInputSection } from './components/GradeInputSection';
import { Header } from './components/Header';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ProfileSelector } from './components/ProfileSelector';
import { ReportShareModal } from './components/ReportShareModal';
import { ResultsDashboard } from './components/ResultsDashboard';
import { SensitivitySimulatorModal } from './components/SensitivitySimulatorModal';
import { ESCOLAS_EEEP } from './data/courses';
import { BoletimCompleto, CursoData, PerfilAluno } from './types/eeep';
import {
  calculateBoletimSummary,
  createEmptyBoletim,
  createPresetBoletim,
  determineModalidadeForSchool,
  getUnifiedRankedChances,
  hasProximityForSchool,
  simulateAllSelectedEscolas,
} from './utils/engine';

export default function App() {
  // Profile and multi-school selection state
  // Profile and multi-school selection state with device localStorage persistence
  const [perfil, setPerfil] = useState<PerfilAluno>(() => {
    const defaultPerfil: PerfilAluno = {
      origemEscola: 'publica',
      municipioResidencia: 'outro',
      moraProximidade: false,
      isPCD: false,
      modalidadeSelecionada: 'pub_ampla',
      escolasSelecionadas: ['edson_queiroz', 'pedro_queiroz', 'jose_carlos_reboucas'],
      escolaProximidadeOverrides: {},
      modoNota: 'rapido',
      notaRapida: '',
      planoCursos: [],
    };
    if (typeof window !== 'undefined') {
      try {
        const savedPerfil = localStorage.getItem('eeep_perfil');
        if (savedPerfil) {
          const parsed = JSON.parse(savedPerfil);
          // Don't restore legacy default 9.15 if user didn't explicitly set it
          if (parsed.notaRapida === '9.15') parsed.notaRapida = '';
          return { ...defaultPerfil, ...parsed };
        }
        const legacyPlan = localStorage.getItem('eeep_plano');
        if (legacyPlan) {
          defaultPerfil.planoCursos = JSON.parse(legacyPlan);
        }
      } catch {
        // ignore parse errors
      }
    }
    return defaultPerfil;
  });

  // 36-grade matrix state with device localStorage persistence
  const [boletim, setBoletim] = useState<BoletimCompleto>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedBoletim = localStorage.getItem('eeep_boletim');
        if (savedBoletim) {
          return JSON.parse(savedBoletim);
        }
      } catch {
        // ignore
      }
    }
    return createEmptyBoletim();
  });

  // Automatically save perfil, grades, and plan to device localStorage (100% offline & LGPD compliant)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('eeep_perfil', JSON.stringify(perfil));
        if (perfil.planoCursos) {
          localStorage.setItem('eeep_plano', JSON.stringify(perfil.planoCursos));
        }
      } catch {
        // ignore storage errors
      }
    }
  }, [perfil]);

  // Automatically save full 36-grade boletim to device localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('eeep_boletim', JSON.stringify(boletim));
      } catch {
        // ignore storage errors
      }
    }
  }, [boletim]);

  // Modals state
  const [isEditalGuideOpen, setIsEditalGuideOpen] = useState(false);
  const [isSensitivityOpen, setIsSensitivityOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [selectedCourseDetail, setSelectedCourseDetail] = useState<CursoData | null>(null);

  // Real-time calculation of grades
  const summary = useMemo(() => {
    return calculateBoletimSummary(boletim);
  }, [boletim]);

  // Determine effective grade for the simulation
  const effectiveNota = useMemo(() => {
    if (perfil.modoNota === 'rapido') {
      const trimmed = String(perfil.notaRapida || '').trim();
      if (!trimmed) return 0;
      const val = parseFloat(trimmed.replace(',', '.'));
      if (isNaN(val) || val <= 0) return 0;
      return Math.min(10, Math.max(0, Number(val.toFixed(2))));
    } else {
      if (summary.notasPreenchidas === 0) return 0;
      return summary.mediaFinal;
    }
  }, [perfil.modoNota, perfil.notaRapida, summary.notasPreenchidas, summary.mediaFinal]);

  // Run multi-school statistical simulation
  const escolaResults = useMemo(() => {
    return simulateAllSelectedEscolas(effectiveNota, perfil);
  }, [effectiveNota, perfil]);

  // Unified ranking of all course-school combinations
  const unifiedResults = useMemo(() => {
    return getUnifiedRankedChances(escolaResults);
  }, [escolaResults]);

  // Dynamic range text for loaded historical datasets (e.g. "2024 a 2026")
  const anosHistoricosTexto = useMemo(() => {
    const yrs = Array.from(
      new Set(unifiedResults.flatMap((r) => Object.keys(r.cortesPorAno || {}).map(Number)))
    ).sort((a, b) => a - b);
    if (yrs.length > 1) return `${yrs[0]} a ${yrs[yrs.length - 1]}`;
    if (yrs.length === 1) return `${yrs[0]}`;
    return '';
  }, [unifiedResults]);

  // Handler for profile changes
  const handleUpdatePerfil = (partial: Partial<PerfilAluno>) => {
    setPerfil((prev) => ({
      ...prev,
      ...partial,
    }));
  };

  // Toggle course in "Meu Plano" (max 3 options)
  const handleTogglePlan = (courseUniqueId: string) => {
    setPerfil((prev) => {
      const current = prev.planoCursos || [];
      if (current.includes(courseUniqueId)) {
        return {
          ...prev,
          planoCursos: current.filter((id) => id !== courseUniqueId),
        };
      }
      if (current.length >= 3) {
        // replace the 3rd or cycle
        return {
          ...prev,
          planoCursos: [...current.slice(0, 2), courseUniqueId],
        };
      }
      return {
        ...prev,
        planoCursos: [...current, courseUniqueId],
      };
    });
  };

  // Reset all fields and clear device storage
  const handleReset = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('eeep_perfil');
        localStorage.removeItem('eeep_boletim');
        localStorage.removeItem('eeep_plano');
      } catch {
        // ignore
      }
    }
    setPerfil({
      origemEscola: 'publica',
      municipioResidencia: 'outro',
      moraProximidade: false,
      isPCD: false,
      modalidadeSelecionada: 'pub_ampla',
      escolasSelecionadas: ['edson_queiroz', 'pedro_queiroz', 'jose_carlos_reboucas'],
      escolaProximidadeOverrides: {},
      modoNota: 'rapido',
      notaRapida: '',
      planoCursos: [],
    });
    setBoletim(createEmptyBoletim());
  };

  const handleApplySimulatedNota = (newNota: number) => {
    setPerfil((prev) => ({
      ...prev,
      modoNota: 'rapido',
      notaRapida: newNota.toFixed(2),
    }));
  };

  return (
    <div className="min-h-screen bg-page text-ink flex flex-col">
      {/* Offline Connectivity Notification */}
      <OfflineIndicator />

      {/* Header with sticky Media badge */}
      <Header
        effectiveNota={effectiveNota}
        onOpenEditalGuide={() => setIsEditalGuideOpen(true)}
        onReset={handleReset}
      />

      {/* Main Content Container — coluna única mobile-first (protótipo 560px) */}
      <main className="mx-auto w-full max-w-[560px] px-3.5 sm:px-4 pt-3 pb-4 flex-1 space-y-3.5">
        {/* Intro Hero */}
        <div className="pt-4 pb-1">
          <h2 className="font-display font-extrabold text-[30px] text-ink leading-[1.1] tracking-[-0.02em]">
            Em quais EEEPs você tem chance?
          </h2>
          <p className="text-base text-muted-2 mt-2.5 leading-normal">
            Compare sua média com o corte de cada curso em Cascavel, Beberibe e Pindoretama.
          </p>
        </div>

        {/* Step 1: School Multi-Selection & Quotas */}
        <ProfileSelector perfil={perfil} onChangePerfil={handleUpdatePerfil} />

        {/* Step 2: Grade Input (Fast 48px tactile or 36-Grade Matrix) */}
        <GradeInputSection
          perfil={perfil}
          boletim={boletim}
          summary={summary}
          onChangePerfil={handleUpdatePerfil}
          onChangeBoletim={setBoletim}
        />

        {/* Step 3: Multi-School Simulation Results Dashboard with Visual Ruler */}
        <ResultsDashboard
          notaFinal={effectiveNota}
          escolaResults={escolaResults}
          unifiedResults={unifiedResults}
          perfil={perfil}
          onOpenCourseDetail={(curso) => setSelectedCourseDetail(curso)}
          onOpenReport={() => setIsReportOpen(true)}
          onOpenSensitivity={() => setIsSensitivityOpen(true)}
        />
      </main>

      {/* Modals */}
      {isEditalGuideOpen && (
        <EditalGuideModal onClose={() => setIsEditalGuideOpen(false)} />
      )}

      {isSensitivityOpen && (
        <SensitivitySimulatorModal
          currentNota={effectiveNota}
          perfil={perfil}
          onClose={() => setIsSensitivityOpen(false)}
          onApplyNota={handleApplySimulatedNota}
        />
      )}

      {isReportOpen && (
        <ReportShareModal
          notaFinal={effectiveNota}
          modalidade={perfil.modalidadeSelecionada}
          summary={summary}
          results={unifiedResults}
          onClose={() => setIsReportOpen(false)}
        />
      )}

      <CourseDetailModal
        curso={selectedCourseDetail}
        onClose={() => setSelectedCourseDetail(null)}
      />

      {/* Rodapé Dark Navy Slim */}
      <footer className="mt-8 w-full bg-navy py-3 border-t border-navy-2 text-white">
        <div className="mx-auto flex max-w-[560px] items-center justify-center gap-2 px-4 text-xs text-[#C5D2E6]">
          <GraduationCap className="h-4 w-4 text-gold flex-none" />
          <span>
            Desenvolvido por: <strong className="font-semibold text-white">Prof. Me. Flávio Jussiê</strong>
          </span>
          <button
            type="button"
            onClick={() => setIsAboutOpen(true)}
            aria-label="Informações sobre estimativas e privacidade"
            title="Como calculamos as estimativas"
            className="flex h-6 w-6 items-center justify-center rounded-full text-[#C5D2E6] hover:text-white hover:bg-white/15 transition active:scale-95 ml-0.5"
          >
            <HelpCircle className="h-3.5 w-3.5 text-gold" />
          </button>
        </div>
      </footer>

      {isAboutOpen && (
        <AboutModal
          onClose={() => setIsAboutOpen(false)}
          anosTexto={anosHistoricosTexto}
        />
      )}
    </div>
  );
}
