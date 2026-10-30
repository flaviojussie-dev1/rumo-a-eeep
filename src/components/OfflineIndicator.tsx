import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <aside
      aria-label="Aviso de conexão"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-[14px] bg-disputa-fill/95 px-3.5 py-2 text-xs font-semibold text-white shadow-xl backdrop-blur-sm animate-bounce"
    >
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>Modo Offline — O simulador e sua calculadora continuam funcionando 100%.</span>
    </aside>
  );
};
