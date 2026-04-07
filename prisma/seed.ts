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

  const entertainmentCategory = await prisma.category.upsert({
    where: { slug: 'entertainment' },
    update: {},
    create: {
      name: 'Entertainment',
      slug: 'entertainment',
      isActive: true,
    },
  });

  // Create products with variants
  const products = [
    {
      name: 'ChatGPT Plus',
      slug: 'chatgpt-plus',
      description: 'Unlock the full power of ChatGPT with GPT-4, faster responses, and priority access. Perfect for professionals, students, and creators who need advanced AI assistance for writing, coding, analysis, and creative projects.',
      features: JSON.stringify([
        'Access to GPT-4 and GPT-4o models',
        'Priority access during peak times',
        'Faster response speeds',
        'Access to plugins and advanced features',
        'DALL-E image generation',
        'Advanced data analysis',
        'Custom GPTs creation',
        'Browse the internet in real-time',
      ]),
      basePrice: 20,
      discount: 0,
      images: JSON.stringify([
        'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/1200px-ChatGPT_logo.svg.png',
      ]),
      categoryId: aiCategory.id,
      orderCount: 0,
      variants: [
        { title: '1 Month Plan', duration: 'monthly', price: 20 },
        { title: '3 Months Plan', duration: '3-months', price: 55 },
        { title: '12 Months Plan', duration: 'yearly', price: 192 },
      ],
    },
    {
      name: 'Gemini Advanced',
      slug: 'gemini-advanced',
      description: 'Experience Google\'s most capable AI model with Gemini Advanced. Get access to Ultra 1.0, the largest and most capable AI model, for complex reasoning, coding, and creative collaboration.',
      features: JSON.stringify([
        'Access to Gemini Ultra model',
        'Extended conversation context',
        'Advanced coding assistance',
        'Complex reasoning capabilities',
        'Priority access to new features',
        'Integration with Google Workspace',
        '2TB Google One storage included',
        'Gemini in Gmail, Docs, and more',
      ]),
      basePrice: 20,
      discount: 5,
      images: JSON.stringify([
        'https://storage.googleapis.com/gweb-uniblog-publish-prod/images/Gemini_SS.width-1300.jpg',
      ]),
      categoryId: aiCategory.id,
      orderCount: 0,
      variants: [
        { title: '1 Month Plan', duration: 'monthly', price: 20 },
        { title: '3 Months Plan', duration: '3-months', price: 54 },
        { title: '12 Months Plan', duration: 'yearly', price: 180 },
      ],
    },
    {
      name: 'LinkedIn Premium',
      slug: 'linkedin-premium',
      description: 'Supercharge your career with LinkedIn Premium. Get InMail credits, see who viewed your profile, access LinkedIn Learning courses, and gain competitive insights to stay ahead in your professional journey.',
      features: JSON.stringify([
        'InMail messages to anyone',
        'See who viewed your profile',
        'Full access to LinkedIn Learning',
        'Salary insights and comparisons',
        'Applicant insights for jobs',
        'Featured applicant badge',
        'Business insights and analytics',
        'AI-powered resume and cover letter tools',
      ]),
      basePrice: 30,
      discount: 0,
      images: JSON.stringify([
        'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/LinkedIn_logo_initials.png/640px-LinkedIn_logo_initials.png',
      ]),
      categoryId: aiCategory.id,
      orderCount: 0,
      variants: [
        { title: '1 Month Plan', duration: 'monthly', price: 30 },
        { title: '3 Months Plan', duration: '3-months', price: 80 },
        { title: '12 Months Plan', duration: 'yearly', price: 288 },
      ],
    },
    {
      name: 'Canva Pro',
      slug: 'canva-pro',
      description: 'Design like a pro with Canva Pro. Access premium templates, brand kits, background remover, magic resize, and millions of premium stock photos and elements for stunning visual content.',
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
      basePrice: 13,
      discount: 0,
      images: JSON.stringify([
        'https://upload.wikimedia.org/wikipedia/en/thumb/b/bb/Canva_Logo.svg/1200px-Canva_Logo.svg.png',
      ]),
      categoryId: creativeCategory.id,
      orderCount: 0,
      variants: [
        { title: '1 Month Plan', duration: 'monthly', price: 13 },
        { title: '3 Months Plan', duration: '3-months', price: 35 },
        { title: '12 Months Plan', duration: 'yearly', price: 120 },
      ],
    },
    {
      name: 'Notion Pro',
      slug: 'notion-pro',
      description: 'The ultimate workspace for notes, docs, and project management. Notion Pro gives you unlimited file uploads, advanced collaboration, and powerful databases to organize your life and work.',
      features: JSON.stringify([
        'Unlimited file uploads',
        'Unlimited blocks for teams',
        'Advanced page analytics',
        'Bulk PDF export',
        '30-day page history',
        'Up to 100 guest collaborators',
        'Advanced permissions',
        'Priority support',
      ]),
      basePrice: 10,
      discount: 0,
      images: JSON.stringify([
        'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Notion-logo.svg/1024px-Notion-logo.svg.png',
      ]),
      categoryId: aiCategory.id,
      orderCount: 0,
      variants: [
        { title: '1 Month Plan', duration: 'monthly', price: 10 },
        { title: '3 Months Plan', duration: '3-months', price: 27 },
        { title: '12 Months Plan', duration: 'yearly', price: 96 },
      ],
    },
    {
      name: 'Spotify Premium',
      slug: 'spotify-premium',
      description: 'Enjoy ad-free music streaming with Spotify Premium. Download songs for offline listening, get higher audio quality, and discover new music with personalized recommendations.',
      features: JSON.stringify([
        'Ad-free music streaming',
        'Download for offline listening',
        'High quality audio (320kbps)',
        'Play any song on demand',
        'Unlimited skips',
        'Spotify Connect across devices',
        'Collaborative playlists',
        'Personalized Discover Weekly',
      ]),
      basePrice: 10,
      discount: 10,
      images: JSON.stringify([
        'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Spotify_icon.svg/1024px-Spotify_icon.svg.png',
      ]),
      categoryId: entertainmentCategory.id,
      orderCount: 0,
      variants: [
        { title: '1 Month Plan', duration: 'monthly', price: 10 },
        { title: '3 Months Plan', duration: '3-months', price: 27 },
        { title: '12 Months Plan', duration: 'yearly', price: 99 },
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
