// Epic 11 Authentication Types and Interfaces
// TypeScript types for authentication and user management
;
emailService ?  : {
    apiKey: string,
    fromEmail: string,
    fromName: string
};
Promise;
;
;
;
;
export var ChallengeType;
(function (ChallengeType) {
    ChallengeType["RECAPTCHA_V2"] = "recaptcha_v2";
    ChallengeType["RECAPTCHA_V3"] = "recaptcha_v3";
    ChallengeType["HCAPTCHA"] = "hcaptcha";
    ChallengeType["MATH_PUZZLE"] = "math_puzzle";
    ChallengeType["IMAGE_SELECTION"] = "image_selection";
    ChallengeType["TEXT_CAPTCHA"] = "text_captcha";
    ChallengeType["AUDIO_CAPTCHA"] = "audio_captcha";
    ChallengeType["SLIDER_PUZZLE"] = "slider_puzzle";
    ChallengeType["PATTERN_RECOGNITION"] = "pattern_recognition";
})(ChallengeType || (ChallengeType = {}));
export var ChallengeDifficulty;
(function (ChallengeDifficulty) {
    ChallengeDifficulty["EASY"] = "easy";
    ChallengeDifficulty["MEDIUM"] = "medium";
    ChallengeDifficulty["HARD"] = "hard";
    ChallengeDifficulty["ADAPTIVE"] = "adaptive";
})(ChallengeDifficulty || (ChallengeDifficulty = {}));
;
rules: ChallengeRule[];
escalation: {
    enabled: boolean;
    thresholds: {
        failedAttempts: number;
        timeWindow: number;
        escalateAfter: number;
    }
    ;
}
;
progressive: {
    enabled: boolean;
    stages: ProgressiveStage[];
}
;
;
escalationDelay: number;
Promise;
