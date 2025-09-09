// Simple user preference persistence for Advanced Matching learning

export interface AcceptanceRecord {
  assetId: string;
  accepted: boolean;
  context: string;
  timestamp: number;
}

export interface UserPreferences {
  favoriteAssets: string[];
  rejectedAssets: string[];
  acceptanceHistory: AcceptanceRecord[];
  stylePreference?: string;
}

const KEY = 'advMatch.prefs';

export const PreferencesService = {
  load(): UserPreferences {
    try {
      const s = window?.localStorage?.getItem(KEY);
      if (!s) return { favoriteAssets: [], rejectedAssets: [], acceptanceHistory: [] };
      const parsed = JSON.parse(s);
      return {
        favoriteAssets: Array.isArray(parsed.favoriteAssets) ? parsed.favoriteAssets : [],
        rejectedAssets: Array.isArray(parsed.rejectedAssets) ? parsed.rejectedAssets : [],
        acceptanceHistory: Array.isArray(parsed.acceptanceHistory) ? parsed.acceptanceHistory : [],
        stylePreference: typeof parsed.stylePreference === 'string' ? parsed.stylePreference : undefined
      } as UserPreferences;
    } catch {
      return { favoriteAssets: [], rejectedAssets: [], acceptanceHistory: [] };
    }
  },
  save(prefs: UserPreferences) {
    try {
      window?.localStorage?.setItem(KEY, JSON.stringify(prefs));
    } catch {
      // ignore
    }
  },
  recordAcceptance(assetId: string, accepted: boolean, context: string) {
    const prefs = this.load();
    const ts = Date.now();
    prefs.acceptanceHistory.push({ assetId, accepted, context, timestamp: ts });
    if (accepted) {
      if (!prefs.favoriteAssets.includes(assetId)) prefs.favoriteAssets.push(assetId);
      // If previously rejected, remove from rejected
      prefs.rejectedAssets = prefs.rejectedAssets.filter(id => id !== assetId);
    } else {
      if (!prefs.rejectedAssets.includes(assetId)) prefs.rejectedAssets.push(assetId);
      // If previously favorite, keep but learning will reflect rejection
    }
    this.save(prefs);
    return prefs;
  }
};

