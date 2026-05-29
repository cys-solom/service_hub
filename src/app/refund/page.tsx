'use client';

import { useI18n } from '@/lib/i18n';

export default function RefundPage() {
    const { t } = useI18n();

    return (
        <div className="min-h-screen pt-8 pb-20 px-4">
            <div className="max-w-3xl mx-auto prose prose-violet" style={{ color: '#f9fafb' }}>
                <h1>{t.refund.title}</h1>
                <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>{t.refund.lastUpdated}</p>

                <h2>{t.refund.s1Title}</h2>
                <p>{t.refund.s1Desc}</p>
                <ul>
                    <li>{t.refund.s1Item1}</li>
                    <li>{t.refund.s1Item2}</li>
                    <li>{t.refund.s1Item3}</li>
                </ul>

                <h2>{t.refund.s2Title}</h2>
                <ul>
                    <li>{t.refund.s2Item1}</li>
                    <li>{t.refund.s2Item2}</li>
                    <li>{t.refund.s2Item3}</li>
                    <li>{t.refund.s2Item4}</li>
                </ul>

                <h2>{t.refund.s3Title}</h2>
                <ol>
                    <li>{t.refund.s3Item1}</li>
                    <li>{t.refund.s3Item2}</li>
                    <li>{t.refund.s3Item3}</li>
                    <li>{t.refund.s3Item4}</li>
                </ol>

                <h2>{t.refund.s4Title}</h2>
                <p>{t.refund.s4Desc}</p>

                <h2>{t.refund.s5Title}</h2>
                <p>{t.refund.s5Desc}</p>
            </div>
        </div>
    );
}
