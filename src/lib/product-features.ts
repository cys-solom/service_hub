/**
 * Real subscription features database for AI products.
 * Arabic + English, max 4 short bullet points per product.
 * Matches the product names used in the service hub.
 */

export interface ProductFeatureData {
  en: string[];
  ar: string[];
  accentColor: string; // Official brand color
}

// Priority order for sorting (lower = higher priority on listing page)
export const PRODUCT_PRIORITY: Record<string, number> = {
  // Tier 1 — Global giants
  chatgpt: 1,
  'chatgpt plus': 1,
  openai: 1,
  claude: 2,
  'claude pro': 2,
  gemini: 3,
  'gemini ai': 3,
  'google gemini': 3,
  grok: 4,
  'grok pro': 4,
  copilot: 5,
  'microsoft copilot': 5,
  perplexity: 6,
  midjourney: 7,
  // Tier 2 — Very popular
  canva: 10,
  notion: 11,
  cursor: 12,
  'cursor pro': 12,
  adobe: 13,
  linkedin: 14,
  'linkedin premium': 14,
  figma: 15,
  elevenlabs: 16,
  replit: 17,
  suno: 18,
  capcut: 19,
  spotify: 20,
  // Tier 3 — Other AI tools
  runway: 25,
  heygen: 26,
  'veo 3': 27,
  luma: 28,
  pika: 29,
  gamma: 30,
  quillbot: 31,
  grammarly: 32,
  bolt: 33,
  lovable: 34,
  warp: 35,
  supabase: 36,
  n8n: 37,
  notebooklm: 38,
  'notebooklm pro': 38,
  windsurf: 39,
};

// Real features database — concise and accurate
export const PRODUCT_FEATURES: Record<string, ProductFeatureData> = {

  /* ═══════════════════════════════════════════
     TIER 1 — The Big Names
  ═══════════════════════════════════════════ */

  chatgpt: {
    accentColor: '#10a37f',
    en: [
      'GPT-4o access — vision, voice & files',
      'Advanced Data Analysis & code interpreter',
      'DALL·E 3 image generation',
      'Custom GPTs & GPT Store access',
    ],
    ar: [
      'وصول GPT-4o — رؤية وصوت وملفات',
      'تحليل البيانات المتقدم ومترجم الكود',
      'توليد الصور بـ DALL·E 3',
      'GPTs مخصصة ومتجر GPT',
    ],
  },

  openai: {
    accentColor: '#10a37f',
    en: [
      'GPT-4o & o1 reasoning models',
      'Advanced Data Analysis & DALL·E 3',
      'Voice mode & vision capabilities',
      'Custom GPTs & API access',
    ],
    ar: [
      'نماذج GPT-4o و o1 للتفكير المتقدم',
      'تحليل البيانات وتوليد الصور DALL·E 3',
      'وضع الصوت وقراءة الصور',
      'GPTs مخصصة ووصول API',
    ],
  },

  gemini: {
    accentColor: '#4285f4',
    en: [
      'Gemini 2.5 Pro — 1M token context',
      'Deep Research & NotebookLM integration',
      'Image, audio & video understanding',
      '2TB Google One storage included',
    ],
    ar: [
      'Gemini 2.5 Pro — سياق مليون رمز',
      'بحث عميق وتكامل NotebookLM',
      'فهم الصور والصوت والفيديو',
      'تخزين 2TB من Google One مضمّن',
    ],
  },

  claude: {
    accentColor: '#d97706',
    en: [
      'Claude 3.7 Sonnet — best coding model',
      '200K token context window',
      'Projects & persistent memory',
      'Priority access during peak hours',
    ],
    ar: [
      'Claude 3.7 Sonnet — أفضل نموذج برمجة',
      'نافذة سياق 200K رمز',
      'مشاريع وذاكرة دائمة',
      'أولوية الوصول في أوقات الذروة',
    ],
  },

  grok: {
    accentColor: '#9b5cf6',
    en: [
      'Grok 3 — real-time X/Twitter data',
      'DeepSearch & Think mode',
      'Image generation with Aurora',
      'Voice conversations & early features',
    ],
    ar: [
      'Grok 3 — بيانات X/تويتر في الوقت الفعلي',
      'DeepSearch ووضع التفكير العميق',
      'توليد الصور بـ Aurora',
      'محادثات صوتية وميزات مبكرة',
    ],
  },

  perplexity: {
    accentColor: '#20b2aa',
    en: [
      'Pro Search with cited sources',
      'GPT-4o, Claude & Grok model switching',
      'File & image uploads analysis',
      'Unlimited access & API credits',
    ],
    ar: [
      'بحث احترافي مع مصادر موثقة',
      'تبديل بين GPT-4o وClaude وGrok',
      'تحليل الملفات والصور',
      'وصول غير محدود ورصيد API',
    ],
  },

  copilot: {
    accentColor: '#0078d4',
    en: [
      'Microsoft 365 Copilot in Word, Excel & Teams',
      'GPT-4 Turbo with Bing real-time search',
      'Image generation with Designer (DALL·E 3)',
      'Priority access & faster responses',
    ],
    ar: [
      'Copilot في Word وExcel وTeams',
      'GPT-4 Turbo مع بحث Bing الفوري',
      'توليد الصور بـ Designer (DALL·E 3)',
      'أولوية الوصول واستجابات أسرع',
    ],
  },

  midjourney: {
    accentColor: '#000000',
    en: [
      'Unlimited image generation (Relax mode)',
      'V6.1 & Niji 6 latest models',
      'High-resolution upscaling & editing',
      'Stealth mode & commercial license',
    ],
    ar: [
      'توليد صور غير محدود (وضع Relax)',
      'أحدث نماذج V6.1 و Niji 6',
      'رفع الدقة والتحرير المتقدم',
      'الوضع المخفي والترخيص التجاري',
    ],
  },

  /* ═══════════════════════════════════════════
     DESIGN & CREATIVE
  ═══════════════════════════════════════════ */

  canva: {
    accentColor: '#00c4cc',
    en: [
      'Magic Studio AI suite (Dream Lab, Magic Write)',
      'Brand Kit & unlimited premium assets',
      'Background Remover & Magic Eraser',
      'Team collaboration & 1TB storage',
    ],
    ar: [
      'مجموعة Magic Studio AI (Dream Lab، Magic Write)',
      'Brand Kit وأصول بريميوم غير محدودة',
      'إزالة الخلفية وممحاة سحرية',
      'تعاون الفريق وتخزين 1TB',
    ],
  },

  figma: {
    accentColor: '#f24e1e',
    en: [
      'Unlimited projects & Figma AI',
      'Dev Mode for developer handoff',
      'Advanced prototyping & animations',
      'Team libraries & branching',
    ],
    ar: [
      'مشاريع غير محدودة وFigma AI',
      'Dev Mode لتسليم المطورين',
      'تصميم نماذج أولية متقدمة',
      'مكتبات الفريق وإدارة الفروع',
    ],
  },

  adobe: {
    accentColor: '#ff0000',
    en: [
      'Firefly AI — unlimited generations',
      'Photoshop + Illustrator + Premiere',
      'Generative Fill & Expand',
      '100GB cloud storage',
    ],
    ar: [
      'Firefly AI — توليد غير محدود',
      'Photoshop + Illustrator + Premiere',
      'ملء وتوسيع تلقائي بالذكاء الاصطناعي',
      'تخزين سحابي 100GB',
    ],
  },

  capcut: {
    accentColor: '#000000',
    en: [
      'AI Auto Captions & translations',
      'AI Enhancer & background removal',
      'Unlimited cloud storage',
      'Commercial license for content',
    ],
    ar: [
      'ترجمة وتعليق تلقائي بالذكاء الاصطناعي',
      'تحسين الذكاء الاصطناعي وإزالة الخلفية',
      'تخزين سحابي غير محدود',
      'رخصة تجارية للمحتوى',
    ],
  },

  gamma: {
    accentColor: '#6366f1',
    en: [
      'AI-generated presentations & docs',
      'Unlimited slides & exports (PDF, PPT)',
      'Custom themes & brand fonts',
      'Analytics & sharing controls',
    ],
    ar: [
      'عروض ومستندات بالذكاء الاصطناعي',
      'شرائح غير محدودة وتصدير PDF وPPT',
      'ثيمات مخصصة وخطوط العلامة التجارية',
      'تحليلات وضوابط المشاركة',
    ],
  },

  /* ═══════════════════════════════════════════
     AI VIDEO & AUDIO
  ═══════════════════════════════════════════ */

  elevenlabs: {
    accentColor: '#f97316',
    en: [
      'Ultra-realistic voice cloning (30 sec sample)',
      '11M+ characters/month generation',
      'Dubbing & audio translation (29 languages)',
      'Voice Studio & API access',
    ],
    ar: [
      'استنساخ الصوت بواقعية فائقة (30 ثانية)',
      'توليد 11M+ حرف شهرياً',
      'دبلجة وترجمة صوتية (29 لغة)',
      'Voice Studio ووصول API',
    ],
  },

  heygen: {
    accentColor: '#6366f1',
    en: [
      'AI avatar video generation',
      'Instant video translation (175 languages)',
      'Custom avatar from 2-min video',
      'Streaming avatar & API access',
    ],
    ar: [
      'توليد فيديو بأفاتار ذكاء اصطناعي',
      'ترجمة فيديو فورية (175 لغة)',
      'أفاتار مخصص من فيديو 2 دقيقة',
      'أفاتار مباشر ووصول API',
    ],
  },

  runway: {
    accentColor: '#000000',
    en: [
      'Gen-3 Alpha Turbo video generation',
      'Motion Brush & camera controls',
      'AI training on custom styles',
      '625 credits/month (~312 seconds)',
    ],
    ar: [
      'توليد فيديو Gen-3 Alpha Turbo',
      'فرشاة الحركة والتحكم في الكاميرا',
      'تدريب AI على أساليب مخصصة',
      '625 رصيد شهرياً (~312 ثانية)',
    ],
  },

  suno: {
    accentColor: '#7c3aed',
    en: [
      'Full song generation with lyrics & vocals',
      '2,500 credits/month (500 songs)',
      'Custom styles, moods & instruments',
      'Commercial license for all music',
    ],
    ar: [
      'توليد أغاني كاملة مع كلمات وأصوات',
      '2,500 رصيد شهرياً (500 أغنية)',
      'أساليب ومزاجيات وآلات مخصصة',
      'رخصة تجارية لجميع الموسيقى',
    ],
  },

  /* ═══════════════════════════════════════════
     AI CODING
  ═══════════════════════════════════════════ */

  cursor: {
    accentColor: '#000000',
    en: [
      'Claude 3.7 Sonnet & GPT-4o — best coding AI',
      'Tab autocomplete & multi-file edits',
      'Codebase-aware AI chat & @-mention',
      '500 fast requests + unlimited slow',
    ],
    ar: [
      'Claude 3.7 Sonnet وGPT-4o — أفضل AI برمجة',
      'إكمال تلقائي بالتبويب وتحرير متعدد الملفات',
      'محادثة AI مدركة لقاعدة الكود',
      '500 طلب سريع + غير محدود بطيء',
    ],
  },

  replit: {
    accentColor: '#f26207',
    en: [
      'Replit AI Agent — build apps by chatting',
      'Ghostwriter code completion & debugging',
      'Always-on deployments & custom domains',
      '10GB storage & private Repls',
    ],
    ar: [
      'Replit AI Agent — بناء تطبيقات بالمحادثة',
      'إكمال الكود والتصحيح بـ Ghostwriter',
      'نشر دائم ونطاقات مخصصة',
      'تخزين 10GB و Repls خاصة',
    ],
  },

  bolt: {
    accentColor: '#f59e0b',
    en: [
      'Full-stack app generation from prompt',
      'Deploy to production in one click',
      'Figma-to-code & URL-to-app',
      '10M tokens/month included',
    ],
    ar: [
      'توليد تطبيقات full-stack من نص',
      'نشر للإنتاج بنقرة واحدة',
      'تحويل Figma وURL لكود',
      '10M رمز شهرياً مضمّن',
    ],
  },

  lovable: {
    accentColor: '#ec4899',
    en: [
      'AI-powered React app generation',
      'GitHub sync & live preview',
      'Supabase backend auto-setup',
      '100 monthly credits (≈100 features)',
    ],
    ar: [
      'توليد تطبيقات React بالذكاء الاصطناعي',
      'مزامنة GitHub ومعاينة مباشرة',
      'إعداد Supabase تلقائي',
      '100 رصيد شهري (≈100 ميزة)',
    ],
  },

  warp: {
    accentColor: '#01a0d2',
    en: [
      'AI-powered terminal with natural language',
      'Warp AI — command explanation & fix',
      'Persistent shell history & teams',
      'Workflows, notebooks & SSH support',
    ],
    ar: [
      'طرفية مدعومة بالذكاء الاصطناعي واللغة الطبيعية',
      'Warp AI — شرح الأوامر وإصلاحها',
      'تاريخ دائم وتعاون الفريق',
      'Workflows وملاحظات ودعم SSH',
    ],
  },

  /* ═══════════════════════════════════════════
     PRODUCTIVITY
  ═══════════════════════════════════════════ */

  notion: {
    accentColor: '#000000',
    en: [
      'Notion AI — write, summarize & translate',
      'Unlimited pages, blocks & file uploads',
      '90-day version history',
      'Custom domains & advanced integrations',
    ],
    ar: [
      'Notion AI — كتابة وتلخيص وترجمة',
      'صفحات وكتل وملفات غير محدودة',
      'تاريخ الإصدارات لـ 90 يوماً',
      'نطاقات مخصصة وتكاملات متقدمة',
    ],
  },

  grammarly: {
    accentColor: '#15c39a',
    en: [
      'Full-sentence rewrites & tone control',
      'Plagiarism detection (10B+ sources)',
      'Generative AI with custom style guide',
      'Works in 500,000+ apps & websites',
    ],
    ar: [
      'إعادة كتابة الجمل كاملة وضبط النبرة',
      'كشف الانتحال (10B+ مصدر)',
      'ذكاء اصطناعي توليدي مع دليل الأسلوب',
      'يعمل في 500,000+ تطبيق وموقع',
    ],
  },

  quillbot: {
    accentColor: '#3b82f6',
    en: [
      'Advanced Paraphraser (9 modes)',
      'AI Summarizer & Essay checker',
      'Plagiarism Checker (100+ pages/month)',
      'Grammar fixer & Citation Generator',
    ],
    ar: [
      'إعادة الصياغة المتقدمة (9 أوضاع)',
      'ملخص AI وفاحص المقالات',
      'كشف الانتحال (100+ صفحة شهرياً)',
      'تصحيح قواعد اللغة ومولد المراجع',
    ],
  },

  linkedin: {
    accentColor: '#0077b5',
    en: [
      'InMail messages (15/month) to anyone',
      'See who viewed your profile (90 days)',
      'LinkedIn Learning — 22,000+ courses',
      'AI-powered job insights & salary data',
    ],
    ar: [
      'رسائل InMail (15/شهر) لأي شخص',
      'من زار ملفك (90 يوم)',
      'LinkedIn Learning — 22,000+ دورة',
      'رؤى الوظائف والرواتب بالذكاء الاصطناعي',
    ],
  },

  /* ═══════════════════════════════════════════
     GOOGLE PRODUCTS
  ═══════════════════════════════════════════ */

  notebooklm: {
    accentColor: '#4285f4',
    en: [
      'AI-powered research assistant from docs',
      'Audio Overviews — podcast-style summaries',
      'Upload 50+ sources (PDF, video, audio)',
      'Deep research & fact-checked citations',
    ],
    ar: [
      'مساعد بحثي ذكي من مستنداتك',
      'ملخصات بأسلوب البودكاست (Audio Overviews)',
      'رفع 50+ مصدر (PDF، فيديو، صوت)',
      'بحث عميق ومراجع موثقة',
    ],
  },

  'google one': {
    accentColor: '#4285f4',
    en: [
      'Up to 5TB shared Google storage',
      'Google AI Premium (Gemini Advanced)',
      'Family sharing up to 5 members',
      'VPN by Google One & expert support',
    ],
    ar: [
      'تخزين Google مشترك حتى 5TB',
      'Google AI Premium (Gemini Advanced)',
      'مشاركة عائلية حتى 5 أشخاص',
      'VPN من Google One ودعم الخبراء',
    ],
  },

  'veo 3': {
    accentColor: '#4285f4',
    en: [
      'Google\'s most advanced video model',
      'Generate video with native audio & dialogue',
      'Cinematic camera controls & motion',
      'Up to 60-second video clips',
    ],
    ar: [
      'نموذج فيديو Google الأكثر تقدماً',
      'توليد فيديو مع صوت وحوار أصلي',
      'تحكم سينمائي بالكاميرا والحركة',
      'مقاطع فيديو تصل إلى 60 ثانية',
    ],
  },

  /* ═══════════════════════════════════════════
     OTHER AI TOOLS
  ═══════════════════════════════════════════ */

  windsurf: {
    accentColor: '#00d4aa',
    en: [
      'Cascade AI — context-aware multi-file edits',
      'Codeium Autocomplete (unlimited)',
      'Real-time collaboration & team features',
      '500 flow actions/month + 4 models',
    ],
    ar: [
      'Cascade AI — تحريرات متعددة الملفات',
      'إكمال تلقائي غير محدود من Codeium',
      'تعاون في الوقت الفعلي وميزات الفريق',
      '500 إجراء شهرياً + 4 نماذج',
    ],
  },

  n8n: {
    accentColor: '#f0532d',
    en: [
      'Visual workflow automation (500+ integrations)',
      'AI agent builder with memory & tools',
      'Self-hostable or cloud — full control',
      '10,000 workflow executions/month',
    ],
    ar: [
      'أتمتة بصرية للعمليات (500+ تكامل)',
      'بناء وكلاء AI مع ذاكرة وأدوات',
      'مستضاف ذاتياً أو سحابي — تحكم كامل',
      '10,000 تنفيذ سير عمل شهرياً',
    ],
  },

  supabase: {
    accentColor: '#3ecf8e',
    en: [
      'PostgreSQL + Edge Functions + Auth',
      'Vector embeddings & pgvector for AI',
      '8GB database & 250GB bandwidth',
      'Real-time subscriptions & Storage 100GB',
    ],
    ar: [
      'PostgreSQL + Edge Functions + Auth',
      'تضمينات متجهية وpgvector للذكاء الاصطناعي',
      'قاعدة بيانات 8GB وحزمة 250GB',
      'اشتراكات فورية وتخزين 100GB',
    ],
  },

  spotify: {
    accentColor: '#1db954',
    en: [
      'Ad-free music & podcasts streaming',
      'Download 10,000 songs offline',
      'AI DJ & Spotify Mix playlists',
      'HiFi audio quality (Lossless)',
    ],
    ar: [
      'موسيقى وبودكاست بدون إعلانات',
      'تحميل 10,000 أغنية بدون إنترنت',
      'DJ ذكي وقوائم Spotify Mix',
      'جودة صوت HiFi (بدون ضغط)',
    ],
  },

};

/**
 * Get features for a product by name.
 * Falls back to empty arrays if not found.
 */
export function getProductFeatureData(productName: string): ProductFeatureData | null {
  const lower = productName.toLowerCase().trim();
  // Sort keys by length DESC to match more specific first
  const keys = Object.keys(PRODUCT_FEATURES).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (lower.includes(key)) return PRODUCT_FEATURES[key];
  }
  return null;
}

/**
 * Get display priority for a product (lower = more important).
 */
export function getProductPriority(productName: string): number {
  const lower = productName.toLowerCase().trim();
  const keys = Object.keys(PRODUCT_PRIORITY).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (lower.includes(key)) return PRODUCT_PRIORITY[key];
  }
  return 999; // Unknown products go last
}

/**
 * Get official brand accent color for a product.
 */
export function getProductAccentColor(productName: string): string {
  const data = getProductFeatureData(productName);
  if (data) return data.accentColor;
  // Fallback palette based on name hash
  const PALETTE = ['#9333ea', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#f97316', '#06b6d4'];
  const n = productName.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return PALETTE[n % PALETTE.length];
}
