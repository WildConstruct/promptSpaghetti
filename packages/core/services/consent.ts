// Simple consent checking and audit logging for 2.5a (P2 optional)

export interface ConsentSettings {
  requireConsent: boolean;
}

export interface ConsentResult {
  allowed: boolean;
  status: 'granted' | 'unclear' | 'denied';
}

export interface ConsentAssetMeta {
  id?: string;
  name?: string;
  metadata?: { consent?: boolean | 'unclear' };
}

const settings: ConsentSettings = {
  requireConsent: true
};

// Initialize from localStorage if available
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    const saved = window.localStorage.getItem('consent.require');
    if (saved === 'true' || saved === 'false') {
      settings.requireConsent = saved === 'true';
    }
  }
} catch {
  // ignore storage errors
}

export const ConsentService = {
  getSettings(): ConsentSettings {
    return { ...settings };
  },
  setRequireConsent(value: boolean) {
    settings.requireConsent = !!value;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(
          'consent.require',
          String(settings.requireConsent)
        );
      }
    } catch {
      // ignore storage errors
    }
  },
  check(asset: ConsentAssetMeta): ConsentResult {
    const flag = asset?.metadata?.consent;
    if (flag === true) return { allowed: true, status: 'granted' };
    if (flag === false)
      return { allowed: !settings.requireConsent, status: 'denied' };
    // unclear / missing
    return { allowed: !settings.requireConsent, status: 'unclear' };
  },
  audit(action: 'asset_drop', asset: ConsentAssetMeta, consent: boolean) {
    const payload = {
      action,
      asset: asset?.id || asset?.name || 'unknown',
      consent,
      timestamp: Date.now()
    };
    try {
      if (typeof window !== 'undefined' && (window as any).analyticsReporter) {
        (window as any).analyticsReporter.track('asset_drop', payload);
      } else {
        // eslint-disable-next-line no-console
        console.debug('[audit]', payload);
      }
    } catch {
      // swallow
    }
  }
};
