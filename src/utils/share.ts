/**
 * Utilitário de compartilhamento com fallback robusto para WhatsApp e Web Share API.
 * Funciona perfeitamente em navegadores mobile, desktop e PWA instalado.
 */

export async function shareContent({
  title,
  text,
  url,
}: {
  title: string;
  text: string;
  url?: string;
}): Promise<boolean> {
  const fullText = url ? `${text}\n\n🔗 ${url}` : text;

  // 1. Tenta a API nativa de compartilhamento (iOS Safari, Android Chrome, PWA)
  // Permite selecionar WhatsApp, Telegram, copiar link, etc. sem bloqueador de popup.
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({
        title,
        text: fullText,
      });
      return true;
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        // Usuário apenas fechou o modal de compartilhamento nativo
        return false;
      }
      // Se falhou por outro motivo (ex: texto longo demais), continua para o fallback
    }
  }

  // 2. Fallback direto para WhatsApp via https://wa.me/?text=...
  const encoded = encodeURIComponent(fullText);
  const waUrl = `https://wa.me/?text=${encoded}`;

  try {
    const a = document.createElement('a');
    a.href = waUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return true;
  } catch {
    // 3. Fallback de redirecionamento se window.open/click falharem
    window.location.href = waUrl;
    return true;
  }
}
