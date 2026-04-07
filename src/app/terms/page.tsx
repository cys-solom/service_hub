'use client';

import { useI18n } from '@/lib/i18n';

export default function TermsPage() {
    const { t } = useI18n();

    return (
        <div className="min-h-screen pt-8 pb-20 px-4">
            <div className="max-w-3xl mx-auto prose dark:prose-invert prose-violet">
                <h1>{t.terms.title}</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{t.terms.lastUpdated}</p>

                <h2>{t.terms.s1Title}</h2>
                <p>{t.terms.s1Desc}</p>

                <h2>{t.terms.s2Title}</h2>
                <p>{t.terms.s2Desc}</p>

                <h2>{t.terms.s3Title}</h2>
                <ul>
                    <li>{t.terms.s3Item1}</li>
                    <li>{t.terms.s3Item2}</li>
                    <li>{t.terms.s3Item3}</li>
                    <li>{t.terms.s3Item4}</li>
                </ul>

                <h2>{t.terms.s4Title}</h2>
                <p>{t.terms.s4Desc}</p>

                <h2>{t.terms.s5Title}</h2>
                <p>{t.terms.s5Desc}</p>

                <h2>{t.terms.s6Title}</h2>
                <p>{t.terms.s6Desc}</p>

                <h2>{t.terms.s7Title}</h2>
                <p>{t.terms.s7Desc}</p>
            </div>
        </div>
    );
}
