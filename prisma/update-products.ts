/**
 * update-products.ts
 * يحدّث بيانات كل المنتجات: الصور، المميزات (EN/AR)، الأوصاف، الترتيب
 * لا يمس الأسعار ولا الـ variants
 * تشغيل: npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/update-products.ts
 */

import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import 'dotenv/config';

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ─── صور المنتجات (من /public/logos/) ───
const IMG = {
  gemini:     '/logos/gemini.svg',
  chatgpt:    '/logos/chatgpt.png',
  canva:      '/logos/canva.png',
  capcut:     '/logos/capcut.png',
  office:     '/logos/office.svg',
  adobe:      '/logos/adobe.png',
  perplexity: '/logos/perplexity.png',
  grok:       '/logos/grok.svg',
};

// ─── بيانات كل منتج (لا يوجد سعر هنا) ───
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
  // GEMINI
  // ════════════════════════════════════════
  'gemini-6month-family': {
    name: 'Gemini Advanced – 6 Months Family',
    nameAr: 'جيميناي أدفانسد – 6 أشهر عائلي',
    description: 'Google Gemini Advanced family plan for 6 months. Share premium AI with up to 5 family members and get 2TB of Google One storage included.',
    descriptionAr: 'اشتراك Gemini Advanced العائلي لمدة 6 أشهر. شارك أقوى ذكاء اصطناعي من Google مع حتى 5 أفراد من العائلة، ويشمل 2TB مساحة Google One.',
    features: [
      'Gemini 2.0 Ultra model — most powerful Google AI',
      'Family sharing for up to 5 members',
      '2TB Google One storage included',
      'Gemini in Gmail, Docs, Drive & Workspace',
      'Advanced coding & debugging assistant',
      'Deep research & analysis capabilities',
      'Priority access to new Google AI features',
      'Multimodal inputs: text, image, audio & video',
    ],
    featuresAr: [
      'نموذج Gemini 2.0 Ultra — أقوى ذكاء اصطناعي من جوجل',
      'مشاركة عائلية لحتى 5 أفراد',
      '2TB مساحة Google One مشمولة',
      'Gemini داخل Gmail ودرايف وDocs',
      'مساعد متقدم للبرمجة وإصلاح الأكواد',
      'قدرات بحث وتحليل عميق',
      'أولوية الوصول لمميزات Google AI الجديدة',
      'يدعم النصوص والصور والصوت والفيديو',
    ],
    images: [IMG.gemini],
    durationLabel: '6 أشهر – عائلي',
    isFeatured: true,
    displayOrder: 1,
  },

  'gemini-12month-family': {
    name: 'Gemini Advanced – 12 Months Family',
    nameAr: 'جيميناي أدفانسد – 12 شهر عائلي',
    description: 'Google Gemini Advanced family plan for 12 months — best value for families wanting premium AI all year long with 2TB shared storage.',
    descriptionAr: 'اشتراك Gemini Advanced العائلي لمدة 12 شهراً — الأفضل قيمة للعائلات مع ذكاء اصطناعي متميز طوال العام و2TB تخزين مشترك.',
    features: [
      'Gemini 2.0 Ultra model — most powerful Google AI',
      'Family sharing for up to 5 members',
      '2TB Google One storage included',
      'Gemini in Gmail, Docs, Drive & Workspace',
      'Advanced coding & debugging assistant',
      'Deep research & analysis capabilities',
      'Best yearly value for families',
      'Priority access to all new features',
    ],
    featuresAr: [
      'نموذج Gemini 2.0 Ultra — أقوى ذكاء اصطناعي من جوجل',
      'مشاركة عائلية لحتى 5 أفراد',
      '2TB مساحة Google One مشمولة',
      'Gemini داخل Gmail ودرايف وDocs',
      'مساعد متقدم للبرمجة وإصلاح الأكواد',
      'قدرات بحث وتحليل عميق',
      'أفضل قيمة سنوية للعائلات',
      'أولوية الوصول لكل المميزات الجديدة',
    ],
    images: [IMG.gemini],
    durationLabel: '12 شهر – عائلي',
    isFeatured: true,
    displayOrder: 2,
  },

  'gemini-pro-antigravity-4month': {
    name: 'Gemini Pro – 4 Months',
    nameAr: 'جيميناي برو – 4 أشهر',
    description: 'Google Gemini Pro subscription for 4 months. Get access to Gemini\'s advanced reasoning, coding, and multimodal capabilities with Google Workspace integration.',
    descriptionAr: 'اشتراك Gemini Pro لمدة 4 أشهر. احصل على قدرات التفكير المتقدم والبرمجة والمدخلات المتعددة مع تكامل كامل مع Google Workspace.',
    features: [
      'Gemini 2.0 Pro model access',
      'Extended 1M token context window',
      'Google Workspace deep integration',
      '2TB Google One storage included',
      'Advanced code generation & review',
      'Multimodal: images, PDFs, videos',
      'Deep research with cited sources',
      'Priority response speed',
    ],
    featuresAr: [
      'الوصول لنموذج Gemini 2.0 Pro',
      'نافذة سياق موسعة تصل إلى مليون رمز',
      'تكامل عميق مع Google Workspace',
      '2TB تخزين Google One مشمول',
      'توليد الكود ومراجعته بشكل متقدم',
      'دعم الصور وملفات PDF والفيديوهات',
      'بحث متعمق مع مصادر موثقة',
      'سرعة استجابة أولوية',
    ],
    images: [IMG.gemini],
    durationLabel: '4 أشهر',
    displayOrder: 3,
  },

  'gemini-pro-12month': {
    name: 'Gemini Pro – 12 Months',
    nameAr: 'جيميناي برو – 12 شهر',
    description: 'Google Gemini Pro for a full year — the most cost-effective way to enjoy premium Gemini capabilities, Workspace integration, and 2TB storage for 12 months.',
    descriptionAr: 'اشتراك Gemini Pro لعام كامل — الطريقة الأكثر توفيراً للاستمتاع بمميزات Gemini المتميزة وتكامل Workspace و2TB تخزين لمدة 12 شهراً.',
    features: [
      'Gemini 2.0 Pro model for a full year',
      'Extended 1M token context window',
      'Google Workspace deep integration',
      '2TB Google One storage included',
      'Advanced code generation & review',
      'Multimodal: images, PDFs, videos',
      'Best price per month — yearly plan',
      'Priority access to all new features',
    ],
    featuresAr: [
      'نموذج Gemini 2.0 Pro لعام كامل',
      'نافذة سياق موسعة تصل إلى مليون رمز',
      'تكامل عميق مع Google Workspace',
      '2TB تخزين Google One مشمول',
      'توليد الكود ومراجعته بشكل متقدم',
      'دعم الصور وملفات PDF والفيديوهات',
      'أفضل سعر شهري — خطة سنوية',
      'أولوية الوصول لكل المميزات الجديدة',
    ],
    images: [IMG.gemini],
    durationLabel: '12 شهر',
    isFeatured: true,
    displayOrder: 4,
  },

  // ════════════════════════════════════════
  // CHATGPT
  // ════════════════════════════════════════
  'chatgpt-go': {
    name: 'ChatGPT Plus GO',
    nameAr: 'شات جي بي تي بلس GO',
    description: 'ChatGPT Plus GO plan — affordable access to OpenAI\'s GPT-4o with browsing, image generation, and custom GPTs at a budget-friendly price.',
    descriptionAr: 'خطة ChatGPT Plus GO — وصول ميسور التكلفة لنموذج GPT-4o مع التصفح وتوليد الصور والـ GPTs المخصصة.',
    features: [
      'Access to GPT-4o model',
      'Web browsing & real-time search',
      'DALL-E 3 image generation',
      'File upload & document analysis',
      'Custom GPTs marketplace access',
      'Voice mode conversation',
      'Mobile & desktop apps',
      'Regular model updates',
    ],
    featuresAr: [
      'الوصول لنموذج GPT-4o',
      'تصفح الويب والبحث في الوقت الفعلي',
      'توليد الصور بـ DALL-E 3',
      'رفع الملفات وتحليل المستندات',
      'الوصول لسوق GPTs المخصصة',
      'محادثة بالصوت',
      'تطبيقات الموبايل والكمبيوتر',
      'تحديثات دورية للنموذج',
    ],
    images: [IMG.chatgpt],
    durationLabel: 'شهري',
    displayOrder: 5,
  },

  'chatgpt-plus-shared': {
    name: 'ChatGPT Plus – Shared',
    nameAr: 'شات جي بي تي بلس – مشترك',
    description: 'ChatGPT Plus shared account — enjoy all Plus features including GPT-4o, DALL-E 3, and advanced data analysis at a reduced cost on a shared account.',
    descriptionAr: 'حساب ChatGPT Plus مشترك — استمتع بكل مميزات Plus من GPT-4o وDALL-E 3 وتحليل البيانات المتقدم بسعر مخفض على حساب مشترك.',
    features: [
      'Access to GPT-4o & GPT-4o mini',
      'DALL-E 3 image generation',
      'Advanced data analysis & Python',
      'Real-time web browsing',
      'Custom GPTs creation & access',
      'File & image uploads',
      'Shared account — cost efficient',
      'Priority access during peak hours',
    ],
    featuresAr: [
      'الوصول لـ GPT-4o وGPT-4o mini',
      'توليد الصور بـ DALL-E 3',
      'تحليل بيانات متقدم وPython',
      'تصفح الويب في الوقت الفعلي',
      'إنشاء GPTs مخصصة والوصول إليها',
      'رفع الملفات والصور',
      'حساب مشترك — موفر التكلفة',
      'أولوية الوصول في ساعات الذروة',
    ],
    images: [IMG.chatgpt],
    durationLabel: 'شهري – مشترك',
    isFeatured: true,
    displayOrder: 6,
  },

  'chatgpt-plus-private': {
    name: 'ChatGPT Plus – Private',
    nameAr: 'شات جي بي تي بلس – خاص',
    description: 'ChatGPT Plus private dedicated account — your own personal account with all Plus features, full privacy, and maximum response speed.',
    descriptionAr: 'حساب ChatGPT Plus خاص ومخصص لك — حسابك الشخصي بكل مميزات Plus مع خصوصية كاملة وأقصى سرعة استجابة.',
    features: [
      'Private dedicated account — yours only',
      'Access to GPT-4o & GPT-4o mini',
      'DALL-E 3 image generation',
      'Advanced data analysis & Python',
      'Real-time web browsing',
      'Custom GPTs creation & access',
      'Faster response speeds vs shared',
      'Full account privacy & history',
    ],
    featuresAr: [
      'حساب خاص ومخصص — لك وحدك',
      'الوصول لـ GPT-4o وGPT-4o mini',
      'توليد الصور بـ DALL-E 3',
      'تحليل بيانات متقدم وPython',
      'تصفح الويب في الوقت الفعلي',
      'إنشاء GPTs مخصصة والوصول إليها',
      'سرعة استجابة أعلى مقارنة بالمشترك',
      'خصوصية كاملة وسجل المحادثات',
    ],
    images: [IMG.chatgpt],
    durationLabel: 'شهري – خاص',
    isFeatured: true,
    displayOrder: 7,
  },

  // ════════════════════════════════════════
  // CANVA PRO
  // ════════════════════════════════════════
  'canva-pro': {
    name: 'Canva Pro',
    nameAr: 'كانفا برو',
    description: 'Canva Pro — design like a professional with 100M+ premium templates, AI-powered tools, Brand Kit, and 1TB cloud storage for all your creative projects.',
    descriptionAr: 'كانفا برو — صمم كالمحترفين مع أكثر من 100 مليون قالب احترافي، وأدوات الذكاء الاصطناعي وBrand Kit و1TB تخزين سحابي لكل مشاريعك الإبداعية.',
    features: [
      '100M+ premium templates & stock photos',
      'Magic Studio: AI design tools',
      'Background Remover & Magic Eraser',
      'Magic Resize for any platform size',
      'Brand Kit: fonts, colors & logos',
      'Schedule & publish to social media',
      '1TB cloud storage for projects',
      'Unlimited premium elements & fonts',
    ],
    featuresAr: [
      'أكثر من 100 مليون قالب وصورة احترافية',
      'Magic Studio: أدوات تصميم بالذكاء الاصطناعي',
      'إزالة الخلفية والعناصر السحرية',
      'تغيير الحجم التلقائي لكل المنصات',
      'Brand Kit: الخطوط والألوان والشعارات',
      'جدولة ونشر المحتوى على السوشيال',
      '1TB تخزين سحابي للمشاريع',
      'عناصر وخطوط احترافية غير محدودة',
    ],
    images: [IMG.canva],
    durationLabel: 'شهري',
    isFeatured: true,
    displayOrder: 8,
  },

  // ════════════════════════════════════════
  // CAPCUT PRO
  // ════════════════════════════════════════
  'capcut-pro': {
    name: 'CapCut Pro',
    nameAr: 'كاب كت برو',
    description: 'CapCut Pro — professional video editing with AI-powered tools, watermark-free exports, exclusive effects, and premium music for creators and businesses.',
    descriptionAr: 'CapCut Pro — تعديل فيديو احترافي بأدوات ذكاء اصطناعي متقدمة، تصدير بدون علامة مائية، مؤثرات حصرية وموسيقى مميزة للكريتورز والشركات.',
    features: [
      'Watermark-free video exports',
      'AI Auto-Captions in 40+ languages',
      'AI Background Removal & Replacement',
      'Exclusive premium effects & filters',
      'Premium music & sound effects library',
      'Cloud storage for all projects',
      'AI Video Enhancement & upscaling',
      'Priority processing speed',
    ],
    featuresAr: [
      'تصدير الفيديو بدون علامة مائية',
      'تعليقات تلقائية بالذكاء الاصطناعي بأكثر من 40 لغة',
      'إزالة الخلفية واستبدالها بالذكاء الاصطناعي',
      'مؤثرات وفلاتر حصرية وأنيقة',
      'مكتبة موسيقى ومؤثرات صوتية احترافية',
      'تخزين سحابي لكل المشاريع',
      'تحسين جودة الفيديو والـ Upscaling بالذكاء الاصطناعي',
      'سرعة معالجة مميزة',
    ],
    images: [IMG.capcut],
    durationLabel: 'شهري',
    displayOrder: 9,
  },

  // ════════════════════════════════════════
  // MICROSOFT OFFICE 365
  // ════════════════════════════════════════
  'office-365': {
    name: 'Microsoft 365',
    nameAr: 'مايكروسوفت 365',
    description: 'Microsoft 365 — the complete productivity suite with Word, Excel, PowerPoint, Teams, 1TB OneDrive, and Microsoft Copilot AI, on up to 5 devices.',
    descriptionAr: 'مايكروسوفت 365 — المجموعة الكاملة للإنتاجية مع Word وExcel وPowerPoint وTeams و1TB OneDrive ومساعد Copilot AI على ما يصل إلى 5 أجهزة.',
    features: [
      'Word, Excel, PowerPoint — always updated',
      'Microsoft Teams for collaboration',
      'Outlook email & calendar',
      '1TB OneDrive cloud storage',
      'Microsoft Copilot AI assistant',
      'Install on up to 5 devices',
      'Microsoft Editor & Designer',
      'Advanced security & compliance',
    ],
    featuresAr: [
      'Word وExcel وPowerPoint — دائماً محدّثة',
      'Microsoft Teams للتعاون والاجتماعات',
      'Outlook للإيميل والتقويم',
      '1TB تخزين OneDrive السحابي',
      'مساعد Copilot AI من مايكروسوفت',
      'التثبيت على ما يصل إلى 5 أجهزة',
      'Microsoft Editor وDesigner',
      'أمان وامتثال متقدمان',
    ],
    images: [IMG.office],
    durationLabel: 'شهري',
    displayOrder: 10,
  },

  // ════════════════════════════════════════
  // ADOBE CREATIVE CLOUD
  // ════════════════════════════════════════
  'adobe-creative-cloud': {
    name: 'Adobe Creative Cloud',
    nameAr: 'أدوبي كريتيف كلاود',
    description: 'Adobe Creative Cloud — the complete suite of 20+ professional creative apps including Photoshop, Illustrator, Premiere Pro, After Effects, and Adobe Firefly AI.',
    descriptionAr: 'أدوبي كريتيف كلاود — مجموعة كاملة من أكثر من 20 تطبيق إبداعي احترافي تشمل Photoshop وIllustrator وPremiere Pro وAfter Effects وAdobe Firefly AI.',
    features: [
      'Adobe Photoshop — photo editing & compositing',
      'Adobe Illustrator — vector graphics',
      'Adobe Premiere Pro — video editing',
      'Adobe After Effects — motion graphics & VFX',
      'Adobe Lightroom — photo management',
      '100GB cloud storage',
      'Adobe Fonts: 20,000+ typefaces',
      'Adobe Firefly AI generative tools',
    ],
    featuresAr: [
      'Adobe Photoshop — تعديل الصور والكومبوزيتينج',
      'Adobe Illustrator — الرسومات المتجهية',
      'Adobe Premiere Pro — تعديل الفيديو',
      'Adobe After Effects — موشن جرافيك وVFX',
      'Adobe Lightroom — إدارة الصور',
      '100GB تخزين سحابي',
      'Adobe Fonts: أكثر من 20,000 خط',
      'أدوات الذكاء الاصطناعي Adobe Firefly',
    ],
    images: [IMG.adobe],
    durationLabel: 'شهري',
    displayOrder: 11,
  },

  // ════════════════════════════════════════
  // PERPLEXITY PRO
  // ════════════════════════════════════════
  'perplexity-pro': {
    name: 'Perplexity Pro',
    nameAr: 'بيربلكسيتي برو',
    description: 'Perplexity Pro — the AI-powered answer engine with unlimited Pro searches, access to GPT-4o, Claude 3.5, and Gemini with cited, real-time answers.',
    descriptionAr: 'Perplexity Pro — محرك الإجابات بالذكاء الاصطناعي مع بحث Pro غير محدود، والوصول لـ GPT-4o وClaude 3.5 وGemini مع إجابات موثقة وفي الوقت الفعلي.',
    features: [
      'Unlimited Pro searches per day',
      'Access to GPT-4o, Claude 3.5 & Gemini',
      'Real-time web search with citations',
      'File upload & document analysis',
      'Image generation with DALL-E 3',
      'API access included',
      'Advanced reasoning (DeepResearch mode)',
      'Priority support',
    ],
    featuresAr: [
      'بحث Pro غير محدود يومياً',
      'الوصول لـ GPT-4o وClaude 3.5 وGemini',
      'بحث ويب في الوقت الفعلي مع مصادر',
      'رفع الملفات وتحليل المستندات',
      'توليد الصور بـ DALL-E 3',
      'وصول للـ API مشمول',
      'تفكير متقدم (وضع DeepResearch)',
      'دعم أولوية',
    ],
    images: [IMG.perplexity],
    durationLabel: 'شهري',
    displayOrder: 12,
  },

  // ════════════════════════════════════════
  // SUPER GROK (xAI)
  // ════════════════════════════════════════
  'super-grok': {
    name: 'Grok SuperGrok',
    nameAr: 'جروك سوبر جروك',
    description: 'Grok SuperGrok by xAI — Elon Musk\'s AI with real-time X/Twitter data, Grok 3 model, unlimited conversations, and unique Think mode for deep reasoning.',
    descriptionAr: 'Grok SuperGrok من xAI — الذكاء الاصطناعي من إيلون ماسك مع بيانات X/تويتر في الوقت الفعلي ونموذج Grok 3 ومحادثات غير محدودة ووضع Think للتفكير العميق.',
    features: [
      'Grok 3 — latest xAI flagship model',
      'Real-time X/Twitter data access',
      'Unlimited conversations & context',
      'Think mode for deep step-by-step reasoning',
      'DeepSearch: in-depth web research',
      'Image understanding & generation',
      'No content restrictions',
      'Priority access to new features',
    ],
    featuresAr: [
      'Grok 3 — أحدث نموذج رائد من xAI',
      'الوصول لبيانات X/تويتر في الوقت الفعلي',
      'محادثات وسياق غير محدودان',
      'وضع Think للتفكير العميق خطوة بخطوة',
      'DeepSearch: بحث ويب متعمق',
      'فهم الصور وتوليدها',
      'بدون قيود على المحتوى',
      'أولوية الوصول للمميزات الجديدة',
    ],
    images: [IMG.grok],
    durationLabel: 'شهري',
    displayOrder: 13,
  },
};

async function main() {
  console.log('🚀 Starting product data update...\n');

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
