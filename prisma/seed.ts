import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import * as bcrypt from 'bcryptjs';
import 'dotenv/config';

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create admin
  const hashedPassword = await bcrypt.hash('Hub2030@', 10);
  await prisma.admin.upsert({
    where: { email: 'owner@servicehub.com' },
    update: {},
    create: {
      email: 'owner@servicehub.com',
      name: 'Owner',
      password: hashedPassword,
    },
  });

  // Create settings
  const existingSettings = await prisma.settings.findFirst();
  if (!existingSettings) {
    await prisma.settings.create({
      data: {
        storeName: 'Service Hub',
        whatsappPhone: '1234567890',
        currency: 'EGP',
        seoTitle: 'Service Hub - Premium Digital Subscriptions',
        seoDescription: 'Get premium digital subscriptions at the best prices. ChatGPT, Gemini, Canva, and more.',
        theme: 'dark',
      },
    });
  }

  // Create categories
  const aiCategory = await prisma.category.upsert({
    where: { slug: 'ai-productivity' },
    update: {},
    create: {
      name: 'AI & Productivity',
      slug: 'ai-productivity',
      isActive: true,
    },
  });

  const creativeCategory = await prisma.category.upsert({
    where: { slug: 'creative-tools' },
    update: {},
    create: {
      name: 'Creative Tools',
      slug: 'creative-tools',
      isActive: true,
    },
  });

  const officeCategory = await prisma.category.upsert({
    where: { slug: 'office-suite' },
    update: {},
    create: {
      name: 'Office & Productivity Suite',
      slug: 'office-suite',
      isActive: true,
    },
  });

  // Product logos (stored in /public/logos/)
  const GEMINI_IMAGE = '/logos/gemini.svg';
  const CHATGPT_IMAGE = '/logos/chatgpt.png';
  const CANVA_IMAGE = '/logos/canva.png';
  const CAPCUT_IMAGE = '/logos/capcut.png';
  const OFFICE_IMAGE = '/logos/office.svg';
  const ADOBE_IMAGE = '/logos/adobe.png';
  const PERPLEXITY_IMAGE = '/logos/perplexity.png';
  const GROK_IMAGE = '/logos/grok.svg';

  // Create products
  const products = [
    // ===== GEMINI PRODUCTS =====
    {
      name: 'Gemini - 6 Month - Family',
      slug: 'gemini-6month-family',
      description: 'اشتراك Gemini Advanced عائلي لمدة 6 أشهر. استمتع بأقوى نموذج ذكاء اصطناعي من Google مع مشاركة عائلية تصل إلى 5 أفراد. يتضمن 2TB مساحة تخزين Google One.',
      features: JSON.stringify([
        'Access to Gemini Ultra model',
        'Family sharing up to 5 members',
        '2TB Google One storage included',
        'Gemini in Gmail, Docs, and more',
        'Advanced coding assistance',
        'Complex reasoning capabilities',
        'Priority access to new features',
        'Integration with Google Workspace',
      ]),
      basePrice: 0,
      discount: 0,
      images: JSON.stringify([GEMINI_IMAGE]),
      categoryId: aiCategory.id,
      durationLabel: '6 أشهر - عائلي',
      orderCount: 0,
      variants: [
        { title: '6 Months - Family', duration: '6-months', price: 0 },
      ],
    },
    {
      name: 'Gemini - 12 Month - Family',
      slug: 'gemini-12month-family',
      description: 'اشتراك Gemini Advanced عائلي لمدة 12 شهر. أفضل قيمة للعائلات مع كل مميزات Gemini Advanced ومشاركة عائلية تصل إلى 5 أفراد.',
      features: JSON.stringify([
        'Access to Gemini Ultra model',
        'Family sharing up to 5 members',
        '2TB Google One storage included',
        'Gemini in Gmail, Docs, and more',
        'Advanced coding assistance',
        'Complex reasoning capabilities',
        'Priority access to new features',
        'Best value for families',
      ]),
      basePrice: 0,
      discount: 0,
      images: JSON.stringify([GEMINI_IMAGE]),
      categoryId: aiCategory.id,
      durationLabel: '12 شهر - عائلي',
      orderCount: 0,
      variants: [
        { title: '12 Months - Family', duration: '12-months', price: 0 },
      ],
    },
    {
      name: 'Gemini Pro (Antigravity) - 4 Month',
      slug: 'gemini-pro-antigravity-4month',
      description: 'اشتراك Gemini Pro مع Antigravity لمدة 4 أشهر. احصل على أقصى أداء من Gemini مع مميزات Antigravity المتقدمة للبرمجة والتحليل.',
      features: JSON.stringify([
        'Gemini Pro with Antigravity features',
        'Advanced coding capabilities',
        'Deep analysis and reasoning',
        'Priority access to new features',
        'Integration with Google Workspace',
        '2TB Google One storage included',
        'Gemini in Gmail, Docs, and more',
        'Extended context window',
      ]),
      basePrice: 0,
      discount: 0,
      images: JSON.stringify([GEMINI_IMAGE]),
      categoryId: aiCategory.id,
      durationLabel: '4 أشهر',
      orderCount: 0,
      variants: [
        { title: '4 Months Plan', duration: '4-months', price: 0 },
      ],
    },
    {
      name: 'Gemini Pro - 12 Month',
      slug: 'gemini-pro-12month',
      description: 'اشتراك Gemini Pro لمدة 12 شهر. استمتع بكل مميزات Gemini Pro لمدة عام كامل بأفضل سعر.',
      features: JSON.stringify([
        'Access to Gemini Pro model',
        'Advanced coding assistance',
        'Complex reasoning capabilities',
        'Priority access to new features',
        'Integration with Google Workspace',
        '2TB Google One storage included',
        'Gemini in Gmail, Docs, and more',
        'Best yearly value',
      ]),
      basePrice: 0,
      discount: 0,
      images: JSON.stringify([GEMINI_IMAGE]),
      categoryId: aiCategory.id,
      durationLabel: '12 شهر',
      orderCount: 0,
      variants: [
        { title: '12 Months Plan', duration: '12-months', price: 0 },
      ],
    },

    // ===== CANVA PRO =====
    {
      name: 'Canva Pro',
      slug: 'canva-pro',
      description: 'صمم كالمحترفين مع Canva Pro. احصل على ملايين القوالب والصور والعناصر المميزة مع أدوات تصميم متقدمة بالذكاء الاصطناعي.',
      features: JSON.stringify([
        '100M+ premium stock photos & elements',
        'Background Remover tool',
        'Magic Resize for any platform',
        'Brand Kit with custom fonts & colors',
        'Schedule social media content',
        'Premium templates library',
        '1TB cloud storage',
        'AI-powered design tools',
      ]),
      basePrice: 0,
      discount: 0,
      images: JSON.stringify([CANVA_IMAGE]),
      categoryId: creativeCategory.id,
      durationLabel: '',
      orderCount: 0,
      variants: [
        { title: 'Monthly Plan', duration: 'monthly', price: 0 },
      ],
    },

    // ===== CAPCUT PRO =====
    {
      name: 'CapCut Pro',
      slug: 'capcut-pro',
      description: 'احترف تعديل الفيديو مع CapCut Pro. أدوات تعديل متقدمة بالذكاء الاصطناعي، تأثيرات حصرية، وإزالة العلامة المائية لفيديوهات احترافية.',
      features: JSON.stringify([
        'Remove watermark',
        'Advanced AI editing tools',
        'Exclusive effects and filters',
        'Cloud storage for projects',
        'Priority processing speed',
        'Premium music library',
        'Advanced text & subtitle tools',
        'Auto captions with AI',
      ]),
      basePrice: 0,
      discount: 0,
      images: JSON.stringify([CAPCUT_IMAGE]),
      categoryId: creativeCategory.id,
      durationLabel: '',
      orderCount: 0,
      variants: [
        { title: 'Monthly Plan', duration: 'monthly', price: 0 },
      ],
    },

    // ===== MICROSOFT OFFICE =====
    {
      name: 'Office 365',
      slug: 'office-365',
      description: 'مايكروسوفت أوفيس 365 الكامل. Word, Excel, PowerPoint, Outlook وكل تطبيقات أوفيس مع 1TB OneDrive ومميزات Copilot AI.',
      features: JSON.stringify([
        'Microsoft Word, Excel, PowerPoint',
        'Microsoft Outlook & Teams',
        'OneDrive 1TB cloud storage',
        'Microsoft Copilot AI assistant',
        'Install on up to 5 devices',
        'Always up to date',
        'Advanced security features',
        'Microsoft Editor & Designer',
      ]),
      basePrice: 0,
      discount: 0,
      images: JSON.stringify([OFFICE_IMAGE]),
      categoryId: officeCategory.id,
      durationLabel: '',
      orderCount: 0,
      variants: [
        { title: 'Monthly Plan', duration: 'monthly', price: 0 },
      ],
    },

    // ===== ADOBE =====
    {
      name: 'Adobe Creative Cloud',
      slug: 'adobe-creative-cloud',
      description: 'مجموعة Adobe الإبداعية الكاملة. Photoshop, Illustrator, Premiere Pro, After Effects وكل تطبيقات Adobe مع 100GB تخزين سحابي.',
      features: JSON.stringify([
        'Adobe Photoshop',
        'Adobe Illustrator',
        'Adobe Premiere Pro',
        'Adobe After Effects',
        'Adobe Lightroom',
        '100GB cloud storage',
        'Adobe Fonts library',
        'AI-powered Adobe Firefly',
      ]),
      basePrice: 0,
      discount: 0,
      images: JSON.stringify([ADOBE_IMAGE]),
      categoryId: creativeCategory.id,
      durationLabel: '',
      orderCount: 0,
      variants: [
        { title: 'Monthly Plan', duration: 'monthly', price: 0 },
      ],
    },

    // ===== CHATGPT PRODUCTS =====
    {
      name: 'ChatGPT GO',
      slug: 'chatgpt-go',
      description: 'اشتراك ChatGPT GO الأساسي. استمتع بالوصول إلى ChatGPT مع مميزات أساسية بسعر مميز.',
      features: JSON.stringify([
        'Access to ChatGPT',
        'GPT-4o mini model',
        'Basic features access',
        'Web browsing',
        'File uploads',
        'Custom GPTs access',
        'Mobile app access',
        'Regular updates',
      ]),
      basePrice: 0,
      discount: 0,
      images: JSON.stringify([CHATGPT_IMAGE]),
      categoryId: aiCategory.id,
      durationLabel: '',
      orderCount: 0,
      variants: [
        { title: 'Monthly Plan', duration: 'monthly', price: 0 },
      ],
    },
    {
      name: 'ChatGPT Plus - Shared',
      slug: 'chatgpt-plus-shared',
      description: 'اشتراك ChatGPT Plus مشترك. كل مميزات Plus من GPT-4، DALL-E، وتحليل البيانات المتقدم بسعر مخفض على حساب مشترك.',
      features: JSON.stringify([
        'Access to GPT-4 and GPT-4o models',
        'DALL-E image generation',
        'Advanced data analysis',
        'Web browsing in real-time',
        'Custom GPTs creation',
        'Shared account access',
        'File uploads & analysis',
        'Priority access during peak times',
      ]),
      basePrice: 0,
      discount: 0,
      images: JSON.stringify([CHATGPT_IMAGE]),
      categoryId: aiCategory.id,
      durationLabel: 'مشترك',
      orderCount: 0,
      variants: [
        { title: 'Monthly Plan - Shared', duration: 'monthly', price: 0 },
      ],
    },
    {
      name: 'ChatGPT Plus - Private',
      slug: 'chatgpt-plus-private',
      description: 'اشتراك ChatGPT Plus خاص. حساب خاص بالكامل مع كل مميزات Plus من GPT-4، DALL-E، تحليل البيانات المتقدم وأكثر.',
      features: JSON.stringify([
        'Access to GPT-4 and GPT-4o models',
        'Private dedicated account',
        'DALL-E image generation',
        'Advanced data analysis',
        'Web browsing in real-time',
        'Custom GPTs creation',
        'Faster response speeds',
        'Priority access during peak times',
      ]),
      basePrice: 0,
      discount: 0,
      images: JSON.stringify([CHATGPT_IMAGE]),
      categoryId: aiCategory.id,
      durationLabel: 'خاص',
      orderCount: 0,
      variants: [
        { title: 'Monthly Plan - Private', duration: 'monthly', price: 0 },
      ],
    },

    // ===== PERPLEXITY PRO =====
    {
      name: 'Perplexity Pro',
      slug: 'perplexity-pro',
      description: 'اشتراك Perplexity Pro. محرك بحث بالذكاء الاصطناعي مع إجابات دقيقة ومراجع موثوقة. أفضل أداة للبحث والتعلم.',
      features: JSON.stringify([
        'Unlimited Pro searches',
        'Access to GPT-4 & Claude models',
        'File upload & analysis',
        'Image generation with DALL-E',
        'API access included',
        'Priority support',
        'Advanced reasoning mode',
        'Cited and verified answers',
      ]),
      basePrice: 0,
      discount: 0,
      images: JSON.stringify([PERPLEXITY_IMAGE]),
      categoryId: aiCategory.id,
      durationLabel: '',
      orderCount: 0,
      variants: [
        { title: 'Monthly Plan', duration: 'monthly', price: 0 },
      ],
    },

    // ===== SUPER GROK =====
    {
      name: 'Super Grok',
      slug: 'super-grok',
      description: 'اشتراك Super Grok من xAI. ذكاء اصطناعي متقدم بدون قيود مع تحليل في الوقت الفعلي وقدرات إبداعية غير محدودة.',
      features: JSON.stringify([
        'Grok 3 advanced model',
        'Real-time X/Twitter analysis',
        'Unlimited conversations',
        'Image understanding & generation',
        'DeepSearch capabilities',
        'Think mode for complex reasoning',
        'No content restrictions',
        'Priority access to new features',
      ]),
      basePrice: 0,
      discount: 0,
      images: JSON.stringify([GROK_IMAGE]),
      categoryId: aiCategory.id,
      durationLabel: '',
      orderCount: 0,
      variants: [
        { title: 'Monthly Plan', duration: 'monthly', price: 0 },
      ],
    },
  ];

  for (const productData of products) {
    const { variants, ...data } = productData;
    const product = await prisma.product.upsert({
      where: { slug: data.slug },
      update: {},
      create: data,
    });

    for (const variant of variants) {
      const existingVariant = await prisma.productVariant.findFirst({
        where: { productId: product.id, duration: variant.duration },
      });
      if (!existingVariant) {
        await prisma.productVariant.create({
          data: { ...variant, productId: product.id },
        });
      }
    }
  }

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
