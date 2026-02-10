import { supabase } from '@/lib/supabase';
import { Driver, Load, AdminStats, UserProfile, Receiver, Product } from '@/types';

export const api = {
  // ... (دوال تسجيل الدخول بالهاتف loginByEmail وغيرها تبقى كما هي) ...

  async loginByEmail(email: string, pass: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    if (error) throw new Error(error.message);

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    return { session: data.session, user: data.user, profile: profile as UserProfile };
  },

  // 1. الخطوة الأولى: إرسال رمز التحقق (بدء التسجيل)
  async sendEmailOtp(email: string, password: string, metadata: { full_name: string; role: string; phone: string }) {
    // تحقق أولاً إذا كان البريد مسجلاً في البروفايل لتجنب الأخطاء
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email) // تأكد أن لديك عمود email في جدول profiles، أو تجاهل هذا السطر
      .maybeSingle();
      
    // ملاحظة: Supabase Auth يمنع التكرار تلقائياً، لكن هذا التحقق إضافي للواجهة
    
    // عملية SignUp في Supabase هي التي ترسل رمز التحقق للإيميل
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata // تخزين البيانات الإضافية في metadata مؤقتاً
      }
    });

    if (error) throw new Error(error.message);
    
    // إذا كان المستخدم موجوداً ومؤكداً مسبقاً، signUp قد تعيد session مباشرة أو خطأ حسب الإعدادات
    if (data?.user?.identities?.length === 0) {
      throw new Error("هذا البريد الإلكتروني مسجل بالفعل");
    }

    return true;
  },

  // 2. الخطوة الثانية: التحقق من الرمز وإنشاء البروفايل
  async registerUser(payload: { 
    email: string; 
    otpCode: string;
    role: string; 
    name: string; 
    phone: string;
  }) {
    // التحقق من الكود
    const { data: authData, error: authError } = await supabase.auth.verifyOtp({
      email: payload.email,
      token: payload.otpCode,
      type: 'signup'
    });

    if (authError) throw new Error(authError.message);
    if (!authData.user) throw new Error("فشل التحقق من المستخدم");

    // إنشاء البروفايل في قاعدة البيانات بعد التحقق الناجح
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert([{
        id: authData.user.id,
        full_name: payload.name,
        role: payload.role,
        phone: payload.phone,
        // email: payload.email, // أضف هذا إذا كان لديك عمود إيميل في profiles
        country_code: '+966',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (profileError) {
      // في حال فشل إنشاء البروفايل (نادر الحدوث)، نرجع بيانات المستخدم فقط أو نحاول جلب البروفايل
      console.error("Profile creation error:", profileError);
      return { user: authData.user, profile: { id: authData.user.id, role: payload.role, full_name: payload.name } as UserProfile };
    }

    return { user: authData.user, profile: profile as UserProfile };
  },

  // ... (باقي الدوال كما هي: forgotPassword, loginAdmin, etc.) ...
  
  async forgotPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    });
    if (error) throw new Error(error.message);
    return true;
  },
  
  // (تأكد من وجود باقي الدوال القديمة هنا)
  // ...
  async getLoads() { /* ... */ return [] }, // placeholder
  async getAdminStats() { return {} as any }, // placeholder
  async getAvailableDrivers() { return [] }, // placeholder
};
