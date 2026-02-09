import { supabase } from '@/lib/supabase';

export const api = {
  // --------------------------------------------------------
  // 1. دوال المصادقة
  // --------------------------------------------------------

  // إرسال رمز التحقق (OTP)
  async sendOtp(phone: string, countryCode: string) {
    const fullPhone = `${countryCode}${phone}`;
    
    const { error } = await supabase.auth.signInWithOtp({
      phone: fullPhone,
    });

    if (error) throw new Error(error.message);
    return { success: true };
  },

  // التحقق من الرمز وتسجيل الدخول
  async verifyOtp(phone: string, countryCode: string, token: string) {
    const fullPhone = `${countryCode}${phone}`;

    const { data: authData, error: authError } = await supabase.auth.verifyOtp({
      phone: fullPhone,
      token: token,
      type: 'sms',
    });

    if (authError) throw new Error(authError.message);
    if (!authData.user) throw new Error("فشل التحقق من المستخدم");

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();
    
    return { 
      session: authData.session,
      user: authData.user,
      profile: profile || null 
    };
  },

  // تسجيل دخول الأدمن
  async loginAdmin(email: string, pass: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: pass,
    });

    if (error) throw new Error(error.message);
    return data;
  },

  // إنشاء بروفايل جديد (تم تصحيح استقبال المتغيرات هنا)
  async createProfile(id: string, full_name: string, role: string, phone: string, country_code: string) {
    const { data, error } = await supabase
      .from('profiles')
      .insert([{
        id,
        full_name,
        role,
        phone,
        country_code,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  // حفظ تفاصيل السائق (الشاحنة، المقطورة، الأبعاد) - (كانت ناقصة)
  async saveDriverDetails(id: string, details: any) {
    const { error } = await supabase
      .from('driver_details')
      .insert([{
        id: id, // الربط مع جدول profiles عبر id
        truck_type: details.truck_type,
        trailer_type: details.trailer_type,
        dimensions: details.dimensions
      }]);

    if (error) throw new Error(error.message);
    return true;
  },

  // جلب تفاصيل السائق (لعرضها في صفحة الحساب) - (كانت ناقصة)
  async getDriverDetails(driverId: string) {
    const { data, error } = await supabase
      .from('driver_details')
      .select('*')
      .eq('id', driverId)
      .single();

    if (error) {
      // قد لا يكون هناك تفاصيل إذا كان المستخدم جديداً
      console.log("No driver details found or error:", error.message);
      return null;
    }
    return data;
  },

  // جلب السائقين المتاحين (لصاحب الحمولة)
  async getAvailableDrivers() {
    // نجلب السائقين من البروفايل، ونربط مع تفاصيل السائق
    const { data, error } = await supabase
      .from('profiles')
      .select('*, driver_details(*)')
      .eq('role', 'driver'); // يمكنك إضافة فلتر .eq('is_available', true) لو أضفته في الداتابيس

    if (error) throw new Error(error.message);

    // تنسيق البيانات للعرض
    return data.map((d: any) => ({
      id: d.id,
      name: d.full_name,
      phone: d.phone,
      country_code: d.country_code,
      currentCity: 'الرياض', // قيمة افتراضية حتى يتم تفعيل التتبع
      truckType: d.driver_details?.[0]?.truck_type || 'unknown',
      rating: 5.0
    }));
  },

  // --------------------------------------------------------
  // 2. دوال الحمولات (Loads)
  // --------------------------------------------------------

  async getLoads() {
    const { data, error } = await supabase
      .from('loads')
      .select('*, profiles:owner_id(full_name, phone)')
      .eq('status', 'available')
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    
    return data.map((l: any) => ({
      ...l,
      ownerName: l.profiles?.full_name || 'مستخدم',
      ownerPhone: l.profiles?.phone || ''
    }));
  },

  async getLoadById(loadId: string) {
    const { data, error } = await supabase
      .from('loads')
      .select('*, profiles:owner_id(full_name, phone)')
      .eq('id', loadId)
      .single();

    if (error) throw new Error(error.message);
    
    return {
      ...data,
      ownerName: data.profiles?.full_name || 'مستخدم',
      ownerPhone: data.profiles?.phone || ''
    };
  },

  // نشر حمولة جديدة
  async postLoad(loadData: any, userId: string) {
    const { error } = await supabase
      .from('loads')
      .insert([{
        owner_id: userId,
        origin: loadData.origin,
        destination: loadData.destination,
        weight: loadData.weight,
        price: loadData.price,
        description: loadData.description,
        truck_type_required: loadData.truck_type_required,
        distance: loadData.distance,
        estimatedTime: loadData.estimatedTime,
        status: 'available'
      }]);

    if (error) throw new Error(error.message);
    return true;
  },

  async getDriverHistory(driverId: string) {
    const { data, error } = await supabase
      .from('loads')
      .select('*')
      .eq('driver_id', driverId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  },

  async acceptLoad(loadId: string, driverId: string) {
    const { error } = await supabase
      .from('loads')
      .update({ 
        status: 'in_progress', 
        driver_id: driverId 
      })
      .eq('id', loadId);

    if (error) throw new Error(error.message);
  },

  async cancelLoad(loadId: string) {
    const { error } = await supabase
      .from('loads')
      .update({ 
        status: 'available',
        driver_id: null
      })
      .eq('id', loadId);

    if (error) throw new Error(error.message);
  }
};
