/**
 * ConsentBanner Component - Epic 19
 *
 * GDPR/CCPA compliant consent banner with granular preferences,
 * just-in-time prompts, and comprehensive consent management.
 *
 * Part of Epic 19 - Data Protection & Privacy Controls
 */
import React from 'react';

}
interface ConsentBannerProps {
    onConsentUpdate?: (consents: ConsentPreferences) => void;
    onClose?: () => void;
    country?: string;
    language?: string;
    theme?: 'light' | 'dark' | 'auto';
    position?: 'top' | 'bottom' | 'overlay' | 'modal';
    showRejectButton?: boolean;
    showCustomizeButton?: boolean;
    autoHide?: boolean;
    respectDoNotTrack?: boolean;


}
interface ConsentPreferences {
    essential: boolean;
    functional: boolean;
    analytics: boolean;
    marketing: boolean;
    advertising: boolean;
    socialMedia: boolean;
    personalization: boolean;


declare const ConsentBanner: React.FC<ConsentBannerProps>;
export default ConsentBanner;
//# sourceMappingURL=ConsentBanner.d.ts.map
}