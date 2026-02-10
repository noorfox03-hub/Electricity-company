import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  ar: {
    translation: {
      // --- عام ---
      app_name: "SAS للنقل",
      slogan: "نمضي بك قدماً",
      welcome: "مرحباً بك في SAS للنقل",
      language_select: "اختر اللغة",
      continue: "استمرار",
      rights: "© 2026 SAS للنقل. جميع الحقوق محفوظة.",
      sar: "ريال",
      km: "كم",
      kg: "كجم",
      loading: "جاري التحميل...",
      no_data: "لا توجد بيانات",
      confirm: "تأكيد",
      cancel: "إلغاء",
      save: "حفظ",
      next: "التالي",
      previous: "السابق",
      back: "عودة",
      view_all: "عرض الكل",
      search_placeholder: "بحث...",
      
      // --- المصادقة ---
      login_users: "دخول المستخدمين",
      admin_login: "الإدارة",
      driver: "ناقل / سائق",
      shipper: "شاحن (صاحب بضاعة)",
      admin: "مدير النظام",
      phone_label: "رقم الجوال",
      
      // --- لوحة تحكم الشاحن (المرسل) - حسب الـ OCR ---
      shipper_dashboard: "لوحة تحكم الشاحن",
      add_new_shipment: "إضافة شحنة جديدة",
      my_shipments: "شحناتي",
      account_statement: "كشف حساب",
      tracking: "تتبع الشحنة",
      messages: "المراسلات",
      rate_driver: "تقييم السائق",
      
      // إضافة شحنة (Wizard)
      shipment_type: "نوع الشحنة",
      package_type: "نوع العبوة",
      pickup_location: "موقع التحميل",
      delivery_location: "موقع التسليم",
      req_date: "التاريخ المطلوب",
      add_products: "إضافة منتجات",
      product_name: "اسم المنتج",
      product_desc: "وصف مختصر",
      product_type: "النوع (غذائية، بناء..)",
      unit: "الوحدة",
      add_product_btn: "إضافة منتج",
      receiver_info: "معلومات المستلم",
      receiver_name: "اسم المستلم",
      receiver_phone: "جوال المستلم",
      receiver_address: "العنوان الكامل",
      save_draft: "حفظ كمسودة",
      send_shipment: "إرسال الطلب",
      
      // --- لوحة تحكم الناقل (صاحب الشاحنة) - حسب الـ OCR ---
      carrier_dashboard: "لوحة تحكم الناقل",
      register_truck: "تسجيل شاحنة جديدة",
      register_driver: "تسجيل سائق",
      submit_offer: "تقديم عروض أسعار",
      active_shipments: "شحنات جارية",
      print_policy: "طباعة بوليصة",
      truck_model: "الموديل",
      plate_number: "رقم اللوحة",
      capacity: "السعة (الحجم)",
      driver_license: "رقم الرخصة",
      id_number: "رقم الهوية",
      
      // --- لوحة تحكم الإدارة - حسب الـ OCR ---
      admin_dashboard: "لوحة تحكم الإدارة",
      users_management: "إدارة المستخدمين",
      shipments_management: "إدارة الشحنات",
      support_reports: "الدعم والتقارير",
      finance_operations: "العمليات المالية",
      system_settings: "إعدادات النظام",
      active_users: "المستخدمين النشطين",
      today_shipments: "شحنات اليوم",
      total_commissions: "إجمالي العمولات",
      performance_reports: "تقارير الأداء",
      
      // --- حالات وحقول أخرى ---
      status_active: "نشطة",
      status_completed: "منجزة",
      status_delayed: "مؤجلة",
      status_cancelled: "ملغاة",
      truck_types: "أنواع الشاحنات",
      trailer_types: "أنواع المقطورات",
      dimensions: "الأبعاد",
      
      // تفاصيل من الـ OCR
      general_goods: "بضائع عامة",
      food_stuff: "مواد غذائية",
      building_materials: "مواد بناء",
      carton: "كرتون",
      sack: "شوال",
      pallet: "طبلية"
    }
  },
  // ... (English translation updates omitted for brevity but structure remains same) ...
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ar',
    interpolation: { escapeValue: false },
    detection: { order: ['localStorage', 'navigator'], caches: ['localStorage'] }
  });

export default i18n;
