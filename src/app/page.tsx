'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import AnimatedLogo from '@/components/AnimatedLogo';
import {
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  Clock,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Star,
  Package,
  CreditCard,
  Send,
} from 'lucide-react';
import { Product, Category } from '@/lib/types';
import { useI18n } from '@/lib/i18n';
import { useSettings } from '@/lib/settings-context';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);
  const { t, locale } = useI18n();
  const { currencySymbol, heroStat1Value, heroStat1Label, heroStat2Value, heroStat2Label, heroStat3Value, heroStat3Label } = useSettings();

  useEffect(() => {
    Promise.all([
      fetch('/api/products').then((r) => r.json()).catch(() => []),
      fetch('/api/categories').then((r) => r.json()).catch(() => []),
    ]).then(([prods, cats]) => {
      setProducts(Array.isArray(prods) ? prods : []);
      setCategories(Array.isArray(cats) ? cats : []);
      setLoaded(true);
    });
  }, []);

  const featuredProducts = products.filter((p) => p.isFeatured);
  const featured = featuredProducts.length > 0 ? featuredProducts : products.slice(0, 3);
  const gridCols = featured.length === 1 ? 'md:grid-cols-1 max-w-md mx-auto' : featured.length === 2 ? 'md:grid-cols-2 max-w-3xl mx-auto' : 'md:grid-cols-3';

  const faqs = [
    { q: t.faq.q1, a: t.faq.a1 },
    { q: t.faq.q2, a: t.faq.a2 },
    { q: t.faq.q3, a: t.faq.a3 },
    { q: t.faq.q4, a: t.faq.a4 },
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-[128px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[128px] animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 mb-8">
              <AnimatedLogo href="" size="sm" />
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight mb-6">
              <span className="text-gray-900 dark:text-white">{t.hero.title.split(' ').slice(0, -2).join(' ')} </span>
              <br />
              <span className="bg-gradient-to-r from-violet-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                {t.hero.title.split(' ').slice(-2).join(' ')}
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              {t.hero.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
              <Link
                href="/products"
                className="group px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl font-semibold text-lg shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-300 flex items-center gap-2"
              >
                {t.hero.cta}
                <ArrowRight className={`w-5 h-5 ${locale === 'ar' ? 'group-hover:-translate-x-1 rotate-180' : 'group-hover:translate-x-1'} transition-transform`} />
              </Link>

              <Link
                href="/contact"
                className="px-8 py-4 rounded-2xl font-semibold text-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-300"
              >
                {t.hero.contact}
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="grid grid-cols-3 gap-8 mt-20 max-w-lg mx-auto"
          >
            {[
              { value: heroStat1Value, label: heroStat1Label },
              { value: heroStat2Value, label: heroStat2Label },
              { value: heroStat3Value, label: heroStat3Label },
            ].map((stat, index) => (
              <div key={`stat-${index}`} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4"
            >
              {t.featured.title}
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              {t.featured.subtitle}
            </motion.p>
          </motion.div>

          <motion.div
            key={loaded ? 'featured-loaded' : 'featured-skeleton'}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className={`grid grid-cols-1 ${gridCols} gap-6`}
          >
            {loaded && featured.length > 0
              ? featured.map((product) => (
                <motion.div key={product.id} variants={fadeInUp}>
                  <Link href={`/product/${product.slug}`}>
                    <div className="group rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6 card-hover h-full">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 flex items-center justify-center overflow-hidden">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-10 h-10 object-contain"
                            />
                          ) : (
                            <Package className="w-7 h-7 text-violet-500" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {product.category?.name}
                          </p>
                        </div>
                      </div>

                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                        {product.description}
                      </p>

                      <div className="flex items-end justify-between">
                        <div>
                          <span className="text-sm text-gray-400">{t.featured.from}</span>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {product.variants?.length > 0
                              ? product.variants.reduce((min, v) => v.price < min.price ? v : min, product.variants[0]).price
                              : product.basePrice} {currencySymbol}
                            {product.durationLabel && (
                              <span className="text-sm font-normal text-gray-400">/{product.durationLabel}</span>
                            )}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-sm font-medium">4.9</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
              : [1, 2, 3].map((i) => (
                <div key={`skeleton-${i}`} className="rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="skeleton w-14 h-14 rounded-2xl" />
                    <div className="flex-1">
                      <div className="skeleton h-5 w-32 mb-2" />
                      <div className="skeleton h-4 w-24" />
                    </div>
                  </div>
                  <div className="skeleton h-4 w-full mb-2" />
                  <div className="skeleton h-4 w-3/4 mb-4" />
                  <div className="skeleton h-8 w-20" />
                </div>
              ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-violet-600 dark:text-violet-400 font-semibold hover:gap-3 transition-all"
            >
              {t.featured.viewAll}
              <ArrowRight className={`w-4 h-4 ${locale === 'ar' ? 'rotate-180' : ''}`} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 px-4 bg-gray-50/50 dark:bg-gray-900/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4"
            >
              {t.categories.title}
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-gray-500 dark:text-gray-400">
              {t.categories.subtitle}
            </motion.p>
          </motion.div>

          <motion.div
            key={loaded ? 'categories-loaded' : 'categories-skeleton'}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6"
          >
            {loaded && categories.length > 0
              ? categories.map((cat) => {
                const catIcons: Record<string, string> = {
                  'ai-productivity': '🤖',
                  'creative-tools': '🎨',
                  entertainment: '🎵',
                };
                return (
                  <motion.div key={cat.id} variants={fadeInUp}>
                    <Link href={`/products?category=${cat.slug}`}>
                      <div className="group rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-8 text-center card-hover">
                        <div className="text-5xl mb-4">{catIcons[cat.slug] || '📦'}</div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                          {cat.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          {products.filter((p) => p.categoryId === cat.id).length} {t.categories.products}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                );
              })
              : [1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl border border-gray-200 dark:border-gray-800 p-8 text-center">
                  <div className="skeleton h-12 w-12 mx-auto rounded-full mb-4" />
                  <div className="skeleton h-5 w-32 mx-auto mb-2" />
                  <div className="skeleton h-4 w-24 mx-auto" />
                </div>
              ))}
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4"
            >
              {t.why.title}
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              {t.why.subtitle}
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              {
                icon: Shield,
                title: t.why.authentic,
                desc: t.why.authenticDesc,
                color: 'from-emerald-500 to-teal-500',
              },
              {
                icon: Zap,
                title: t.why.instant,
                desc: t.why.instantDesc,
                color: 'from-amber-500 to-orange-500',
              },
              {
                icon: Clock,
                title: t.why.support,
                desc: t.why.supportDesc,
                color: 'from-blue-500 to-cyan-500',
              },
              {
                icon: CreditCard,
                title: t.why.prices,
                desc: t.why.pricesDesc,
                color: 'from-violet-500 to-purple-500',
              },
            ].map((item) => (
              <motion.div key={item.title} variants={fadeInUp}>
                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6 h-full card-hover">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 shadow-lg`}>
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How To Order */}
      <section className="py-24 px-4 bg-gray-50/50 dark:bg-gray-900/30">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4"
            >
              {t.howTo.title}
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-gray-500 dark:text-gray-400">
              {t.howTo.subtitle}
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                step: '01',
                icon: Package,
                title: t.howTo.step1,
                desc: t.howTo.step1Desc,
              },
              {
                step: '02',
                icon: Send,
                title: t.howTo.step2,
                desc: t.howTo.step2Desc,
              },
              {
                step: '03',
                icon: Sparkles,
                title: t.howTo.step3,
                desc: t.howTo.step3Desc,
              },
            ].map((item) => (
              <motion.div key={item.step} variants={fadeInUp}>
                <div className="relative text-center">
                  <div className="text-7xl font-black text-gray-100 dark:text-gray-800/50 absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 select-none">
                    {item.step}
                  </div>
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-violet-500/20">
                      <item.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4"
            >
              {t.faq.title}
            </motion.h2>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="space-y-4"
          >
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-start"
                >
                  <span className="font-semibold text-gray-900 dark:text-white pe-4">{faq.q}</span>
                  {openFaq === i ? (
                    <ChevronUp className="w-5 h-5 text-violet-500 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="px-6 pb-6"
                  >
                    <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA / Contact */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-3xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600 to-indigo-700" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
            <div className="relative px-8 py-16 sm:px-16 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                {t.cta.title}
              </h2>
              <p className="text-violet-100 max-w-xl mx-auto mb-8 leading-relaxed">
                {t.cta.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
                <Link
                  href="/products"
                  className="px-8 py-4 bg-white text-violet-700 rounded-2xl font-semibold shadow-xl hover:bg-gray-50 transition-all duration-300 flex items-center gap-2"
                >
                  <Package className="w-5 h-5" />
                  {t.cta.browse}
                </Link>
                <Link
                  href="/contact"
                  className="px-8 py-4 rounded-2xl font-semibold border-2 border-white/30 text-white hover:bg-white/10 transition-all duration-300 flex items-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  {t.cta.contact}
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
