import type { PsgPreviewBackend } from '@promptscape/core/services/psg';

export function getPreviewBackendFingerprint(
  backend: Pick<PsgPreviewBackend, 'label' | 'model' | 'profile'>
): string {
  const profileLabel =
    backend.profile === 'scene'
      ? 'scene-oriented'
      : backend.profile === 'bootstrap'
        ? 'bootstrap-oriented'
        : null;

  return [backend.label, backend.model, profileLabel].filter(Boolean).join(' · ');
}
