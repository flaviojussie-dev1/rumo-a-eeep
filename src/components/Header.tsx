import React from 'react';
import { HelpCircle, RotateCcw } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  effectiveNota?: number;
  onOpenEditalGuide: () => void;
  onReset: () => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

/** Barra superior fixa (Navy + Brand + Ações rápidas). */
export const Header: React.FC<HeaderProps> = ({
  onOpenEditalGuide,
  onReset,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-navy text-white">
      <div className="mx-auto flex max-w-[560px] items-center gap-3 px-4 py-2.5">
        {/* Brand Icon */}
        <img
          src="./icon.svg"
          alt="Rumo à EEEP"
          className="h-9 w-9 flex-none rounded-[10px] shadow-sm object-contain"
        />
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-lg font-bold leading-[1.1] text-white">
            Rumo à EEEP
          </h1>
          <p className="mt-0.5 text-xs leading-none text-[#C5D2E6]">
            Simulador do processo seletivo
          </p>
        </div>

        {/* Ações */}
        <div className="flex flex-none items-center gap-1.5 sm:gap-2">
          <button
            onClick={onOpenEditalGuide}
            aria-label="Guia do Edital e Regras"
            title="Guia do Edital e Regras"
            className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full text-[#C5D2E6] transition hover:bg-navy-2 hover:text-white"
          >
            <HelpCircle className="h-5 w-5" />
          </button>

          <button
            onClick={onReset}
            aria-label="Limpar formulário e reiniciar"
            className="flex h-11 w-11 items-center justify-center rounded-full text-[#C5D2E6] transition hover:bg-navy-2 hover:text-white"
          >
            <RotateCcw className="h-5 w-5" />
          </button>

          <PWAInstallButton />
        </div>
      </div>
    </header>
  );
};
