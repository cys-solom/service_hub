'use client';

import { useI18n } from '@/lib/i18n';

export default function PrivacyPage() {
    const { t } = useI18n();

    return (
        <div className="min-h-screen pt-8 pb-20 px-4">
            <div className="max-w-3xl mx-auto prose prose-violet" style={{ color: '#f9fafb' }}>
                <h1>{t.privacy.title}</h1>
                <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>{t.privacy.lastUpdated}</p>

                <h2>{t.privacy.s1Title}</h2>
                <p>{t.privacy.s1Desc}</p>
                <ul>
                    <li>{t.privacy.s1Item1}</li>
                    <li>{t.privacy.s1Item2}</li>
                    <li>{t.privacy.s1Item3}</li>
                </ul>

                <h2>{t.privacy.s2Title}</h2>
                <p>{t.privacy.s2Desc}</p>
                <ul>
                    <li>{t.privacy.s2Item1}</li>
                    <li>{t.privacy.s2Item2}</li>
                    <li>{t.privacy.s2Item3}</li>
                    <li>{t.privacy.s2Item4}</li>
                </ul>

                <h2>{t.privacy.s3Title}</h2>
                <p>{t.privacy.s3Desc}</p>

                <h2>{t.privacy.s4Title}</h2>
                <p>{t.privacy.s4Desc}</p>

                <h2>{t.privacy.s5Title}</h2>
                <p>{t.privacy.s5Desc}</p>

                <h2>{t.privacy.s6Title}</h2>
                <p>{t.privacy.s6Desc}</p>
            </div>
        </div>
    );
}
