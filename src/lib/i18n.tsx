'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Locale = 'en' | 'ar';

export type Translations = typeof defaultEn;

const defaultEn = {
    // Navigation
    nav: {
        home: 'Home',
        products: 'Products',
        contact: 'Contact',
        cart: 'Cart',
        admin: 'Admin',
        toggleTheme: 'Toggle theme',
        toggleLang: 'العربية',
    },
    // Hero
    hero: {
        title: 'Power Up With Premium Tools',
        subtitle: 'Get access to ChatGPT, Gemini, Canva, LinkedIn Premium and more — at unbeatable prices. Order via WhatsApp — no account required.',
        cta: 'Browse Subscriptions',
        contact: 'Contact Us',
    },
    // Featured
    featured: {
        title: 'Featured Subscriptions',
        subtitle: 'Our most popular digital subscriptions, trusted by hundreds of customers worldwide.',
        viewAll: 'View All Products',
        from: 'From',
        month: '/mo',
        orders: 'orders',
    },
    // Categories
    categories: {
        title: 'Browse by Category',
        subtitle: 'Find the perfect subscription for your needs.',
        products: 'products',
    },
    // Why choose us
    why: {
        title: 'Why Choose Us?',
        subtitle: 'We make getting premium digital tools easy, affordable, and reliable.',
        authentic: 'Guaranteed Authentic',
        authenticDesc: '100% genuine subscriptions from official providers.',
        instant: 'Instant Delivery',
        instantDesc: 'Get your subscription within hours of order confirmation.',
        support: '24/7 Support',
        supportDesc: 'Our team is always ready to assist you via WhatsApp.',
        prices: 'Best Prices',
        pricesDesc: 'Competitive prices with exclusive deals and discounts.',
    },
    // How to order
    howTo: {
        title: 'How to Order',
        subtitle: 'Three simple steps to get your premium subscription.',
        step1: 'Choose Your Plan',
        step1Desc: 'Browse our catalog and pick the subscription that fits your needs.',
        step2: 'Order via WhatsApp',
        step2Desc: 'Click the order button and send us your details through WhatsApp.',
        step3: 'Get Your Access',
        step3Desc: 'Receive your subscription details within hours after payment.',
    },
    // FAQ
    faq: {
        title: 'Frequently Asked Questions',
        q1: 'Are the subscriptions genuine?',
        a1: 'Yes, all our subscriptions are 100% genuine and sourced from official providers. We guarantee authenticity for every product.',
        q2: 'How long does delivery take?',
        a2: 'Most subscriptions are delivered within 1-4 hours after payment confirmation. Some may take up to 24 hours during peak times.',
        q3: 'What payment methods do you accept?',
        a3: 'We accept various payment methods including bank transfer, e-wallets, and cryptocurrency. Payment details are shared via WhatsApp.',
        q4: 'Can I get a refund?',
        a4: 'Yes, we offer refunds within 24 hours if the subscription has not been activated. Please contact us via WhatsApp with your order code.',
    },
    // CTA
    cta: {
        title: 'Ready to Get Started?',
        subtitle: 'Have questions or need a custom plan? Reach out to us on WhatsApp and we\'ll get you set up in no time.',
        browse: 'Browse Products',
        contact: 'Contact Us',
    },
    // Products page
    productsPage: {
        title: 'All Subscriptions',
        subtitle: 'Browse our complete catalog of premium digital subscriptions.',
        search: 'Search products...',
        filters: 'Filters',
        category: 'Category',
        allCategories: 'All Categories',
        duration: 'Duration',
        allDurations: 'All Durations',
        monthly: 'Monthly',
        threeMonths: '3 Months',
        sixMonths: '6 Months',
        yearly: 'Yearly',
        priceRange: 'Price Range',
        sortBy: 'Sort by',
        popular: 'Most Popular',
        priceLow: 'Price: Low to High',
        priceHigh: 'Price: High to Low',
        newest: 'Newest',
        noProducts: 'No products found',
        noProductsDesc: 'Try adjusting your filters or search query.',
        subscribe: 'Subscribe',
        unavailable: 'Unavailable',
        min: 'Min',
        max: 'Max',
    },
    // Product detail
    product: {
        backToProducts: 'Back to Products',
        features: 'Features',
        selectPlan: 'Select Plan',
        totalPrice: 'Total Price',
        orderWhatsApp: 'Order via WhatsApp',
        addToCart: 'Add to Cart',
        added: 'Added!',
        yourName: 'Your Name',
        yourPhone: 'Your Phone Number',
    },
    // Cart
    cart: {
        title: 'Shopping Cart',
        items: 'items',
        item: 'item',
        inCart: 'in your cart',
        empty: 'Your cart is empty',
        emptyDesc: 'Browse our products and add subscriptions to your cart.',
        browseProducts: 'Browse Products',
        orderSummary: 'Order Summary',
        total: 'Total',
        namePlaceholder: 'Your Name *',
        phonePlaceholder: 'Your Phone *',
        notesPlaceholder: 'Notes (optional)',
        sendOrder: 'Send Order via WhatsApp',
        sending: 'Sending...',
        // Trust microcopy
        noAccount: 'No account required',
        deliveryInfo: 'Delivery confirmed via WhatsApp after payment',
        orderCodeSaved: 'Your order code will appear on the next page',
        priceGuarantee: 'Prices calculated & verified by our system',
        supportViaWhatsApp: 'Support available via WhatsApp',
    },
    // Thank you
    thankYou: {
        title: 'Thank You! 🎉',
        subtitle: 'Your order has been placed successfully. Please send the WhatsApp message to confirm — our team will activate your subscription after payment.',
        orderCode: 'Your Order Code',
        orderCodeHint: 'Save this code — share it with support if you need help.',
        continueShopping: 'Continue Shopping',
        backHome: 'Back to Home',
        whatsappFallback: 'Open WhatsApp & Send Order',
    },
    // Contact
    contact: {
        title: 'Get in Touch',
        subtitle: 'Have a question or need help? We\'re here to assist you. Reach out to us through WhatsApp for the fastest response.',
        whatsapp: 'WhatsApp',
        whatsappDesc: 'Chat with us directly on WhatsApp for instant support.',
        email: 'Email',
        emailDesc: 'Send us an email and we\'ll respond within 24 hours.',
        phone: 'Phone',
        phoneDesc: 'Call us during business hours.',
        sendMessage: 'Send us a message',
        yourNameLabel: 'Your Name',
        yourEmail: 'Your Email',
        yourMessage: 'Your Message',
        sendViaWhatsApp: 'Send via WhatsApp',
        whatsappGreeting: 'Hello! I have a question about your digital subscriptions.',
    },
    // Footer
    footer: {
        description: 'Your one-stop destination for premium digital subscriptions. Get the tools you need at the best prices.',
        quickLinks: 'Quick Links',
        legal: 'Legal',
        privacy: 'Privacy Policy',
        terms: 'Terms & Conditions',
        refund: 'Refund Policy',
        rights: 'All rights reserved.',
    },
    // Common
    common: {
        loading: 'Loading...',
        error: 'Something went wrong',
    },
    // Not Found
    notFound: {
        title: 'Page Not Found',
        description: 'The page you\'re looking for doesn\'t exist or has been moved.',
        backHome: 'Back to Home',
        browseProducts: 'Browse Products',
    },
    // Privacy Policy
    privacy: {
        title: 'Privacy Policy',
        lastUpdated: 'Last updated: February 2026',
        s1Title: '1. Information We Collect',
        s1Desc: 'We collect information you provide when placing orders through our WhatsApp ordering system, including:',
        s1Item1: 'Name and contact information (phone number, email)',
        s1Item2: 'Order details and preferences',
        s1Item3: 'Communication history through WhatsApp',
        s2Title: '2. How We Use Your Information',
        s2Desc: 'We use the collected information to:',
        s2Item1: 'Process and fulfill your subscription orders',
        s2Item2: 'Communicate with you about your orders',
        s2Item3: 'Provide customer support',
        s2Item4: 'Improve our services',
        s3Title: '3. Information Sharing',
        s3Desc: 'We do not sell, trade, or share your personal information with third parties, except as necessary to fulfill your orders or as required by law.',
        s4Title: '4. Data Security',
        s4Desc: 'We implement appropriate security measures to protect your personal information. However, no method of electronic transmission or storage is 100% secure.',
        s5Title: '5. Cookies',
        s5Desc: 'Our website uses cookies to enhance your browsing experience such as cart data and theme preferences. These are stored locally on your device.',
        s6Title: '6. Contact Us',
        s6Desc: 'If you have questions about this Privacy Policy, please contact us through WhatsApp or our contact page.',
    },
    // Terms & Conditions
    terms: {
        title: 'Terms & Conditions',
        lastUpdated: 'Last updated: February 2026',
        s1Title: '1. Acceptance of Terms',
        s1Desc: 'By accessing and using Service Hub, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use our services.',
        s2Title: '2. Products and Services',
        s2Desc: 'We provide digital subscription services for various online platforms. All subscriptions are delivered digitally and are subject to the terms of the respective service providers.',
        s3Title: '3. Ordering Process',
        s3Item1: 'Orders are placed through our WhatsApp ordering system',
        s3Item2: 'Each order receives a unique order code for tracking',
        s3Item3: 'Order confirmation is sent through WhatsApp',
        s3Item4: 'Delivery times may vary based on the subscription type',
        s4Title: '4. Pricing and Payment',
        s4Desc: 'All prices are displayed in the currency specified on our website. Prices are subject to change without prior notice. Payment is processed outside our platform as agreed upon via WhatsApp.',
        s5Title: '5. Account Responsibility',
        s5Desc: 'You are responsible for the security and proper use of any subscription accounts provided. Sharing, reselling, or misusing subscription accounts is strictly prohibited.',
        s6Title: '6. Limitation of Liability',
        s6Desc: 'Service Hub is not liable for any service disruptions or changes made by the original subscription providers (e.g., ChatGPT, Canva, etc.).',
        s7Title: '7. Changes to Terms',
        s7Desc: 'We reserve the right to modify these terms at any time. Continued use of our services constitutes acceptance of the updated terms.',
    },
    // Refund Policy
    refund: {
        title: 'Refund Policy',
        lastUpdated: 'Last updated: February 2026',
        s1Title: '1. Refund Eligibility',
        s1Desc: 'We offer refunds under the following conditions:',
        s1Item1: 'Request made within 24 hours of purchase',
        s1Item2: 'Subscription has not been activated or used',
        s1Item3: 'Technical issues preventing subscription activation',
        s2Title: '2. Non-Refundable Cases',
        s2Item1: 'Subscriptions that have been activated and used',
        s2Item2: 'Requests made after 24 hours of purchase',
        s2Item3: 'Change of mind after activation',
        s2Item4: 'Issues caused by the original service provider',
        s3Title: '3. Refund Process',
        s3Item1: 'Contact us via WhatsApp with your order code',
        s3Item2: 'Provide the reason for your refund request',
        s3Item3: 'Our team will review your request within 24 hours',
        s3Item4: 'Approved refunds are processed within 3-5 business days',
        s4Title: '4. Partial Refunds',
        s4Desc: 'In some cases, partial refunds may be offered for subscriptions that have been partially used or for multi-month plans.',
        s5Title: '5. Contact',
        s5Desc: 'For refund requests or questions, please contact us through WhatsApp with your order code and details.',
    },
};

const defaultAr: Translations = {
    nav: {
        home: 'الرئيسية',
        products: 'المنتجات',
        contact: 'تواصل معنا',
        cart: 'السلة',
        admin: 'لوحة التحكم',
        toggleTheme: 'تبديل المظهر',
        toggleLang: 'English',
    },
    hero: {
        title: 'اشتراكات رقمية بأفضل الأسعار',
        subtitle: 'احصل على ChatGPT, Gemini, Canva, LinkedIn Premium والمزيد — بأسعار لا تُقاوَم. اطلب عبر واتساب بدون إنشاء حساب.',
        cta: 'تصفح الاشتراكات',
        contact: 'تواصل معنا',
    },
    featured: {
        title: 'الاشتراكات المميزة',
        subtitle: 'أشهر اشتراكاتنا الرقمية، موثوقة من مئات العملاء حول العالم.',
        viewAll: 'عرض جميع المنتجات',
        from: 'يبدأ من',
        month: '/شهر',
        orders: 'طلب',
    },
    categories: {
        title: 'تصفح حسب الفئة',
        subtitle: 'اعثر على الاشتراك المثالي لاحتياجاتك.',
        products: 'منتج',
    },
    why: {
        title: 'لماذا تختارنا؟',
        subtitle: 'نجعل الحصول على الأدوات الرقمية المميزة سهلاً وبأسعار معقولة وموثوقة.',
        authentic: 'ضمان الأصالة',
        authenticDesc: 'اشتراكات أصلية 100% من مزودين رسميين.',
        instant: 'توصيل فوري',
        instantDesc: 'احصل على اشتراكك خلال ساعات من تأكيد الطلب.',
        support: 'دعم على مدار الساعة',
        supportDesc: 'فريقنا جاهز دائماً لمساعدتك عبر واتساب.',
        prices: 'أفضل الأسعار',
        pricesDesc: 'أسعار تنافسية مع عروض وخصومات حصرية.',
    },
    howTo: {
        title: 'كيف تطلب',
        subtitle: 'ثلاث خطوات بسيطة للحصول على اشتراكك المميز.',
        step1: 'اختر خطتك',
        step1Desc: 'تصفح كتالوجنا واختر الاشتراك المناسب لاحتياجاتك.',
        step2: 'اطلب عبر واتساب',
        step2Desc: 'اضغط على زر الطلب وأرسل لنا بياناتك عبر واتساب.',
        step3: 'استلم حسابك',
        step3Desc: 'استلم تفاصيل اشتراكك خلال ساعات بعد الدفع.',
    },
    faq: {
        title: 'الأسئلة الشائعة',
        q1: 'هل الاشتراكات أصلية؟',
        a1: 'نعم، جميع اشتراكاتنا أصلية 100% ومصدرها مزودون رسميون. نحن نضمن الأصالة لكل منتج.',
        q2: 'كم يستغرق التوصيل؟',
        a2: 'معظم الاشتراكات يتم توصيلها خلال 1-4 ساعات بعد تأكيد الدفع. قد يستغرق البعض حتى 24 ساعة في أوقات الذروة.',
        q3: 'ما طرق الدفع المقبولة؟',
        a3: 'نقبل طرق دفع متنوعة تشمل التحويل البنكي، المحافظ الإلكترونية، والعملات الرقمية. يتم مشاركة تفاصيل الدفع عبر واتساب.',
        q4: 'هل يمكنني استرداد المبلغ؟',
        a4: 'نعم، نقدم استرداد خلال 24 ساعة إذا لم يتم تفعيل الاشتراك. يرجى التواصل معنا عبر واتساب مع رمز طلبك.',
    },
    cta: {
        title: 'مستعد للبدء؟',
        subtitle: 'لديك أسئلة أو تحتاج خطة مخصصة؟ تواصل معنا عبر واتساب وسنساعدك في أسرع وقت.',
        browse: 'تصفح المنتجات',
        contact: 'تواصل معنا',
    },
    productsPage: {
        title: 'جميع الاشتراكات',
        subtitle: 'تصفح كتالوجنا الكامل من الاشتراكات الرقمية المميزة.',
        search: 'ابحث عن منتج...',
        filters: 'الفلاتر',
        category: 'الفئة',
        allCategories: 'جميع الفئات',
        duration: 'المدة',
        allDurations: 'جميع المدد',
        monthly: 'شهري',
        threeMonths: '3 أشهر',
        sixMonths: '6 أشهر',
        yearly: 'سنوي',
        priceRange: 'نطاق السعر',
        sortBy: 'ترتيب حسب',
        popular: 'الأكثر شعبية',
        priceLow: 'السعر: من الأقل للأعلى',
        priceHigh: 'السعر: من الأعلى للأقل',
        newest: 'الأحدث',
        noProducts: 'لا توجد منتجات',
        noProductsDesc: 'حاول تعديل الفلاتر أو كلمة البحث.',
        subscribe: 'اشترك',
        unavailable: 'غير متوفر',
        min: 'الحد الأدنى',
        max: 'الحد الأقصى',
    },
    product: {
        backToProducts: 'العودة للمنتجات',
        features: 'المميزات',
        selectPlan: 'اختر الخطة',
        totalPrice: 'السعر الإجمالي',
        orderWhatsApp: 'اطلب عبر واتساب',
        addToCart: 'أضف للسلة',
        added: 'تمت الإضافة!',
        yourName: 'اسمك',
        yourPhone: 'رقم هاتفك',
    },
    cart: {
        title: 'سلة التسوق',
        items: 'عناصر',
        item: 'عنصر',
        inCart: 'في سلتك',
        empty: 'سلتك فارغة',
        emptyDesc: 'تصفح منتجاتنا وأضف اشتراكات لسلتك.',
        browseProducts: 'تصفح المنتجات',
        orderSummary: 'ملخص الطلب',
        total: 'المجموع',
        namePlaceholder: 'اسمك *',
        phonePlaceholder: 'رقم هاتفك *',
        notesPlaceholder: 'ملاحظات (اختياري)',
        sendOrder: 'إرسال الطلب عبر واتساب',
        sending: 'جاري الإرسال...',
        // Trust microcopy
        noAccount: 'بدون إنشاء حساب',
        deliveryInfo: 'التسليم يتم عبر واتساب بعد التأكيد',
        orderCodeSaved: 'سيظهر لك كود الطلب في الصفحة التالية',
        priceGuarantee: 'الأسعار محسوبة ومضمونة من النظام',
        supportViaWhatsApp: 'الدعم متاح عبر واتساب',
    },
    thankYou: {
        title: '🎉 شكراً لك!',
        subtitle: 'تم تسجيل طلبك بنجاح. أرسل رسالة واتساب لتأكيد الطلب — سيقوم فريقنا بتفعيل اشتراكك بعد الدفع.',
        orderCode: 'كود طلبك',
        orderCodeHint: 'احفظ هذا الكود — شاركه مع الدعم إذا احتجت مساعدة.',
        continueShopping: 'متابعة التسوق',
        backHome: 'العودة للرئيسية',
        whatsappFallback: 'افتح واتساب وأرسل الطلب',
    },
    contact: {
        title: 'تواصل معنا',
        subtitle: 'لديك سؤال أو تحتاج مساعدة؟ نحن هنا لمساعدتك. تواصل معنا عبر واتساب للحصول على أسرع استجابة.',
        whatsapp: 'واتساب',
        whatsappDesc: 'تحدث معنا مباشرة على واتساب للدعم الفوري.',
        email: 'البريد الإلكتروني',
        emailDesc: 'أرسل لنا بريداً إلكترونياً وسنرد خلال 24 ساعة.',
        phone: 'الهاتف',
        phoneDesc: 'اتصل بنا خلال ساعات العمل.',
        sendMessage: 'أرسل لنا رسالة',
        yourNameLabel: 'اسمك',
        yourEmail: 'بريدك الإلكتروني',
        yourMessage: 'رسالتك',
        sendViaWhatsApp: 'إرسال عبر واتساب',
        whatsappGreeting: 'مرحباً! لدي سؤال حول اشتراكاتكم الرقمية.',
    },
    footer: {
        description: 'وجهتك الأولى للاشتراكات الرقمية المميزة. احصل على الأدوات التي تحتاجها بأفضل الأسعار.',
        quickLinks: 'روابط سريعة',
        legal: 'قانوني',
        privacy: 'سياسة الخصوصية',
        terms: 'الشروط والأحكام',
        refund: 'سياسة الاسترداد',
        rights: 'جميع الحقوق محفوظة.',
    },
    common: {
        loading: 'جاري التحميل...',
        error: 'حدث خطأ ما',
    },
    notFound: {
        title: 'الصفحة غير موجودة',
        description: 'الصفحة التي تبحث عنها غير موجودة أو تم نقلها.',
        backHome: 'العودة للرئيسية',
        browseProducts: 'تصفح المنتجات',
    },
    privacy: {
        title: 'سياسة الخصوصية',
        lastUpdated: 'آخر تحديث: فبراير 2026',
        s1Title: '1. المعلومات التي نجمعها',
        s1Desc: 'نجمع المعلومات التي تقدمها عند تقديم الطلبات عبر نظام الطلب عبر واتساب، بما في ذلك:',
        s1Item1: 'الاسم ومعلومات الاتصال (رقم الهاتف، البريد الإلكتروني)',
        s1Item2: 'تفاصيل الطلب والتفضيلات',
        s1Item3: 'سجل التواصل عبر واتساب',
        s2Title: '2. كيف نستخدم معلوماتك',
        s2Desc: 'نستخدم المعلومات المجمعة لـ:',
        s2Item1: 'معالجة وتنفيذ طلبات الاشتراك',
        s2Item2: 'التواصل معك بخصوص طلباتك',
        s2Item3: 'تقديم دعم العملاء',
        s2Item4: 'تحسين خدماتنا',
        s3Title: '3. مشاركة المعلومات',
        s3Desc: 'لا نبيع أو نتاجر أو نشارك معلوماتك الشخصية مع أطراف ثالثة، إلا عند الضرورة لتنفيذ طلباتك أو كما يقتضي القانون.',
        s4Title: '4. أمان البيانات',
        s4Desc: 'نطبق إجراءات أمان مناسبة لحماية معلوماتك الشخصية. ومع ذلك، لا توجد طريقة نقل أو تخزين إلكتروني آمنة بنسبة 100%.',
        s5Title: '5. ملفات تعريف الارتباط',
        s5Desc: 'يستخدم موقعنا ملفات تعريف الارتباط لتحسين تجربة التصفح مثل بيانات السلة وتفضيلات المظهر. يتم تخزينها محلياً على جهازك.',
        s6Title: '6. اتصل بنا',
        s6Desc: 'إذا كانت لديك أسئلة حول سياسة الخصوصية هذه، يرجى التواصل معنا عبر واتساب أو صفحة التواصل.',
    },
    terms: {
        title: 'الشروط والأحكام',
        lastUpdated: 'آخر تحديث: فبراير 2026',
        s1Title: '1. قبول الشروط',
        s1Desc: 'باستخدامك لـ Service Hub، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا لم توافق، يرجى عدم استخدام خدماتنا.',
        s2Title: '2. المنتجات والخدمات',
        s2Desc: 'نقدم خدمات اشتراكات رقمية لمنصات إلكترونية متنوعة. جميع الاشتراكات يتم تسليمها رقمياً وتخضع لشروط مزودي الخدمة المعنيين.',
        s3Title: '3. عملية الطلب',
        s3Item1: 'يتم تقديم الطلبات عبر نظام الطلب عبر واتساب',
        s3Item2: 'يحصل كل طلب على رمز طلب فريد للتتبع',
        s3Item3: 'يتم إرسال تأكيد الطلب عبر واتساب',
        s3Item4: 'قد تختلف أوقات التسليم حسب نوع الاشتراك',
        s4Title: '4. التسعير والدفع',
        s4Desc: 'جميع الأسعار معروضة بالعملة المحددة على موقعنا. الأسعار قابلة للتغيير دون إشعار مسبق. تتم معالجة الدفع خارج منصتنا كما هو متفق عليه عبر واتساب.',
        s5Title: '5. مسؤولية الحساب',
        s5Desc: 'أنت مسؤول عن أمان واستخدام أي حسابات اشتراك مقدمة بشكل صحيح. يُمنع منعاً باتاً مشاركة أو إعادة بيع أو إساءة استخدام حسابات الاشتراك.',
        s6Title: '6. حدود المسؤولية',
        s6Desc: 'Service Hub غير مسؤول عن أي انقطاع في الخدمة أو تغييرات يجريها مزودو الاشتراك الأصليون (مثل ChatGPT، Canva، إلخ).',
        s7Title: '7. تغييرات الشروط',
        s7Desc: 'نحتفظ بالحق في تعديل هذه الشروط في أي وقت. استمرار استخدامك لخدماتنا يعتبر قبولاً للشروط المحدثة.',
    },
    refund: {
        title: 'سياسة الاسترداد',
        lastUpdated: 'آخر تحديث: فبراير 2026',
        s1Title: '1. أهلية الاسترداد',
        s1Desc: 'نقدم استرداد الأموال في الحالات التالية:',
        s1Item1: 'تقديم الطلب خلال 24 ساعة من الشراء',
        s1Item2: 'لم يتم تفعيل أو استخدام الاشتراك',
        s1Item3: 'مشاكل تقنية تمنع تفعيل الاشتراك',
        s2Title: '2. الحالات غير القابلة للاسترداد',
        s2Item1: 'الاشتراكات التي تم تفعيلها واستخدامها',
        s2Item2: 'الطلبات المقدمة بعد 24 ساعة من الشراء',
        s2Item3: 'تغيير الرأي بعد التفعيل',
        s2Item4: 'المشاكل الناتجة عن مزود الخدمة الأصلي',
        s3Title: '3. عملية الاسترداد',
        s3Item1: 'تواصل معنا عبر واتساب مع رمز طلبك',
        s3Item2: 'قدم سبب طلب الاسترداد',
        s3Item3: 'سيراجع فريقنا طلبك خلال 24 ساعة',
        s3Item4: 'تتم معالجة المبالغ المستردة المعتمدة خلال 3-5 أيام عمل',
        s4Title: '4. الاسترداد الجزئي',
        s4Desc: 'في بعض الحالات، قد يتم تقديم استرداد جزئي للاشتراكات التي تم استخدامها جزئياً أو للخطط متعددة الأشهر.',
        s5Title: '5. التواصل',
        s5Desc: 'لطلبات الاسترداد أو الاستفسارات، يرجى التواصل معنا عبر واتساب مع رمز طلبك والتفاصيل.',
    },
};

// Deep merge: overrides take priority, fallback to defaults
function deepMerge(defaults: Record<string, any>, overrides: Record<string, any>): Record<string, any> {
    const result = { ...defaults };
    for (const key of Object.keys(defaults)) {
        if (overrides[key] !== undefined) {
            if (typeof defaults[key] === 'object' && defaults[key] !== null && !Array.isArray(defaults[key])) {
                result[key] = deepMerge(defaults[key], overrides[key] || {});
            } else {
                result[key] = overrides[key] || defaults[key];
            }
        }
    }
    return result;
}

const builtInTranslations: Record<Locale, Translations> = { en: defaultEn, ar: defaultAr };

interface I18nContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: Translations;
    dir: 'ltr' | 'rtl';
}

const I18nContext = createContext<I18nContextType>({
    locale: 'en',
    setLocale: () => { },
    t: defaultEn,
    dir: 'ltr',
});

export function I18nProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>('en');
    const [dbContent, setDbContent] = useState<{ en: Record<string, any>; ar: Record<string, any> }>({ en: {}, ar: {} });

    useEffect(() => {
        const saved = localStorage.getItem('locale') as Locale | null;
        if (saved && (saved === 'en' || saved === 'ar')) {
            setLocaleState(saved);
        }
    }, []);

    useEffect(() => {
        fetch('/api/settings')
            .then((r) => r.json())
            .then((data) => {
                if (data && !data.error) {
                    try {
                        const en = data.contentEn ? JSON.parse(data.contentEn) : {};
                        const ar = data.contentAr ? JSON.parse(data.contentAr) : {};
                        setDbContent({ en, ar });
                    } catch {
                        // ignore parse errors
                    }
                }
            })
            .catch(() => { });
    }, []);

    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale);
        localStorage.setItem('locale', newLocale);
    };

    const mergedTranslations: Record<Locale, Translations> = {
        en: deepMerge(defaultEn, dbContent.en) as Translations,
        ar: deepMerge(defaultAr, dbContent.ar) as Translations,
    };

    const value: I18nContextType = {
        locale,
        setLocale,
        t: mergedTranslations[locale],
        dir: locale === 'ar' ? 'rtl' : 'ltr',
    };

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
    return useContext(I18nContext);
}

export { builtInTranslations as translations, defaultEn, defaultAr };
