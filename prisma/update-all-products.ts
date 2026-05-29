/**
 * update-all-products.ts
 * يحدّث بيانات كل المنتجات المتبقية: الصور، المميزات (EN/AR)، الأوصاف، الترتيب
 * لا يمس الأسعار ولا الـ variants
 * تشغيل: npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/update-all-products.ts
 */

import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import 'dotenv/config';

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const IMG = {
  gemini:        '/logos/gemini.svg',
  chatgpt:       '/logos/chatgpt.png',
  canva:         '/logos/canva.png',
  capcut:        '/logos/capcut.png',
  office:        '/logos/office.svg',
  adobe:         '/logos/adobe.png',
  perplexity:    '/logos/perplexity.png',
  grok:          '/logos/grok.svg',
  linkedin:      '/logos/linkedin.svg',
  notion:        '/logos/notion.png',
  lovable:       '/logos/lovable.svg',
  elevenlabs:    '/logos/elevenlabs.png',
  granola:       '/logos/granola.svg',
  mobbin:        '/logos/mobbin.svg',
  magicpatterns: '/logos/magicpatterns.svg',
  picsart:       '/logos/picsart.svg',
  quillbot:      '/logos/quillbot.svg',
  coursera:      '/logos/coursera.png',
  googleai:      '/logos/googleai.svg',
  chatprd:       '/logos/chatprd.svg',
  factory:       '/logos/factory.svg',
  framer:        '/logos/framer.svg',
  gumloop:       '/logos/gumloop.png',
  railway:       '/logos/railway.png',
  posthog:       '/logos/posthog.png',
  supabase:      '/logos/supabase.png',
  gamma:         '/logos/gamma.png',
  cursor:        '/logos/cursor.png',
  n8n:           '/logos/n8n.png',
  warp:          '/logos/warp.png',
  bolt:          '/logos/bolt-new.png',
  wisprflow:     '/logos/wisprflow.png',
  linear:        '/logos/linear.png',
  manus:         '/logos/manus.png',
  replit:        '/logos/replit.png',
  antigravity:   '/logos/antigravity.png',
};

const PRODUCTS: Record<string, {
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  features: string[];
  featuresAr: string[];
  images: string[];
  durationLabel: string;
  isFeatured?: boolean;
  displayOrder: number;
}> = {

  // ════════════════════════════════════════
  // ANTIGRAVITY (Brand Product)
  // ════════════════════════════════════════
  'antigravity-4-month': {
    name: 'Antigravity – 4 Months',
    nameAr: 'انتي جرافيتي – 4 أشهر',
    description: 'Antigravity exclusive 4-month subscription — curated AI tools bundle access, priority support, and direct access to Antigravity\'s team for personalized setup and guidance.',
    descriptionAr: 'اشتراك انتي جرافيتي الحصري لمدة 4 أشهر — حزمة وصول لأدوات ذكاء اصطناعي مختارة، ودعم أولوية، وتواصل مباشر مع فريق انتي جرافيتي للإعداد الشخصي والتوجيه.',
    features: [
      'Exclusive Antigravity AI bundle access',
      'Priority customer support',
      'Personal onboarding & setup assistance',
      'Access to all Antigravity-curated tools',
      'Regular updates & new tool additions',
      '4 months of uninterrupted service',
      'Direct team communication channel',
      'Early access to new products',
    ],
    featuresAr: [
      'وصول حصري لحزمة انتي جرافيتي AI',
      'دعم عملاء أولوية',
      'مساعدة شخصية في الإعداد',
      'وصول لكل أدوات انتي جرافيتي المختارة',
      'تحديثات منتظمة وإضافة أدوات جديدة',
      '4 أشهر من الخدمة المتواصلة',
      'قناة تواصل مباشرة مع الفريق',
      'وصول مبكر للمنتجات الجديدة',
    ],
    images: [IMG.antigravity],
    durationLabel: '4 أشهر',
    isFeatured: true,
    displayOrder: 3,
  },

  // ════════════════════════════════════════
  // LINKEDIN
  // ════════════════════════════════════════
  'linkedin-premium': {
    name: 'LinkedIn Premium',
    nameAr: 'لينكد إن بريميوم',
    description: 'LinkedIn Premium — grow your professional network faster with InMail credits, profile viewers insights, AI-powered job matching, and LinkedIn Learning access.',
    descriptionAr: 'لينكد إن بريميوم — طور شبكتك المهنية بسرعة مع رصيد InMail ورؤى من زوار الملف الشخصي ومطابقة الوظائف بالذكاء الاصطناعي والوصول لـ LinkedIn Learning.',
    features: [
      'See who viewed your profile (last 365 days)',
      'InMail credits to message anyone',
      'AI-powered job fit analysis',
      'LinkedIn Learning: 21,000+ courses',
      'Salary insights & market data',
      'Top Applicant badge on applications',
      'Interview preparation tools',
      'Business insights & company analytics',
    ],
    featuresAr: [
      'رؤية من شاهد ملفك الشخصي (آخر 365 يوم)',
      'رصيد InMail للتواصل مع أي شخص',
      'تحليل مدى توافق الوظائف بالذكاء الاصطناعي',
      'LinkedIn Learning: أكثر من 21,000 دورة',
      'رؤى الراتب وبيانات السوق',
      'شارة "Top Applicant" على الطلبات',
      'أدوات التحضير للمقابلات',
      'رؤى الأعمال وتحليلات الشركات',
    ],
    images: [IMG.linkedin],
    durationLabel: 'شهري',
    displayOrder: 14,
  },

  'linkedin-career-2month': {
    name: 'LinkedIn Career – 2 Months',
    nameAr: 'لينكد إن كارير – 2 شهر',
    description: 'LinkedIn Career plan for 2 months — ideal for active job seekers with InMail credits, profile visibility boost, and AI-powered job recommendations.',
    descriptionAr: 'خطة LinkedIn Career لمدة شهرين — مثالية لمن يبحثون عن عمل مع رصيد InMail وتعزيز ظهور الملف الشخصي وتوصيات وظائف بالذكاء الاصطناعي.',
    features: [
      'InMail credits: 5 per month',
      'See all profile viewers',
      'AI job fit scoring & recommendations',
      'Top Applicant job prioritization',
      'Interview prep: practice Q&A',
      'Resume builder & review',
      'Salary comparison insights',
      'LinkedIn Learning access',
    ],
    featuresAr: [
      '5 رصيد InMail شهرياً',
      'رؤية كل من شاهد ملفك',
      'تقييم وتوصيات الوظائف بالذكاء الاصطناعي',
      'أولوية التقديم كـ Top Applicant',
      'تحضير المقابلات: أسئلة وأجوبة تدريبية',
      'منشئ السيرة الذاتية ومراجعتها',
      'رؤى مقارنة الرواتب',
      'الوصول لـ LinkedIn Learning',
    ],
    images: [IMG.linkedin],
    durationLabel: 'شهران',
    displayOrder: 15,
  },

  'linkedin-career-3month': {
    name: 'LinkedIn Career – 3 Months',
    nameAr: 'لينكد إن كارير – 3 أشهر',
    description: 'LinkedIn Career plan for 3 months — sustained job-search advantage with InMail credits, AI job matching, interview prep, and full LinkedIn Learning access.',
    descriptionAr: 'خطة LinkedIn Career لمدة 3 أشهر — ميزة مستدامة في البحث عن عمل مع رصيد InMail ومطابقة الوظائف بالذكاء الاصطناعي والتحضير للمقابلات وكامل LinkedIn Learning.',
    features: [
      'InMail credits: 5 per month',
      'Full profile viewer history',
      'AI-driven job matching',
      'Interview prep & practice',
      '21,000+ LinkedIn Learning courses',
      'Salary benchmarking data',
      'Open Profile for easier networking',
      'Job application priority badge',
    ],
    featuresAr: [
      '5 رصيد InMail شهرياً',
      'سجل كامل لزوار الملف الشخصي',
      'مطابقة الوظائف بالذكاء الاصطناعي',
      'تحضير وتدريب على المقابلات',
      'أكثر من 21,000 دورة على LinkedIn Learning',
      'بيانات معيارية للرواتب',
      'ملف مفتوح لتسهيل التواصل',
      'شارة أولوية على طلبات التوظيف',
    ],
    images: [IMG.linkedin],
    durationLabel: '3 أشهر',
    displayOrder: 16,
  },

  'linkedin-career-6month': {
    name: 'LinkedIn Career – 6 Months',
    nameAr: 'لينكد إن كارير – 6 أشهر',
    description: 'LinkedIn Career plan for 6 months — the best value for serious job seekers combining all Career features with 6 months of learning, networking, and applying.',
    descriptionAr: 'خطة LinkedIn Career لمدة 6 أشهر — الأفضل قيمة لمن يبحثون عن فرص عمل جادة مع كامل مميزات Career لمدة 6 أشهر من التعلم والتواصل والتقديم.',
    features: [
      'InMail credits: 5 per month (30 total)',
      'Full 365-day profile viewer history',
      'Advanced AI job recommendations',
      'Comprehensive interview preparation',
      '21,000+ LinkedIn Learning courses',
      'Salary insights & negotiation data',
      'Enhanced profile visibility',
      'Best value per-month vs monthly',
    ],
    featuresAr: [
      '5 رصيد InMail شهرياً (30 إجمالاً)',
      'سجل كامل لزوار الملف لمدة 365 يوم',
      'توصيات وظائف متقدمة بالذكاء الاصطناعي',
      'تحضير شامل للمقابلات',
      'أكثر من 21,000 دورة على LinkedIn Learning',
      'رؤى الرواتب وبيانات التفاوض',
      'ظهور محسّن للملف الشخصي',
      'أفضل سعر شهري مقارنة بالاشتراك الشهري',
    ],
    images: [IMG.linkedin],
    durationLabel: '6 أشهر',
    displayOrder: 17,
  },

  'linkedin-business-2month': {
    name: 'LinkedIn Business – 2 Months',
    nameAr: 'لينكد إن بيزنس – 2 شهر',
    description: 'LinkedIn Business plan for 2 months — designed for professionals and business owners with 15 InMail credits, unlimited company insights, and priority placement.',
    descriptionAr: 'خطة LinkedIn Business لمدة شهرين — مصممة للمحترفين وأصحاب الأعمال مع 15 رصيد InMail ورؤى شركات غير محدودة وأولوية الظهور.',
    features: [
      '15 InMail credits per month',
      'Unlimited company & people search',
      'Business insights & team analytics',
      'CRM: lead tracking & pipeline',
      'Advanced search filters',
      'LinkedIn Learning: full access',
      'Priority customer support',
      'Open Profile networking',
    ],
    featuresAr: [
      '15 رصيد InMail شهرياً',
      'بحث غير محدود في الشركات والأشخاص',
      'رؤى الأعمال وتحليلات الفريق',
      'CRM: تتبع العملاء المحتملين',
      'فلاتر بحث متقدمة',
      'LinkedIn Learning: وصول كامل',
      'دعم عملاء أولوية',
      'شبكة تواصل بملف مفتوح',
    ],
    images: [IMG.linkedin],
    durationLabel: 'شهران',
    displayOrder: 18,
  },

  // ════════════════════════════════════════
  // NOTION
  // ════════════════════════════════════════
  'notion-pro': {
    name: 'Notion Pro',
    nameAr: 'نوشن برو',
    description: 'Notion Pro — the all-in-one workspace for notes, wikis, tasks, and databases with unlimited AI, guests, and file uploads for maximum personal productivity.',
    descriptionAr: 'نوشن برو — مساحة العمل المتكاملة للملاحظات والويكي والمهام وقواعد البيانات مع ذكاء اصطناعي غير محدود وضيوف ورفع ملفات غير محدود للإنتاجية الشخصية القصوى.',
    features: [
      'Unlimited pages, blocks & storage',
      'Notion AI: drafting, summarizing & Q&A',
      'Custom databases with filters & views',
      'Unlimited file uploads',
      'Invite up to 100 guests',
      'Version history (90 days)',
      'API access for integrations',
      'Priority customer support',
    ],
    featuresAr: [
      'صفحات وبلوكات وتخزين غير محدود',
      'Notion AI: الكتابة والتلخيص والأسئلة',
      'قواعد بيانات مخصصة بفلاتر وعروض متعددة',
      'رفع ملفات غير محدود',
      'دعوة حتى 100 ضيف',
      'سجل النسخ (90 يوم)',
      'وصول للـ API للتكاملات',
      'دعم عملاء أولوية',
    ],
    images: [IMG.notion],
    durationLabel: 'شهري',
    displayOrder: 19,
  },

  'notion-business': {
    name: 'Notion Business',
    nameAr: 'نوشن بيزنس',
    description: 'Notion Business — enterprise-grade collaboration with advanced permissions, SAML SSO, audit logs, and unlimited AI for your entire team\'s workflows.',
    descriptionAr: 'نوشن بيزنس — تعاون على مستوى الشركات مع أذونات متقدمة وSSO وسجلات التدقيق وذكاء اصطناعي غير محدود لسير عمل فريقك بالكامل.',
    features: [
      'All Notion Pro features included',
      'Advanced team spaces & permissions',
      'SAML SSO & user provisioning',
      'Audit logs for compliance',
      'Bulk PDF exports',
      'Notion AI for every workspace member',
      '12-month version history',
      'Dedicated customer success manager',
    ],
    featuresAr: [
      'كل مميزات Notion Pro مشمولة',
      'مساحات فريق متقدمة مع أذونات',
      'SAML SSO وإعداد المستخدمين',
      'سجلات التدقيق للامتثال',
      'تصدير PDF بالجملة',
      'Notion AI لكل أعضاء مساحة العمل',
      'سجل نسخ لمدة 12 شهراً',
      'مدير نجاح مخصص',
    ],
    images: [IMG.notion],
    durationLabel: 'شهري – للفرق',
    displayOrder: 20,
  },

  // ════════════════════════════════════════
  // LOVABLE
  // ════════════════════════════════════════
  'lovable-pro': {
    name: 'Lovable Pro',
    nameAr: 'لوفابل برو',
    description: 'Lovable Pro — AI-powered full-stack app builder that turns prompts into production-ready React apps with Supabase backend, custom domains, and unlimited projects.',
    descriptionAr: 'Lovable Pro — منشئ تطبيقات Full-Stack بالذكاء الاصطناعي يحوّل أفكارك إلى تطبيقات React جاهزة للإنتاج مع Supabase وروابط مخصصة ومشاريع غير محدودة.',
    features: [
      '2,500 AI generation credits/month',
      'Unlimited projects & apps',
      'React + Supabase full-stack generation',
      'Custom domain publishing',
      'GitHub sync & version control',
      'Real-time collaborative editing',
      'One-click Supabase deployment',
      'Priority AI processing speed',
    ],
    featuresAr: [
      '2,500 رصيد توليد AI شهرياً',
      'مشاريع وتطبيقات غير محدودة',
      'توليد Full-Stack بـ React + Supabase',
      'نشر على نطاق مخصص',
      'مزامنة GitHub والتحكم في الإصدارات',
      'تحرير تعاوني في الوقت الفعلي',
      'نشر Supabase بضغطة واحدة',
      'سرعة معالجة AI ذات أولوية',
    ],
    images: [IMG.lovable],
    durationLabel: 'شهري',
    isFeatured: true,
    displayOrder: 21,
  },

  // ════════════════════════════════════════
  // ELEVENLABS
  // ════════════════════════════════════════
  'elevenlabs-creator-1month': {
    name: 'ElevenLabs Creator – 1 Month',
    nameAr: 'إليفن لابس كريتور – شهر',
    description: 'ElevenLabs Creator plan for 1 month — professional AI voice generation with 100,000 characters/month, 30+ voice clones, and commercial usage rights.',
    descriptionAr: 'خطة ElevenLabs Creator لشهر واحد — توليد أصوات AI احترافية مع 100,000 حرف شهرياً و30+ نسخة صوتية وحقوق الاستخدام التجاري.',
    features: [
      '100,000 characters per month',
      '30 custom voice clones',
      'Commercial usage rights included',
      '192kbps audio quality',
      'Instant voice cloning from samples',
      'Projects & long-form audio creation',
      'Multilingual voice generation (30+ languages)',
      'API access with 100K character quota',
    ],
    featuresAr: [
      '100,000 حرف شهرياً',
      '30 نسخة صوت مخصصة',
      'حقوق الاستخدام التجاري مشمولة',
      'جودة صوت 192kbps',
      'استنساخ صوت فوري من عينات',
      'مشاريع وإنشاء صوت طويل',
      'توليد صوت متعدد اللغات (30+ لغة)',
      'وصول للـ API بحصة 100K حرف',
    ],
    images: [IMG.elevenlabs],
    durationLabel: 'شهر',
    displayOrder: 22,
  },

  'elevenlabs-creator-12month': {
    name: 'ElevenLabs Creator – 12 Months',
    nameAr: 'إليفن لابس كريتور – 12 شهر',
    description: 'ElevenLabs Creator plan for 12 months — best annual value for content creators needing professional AI voice generation all year with commercial rights.',
    descriptionAr: 'خطة ElevenLabs Creator لمدة 12 شهراً — أفضل قيمة سنوية لصنّاع المحتوى الذين يحتاجون توليد أصوات AI احترافية طوال العام مع حقوق تجارية.',
    features: [
      '100,000 characters per month (1.2M/year)',
      '30 custom voice clones',
      'Commercial usage rights',
      '192kbps top audio quality',
      'Instant voice cloning',
      'Long-form audio & podcast creation',
      '30+ language support',
      'Best yearly value — save vs monthly',
    ],
    featuresAr: [
      '100,000 حرف شهرياً (1.2 مليون سنوياً)',
      '30 نسخة صوت مخصصة',
      'حقوق الاستخدام التجاري',
      'جودة صوت 192kbps الأعلى',
      'استنساخ صوت فوري',
      'إنشاء صوت طويل وبودكاست',
      'دعم أكثر من 30 لغة',
      'أفضل قيمة سنوية — وفر مقارنة بالشهري',
    ],
    images: [IMG.elevenlabs],
    durationLabel: '12 شهر',
    displayOrder: 23,
  },

  // ════════════════════════════════════════
  // GRANOLA
  // ════════════════════════════════════════
  'granola-business-10seats': {
    name: 'Granola Business – 10 Seats',
    nameAr: 'جرانولا بيزنس – 10 مقاعد',
    description: 'Granola Business 10-seat plan — the AI meeting notepad that transcribes, summarizes, and structures your team\'s meetings in real time, integrated with all your tools.',
    descriptionAr: 'خطة Granola Business لـ 10 مقاعد — دفتر الملاحظات AI للاجتماعات الذي يسجل ويلخص ويرتب اجتماعات فريقك في الوقت الفعلي، متكامل مع كل أدواتك.',
    features: [
      'AI-powered meeting transcription',
      'Smart meeting summaries & action items',
      'Works with Zoom, Meet, Teams & more',
      'Custom meeting templates',
      'CRM & tool integrations',
      'Shared team workspace',
      '10 team seats included',
      'Enterprise security & admin controls',
    ],
    featuresAr: [
      'تدوين الاجتماعات بالذكاء الاصطناعي',
      'ملخصات ذكية وبنود العمل',
      'يعمل مع Zoom وMeet وTeams وغيرها',
      'قوالب اجتماعات مخصصة',
      'تكاملات مع CRM والأدوات الأخرى',
      'مساحة عمل مشتركة للفريق',
      '10 مقاعد فريق مشمولة',
      'أمان المؤسسات وأدوات الإدارة',
    ],
    images: [IMG.granola],
    durationLabel: 'شهري – 10 مقاعد',
    displayOrder: 24,
  },

  // ════════════════════════════════════════
  // MOBBIN
  // ════════════════════════════════════════
  'mobbin-10x-seat': {
    name: 'Mobbin 10x Seat',
    nameAr: 'موبين 10 مقاعد',
    description: 'Mobbin 10x Seat plan — the world\'s largest UI/UX design reference library with 300,000+ screens from top apps to inspire and speed up your design process.',
    descriptionAr: 'خطة Mobbin 10 مقاعد — أكبر مكتبة مرجعية لتصميم UI/UX في العالم مع أكثر من 300,000 شاشة من أفضل التطبيقات لإلهام وتسريع عملية التصميم.',
    features: [
      '300,000+ curated UI screens & flows',
      'iOS, Android & Web patterns',
      'Advanced search by UI pattern',
      'Bookmark & organize collections',
      'Copy to Figma in one click',
      'Annotation layer for design notes',
      'Team collaboration features',
      '10 team seats included',
    ],
    featuresAr: [
      'أكثر من 300,000 شاشة UI منتقاة',
      'أنماط iOS وAndroid والويب',
      'بحث متقدم حسب نمط UI',
      'حفظ وتنظيم المجموعات',
      'نسخ إلى Figma بضغطة واحدة',
      'طبقة تعليقات لملاحظات التصميم',
      'ميزات التعاون للفريق',
      '10 مقاعد فريق مشمولة',
    ],
    images: [IMG.mobbin],
    durationLabel: 'شهري – 10 مقاعد',
    displayOrder: 25,
  },

  // ════════════════════════════════════════
  // MAGIC PATTERNS
  // ════════════════════════════════════════
  'magic-patterns-starter': {
    name: 'Magic Patterns Starter',
    nameAr: 'ماجيك باترنز ستارتر',
    description: 'Magic Patterns Starter — AI-powered UI design tool that generates beautiful React component designs from prompts, with Figma export and theme customization.',
    descriptionAr: 'Magic Patterns Starter — أداة تصميم UI بالذكاء الاصطناعي تولّد تصاميم مكونات React جميلة من الأوصاف النصية، مع تصدير Figma وتخصيص الثيم.',
    features: [
      'AI-generated React UI components',
      'Beautiful design system output',
      'Figma & code export',
      'Custom theme & color system',
      'Component variants & states',
      'Responsive design generation',
      'TailwindCSS & CSS output',
      'Starter: 200 generations/month',
    ],
    featuresAr: [
      'مكونات React UI مولّدة بالذكاء الاصطناعي',
      'مخرجات نظام تصميم جميل',
      'تصدير Figma والكود',
      'ثيم مخصص ونظام ألوان',
      'متغيرات وحالات المكونات',
      'توليد تصميم متجاوب',
      'مخرجات TailwindCSS وCSS',
      'Starter: 200 عملية توليد شهرياً',
    ],
    images: [IMG.magicpatterns],
    durationLabel: 'شهري',
    displayOrder: 26,
  },

  // ════════════════════════════════════════
  // GEMINI AI PRO 18 MONTH
  // ════════════════════════════════════════
  'gemini-ai-pro-18month': {
    name: 'Gemini AI Pro – 18 Months',
    nameAr: 'جيميناي AI برو – 18 شهر',
    description: 'Google Gemini AI Pro for 18 months — the longest-value Google AI subscription with full Gemini 2.0 Pro access, 2TB storage, and Workspace integration for a year and a half.',
    descriptionAr: 'اشتراك Google Gemini AI Pro لمدة 18 شهراً — أطول اشتراك AI من Google بكامل Gemini 2.0 Pro و2TB تخزين وتكامل Workspace لمدة سنة ونصف.',
    features: [
      'Gemini 2.0 Pro — 18 months access',
      '2TB Google One storage included',
      'Full Google Workspace integration',
      'Extended 1M token context window',
      'Multimodal: text, image, audio, video',
      'Advanced code generation & debugging',
      'Deep research with cited sources',
      'Best price-per-month for Gemini',
    ],
    featuresAr: [
      'Gemini 2.0 Pro — وصول لمدة 18 شهراً',
      '2TB تخزين Google One مشمول',
      'تكامل كامل مع Google Workspace',
      'نافذة سياق موسعة تصل إلى مليون رمز',
      'يدعم النصوص والصور والصوت والفيديو',
      'توليد الكود وإصلاح الأخطاء المتقدم',
      'بحث عميق مع مصادر موثقة',
      'أفضل سعر شهري لـ Gemini',
    ],
    images: [IMG.gemini],
    durationLabel: '18 شهر',
    displayOrder: 4,
  },

  // ════════════════════════════════════════
  // ADOBE CC 1 MONTH
  // ════════════════════════════════════════
  'adobe-creative-cloud-1month': {
    name: 'Adobe Creative Cloud – 1 Month',
    nameAr: 'أدوبي كريتيف كلاود – شهر',
    description: 'Adobe Creative Cloud for 1 month — full access to all 20+ Adobe creative apps including Photoshop, Illustrator, Premiere Pro, and Adobe Firefly AI for a month.',
    descriptionAr: 'أدوبي كريتيف كلاود لمدة شهر واحد — وصول كامل لأكثر من 20 تطبيق Adobe إبداعي بما فيها Photoshop وIllustrator وPremiere Pro وAdobe Firefly AI لمدة شهر.',
    features: [
      'All 20+ Adobe apps for 1 month',
      'Photoshop, Illustrator, Premiere Pro',
      'After Effects & Lightroom',
      'Adobe Firefly AI: Generative Fill',
      'Adobe Fonts: 20,000+ typefaces',
      '100GB cloud storage',
      'Portfolio website on Behance',
      'No long-term commitment',
    ],
    featuresAr: [
      'كل تطبيقات Adobe (20+) لمدة شهر',
      'Photoshop وIllustrator وPremiere Pro',
      'After Effects وLightroom',
      'Adobe Firefly AI: التعبئة التوليدية',
      'Adobe Fonts: أكثر من 20,000 خط',
      '100GB تخزين سحابي',
      'موقع Portfolio على Behance',
      'بدون التزام طويل الأمد',
    ],
    images: [IMG.adobe],
    durationLabel: 'شهر',
    displayOrder: 27,
  },

  // ════════════════════════════════════════
  // PICSART
  // ════════════════════════════════════════
  'picsart-pro': {
    name: 'Picsart Pro',
    nameAr: 'بيكسارت برو',
    description: 'Picsart Pro — AI-powered photo & video editing with background remover, AI image generator, 5000+ templates, and sticker packs for social media creators.',
    descriptionAr: 'بيكسارت برو — تعديل صور وفيديو بالذكاء الاصطناعي مع إزالة الخلفية ومولّد الصور AI وأكثر من 5000 قالب وملصقات لصنّاع محتوى السوشيال ميديا.',
    features: [
      'AI Background Remover (one-tap)',
      'AI Image Generator from text prompts',
      'AI Photo Enhancer & upscaler',
      '5,000+ premium templates',
      'Watermark-free exports',
      'Premium stickers & fonts pack',
      'Video editing & transitions',
      'Content Scheduler for social media',
    ],
    featuresAr: [
      'إزالة الخلفية بالذكاء الاصطناعي (بلمسة واحدة)',
      'مولّد صور AI من الأوصاف النصية',
      'محسّن الصور وUpscaler بالذكاء الاصطناعي',
      'أكثر من 5,000 قالب احترافي',
      'تصدير بدون علامة مائية',
      'حزمة ملصقات وخطوط احترافية',
      'تعديل الفيديو والانتقالات',
      'جدولة المحتوى للسوشيال ميديا',
    ],
    images: [IMG.picsart],
    durationLabel: 'شهري',
    displayOrder: 28,
  },

  // ════════════════════════════════════════
  // MICROSOFT 365 FAMILY
  // ════════════════════════════════════════
  'microsoft-365-family': {
    name: 'Microsoft 365 Family',
    nameAr: 'مايكروسوفت 365 عائلي',
    description: 'Microsoft 365 Family — share premium Microsoft apps with up to 6 family members. Includes Word, Excel, PowerPoint, 1TB OneDrive per person, and Copilot AI.',
    descriptionAr: 'مايكروسوفت 365 عائلي — شارك تطبيقات Microsoft المميزة مع حتى 6 أفراد من العائلة. يشمل Word وExcel وPowerPoint و1TB OneDrive لكل شخص وCopilot AI.',
    features: [
      'Up to 6 family members included',
      '1TB OneDrive per person (6TB total)',
      'Word, Excel, PowerPoint — full desktop apps',
      'Microsoft Teams & Outlook',
      'Microsoft Copilot AI for everyone',
      'Install on 5 devices per person',
      'Family Safety & parental controls',
      'Microsoft Designer & Editor',
    ],
    featuresAr: [
      'حتى 6 أفراد من العائلة مشمولون',
      '1TB OneDrive لكل شخص (6TB إجمالاً)',
      'Word وExcel وPowerPoint — تطبيقات كاملة',
      'Microsoft Teams وOutlook',
      'Copilot AI من مايكروسوفت للجميع',
      'التثبيت على 5 أجهزة لكل شخص',
      'Family Safety والرقابة الأبوية',
      'Microsoft Designer وEditor',
    ],
    images: [IMG.office],
    durationLabel: 'شهري – عائلي',
    isFeatured: true,
    displayOrder: 29,
  },

  // ════════════════════════════════════════
  // QUILLBOT
  // ════════════════════════════════════════
  'quillbot-premium-1month': {
    name: 'QuillBot Premium – 1 Month',
    nameAr: 'كويل بوت بريميوم – شهر',
    description: 'QuillBot Premium for 1 month — the most powerful AI writing assistant with unlimited paraphrasing, AI detection, plagiarism checker, and tone customization.',
    descriptionAr: 'QuillBot Premium لشهر واحد — أقوى مساعد كتابة AI مع إعادة الصياغة غير المحدودة وكشف الذكاء الاصطناعي وفحص السرقة الأدبية وتخصيص النبرة.',
    features: [
      'Unlimited paraphrasing (no word limit)',
      '7 writing modes (Formal, Academic, etc.)',
      'AI Plagiarism Checker',
      'AI Content Detector',
      'Grammar Checker & Corrector',
      'Summarizer: unlimited text',
      'Co-Writer: AI full-text generation',
      'Chrome extension included',
    ],
    featuresAr: [
      'إعادة صياغة غير محدودة (بلا حد للكلمات)',
      '7 أوضاع كتابة (رسمي، أكاديمي، وغيرها)',
      'كاشف السرقة الأدبية بالذكاء الاصطناعي',
      'كاشف المحتوى AI',
      'مدقق النحو والإملاء',
      'أداة تلخيص: نصوص غير محدودة',
      'Co-Writer: توليد نص كامل بالـ AI',
      'إضافة Chrome مشمولة',
    ],
    images: [IMG.quillbot],
    durationLabel: 'شهر',
    displayOrder: 30,
  },

  // ════════════════════════════════════════
  // COURSERA
  // ════════════════════════════════════════
  'coursera-premium': {
    name: 'Coursera Premium',
    nameAr: 'كورسيرا بريميوم',
    description: 'Coursera Premium — unlimited access to 7,000+ courses from top universities and companies like Google, IBM, Meta, and Stanford with certificates and AI guidance.',
    descriptionAr: 'كورسيرا بريميوم — وصول غير محدود لأكثر من 7,000 دورة من أفضل الجامعات والشركات مثل Google وIBM وMeta وStanford مع شهادات وإرشاد AI.',
    features: [
      '7,000+ courses from top universities',
      'Courses from Google, IBM, Meta & Stanford',
      'Unlimited certificates of completion',
      'Professional Certificates & Specializations',
      'Guided Projects with hands-on labs',
      'AI learning coach personalization',
      'Offline mobile downloads',
      'All courses in all languages',
    ],
    featuresAr: [
      'أكثر من 7,000 دورة من أفضل الجامعات',
      'دورات من Google وIBM وMeta وStanford',
      'شهادات إتمام غير محدودة',
      'شهادات مهنية وتخصصات',
      'مشاريع موجهة بمختبرات عملية',
      'مدرب تعلم AI شخصي',
      'تحميل للموبايل وللاستخدام بدون إنترنت',
      'كل الدورات بكل اللغات',
    ],
    images: [IMG.coursera],
    durationLabel: 'شهري',
    displayOrder: 31,
  },

  // ════════════════════════════════════════
  // GOOGLE AI PRO
  // ════════════════════════════════════════
  'google-ai-pro': {
    name: 'Google AI Pro',
    nameAr: 'جوجل AI برو',
    description: 'Google AI Pro — access to Google\'s most advanced AI with Gemini 2.0 Ultra, AI Overviews, NotebookLM Plus, and the full Google One AI Premium experience.',
    descriptionAr: 'Google AI Pro — الوصول لأكثر ذكاء اصطناعي من Google تقدماً مع Gemini 2.0 Ultra وAI Overviews وNotebookLM Plus وكامل تجربة Google One AI Premium.',
    features: [
      'Gemini 2.0 Ultra — most powerful model',
      'NotebookLM Plus for research',
      'AI Overviews in Google Search',
      '2TB Google One storage',
      'Gemini in all Google Workspace apps',
      'Early access to experimental features',
      'AI-powered Workspace tools',
      'Priority Google support',
    ],
    featuresAr: [
      'Gemini 2.0 Ultra — أقوى نموذج',
      'NotebookLM Plus للبحث العلمي',
      'نظرات عامة AI في Google Search',
      '2TB تخزين Google One',
      'Gemini في كل تطبيقات Google Workspace',
      'وصول مبكر للميزات التجريبية',
      'أدوات Workspace بتعزيز AI',
      'دعم Google ذو أولوية',
    ],
    images: [IMG.googleai],
    durationLabel: 'شهري',
    displayOrder: 32,
  },

  // ════════════════════════════════════════
  // CHATPRD
  // ════════════════════════════════════════
  'chatprd-pro': {
    name: 'ChatPRD',
    nameAr: 'شات PRD',
    description: 'ChatPRD — the AI assistant built specifically for Product Managers to write PRDs, user stories, OKRs, and product specs 10x faster with structured output.',
    descriptionAr: 'ChatPRD — المساعد AI المصمم خصيصاً لمديري المنتجات لكتابة PRDs وقصص المستخدمين وOKRs ومواصفات المنتج 10 مرات أسرع مع مخرجات منظمة.',
    features: [
      'AI PRD generation from requirements',
      'User Story & Acceptance Criteria writer',
      'OKR & roadmap creation templates',
      'Product spec structured output',
      'PM interview preparation',
      'Competitive analysis templates',
      'Integration with Notion & Confluence',
      'Priority support for PMs',
    ],
    featuresAr: [
      'توليد PRD بالذكاء الاصطناعي من المتطلبات',
      'كاتب User Story ومعايير القبول',
      'قوالب إنشاء OKR وخريطة الطريق',
      'مخرجات منظمة لمواصفات المنتج',
      'تحضير مقابلات PM',
      'قوالب التحليل التنافسي',
      'تكامل مع Notion وConfluence',
      'دعم أولوية لمديري المنتجات',
    ],
    images: [IMG.chatprd],
    durationLabel: 'شهري',
    displayOrder: 33,
  },

  // ════════════════════════════════════════
  // FACTORY AI
  // ════════════════════════════════════════
  'factory-ai': {
    name: 'Factory',
    nameAr: 'فاكتوري',
    description: 'Factory — the AI software engineering platform with Droids that autonomously handle code reviews, bug fixes, migrations, and complex software tasks end-to-end.',
    descriptionAr: 'Factory — منصة هندسة البرمجيات بالذكاء الاصطناعي مع Droids تتعامل بشكل مستقل مع مراجعات الكود وإصلاح الأخطاء والترحيل والمهام البرمجية المعقدة.',
    features: [
      'AI Droids for autonomous coding tasks',
      'Automated code review & feedback',
      'Bug detection & auto-fix',
      'Codebase migration automation',
      'PR creation & description writing',
      'GitHub & GitLab integration',
      'Multi-language support',
      'Security vulnerability scanning',
    ],
    featuresAr: [
      'Droids AI للمهام البرمجية المستقلة',
      'مراجعة الكود التلقائية والتغذية الراجعة',
      'كشف الأخطاء وإصلاحها تلقائياً',
      'أتمتة ترحيل قاعدة الكود',
      'إنشاء PR وكتابة الوصف',
      'تكامل مع GitHub وGitLab',
      'دعم متعدد اللغات البرمجية',
      'فحص ثغرات الأمان',
    ],
    images: [IMG.factory],
    durationLabel: 'شهري',
    displayOrder: 34,
  },

  // ════════════════════════════════════════
  // FRAMER PRO
  // ════════════════════════════════════════
  'framer-pro': {
    name: 'Framer Pro',
    nameAr: 'فريمر برو',
    description: 'Framer Pro — the design-to-code website builder with AI generation, CMS, custom animations, and production-ready publishing for professional websites.',
    descriptionAr: 'Framer Pro — منشئ المواقع من التصميم إلى الكود مع توليد AI وCMS وأنيميشن مخصص ونشر جاهز للإنتاج للمواقع الاحترافية.',
    features: [
      'AI website generation from prompts',
      'Design-to-code with zero compromises',
      'Built-in CMS for dynamic content',
      'Custom animations & interactions',
      'SEO tools & performance optimization',
      'Custom domain publishing',
      'Figma import support',
      'Analytics & visitor tracking',
    ],
    featuresAr: [
      'توليد موقع AI من الأوصاف النصية',
      'تصميم إلى كود بدون تنازلات',
      'CMS مدمج للمحتوى الديناميكي',
      'أنيميشن وتفاعلات مخصصة',
      'أدوات SEO وتحسين الأداء',
      'نشر على نطاق مخصص',
      'دعم استيراد Figma',
      'تحليلات وتتبع الزوار',
    ],
    images: [IMG.framer],
    durationLabel: 'شهري',
    displayOrder: 35,
  },

  // ════════════════════════════════════════
  // GUMLOOP PRO
  // ════════════════════════════════════════
  'gumloop-pro': {
    name: 'Gumloop Pro',
    nameAr: 'جامloop برو',
    description: 'Gumloop Pro — the no-code AI automation platform to build powerful workflows connecting AI models, web scrapers, email, and 100+ apps without writing code.',
    descriptionAr: 'Gumloop Pro — منصة أتمتة AI بدون كود لبناء سير عمل قوية تربط نماذج الذكاء الاصطناعي والـ Web Scrapers والبريد الإلكتروني وأكثر من 100 تطبيق بدون كتابة كود.',
    features: [
      'Visual no-code workflow builder',
      'AI model integration (GPT-4, Claude, etc.)',
      'Web scraping & data extraction nodes',
      '100+ app integrations',
      'Scheduled & triggered automations',
      'Custom AI pipelines',
      'Email & notification automation',
      'Pro: 10,000 credits/month',
    ],
    featuresAr: [
      'منشئ سير عمل بصري بدون كود',
      'تكامل نماذج AI (GPT-4 وClaude وغيرها)',
      'عقد استخراج بيانات وWeb Scraping',
      'تكاملات مع أكثر من 100 تطبيق',
      'أتمتة مجدولة ومُشغَّلة',
      'خطوط أنابيب AI مخصصة',
      'أتمتة البريد الإلكتروني والإشعارات',
      'Pro: 10,000 رصيد شهرياً',
    ],
    images: [IMG.gumloop],
    durationLabel: 'شهري',
    displayOrder: 36,
  },

  // ════════════════════════════════════════
  // RAILWAY HOBBY
  // ════════════════════════════════════════
  'railway-hobby': {
    name: 'Railway Hobby',
    nameAr: 'ريلواي هوبي',
    description: 'Railway Hobby plan — deploy any app in seconds with zero DevOps. Supports any language with auto-scaling, persistent storage, private networking, and $5 credit/month.',
    descriptionAr: 'خطة Railway Hobby — انشر أي تطبيق في ثوانٍ بدون DevOps. يدعم أي لغة مع Auto-scaling وتخزين دائم وشبكة خاصة ورصيد 5 دولار شهرياً.',
    features: [
      '$5/month credit included',
      'One-click deploy from GitHub',
      'Auto-scaling & always-on service',
      'Persistent volumes & databases',
      'Private networking between services',
      'Custom domain with free SSL',
      'Support for all frameworks & languages',
      'Built-in logging & metrics dashboard',
    ],
    featuresAr: [
      'رصيد 5 دولار شهرياً مشمول',
      'نشر بضغطة واحدة من GitHub',
      'Auto-scaling وخدمة دائمة التشغيل',
      'أحجام دائمة وقواعد بيانات',
      'شبكة خاصة بين الخدمات',
      'نطاق مخصص مع SSL مجاني',
      'دعم كل الأطر واللغات البرمجية',
      'لوحة مقاييس وسجلات مدمجة',
    ],
    images: [IMG.railway],
    durationLabel: 'شهري',
    displayOrder: 37,
  },

  // ════════════════════════════════════════
  // POSTHOG SCALE
  // ════════════════════════════════════════
  'posthog-scale': {
    name: 'PostHog Scale',
    nameAr: 'بوست هوج سكيل',
    description: 'PostHog Scale — the all-in-one product analytics platform with event tracking, session recordings, feature flags, A/B testing, and surveys for engineering teams.',
    descriptionAr: 'PostHog Scale — منصة تحليلات المنتج المتكاملة مع تتبع الأحداث وتسجيلات الجلسات وFeature Flags واختبار A/B والاستطلاعات لفرق الهندسة.',
    features: [
      'Product analytics & funnel analysis',
      'Session replay & heatmaps',
      'Feature flags & rollout control',
      'A/B testing & experimentation',
      'User surveys & feedback',
      'Data warehouse sync',
      'SDK for all platforms',
      'Scale: high-volume event ingestion',
    ],
    featuresAr: [
      'تحليلات المنتج وتحليل Funnel',
      'تسجيل الجلسات وخرائط الحرارة',
      'Feature Flags والتحكم في الإطلاق',
      'اختبار A/B والتجريب',
      'استطلاعات المستخدمين والتغذية الراجعة',
      'مزامنة مع Data Warehouse',
      'SDK لكل المنصات',
      'Scale: استيعاب أحداث بحجم كبير',
    ],
    images: [IMG.posthog],
    durationLabel: 'شهري',
    displayOrder: 38,
  },

  // ════════════════════════════════════════
  // SUPABASE PRO
  // ════════════════════════════════════════
  'supabase-pro': {
    name: 'Supabase Pro',
    nameAr: 'سوبا بيس برو',
    description: 'Supabase Pro — the open-source Firebase alternative with PostgreSQL, Auth, Edge Functions, Realtime subscriptions, and AI vector search for production apps.',
    descriptionAr: 'Supabase Pro — بديل Firebase مفتوح المصدر مع PostgreSQL والمصادقة وEdge Functions والاشتراكات الفورية وبحث المتجهات AI لتطبيقات الإنتاج.',
    features: [
      '8GB PostgreSQL database',
      'Unlimited API requests',
      'Authentication & user management',
      'Edge Functions (serverless)',
      'Realtime subscriptions',
      'Storage: 100GB included',
      'AI vector search with pgvector',
      'Daily backups (7-day retention)',
    ],
    featuresAr: [
      'قاعدة بيانات PostgreSQL 8GB',
      'طلبات API غير محدودة',
      'مصادقة وإدارة المستخدمين',
      'Edge Functions (بدون خادم)',
      'اشتراكات فورية Realtime',
      'تخزين: 100GB مشمول',
      'بحث متجهات AI مع pgvector',
      'نسخ احتياطية يومية (7 أيام)',
    ],
    images: [IMG.supabase],
    durationLabel: 'شهري',
    displayOrder: 39,
  },

  // ════════════════════════════════════════
  // GAMMA PRO
  // ════════════════════════════════════════
  'gamma-pro': {
    name: 'Gamma Pro',
    nameAr: 'جاما برو',
    description: 'Gamma Pro — AI-powered presentation, document, and webpage creator that turns your text into stunning visual content in seconds, no design skills needed.',
    descriptionAr: 'Gamma Pro — منشئ عروض تقديمية ومستندات وصفحات ويب بالذكاء الاصطناعي يحول نصك إلى محتوى بصري مذهل في ثوانٍ، بدون مهارات تصميم.',
    features: [
      'AI generation from text or outline',
      'Stunning presentation templates',
      'Real-time collaborative editing',
      'One-click web publishing',
      'Custom branding & themes',
      'Embed media, charts & code blocks',
      'Unlimited AI creation credits',
      'Export to PDF & PowerPoint',
    ],
    featuresAr: [
      'توليد AI من النص أو المخطط التفصيلي',
      'قوالب عروض تقديمية مذهلة',
      'تحرير تعاوني في الوقت الفعلي',
      'نشر على الويب بضغطة واحدة',
      'علامة تجارية وثيمات مخصصة',
      'تضمين الوسائط والرسوم البيانية والكود',
      'رصيد إبداع AI غير محدود',
      'تصدير إلى PDF وPowerPoint',
    ],
    images: [IMG.gamma],
    durationLabel: 'شهري',
    displayOrder: 40,
  },

  // ════════════════════════════════════════
  // CURSOR PRO
  // ════════════════════════════════════════
  'cursor-pro': {
    name: 'Cursor Pro',
    nameAr: 'كيرسور برو',
    description: 'Cursor Pro — the AI-first code editor with GPT-4o, Claude 3.5 Sonnet, tab autocomplete, codebase-aware chat, and agent mode for autonomous multi-file edits.',
    descriptionAr: 'Cursor Pro — محرر الكود AI-First مع GPT-4o وClaude 3.5 Sonnet وإكمال تلقائي بالـ Tab ومحادثة واعية بقاعدة الكود ووضع Agent للتعديلات المستقلة متعددة الملفات.',
    features: [
      'GPT-4o & Claude 3.5 Sonnet integration',
      'AI Tab: smart multi-line autocomplete',
      'Codebase-aware AI chat',
      'Agent mode: autonomous multi-file edits',
      '500 fast AI requests per month',
      'Unlimited slow AI requests',
      'Privacy mode: code never stored',
      'VS Code extension compatibility',
    ],
    featuresAr: [
      'تكامل GPT-4o وClaude 3.5 Sonnet',
      'AI Tab: إكمال تلقائي ذكي متعدد الأسطر',
      'محادثة AI واعية بقاعدة الكود',
      'وضع Agent: تعديلات مستقلة متعددة الملفات',
      '500 طلب AI سريع شهرياً',
      'طلبات AI بطيئة غير محدودة',
      'وضع الخصوصية: الكود لا يُحفظ أبداً',
      'توافق مع إضافات VS Code',
    ],
    images: [IMG.cursor],
    durationLabel: 'شهري',
    isFeatured: true,
    displayOrder: 41,
  },

  // ════════════════════════════════════════
  // N8N STARTER
  // ════════════════════════════════════════
  'n8n-starter': {
    name: 'N8N Starter',
    nameAr: 'N8N ستارتر',
    description: 'N8N Starter — the self-hostable workflow automation platform with 400+ integrations, native AI nodes for LLM workflows, and visual automation builder.',
    descriptionAr: 'N8N Starter — منصة أتمتة سير العمل القابلة للاستضافة الذاتية مع أكثر من 400 تكامل وعقد AI أصلية لسير عمل LLM ومنشئ أتمتة بصري.',
    features: [
      '400+ native app integrations',
      'AI nodes: LLM chains & agents',
      'Visual workflow builder',
      'Code nodes (JavaScript & Python)',
      'Webhook triggers & schedulers',
      'Data transformation & routing',
      'Starter: 2,500 workflow executions/month',
      'Community support & templates',
    ],
    featuresAr: [
      'أكثر من 400 تكامل تطبيقات أصلي',
      'عقد AI: سلاسل LLM ووكلاء',
      'منشئ سير عمل بصري',
      'عقد الكود (JavaScript وPython)',
      'محفزات Webhook وجداول زمنية',
      'تحويل البيانات والتوجيه',
      'Starter: 2,500 تنفيذ سير عمل شهرياً',
      'دعم المجتمع وقوالب جاهزة',
    ],
    images: [IMG.n8n],
    durationLabel: 'شهري',
    displayOrder: 42,
  },

  // ════════════════════════════════════════
  // WARP BUILD
  // ════════════════════════════════════════
  'warp-build': {
    name: 'Warp Build',
    nameAr: 'وارب بيلد',
    description: 'Warp Build — the AI-powered terminal and dev environment with natural language commands, AI agent for debugging, smart command palette, and team sharing.',
    descriptionAr: 'Warp Build — الطرفية وبيئة التطوير AI مع أوامر لغة طبيعية ووكيل AI للتصحيح وقائمة أوامر ذكية ومشاركة الفريق.',
    features: [
      'AI agent for command assistance',
      'Natural language to shell commands',
      'Smart autocomplete & suggestions',
      'Warp Drive: shared team runbooks',
      'AI debugging for error messages',
      'Block-based output for readability',
      'Multi-session & tab management',
      'Git workflow integrations',
    ],
    featuresAr: [
      'وكيل AI لمساعدة الأوامر',
      'لغة طبيعية إلى أوامر Shell',
      'إكمال تلقائي واقتراحات ذكية',
      'Warp Drive: دفاتر تشغيل الفريق المشتركة',
      'تصحيح أخطاء AI لرسائل الخطأ',
      'مخرجات قائمة على البلوك لسهولة القراءة',
      'جلسات متعددة وإدارة التبويبات',
      'تكاملات Git workflow',
    ],
    images: [IMG.warp],
    durationLabel: 'شهري',
    displayOrder: 43,
  },

  // ════════════════════════════════════════
  // BOLT.NEW PRO
  // ════════════════════════════════════════
  'bolt-new-pro': {
    name: 'Bolt.new Pro',
    nameAr: 'بولت نيو برو',
    description: 'Bolt.new Pro — AI-powered full-stack web development in the browser. Prompt, run, edit, and deploy full-stack apps instantly with Anthropic Claude integration.',
    descriptionAr: 'Bolt.new Pro — تطوير ويب Full-Stack بالذكاء الاصطناعي في المتصفح. أنشئ وشغّل وعدّل وانشر تطبيقات Full-Stack فوراً مع تكامل Claude من Anthropic.',
    features: [
      'Claude AI for full-stack generation',
      '10M tokens/month (Pro)',
      'Full browser-based IDE',
      'Instant preview & hot-reload',
      'Deploy to Netlify in one click',
      'npm package installation',
      'Multiple framework support',
      'Project export to ZIP or GitHub',
    ],
    featuresAr: [
      'Claude AI لتوليد Full-Stack',
      '10 مليون رمز شهرياً (Pro)',
      'بيئة تطوير كاملة في المتصفح',
      'معاينة فورية وHot-reload',
      'نشر على Netlify بضغطة واحدة',
      'تثبيت حزم npm',
      'دعم أطر متعددة',
      'تصدير المشروع إلى ZIP أو GitHub',
    ],
    images: [IMG.bolt],
    durationLabel: 'شهري',
    isFeatured: true,
    displayOrder: 44,
  },

  // ════════════════════════════════════════
  // WISPR FLOW PRO
  // ════════════════════════════════════════
  'wispr-flow-pro': {
    name: 'Wispr Flow Pro',
    nameAr: 'ويسبر فلو برو',
    description: 'Wispr Flow Pro — AI voice dictation that works everywhere on your Mac. Speak naturally and Wispr Flow transcribes & edits your text in any app, 3x faster than typing.',
    descriptionAr: 'Wispr Flow Pro — إملاء صوتي AI يعمل في كل مكان على Mac. تكلم بشكل طبيعي وWispr Flow يكتب وينسّق نصك في أي تطبيق، 3x أسرع من الكتابة.',
    features: [
      'AI voice dictation in any app',
      '3x faster than typing',
      'AI grammar & punctuation correction',
      'Custom commands & vocabulary',
      'Works offline (no internet required)',
      'Multi-language support',
      'Customizable tone & style',
      'macOS native integration',
    ],
    featuresAr: [
      'إملاء صوتي AI في أي تطبيق',
      '3x أسرع من الكتابة',
      'تصحيح النحو وعلامات الترقيم بالذكاء الاصطناعي',
      'أوامر ومفردات مخصصة',
      'يعمل بدون إنترنت',
      'دعم متعدد اللغات',
      'نبرة وأسلوب قابلان للتخصيص',
      'تكامل أصلي مع macOS',
    ],
    images: [IMG.wisprflow],
    durationLabel: 'شهري',
    displayOrder: 45,
  },

  // ════════════════════════════════════════
  // LINEAR BUSINESS
  // ════════════════════════════════════════
  'linear-business': {
    name: 'Linear Business',
    nameAr: 'لينيار بيزنس',
    description: 'Linear Business — the issue tracker built for high-performance engineering teams with cycles, roadmaps, AI writing, SAML SSO, and advanced analytics.',
    descriptionAr: 'Linear Business — متتبع المشكلات المصمم لفرق هندسة عالية الأداء مع Cycles وخرائط الطريق وكتابة AI وSAML SSO وتحليلات متقدمة.',
    features: [
      'Unlimited team members & projects',
      'Cycles (sprints) with analytics',
      'Roadmaps & project planning',
      'Linear AI: issue drafting & summaries',
      'SAML SSO & SCIM provisioning',
      'Advanced workflow customization',
      'GitHub, GitLab & Figma integrations',
      'Priority & SLA tracking',
    ],
    featuresAr: [
      'أعضاء فريق ومشاريع غير محدودة',
      'Cycles (سبرينتات) مع تحليلات',
      'خرائط الطريق وتخطيط المشاريع',
      'Linear AI: صياغة المشكلات والملخصات',
      'SAML SSO وتوفير SCIM',
      'تخصيص سير عمل متقدم',
      'تكاملات GitHub وGitLab وFigma',
      'تتبع الأولوية وSLA',
    ],
    images: [IMG.linear],
    durationLabel: 'شهري',
    displayOrder: 46,
  },

  // ════════════════════════════════════════
  // MANUS PRO
  // ════════════════════════════════════════
  'manus-pro': {
    name: 'Manus Pro',
    nameAr: 'مانوس برو',
    description: 'Manus Pro — the autonomous AI agent that independently browses the web, writes code, manages files, and completes complex multi-step tasks without supervision.',
    descriptionAr: 'Manus Pro — وكيل AI مستقل يتصفح الويب ويكتب الكود ويدير الملفات ويكمل مهاماً معقدة متعددة الخطوات بشكل مستقل بدون إشراف.',
    features: [
      'Autonomous multi-step task completion',
      'Web browsing & information gathering',
      'Code writing & execution',
      'File management & document creation',
      'Form filling & web interaction',
      'Data analysis & report generation',
      'Pro: 3,000 credits/month',
      'Parallel agent execution',
    ],
    featuresAr: [
      'إكمال مهام متعددة الخطوات باستقلالية',
      'تصفح الويب وجمع المعلومات',
      'كتابة الكود وتنفيذه',
      'إدارة الملفات وإنشاء المستندات',
      'تعبئة النماذج والتفاعل مع الويب',
      'تحليل البيانات وإنشاء التقارير',
      'Pro: 3,000 رصيد شهرياً',
      'تنفيذ وكلاء متوازيين',
    ],
    images: [IMG.manus],
    durationLabel: 'شهري',
    isFeatured: true,
    displayOrder: 47,
  },

  // ════════════════════════════════════════
  // REPLIT CORE
  // ════════════════════════════════════════
  'replit-core': {
    name: 'Replit Core',
    nameAr: 'ريبليت كور',
    description: 'Replit Core — cloud-based IDE with AI coding agent, always-on deployments, 50GB storage, private Repls, and boosted computing for professional developers.',
    descriptionAr: 'Replit Core — بيئة تطوير سحابية مع وكيل كود AI ونشر دائم التشغيل و50GB تخزين وRepls خاصة وحوسبة معززة للمطورين المحترفين.',
    features: [
      'Replit AI Agent: full app generation',
      'Always-on & scheduled deployments',
      'Private Repls & code privacy',
      '50GB persistent storage',
      'Boosted compute (4x faster)',
      'Custom domains for deployments',
      '10 always-on Repls',
      'Priority support & Core badge',
    ],
    featuresAr: [
      'Replit AI Agent: توليد تطبيقات كاملة',
      'نشر دائم التشغيل ومجدول',
      'Repls خاصة وخصوصية الكود',
      '50GB تخزين دائم',
      'حوسبة معززة (4x أسرع)',
      'نطاقات مخصصة للنشر',
      '10 Repls دائمة التشغيل',
      'دعم أولوية وشارة Core',
    ],
    images: [IMG.replit],
    durationLabel: 'شهري',
    displayOrder: 48,
  },

  // ════════════════════════════════════════
  // CANVA BUSINESS
  // ════════════════════════════════════════
  'canva-business': {
    name: 'Canva Business',
    nameAr: 'كانفا بيزنس',
    description: 'Canva Business — team design collaboration with Brand Controls, unlimited storage, advanced workflows, approval processes, and AI design tools for growing teams.',
    descriptionAr: 'كانفا بيزنس — تصميم تعاوني للفرق مع Brand Controls وتخزين غير محدود وسير عمل متقدمة وعمليات موافقة وأدوات تصميم AI للفرق النامية.',
    features: [
      'All Canva Pro features included',
      'Brand Controls & approval workflows',
      'Unlimited team storage',
      'Teams & shared brand templates',
      'Custom template locking',
      'Advanced admin controls',
      'Magic Studio AI for teams',
      'Priority team support',
    ],
    featuresAr: [
      'كل مميزات Canva Pro مشمولة',
      'Brand Controls وسير عمل الموافقة',
      'تخزين فريق غير محدود',
      'فرق وقوالب علامة تجارية مشتركة',
      'قفل القوالب المخصصة',
      'أدوات مشرف متقدمة',
      'Magic Studio AI للفرق',
      'دعم فريق أولوية',
    ],
    images: [IMG.canva],
    durationLabel: 'شهري – للفرق',
    displayOrder: 49,
  },
};

async function main() {
  console.log('🚀 Starting full product data update...\n');

  for (const [slug, data] of Object.entries(PRODUCTS)) {
    const product = await prisma.product.findUnique({ where: { slug } });
    if (!product) {
      console.log(`⚠️  Product not found: ${slug} — skipping`);
      continue;
    }

    await prisma.product.update({
      where: { slug },
      data: {
        name:          data.name,
        nameAr:        data.nameAr,
        description:   data.description,
        descriptionAr: data.descriptionAr,
        features:      JSON.stringify(data.features),
        featuresAr:    JSON.stringify(data.featuresAr),
        images:        JSON.stringify(data.images),
        durationLabel: data.durationLabel,
        isFeatured:    data.isFeatured ?? false,
        displayOrder:  data.displayOrder,
        // ❌ لا نمس الأسعار أو الـ variants
      },
    });

    console.log(`✅ Updated: ${data.name}`);
  }

  console.log('\n✨ All products updated successfully!');
  console.log('⚠️  Prices were NOT changed — update them manually in admin panel.\n');
}

main()
  .catch((e) => { console.error('❌ Error:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
