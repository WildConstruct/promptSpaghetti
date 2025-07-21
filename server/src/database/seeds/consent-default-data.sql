-- ===================================================================
-- Epic 19 - Consent Storage Default Data (Task E19-1753114711826-03C121)
-- Default data population for consent management system
-- GDPR/CCPA compliant default configurations and reference data
-- ===================================================================

-- ===================================================================
-- Default Consent Purposes
-- ===================================================================

INSERT INTO consent_purposes (purpose_code, name, category, description, essential_service, data_processing_details, legal_basis_options, user_benefit, business_justification, created_by) VALUES

-- Essential Services
('essential_auth', 'Authentication & Account Management', 'ESSENTIAL', 'User authentication, account creation, login sessions, and security features', TRUE, 
 '{"collectsPersonalData": true, "storesData": true, "processingMethods": ["authentication", "session_management"], "dataTypes": ["email", "password_hash", "user_id"], "retentionPeriod": "account_lifetime", "thirdPartySharing": false}',
 '["CONSENT", "CONTRACT"]',
 'Secure access to your account and protection of your data',
 'Required for user identification and account security',
 'system'),

('essential_security', 'Security & Fraud Prevention', 'ESSENTIAL', 'Security monitoring, fraud detection, abuse prevention, and system integrity', TRUE,
 '{"collectsPersonalData": true, "storesData": true, "processingMethods": ["monitoring", "analysis", "threat_detection"], "dataTypes": ["ip_address", "device_info", "behavior_patterns"], "retentionPeriod": 90, "thirdPartySharing": false}',
 '["LEGAL_OBLIGATION", "LEGITIMATE_INTERESTS"]',
 'Protection from fraud, abuse, and security threats',
 'Essential for platform security and regulatory compliance',
 'system'),

('essential_service_delivery', 'Core Service Delivery', 'ESSENTIAL', 'Basic functionality required to deliver the core service features', TRUE,
 '{"collectsPersonalData": false, "storesData": true, "processingMethods": ["service_provision"], "dataTypes": ["usage_data", "preferences"], "retentionPeriod": "service_duration", "thirdPartySharing": false}',
 '["CONTRACT", "LEGITIMATE_INTERESTS"]',
 'Access to core platform features and functionality',
 'Required to provide the service you signed up for',
 'system'),

-- Functional Services
('functional_preferences', 'User Preferences & Settings', 'FUNCTIONAL', 'Store user preferences, settings, customizations, and interface choices', FALSE,
 '{"collectsPersonalData": false, "storesData": true, "processingMethods": ["preference_storage", "customization"], "dataTypes": ["ui_preferences", "language", "timezone"], "retentionPeriod": "account_lifetime", "thirdPartySharing": false}',
 '["CONSENT"]',
 'Personalized experience with your preferred settings',
 'Enhanced user experience and reduced support requests',
 'system'),

('functional_communication', 'Service Communications', 'FUNCTIONAL', 'Essential communications about your account, service updates, and important notices', FALSE,
 '{"collectsPersonalData": true, "storesData": true, "processingMethods": ["communication", "notification"], "dataTypes": ["email", "communication_history"], "retentionPeriod": 365, "thirdPartySharing": false}',
 '["CONSENT", "LEGITIMATE_INTERESTS"]',
 'Stay informed about important account and service updates',
 'Required for user communication and service notifications',
 'system'),

('functional_support', 'Customer Support', 'FUNCTIONAL', 'Provide customer support, troubleshooting, and help desk services', FALSE,
 '{"collectsPersonalData": true, "storesData": true, "processingMethods": ["support_provision", "issue_tracking"], "dataTypes": ["contact_info", "support_history", "issue_details"], "retentionPeriod": 1095, "thirdPartySharing": false}',
 '["CONSENT", "LEGITIMATE_INTERESTS"]',
 'Get help and support when you need it',
 'Required to provide effective customer support',
 'system'),

-- Analytics Services
('analytics_usage', 'Usage Analytics', 'ANALYTICS', 'Analyze website/app usage to understand user behavior and improve our services', FALSE,
 '{"collectsPersonalData": false, "storesData": true, "processingMethods": ["analytics", "aggregation", "trend_analysis"], "dataTypes": ["page_views", "click_events", "session_data"], "retentionPeriod": 730, "thirdPartySharing": false}',
 '["CONSENT"]',
 'Help us improve the service by understanding how it is used',
 'Service improvement and user experience optimization',
 'system'),

('analytics_performance', 'Performance Monitoring', 'ANALYTICS', 'Monitor system performance, uptime, and technical metrics for service optimization', FALSE,
 '{"collectsPersonalData": false, "storesData": true, "processingMethods": ["monitoring", "performance_analysis"], "dataTypes": ["response_times", "error_rates", "system_metrics"], "retentionPeriod": 365, "thirdPartySharing": true}',
 '["CONSENT", "LEGITIMATE_INTERESTS"]',
 'Ensure reliable and fast service performance',
 'Service reliability and performance optimization',
 'system'),

('analytics_research', 'Product Research & Development', 'RESEARCH', 'Research to develop new features, improve existing functionality, and understand user needs', FALSE,
 '{"collectsPersonalData": false, "storesData": true, "processingMethods": ["research", "feature_analysis", "user_research"], "dataTypes": ["feature_usage", "feedback", "survey_responses"], "retentionPeriod": 1095, "thirdPartySharing": false}',
 '["CONSENT"]',
 'Help us build better features that meet your needs',
 'Product development and innovation based on user needs',
 'system'),

-- Marketing Services
('marketing_communication', 'Marketing Communications', 'MARKETING', 'Send newsletters, promotional emails, product updates, and marketing materials', FALSE,
 '{"collectsPersonalData": true, "storesData": true, "processingMethods": ["email_marketing", "segmentation"], "dataTypes": ["email", "marketing_preferences", "engagement_data"], "retentionPeriod": 1095, "thirdPartySharing": true}',
 '["CONSENT"]',
 'Stay informed about new features, updates, and special offers',
 'User engagement and retention through relevant communications',
 'system'),

('marketing_personalization', 'Content Personalization', 'PERSONALIZATION', 'Personalize content, recommendations, and user experience based on preferences and behavior', FALSE,
 '{"collectsPersonalData": true, "storesData": true, "processingMethods": ["personalization", "recommendation"], "dataTypes": ["behavior_data", "preferences", "interaction_history"], "retentionPeriod": 730, "thirdPartySharing": false}',
 '["CONSENT"]',
 'Get content and recommendations tailored to your interests',
 'Improved user experience through personalized content',
 'system'),

-- Advertising Services
('advertising_targeted', 'Targeted Advertising', 'ADVERTISING', 'Show relevant advertisements based on your interests and online behavior', FALSE,
 '{"collectsPersonalData": true, "storesData": true, "processingMethods": ["profiling", "ad_targeting"], "dataTypes": ["browsing_behavior", "interests", "demographics"], "retentionPeriod": 395, "thirdPartySharing": true}',
 '["CONSENT"]',
 'See advertisements that are more relevant to your interests',
 'Revenue generation through relevant advertising',
 'system'),

('advertising_measurement', 'Advertisement Measurement', 'ADVERTISING', 'Measure and analyze the effectiveness of advertising campaigns and content', FALSE,
 '{"collectsPersonalData": false, "storesData": true, "processingMethods": ["measurement", "attribution"], "dataTypes": ["ad_impressions", "click_rates", "conversion_data"], "retentionPeriod": 365, "thirdPartySharing": true}',
 '["CONSENT", "LEGITIMATE_INTERESTS"]',
 'Help us show you better ads and improve ad relevance',
 'Advertising effectiveness measurement and optimization',
 'system'),

-- Social Media Integration
('social_sharing', 'Social Media Integration', 'SOCIAL_MEDIA', 'Integration with social media platforms for sharing, login, and social features', FALSE,
 '{"collectsPersonalData": true, "storesData": true, "processingMethods": ["social_integration", "profile_linking"], "dataTypes": ["social_profile", "friends_list", "shared_content"], "retentionPeriod": 730, "thirdPartySharing": true}',
 '["CONSENT"]',
 'Easy sharing and social features integration',
 'Enhanced user engagement through social features',
 'system');

-- ===================================================================
-- Default Data Categories
-- ===================================================================

INSERT INTO data_categories (category_code, name, data_classification, sensitivity_level, description, examples, retention_requirements, special_handling, encryption_required, legal_basis_required) VALUES

-- Authentication & Identity Data
('auth_credentials', 'Authentication Credentials', 'PERSONAL_IDENTIFIABLE', 'CONFIDENTIAL', 
 'Login credentials, passwords, authentication tokens, and security keys',
 '["email addresses", "password hashes", "two-factor codes", "API tokens", "session IDs"]',
 '[{"framework": "GDPR", "period": 2555, "basis": "account_deletion"}, {"framework": "CCPA", "period": 1095, "basis": "retention_policy"}]',
 TRUE, TRUE, '["CONSENT", "CONTRACT"]'),

('identity_verification', 'Identity Verification Data', 'PERSONAL_IDENTIFIABLE', 'RESTRICTED',
 'Data used to verify user identity and prevent fraud',
 '["government ID numbers", "passport data", "driving license", "biometric data"]',
 '[{"framework": "GDPR", "period": 2555, "basis": "legal_requirement"}, {"framework": "KYC", "period": 1825, "basis": "regulatory"}]',
 TRUE, TRUE, '["LEGAL_OBLIGATION", "CONSENT"]'),

-- Personal Profile Data
('profile_basic', 'Basic Profile Information', 'PERSONAL_IDENTIFIABLE', 'CONFIDENTIAL',
 'Basic user profile information and personal details',
 '["full name", "date of birth", "phone number", "profile photo", "bio"]',
 '[{"framework": "GDPR", "period": 2190, "basis": "user_account"}, {"framework": "CCPA", "period": 1095, "basis": "business_purpose"}]',
 FALSE, TRUE, '["CONSENT", "CONTRACT"]'),

('profile_preferences', 'User Preferences & Settings', 'PREFERENCE', 'INTERNAL',
 'User preferences, settings, and customization choices',
 '["language preference", "timezone", "theme selection", "notification settings"]',
 '[{"framework": "GDPR", "period": 730, "basis": "service_provision"}, {"framework": "CCPA", "period": 365, "basis": "user_convenience"}]',
 FALSE, FALSE, '["CONSENT"]'),

-- Communication Data
('communication_contact', 'Contact Information', 'COMMUNICATION', 'CONFIDENTIAL',
 'Contact details for communication purposes',
 '["email addresses", "phone numbers", "mailing addresses", "emergency contacts"]',
 '[{"framework": "GDPR", "period": 1095, "basis": "business_relationship"}, {"framework": "CCPA", "period": 730, "basis": "customer_service"}]',
 FALSE, TRUE, '["CONSENT", "LEGITIMATE_INTERESTS"]'),

('communication_history', 'Communication History', 'COMMUNICATION', 'INTERNAL',
 'History of communications, messages, and interactions',
 '["email history", "chat logs", "support tickets", "phone call records"]',
 '[{"framework": "GDPR", "period": 1095, "basis": "customer_service"}, {"framework": "CCPA", "period": 730, "basis": "dispute_resolution"}]',
 FALSE, FALSE, '["CONSENT", "LEGITIMATE_INTERESTS"]'),

-- Behavioral Data
('behavior_usage', 'Usage Behavior', 'BEHAVIORAL', 'INTERNAL',
 'Information about how users interact with our services',
 '["page views", "click patterns", "session duration", "feature usage", "search queries"]',
 '[{"framework": "GDPR", "period": 730, "basis": "analytics"}, {"framework": "CCPA", "period": 365, "basis": "service_improvement"}]',
 FALSE, FALSE, '["CONSENT"]'),

('behavior_preferences', 'Behavioral Preferences', 'BEHAVIORAL', 'INTERNAL',
 'Inferred preferences based on user behavior and interactions',
 '["content preferences", "product interests", "usage patterns", "engagement levels"]',
 '[{"framework": "GDPR", "period": 395, "basis": "personalization"}, {"framework": "CCPA", "period": 365, "basis": "user_experience"}]',
 FALSE, FALSE, '["CONSENT"]'),

-- Technical Data
('technical_device', 'Device & Technical Information', 'TECHNICAL', 'INTERNAL',
 'Technical information about devices and systems used to access our services',
 '["IP addresses", "browser type", "device ID", "operating system", "screen resolution"]',
 '[{"framework": "GDPR", "period": 365, "basis": "security"}, {"framework": "CCPA", "period": 365, "basis": "fraud_prevention"}]',
 FALSE, FALSE, '["LEGITIMATE_INTERESTS"]'),

('technical_performance', 'Performance & Analytics Data', 'TECHNICAL', 'PUBLIC',
 'Aggregated and anonymized data about system performance and usage',
 '["response times", "error rates", "usage statistics", "performance metrics"]',
 '[{"framework": "GDPR", "period": 1095, "basis": "service_improvement"}, {"framework": "CCPA", "period": 730, "basis": "analytics"}]',
 FALSE, FALSE, '["LEGITIMATE_INTERESTS"]'),

-- Financial Data
('financial_payment', 'Payment Information', 'FINANCIAL', 'RESTRICTED',
 'Payment methods, billing information, and transaction data',
 '["credit card details", "bank account info", "payment history", "billing address"]',
 '[{"framework": "PCI_DSS", "period": 1095, "basis": "compliance"}, {"framework": "GDPR", "period": 2555, "basis": "tax_records"}]',
 TRUE, TRUE, '["CONTRACT", "LEGAL_OBLIGATION"]'),

('financial_transaction', 'Transaction History', 'FINANCIAL', 'CONFIDENTIAL',
 'Records of financial transactions and purchase history',
 '["purchase history", "refund records", "subscription details", "invoice data"]',
 '[{"framework": "TAX_LAW", "period": 2555, "basis": "legal_requirement"}, {"framework": "GDPR", "period": 1095, "basis": "dispute_resolution"}]',
 FALSE, TRUE, '["CONTRACT", "LEGAL_OBLIGATION"]'),

-- Special Category Data
('health_data', 'Health Information', 'HEALTH', 'SPECIAL_CATEGORY',
 'Health-related information and medical data (if applicable)',
 '["health conditions", "medical history", "fitness data", "dietary restrictions"]',
 '[{"framework": "HIPAA", "period": 2190, "basis": "medical_records"}, {"framework": "GDPR", "period": 3650, "basis": "special_category"}]',
 TRUE, TRUE, '["EXPLICIT_CONSENT"]');

-- ===================================================================
-- Default Cookie Definitions
-- ===================================================================

INSERT INTO cookie_definitions (cookie_name, cookie_category, vendor, purpose, cookie_type, domain, duration, essential, requires_consent, legal_basis, same_site, secure_only, http_only) VALUES

-- Essential Cookies
('session_id', 'ESSENTIAL', 'First Party', 'Session management and user authentication', 'session', 'localhost', NULL, TRUE, FALSE, 'LEGITIMATE_INTERESTS', 'Strict', TRUE, TRUE),
('csrf_token', 'ESSENTIAL', 'First Party', 'Cross-site request forgery protection', 'session', 'localhost', NULL, TRUE, FALSE, 'LEGITIMATE_INTERESTS', 'Strict', TRUE, TRUE),
('security_context', 'ESSENTIAL', 'First Party', 'Security context and fraud prevention', 'session', 'localhost', NULL, TRUE, FALSE, 'LEGITIMATE_INTERESTS', 'Strict', TRUE, TRUE),
('load_balancer', 'ESSENTIAL', 'First Party', 'Load balancing and server affinity', 'session', 'localhost', NULL, TRUE, FALSE, 'LEGITIMATE_INTERESTS', 'None', FALSE, TRUE),

-- Functional Cookies
('user_preferences', 'FUNCTIONAL', 'First Party', 'Store user preferences and settings', 'persistent', 'localhost', 365, FALSE, TRUE, 'CONSENT', 'Lax', TRUE, FALSE),
('language_preference', 'FUNCTIONAL', 'First Party', 'Remember user language selection', 'persistent', 'localhost', 365, FALSE, TRUE, 'CONSENT', 'Lax', FALSE, FALSE),
('theme_selection', 'FUNCTIONAL', 'First Party', 'Remember user interface theme choice', 'persistent', 'localhost', 90, FALSE, TRUE, 'CONSENT', 'Lax', FALSE, FALSE),
('consent_preferences', 'FUNCTIONAL', 'First Party', 'Store user consent choices', 'persistent', 'localhost', 395, FALSE, FALSE, 'LEGITIMATE_INTERESTS', 'Strict', TRUE, FALSE),

-- Analytics Cookies
('analytics_id', 'ANALYTICS', 'Google Analytics', 'Website usage analytics and visitor tracking', 'persistent', 'localhost', 730, FALSE, TRUE, 'CONSENT', 'None', TRUE, FALSE),
('performance_monitoring', 'ANALYTICS', 'First Party', 'Monitor website performance and user experience', 'persistent', 'localhost', 30, FALSE, TRUE, 'CONSENT', 'Lax', FALSE, FALSE),
('user_journey', 'ANALYTICS', 'First Party', 'Track user journey and navigation patterns', 'persistent', 'localhost', 365, FALSE, TRUE, 'CONSENT', 'Lax', FALSE, FALSE),
('conversion_tracking', 'ANALYTICS', 'Third Party', 'Track conversions and goal completions', 'persistent', 'localhost', 90, FALSE, TRUE, 'CONSENT', 'None', TRUE, FALSE),

-- Marketing Cookies
('marketing_campaigns', 'MARKETING', 'First Party', 'Track marketing campaign effectiveness', 'persistent', 'localhost', 90, FALSE, TRUE, 'CONSENT', 'Lax', FALSE, FALSE),
('email_tracking', 'MARKETING', 'First Party', 'Track email campaign interactions', 'persistent', 'localhost', 30, FALSE, TRUE, 'CONSENT', 'Lax', FALSE, FALSE),
('personalization_data', 'MARKETING', 'First Party', 'Store data for content personalization', 'persistent', 'localhost', 365, FALSE, TRUE, 'CONSENT', 'Lax', FALSE, FALSE),

-- Advertising Cookies
('ad_targeting', 'ADVERTISING', 'Third Party', 'Target advertisements based on interests', 'persistent', 'localhost', 395, FALSE, TRUE, 'CONSENT', 'None', TRUE, FALSE),
('ad_measurement', 'ADVERTISING', 'Third Party', 'Measure advertisement performance', 'persistent', 'localhost', 30, FALSE, TRUE, 'CONSENT', 'None', TRUE, FALSE),
('cross_site_tracking', 'ADVERTISING', 'Third Party', 'Cross-site advertising tracking', 'persistent', 'localhost', 365, FALSE, TRUE, 'CONSENT', 'None', TRUE, FALSE),

-- Social Media Cookies
('social_login', 'SOCIAL_MEDIA', 'Facebook', 'Social media login integration', 'persistent', 'localhost', 365, FALSE, TRUE, 'CONSENT', 'None', TRUE, FALSE),
('social_sharing', 'SOCIAL_MEDIA', 'Twitter', 'Social media sharing functionality', 'session', 'localhost', NULL, FALSE, TRUE, 'CONSENT', 'None', TRUE, FALSE);

-- ===================================================================
-- Default Third Party Entities
-- ===================================================================

INSERT INTO third_party_entities (entity_name, domain, relationship_type, jurisdiction, adequacy_decision, privacy_email, privacy_policy_url, contractual_safeguards, transfer_mechanism, verified, active) VALUES

-- Analytics Providers
('Google Analytics', 'google.com', 'PROCESSOR', 'US', FALSE, 'privacy@google.com', 'https://policies.google.com/privacy', 
 '["Data Processing Agreement", "Standard Contractual Clauses"]', 'Standard Contractual Clauses', TRUE, TRUE),

('Adobe Analytics', 'adobe.com', 'PROCESSOR', 'US', FALSE, 'privacy@adobe.com', 'https://www.adobe.com/privacy/policy.html',
 '["Data Processing Agreement", "Privacy Shield"]', 'Privacy Shield Framework', TRUE, TRUE),

-- Marketing & Communications
('Mailchimp', 'mailchimp.com', 'PROCESSOR', 'US', FALSE, 'privacy@mailchimp.com', 'https://mailchimp.com/legal/privacy/',
 '["Data Processing Agreement", "Standard Contractual Clauses"]', 'Standard Contractual Clauses', TRUE, TRUE),

('SendGrid', 'sendgrid.com', 'PROCESSOR', 'US', FALSE, 'privacy@sendgrid.com', 'https://sendgrid.com/policies/privacy/',
 '["Data Processing Agreement", "Standard Contractual Clauses"]', 'Standard Contractual Clauses', TRUE, TRUE),

-- Customer Support
('Zendesk', 'zendesk.com', 'PROCESSOR', 'US', FALSE, 'privacy@zendesk.com', 'https://www.zendesk.com/company/customers-partners/privacy-policy/',
 '["Data Processing Agreement", "Standard Contractual Clauses"]', 'Standard Contractual Clauses', TRUE, TRUE),

-- Payment Processing
('Stripe', 'stripe.com', 'PROCESSOR', 'US', FALSE, 'privacy@stripe.com', 'https://stripe.com/privacy',
 '["Data Processing Agreement", "PCI Compliance", "Standard Contractual Clauses"]', 'Standard Contractual Clauses', TRUE, TRUE),

('PayPal', 'paypal.com', 'PROCESSOR', 'US', FALSE, 'privacy@paypal.com', 'https://www.paypal.com/webapps/mpp/ua/privacy-full',
 '["Data Processing Agreement", "Standard Contractual Clauses"]', 'Standard Contractual Clauses', TRUE, TRUE),

-- Social Media Platforms
('Facebook', 'facebook.com', 'JOINT_CONTROLLER', 'US', FALSE, 'privacy@fb.com', 'https://www.facebook.com/policy.php',
 '["Joint Controller Agreement", "Standard Contractual Clauses"]', 'Standard Contractual Clauses', TRUE, TRUE),

('Twitter', 'twitter.com', 'JOINT_CONTROLLER', 'US', FALSE, 'privacy@twitter.com', 'https://twitter.com/privacy',
 '["Joint Controller Agreement", "Standard Contractual Clauses"]', 'Standard Contractual Clauses', TRUE, TRUE),

-- Cloud Infrastructure
('Amazon Web Services', 'aws.amazon.com', 'PROCESSOR', 'US', FALSE, 'privacy@amazon.com', 'https://aws.amazon.com/privacy/',
 '["Data Processing Agreement", "SOC Compliance", "Standard Contractual Clauses"]', 'Standard Contractual Clauses', TRUE, TRUE);

-- ===================================================================
-- Default Consent Configuration
-- ===================================================================

INSERT INTO consent_configurations (version, name, consent_types, banner_config, compliance_settings, retention_settings, active, default_config, description, created_by) VALUES
('1.0.0', 'Default GDPR Configuration', 
 '[
    {
      "type": "necessary",
      "name": "Strictly Necessary",
      "description": "Essential cookies for basic website functionality, security, and authentication",
      "isEssential": true,
      "defaultStatus": "granted",
      "canToggle": false,
      "purposes": ["essential_auth", "essential_security", "essential_service_delivery"],
      "legalBasis": "legitimate_interests"
    },
    {
      "type": "functional", 
      "name": "Functional",
      "description": "Enhanced functionality such as preferences, settings, and improved user experience",
      "isEssential": false,
      "defaultStatus": "not_set",
      "canToggle": true,
      "purposes": ["functional_preferences", "functional_communication", "functional_support"],
      "legalBasis": "consent"
    },
    {
      "type": "analytics",
      "name": "Analytics & Performance",
      "description": "Help us understand how you use our website to improve performance and user experience",
      "isEssential": false,
      "defaultStatus": "not_set", 
      "canToggle": true,
      "purposes": ["analytics_usage", "analytics_performance", "analytics_research"],
      "legalBasis": "consent"
    },
    {
      "type": "marketing",
      "name": "Marketing & Personalization",
      "description": "Personalized content, recommendations, and marketing communications",
      "isEssential": false,
      "defaultStatus": "denied",
      "canToggle": true,
      "purposes": ["marketing_communication", "marketing_personalization"],
      "legalBasis": "consent"
    },
    {
      "type": "advertising",
      "name": "Advertising & Targeting",
      "description": "Targeted advertisements and cross-site tracking for personalized ads",
      "isEssential": false,
      "defaultStatus": "denied",
      "canToggle": true,
      "purposes": ["advertising_targeted", "advertising_measurement"],
      "legalBasis": "consent"
    }
  ]',
 '{
    "position": "bottom",
    "theme": "light",
    "showLogo": true,
    "showRejectAll": true,
    "showAcceptAll": true,
    "showCustomize": true,
    "showMoreInfo": true,
    "moreInfoUrl": "/privacy-policy",
    "animation": "slide-up",
    "overlay": false,
    "dismissible": true,
    "respectDNT": true,
    "layout": "horizontal",
    "primaryColor": "#007bff",
    "textColor": "#333333",
    "backgroundColor": "#ffffff",
    "borderColor": "#dee2e6",
    "buttonStyle": "rounded",
    "fontSize": "14px",
    "padding": "20px",
    "borderRadius": "8px",
    "boxShadow": "0 4px 6px rgba(0, 0, 0, 0.1)",
    "zIndex": 9999,
    "responsive": true,
    "languages": {
      "en": {
        "title": "We value your privacy",
        "message": "We and our partners use cookies and similar technologies to provide, protect, and improve our services and to personalize content and ads. By clicking Accept All or continuing to browse, you agree to our use of cookies.",
        "acceptAll": "Accept All",
        "rejectAll": "Reject All",
        "customize": "Customize Settings",
        "moreInfo": "Learn More",
        "close": "Close"
      }
    }
  }',
 '{
    "gdprEnabled": true,
    "ccpaEnabled": true,
    "pecnEnabled": false,
    "lgpdEnabled": false,
    "consentDuration": 395,
    "cookieDuration": 395,
    "requireExplicitConsent": true,
    "granularConsent": true,
    "withdrawalMechanism": "preferences_center",
    "consentProof": true,
    "dataPortability": true,
    "rightToErasure": true,
    "ageVerification": false,
    "minimumAge": 16,
    "parentalConsent": false,
    "jurisdictionDetection": true,
    "defaultJurisdiction": "GDPR",
    "auditLogging": true,
    "complianceMonitoring": true
  }',
 '{
    "consentRecordRetention": 2555,
    "auditLogRetention": 2555,
    "interactionLogRetention": 1095,
    "cookieDataRetention": 395,
    "marketingDataRetention": 1095,
    "analyticsDataRetention": 730,
    "functionalDataRetention": 365,
    "anonymizeAfterRetention": true,
    "archiveBeforeDeletion": true,
    "retentionNotifications": true,
    "automaticCleanup": true,
    "retentionExceptions": [
      {
        "reason": "legal_hold",
        "extendedPeriod": 365,
        "approvalRequired": true
      }
    ]
  }',
 TRUE, TRUE, 'Default configuration compliant with GDPR, CCPA, and other major privacy regulations', 'system');

-- ===================================================================
-- Default Just-in-Time Prompt Configurations
-- ===================================================================

INSERT INTO jit_prompt_configs (trigger_id, consent_type, title, message, appearance, behavior, contexts, enabled, created_by) VALUES

('location_access', 'functional', 'Location Access Required',
 'We need access to your location to provide personalized content and services in your area. This helps us show you relevant information and improve your experience.',
 '{
    "style": "modal",
    "theme": "light",
    "size": "medium",
    "icon": "location",
    "primaryColor": "#007bff",
    "animation": "fade-in"
  }',
 '{
    "blocking": true,
    "dismissible": true,
    "showOnce": false,
    "rememberChoice": true,
    "autoHide": false,
    "timeout": null,
    "persistentDenial": true
  }',
 '[
    {
      "trigger": "geolocation_request",
      "page": "*",
      "userType": "all",
      "sessionCount": 1
    }
  ]',
 TRUE, 'system'),

('camera_access', 'functional', 'Camera Access Required',
 'To use photo features, we need permission to access your camera. Your photos will be processed locally and only shared if you choose to upload them.',
 '{
    "style": "toast",
    "theme": "light", 
    "position": "top-right",
    "icon": "camera",
    "primaryColor": "#28a745"
  }',
 '{
    "blocking": false,
    "dismissible": true,
    "showOnce": true,
    "rememberChoice": true,
    "autoHide": true,
    "timeout": 10000
  }',
 '[
    {
      "trigger": "camera_request",
      "page": "/upload",
      "userType": "authenticated",
      "feature": "photo_upload"
    }
  ]',
 TRUE, 'system'),

('analytics_first_visit', 'analytics', 'Help Us Improve',
 'We\'d like to collect anonymous usage data to understand how you use our service and make improvements. No personal information is collected.',
 '{
    "style": "banner",
    "theme": "light",
    "position": "top",
    "icon": "chart",
    "primaryColor": "#6f42c1"
  }',
 '{
    "blocking": false,
    "dismissible": true,
    "showOnce": true,
    "rememberChoice": true,
    "autoHide": false,
    "deferredPrompt": true
  }',
 '[
    {
      "trigger": "first_visit",
      "page": "*",
      "userType": "new",
      "delay": 30000
    }
  ]',
 TRUE, 'system'),

('marketing_newsletter', 'marketing', 'Stay Updated',
 'Would you like to receive our newsletter with product updates, tips, and exclusive offers? You can unsubscribe at any time.',
 '{
    "style": "slide-in",
    "theme": "dark",
    "position": "bottom-right",
    "icon": "mail",
    "primaryColor": "#fd7e14"
  }',
 '{
    "blocking": false,
    "dismissible": true,
    "showOnce": true,
    "rememberChoice": true,
    "autoHide": false,
    "deferredPrompt": true
  }',
 '[
    {
      "trigger": "feature_engagement",
      "page": "/dashboard",
      "userType": "active",
      "sessionCount": 5,
      "engagementLevel": "high"
    }
  ]',
 TRUE, 'system');

-- ===================================================================
-- Sample Consent Metrics (for demonstration)
-- ===================================================================

INSERT INTO consent_metrics (metric_date, metric_hour, total_consents, new_consents, banner_views, banner_accepts, banner_rejects, consent_completion_rate, gdpr_compliance_score) VALUES
(CURRENT_DATE, EXTRACT(HOUR FROM NOW())::INTEGER, 0, 0, 0, 0, 0, 100.0, 100.0),
(CURRENT_DATE - INTERVAL '1 day', 12, 150, 25, 200, 120, 30, 75.0, 98.5),
(CURRENT_DATE - INTERVAL '1 day', 18, 175, 15, 180, 100, 45, 80.6, 97.2),
(CURRENT_DATE - INTERVAL '2 days', 14, 130, 30, 220, 140, 25, 75.0, 99.1);

-- ===================================================================
-- Cleanup and Verification Procedures
-- ===================================================================

-- Create cleanup function for expired consents
CREATE OR REPLACE FUNCTION cleanup_expired_consents()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    UPDATE consent_records 
    SET status = 'EXPIRED', 
        last_modified = NOW(),
        modified_by = 'system_cleanup'
    WHERE status = 'ACTIVE' 
      AND expires_at IS NOT NULL 
      AND expires_at <= NOW();
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    
    -- Log the cleanup operation
    INSERT INTO consent_change_history (
        consent_id,
        user_id,
        change_type,
        change_method,
        previous_state,
        new_state,
        change_reason,
        integrity_hash
    )
    SELECT 
        consent_id,
        user_id,
        'expiration',
        'system_automated',
        '{"status": "ACTIVE"}',
        '{"status": "EXPIRED"}',
        'Automated expiration cleanup',
        md5(consent_id::text || NOW()::text)
    FROM consent_records 
    WHERE status = 'EXPIRED' 
      AND last_modified >= NOW() - INTERVAL '1 minute';
    
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to verify data integrity
CREATE OR REPLACE FUNCTION verify_consent_data_integrity()
RETURNS TABLE (
    table_name TEXT,
    issue_type TEXT,
    issue_count INTEGER,
    description TEXT
) AS $$
BEGIN
    -- Check for consent records without valid purposes
    RETURN QUERY
    SELECT 
        'consent_records'::TEXT,
        'missing_purposes'::TEXT,
        COUNT(*)::INTEGER,
        'Consent records without associated purposes'::TEXT
    FROM consent_records cr
    LEFT JOIN consent_purpose_mappings cpm ON cr.consent_id = cpm.consent_id
    WHERE cpm.consent_id IS NULL;
    
    -- Check for expired consents that should be cleaned up
    RETURN QUERY
    SELECT 
        'consent_records'::TEXT,
        'expired_not_updated'::TEXT,
        COUNT(*)::INTEGER,
        'Active consent records past expiration date'::TEXT
    FROM consent_records
    WHERE status = 'ACTIVE' 
      AND expires_at IS NOT NULL 
      AND expires_at <= NOW();
    
    -- Check for orphaned mappings
    RETURN QUERY
    SELECT 
        'consent_purpose_mappings'::TEXT,
        'orphaned_mappings'::TEXT,
        COUNT(*)::INTEGER,
        'Purpose mappings without valid consent records'::TEXT
    FROM consent_purpose_mappings cpm
    LEFT JOIN consent_records cr ON cpm.consent_id = cr.consent_id
    WHERE cr.consent_id IS NULL;
    
    -- Check for integrity hash mismatches
    RETURN QUERY
    SELECT 
        'consent_change_history'::TEXT,
        'integrity_issues'::TEXT,
        COUNT(*)::INTEGER,
        'Change history records with potential integrity issues'::TEXT
    FROM consent_change_history
    WHERE integrity_hash IS NULL 
       OR LENGTH(integrity_hash) != 32;
    
END;
$$ LANGUAGE plpgsql;

-- ===================================================================
-- Default Administrative Users and Permissions (if needed)
-- ===================================================================

-- Note: This would typically integrate with existing user management system
-- These are example entries for demonstration

/*
INSERT INTO consent_admin_users (user_id, role, permissions, created_by) VALUES
('system', 'SYSTEM_ADMIN', '["read", "write", "delete", "configure", "audit"]', 'system'),
('privacy_officer', 'PRIVACY_OFFICER', '["read", "write", "audit", "report", "configure"]', 'system'),
('compliance_manager', 'COMPLIANCE_MANAGER', '["read", "audit", "report"]', 'system'),
('data_protection_officer', 'DPO', '["read", "write", "audit", "report", "configure", "investigate"]', 'system');
*/

-- ===================================================================
-- Success Verification Queries
-- ===================================================================

-- These queries can be used to verify successful installation
-- SELECT COUNT(*) as consent_purposes_count FROM consent_purposes;
-- SELECT COUNT(*) as data_categories_count FROM data_categories;
-- SELECT COUNT(*) as cookie_definitions_count FROM cookie_definitions;
-- SELECT COUNT(*) as third_party_entities_count FROM third_party_entities;
-- SELECT version, active FROM consent_configurations WHERE default_config = TRUE;
-- SELECT trigger_id, enabled FROM jit_prompt_configs;

-- Display installation summary
DO $$
DECLARE
    purpose_count INTEGER;
    category_count INTEGER;
    cookie_count INTEGER;
    entity_count INTEGER;
    config_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO purpose_count FROM consent_purposes;
    SELECT COUNT(*) INTO category_count FROM data_categories;
    SELECT COUNT(*) INTO cookie_count FROM cookie_definitions;
    SELECT COUNT(*) INTO entity_count FROM third_party_entities;
    SELECT COUNT(*) INTO config_count FROM consent_configurations;
    
    RAISE NOTICE '=== Consent Storage Schema Installation Summary ===';
    RAISE NOTICE 'Consent Purposes: % records', purpose_count;
    RAISE NOTICE 'Data Categories: % records', category_count;
    RAISE NOTICE 'Cookie Definitions: % records', cookie_count;
    RAISE NOTICE 'Third Party Entities: % records', entity_count;
    RAISE NOTICE 'Consent Configurations: % records', config_count;
    RAISE NOTICE '=== Installation Complete ===';
END $$;