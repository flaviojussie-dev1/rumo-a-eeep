import React, { useState } from 'react';
import { Download, Share2, PlusSquare, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ variant?: 'compact' | 'full' }> = ({
  variant = 'compact',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, do not render
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        aria-label="Instalar aplicativo"
        className={`inline-flex items-center gap-1.5 rounded-[10px] bg-folgado-fill font-medium text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition-all ${
          variant === 'full'
            ? 'w-full justify-center px-4 py-2.5 text-sm'
            : 'px-3 py-1.5 text-xs'
        }`}
      >
        <Download className="w-4 h-4 shrink-0" />
        <span>Instalar App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`inline-flex items-center gap-1.5 rounded-[10px] border border-emerald-600/30 bg-folgado-bg font-medium text-folgado-fg hover:bg-folgado-bg active:scale-95 transition-all ${
            variant === 'full'
              ? 'w-full justify-center px-4 py-2.5 text-sm'
              : 'px-3 py-1.5 text-xs'
          }`}
        >
          <Download className="w-4 h-4 shrink-0" />
          <span>Instalar no iPhone</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-[20px] bg-white border border-line p-6 shadow-2xl relative">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 text-muted hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-[14px] bg-folgado-fill flex items-center justify-center text-white font-bold shadow-md">
                  <img src="/icon.svg" alt="Rumo à EEEP" className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-ink">
                    Instalar Rumo à EEEP
                  </h3>
                  <p className="text-xs text-muted">
                    Acesso rápido direto da sua tela inicial
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-sm text-ink bg-page p-4 rounded-[14px] border border-line">
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 bg-folgado-bg rounded-[10px] text-folgado-fill shrink-0">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <span>
                    1. No navegador Safari, toque no botão <strong>Compartilhar</strong> (ícone na barra inferior).
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 bg-folgado-bg rounded-[10px] text-folgado-fill shrink-0">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <span>
                    2. Role as opções e selecione <strong>Adicionar à Tela de Início</strong>.
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-[14px] bg-navy py-2.5 text-sm font-semibold text-white hover:opacity-90 transition"
              >
                Entendi
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
