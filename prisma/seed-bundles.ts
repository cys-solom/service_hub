/**
 * seed-bundles.ts
 * يضيف الباندلات الأربعة الافتراضية لقاعدة البيانات
 * تشغيل: npx ts-node --project prisma/tsconfig-script.json prisma/seed-bundles.ts
 */
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import 'dotenv/config';

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const BUNDLES = [
  {
    title:         'Creator Bundle',
    titleAr:       'باندل المبدع',
    subtitle:      'Content · Design · Voice',
    subtitleAr:    'للمحتوى والتصميم والصوت',
    description:   'The ultimate bundle for content creators — ChatGPT for writing, Canva for design, ElevenLabs for AI voice, and CapCut for video editing.',
    descriptionAr: 'الباندل المثالي لصنّاع المحتوى — ChatGPT للكتابة، Canva للتصميم، ElevenLabs للأصوات AI، وCapCut لتعديل الفيديو.',
    gradient:      'linear-gradient(135deg, #7c3aed, #a855f7)',
    savings:       'Save 40%',
    savingsAr:     'وفّر 40%',
    price:         0,
    originalPrice: 0,
    tools: JSON.stringify([
      { productName: 'ChatGPT Plus', dbImage: '/logos/chatgpt.png' },
      { productName: 'Canva Pro',    dbImage: '/logos/canva.png'   },
      { productName: 'ElevenLabs',   dbImage: '/logos/elevenlabs.png' },
      { productName: 'CapCut Pro',   dbImage: '/logos/capcut.png'  },
    ]),
    features:   JSON.stringify(['ChatGPT Plus for content writing', 'Canva Pro for professional design', 'ElevenLabs AI voice generation', 'CapCut Pro video editing']),
    featuresAr: JSON.stringify(['ChatGPT Plus لكتابة المحتوى', 'Canva Pro للتصميم الاحترافي', 'ElevenLabs للأصوات AI', 'CapCut Pro لتعديل الفيديو']),
    isHot:       true,
    isActive:    true,
    displayOrder: 1,
  },
  {
    title:         'Developer Bundle',
    titleAr:       'باندل المطور',
    subtitle:      'Code · Deploy · Automate',
    subtitleAr:    'للكود والنشر والأتمتة',
    description:   'Everything a developer needs — Cursor for AI coding, Bolt.new for full-stack building, Supabase for backend, and Railway for deployment.',
    descriptionAr: 'كل ما يحتاجه المطور — Cursor للكود بالذكاء الاصطناعي، Bolt.new لبناء Full-Stack، Supabase للـ Backend، وRailway للنشر.',
    gradient:      'linear-gradient(135deg, #0ea5e9, #6366f1)',
    savings:       'Save 35%',
    savingsAr:     'وفّر 35%',
    price:         0,
    originalPrice: 0,
    tools: JSON.stringify([
      { productName: 'Cursor Pro', dbImage: '/logos/cursor.png'   },
      { productName: 'Bolt.new',   dbImage: '/logos/bolt-new.png' },
      { productName: 'Supabase',   dbImage: '/logos/supabase.png' },
      { productName: 'Railway',    dbImage: '/logos/railway.png'  },
    ]),
    features:   JSON.stringify(['Cursor Pro AI code editor', 'Bolt.new full-stack builder', 'Supabase Pro database', 'Railway cloud deployment']),
    featuresAr: JSON.stringify(['Cursor Pro بـ AI للكود', 'Bolt.new لبناء التطبيقات', 'Supabase Pro قاعدة البيانات', 'Railway للنشر السحابي']),
    isHot:       false,
    isActive:    true,
    displayOrder: 2,
  },
  {
    title:         'Productivity Bundle',
    titleAr:       'باندل الإنتاجية',
    subtitle:      'Work · Organize · Research',
    subtitleAr:    'للعمل والتنظيم والبحث',
    description:   'Maximize your productivity — Gemini Pro for AI assistance, Notion for organization, Perplexity for research, and Microsoft 365 for office work.',
    descriptionAr: 'حقق أقصى إنتاجية — Gemini Pro كمساعد AI، Notion للتنظيم، Perplexity للبحث، ومايكروسوفت 365 لأعمال المكتب.',
    gradient:      'linear-gradient(135deg, #10b981, #0891b2)',
    savings:       'Save 38%',
    savingsAr:     'وفّر 38%',
    price:         0,
    originalPrice: 0,
    tools: JSON.stringify([
      { productName: 'Gemini Pro',       dbImage: '/logos/gemini.svg'     },
      { productName: 'Notion Pro',       dbImage: '/logos/notion.png'     },
      { productName: 'Perplexity Pro',   dbImage: '/logos/perplexity.png' },
      { productName: 'Microsoft 365',    dbImage: '/logos/office.svg'     },
    ]),
    features:   JSON.stringify(['Gemini Pro advanced AI', 'Notion Pro workspace', 'Perplexity Pro research', 'Microsoft 365 suite']),
    featuresAr: JSON.stringify(['Gemini Pro ذكاء اصطناعي متقدم', 'Notion Pro لتنظيم العمل', 'Perplexity Pro للبحث', 'Microsoft 365 للمكتب']),
    isHot:       false,
    isActive:    true,
    displayOrder: 3,
  },
  {
    title:         'Builder Bundle',
    titleAr:       'باندل المبني',
    subtitle:      'Build · Launch · Grow',
    subtitleAr:    'لبناء المنتجات والأعمال',
    description:   'Build and launch your product fast — Lovable for apps, Framer for websites, Gamma for presentations, and Linear for project management.',
    descriptionAr: 'ابنِ وأطلق منتجك بسرعة — Lovable للتطبيقات، Framer للمواقع، Gamma للعروض التقديمية، وLinear لإدارة المشاريع.',
    gradient:      'linear-gradient(135deg, #f59e0b, #ef4444)',
    savings:       'Save 45%',
    savingsAr:     'وفّر 45%',
    price:         0,
    originalPrice: 0,
    tools: JSON.stringify([
      { productName: 'Lovable', dbImage: '/logos/lovable.svg' },
      { productName: 'Framer',  dbImage: '/logos/framer.svg'  },
      { productName: 'Gamma',   dbImage: '/logos/gamma.png'   },
      { productName: 'Linear',  dbImage: '/logos/linear.png'  },
    ]),
    features:   JSON.stringify(['Lovable Pro app builder', 'Framer Pro websites', 'Gamma AI presentations', 'Linear project management']),
    featuresAr: JSON.stringify(['Lovable Pro لبناء التطبيقات', 'Framer Pro للمواقع', 'Gamma لعروض AI', 'Linear لإدارة المشاريع']),
    isHot:       true,
    isActive:    true,
    displayOrder: 4,
  },
];

async function main() {
  console.log('🚀 Seeding bundles...\n');

  // Clear existing bundles first
  await prisma.bundle.deleteMany({});
  console.log('🗑️  Cleared existing bundles');

  for (const bundle of BUNDLES) {
    await prisma.bundle.create({ data: bundle });
    console.log(`✅ Created: ${bundle.title}`);
  }

  console.log('\n✨ All bundles seeded successfully!');
}

main()
  .catch((e) => { console.error('❌ Error:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
