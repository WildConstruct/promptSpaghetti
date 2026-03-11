import React from 'react';
import './LegalPage.css';

export type LegalDocumentKey = 'terms' | 'privacy' | 'acceptable-use';

interface LegalPageProps {
  documentKey: LegalDocumentKey;
  onBack: () => void;
}

type LegalDocument = {
  eyebrow: string;
  title: string;
  summary: string;
  sections: Array<{
    heading: string;
    body: string[];
  }>;
};

const LEGAL_DOCUMENTS: Record<LegalDocumentKey, LegalDocument> = {
  terms: {
    eyebrow: 'Terms of Service',
    title: 'Prompt Spaghetti Terms of Service',
    summary:
      'These terms describe the basic rules for accessing the Prompt Spaghetti launch surface, editor experience, and future account-backed features.',
    sections: [
      {
        heading: 'Using the product',
        body: [
          'You may use Prompt Spaghetti to explore graph-based prompt workflows, reusable archetypes, and related product features in accordance with these terms.',
          'You are responsible for the prompts, graph content, and external assets you create, store, or share through the product.'
        ]
      },
      {
        heading: 'Accounts and access',
        body: [
          'Some features may require authentication or third-party providers such as Supabase-backed email or OAuth sign-in.',
          'You are responsible for maintaining access to your account and for activity that occurs under your account credentials.'
        ]
      },
      {
        heading: 'Product status',
        body: [
          'Prompt Spaghetti is evolving and features may change, move, or be removed as the product matures.',
          'Access to experimental features does not guarantee long-term availability, pricing, or storage commitments.'
        ]
      }
    ]
  },
  privacy: {
    eyebrow: 'Privacy Policy',
    title: 'Prompt Spaghetti Privacy Policy',
    summary:
      'This policy explains the current high-level handling of account, session, and product usage information for Prompt Spaghetti.',
    sections: [
      {
        heading: 'Information we use',
        body: [
          'Prompt Spaghetti may process authentication details, session state, and the content needed to render and save your graph-based workflows.',
          'If authentication is enabled, account-related data may be handled through configured providers such as Supabase.'
        ]
      },
      {
        heading: 'How information supports the product',
        body: [
          'Information is used to operate the editor, support login flows, and enable future saved graph, collaboration, and subscription features.',
          'Product telemetry and operational logs may be used to maintain reliability, security, and service quality.'
        ]
      },
      {
        heading: 'Policy evolution',
        body: [
          'This public-facing policy surface is an initial product layer and may be expanded as hosted features, billing, and storage surfaces come online.',
          'Material changes to data handling should be reflected here as the SaaS surface becomes more complete.'
        ]
      }
    ]
  },
  'acceptable-use': {
    eyebrow: 'Acceptable Use',
    title: 'Prompt Spaghetti Acceptable Use Policy',
    summary:
      'This policy sets the baseline expectations for how Prompt Spaghetti may be used as a graph-first prompt tooling product.',
    sections: [
      {
        heading: 'Allowed usage',
        body: [
          'You may use Prompt Spaghetti for legitimate creative, editorial, prototyping, and workflow design purposes.',
          'Reasonable experimentation with archetypes, family logic, and reusable graph systems is allowed.'
        ]
      },
      {
        heading: 'Restricted usage',
        body: [
          'You may not use the product to violate applicable law, abuse connected services, attempt unauthorized access, or distribute malicious content.',
          'You may not use Prompt Spaghetti to harass others, facilitate fraud, or intentionally evade product safeguards.'
        ]
      },
      {
        heading: 'Enforcement and product integrity',
        body: [
          'Prompt Spaghetti may limit or suspend access where usage threatens product integrity, account safety, or legal compliance.',
          'As hosted features expand, more specific policy controls may be added to this surface.'
        ]
      }
    ]
  }
};

export function LegalPage({ documentKey, onBack }: LegalPageProps) {
  const document = LEGAL_DOCUMENTS[documentKey];

  return (
    <div className="legal-page">
      <div className="legal-page__shell">
        <header className="legal-page__header">
          <button className="legal-page__back" onClick={onBack}>
            ← Back
          </button>
          <span className="legal-page__eyebrow">{document.eyebrow}</span>
          <h1>{document.title}</h1>
          <p>{document.summary}</p>
        </header>

        <main className="legal-page__content">
          {document.sections.map(section => (
            <section key={section.heading} className="legal-page__section">
              <h2>{section.heading}</h2>
              {section.body.map(paragraph => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}
        </main>
      </div>
    </div>
  );
}
