import { supabase } from '@/lib/supabase';

export const api = {
  // --------------------------------------------------------
  // 1. دوال المصادقة
  // --------------------------------------------------------

  async sendOtp(phone: string, countryCode: string) {
    const fullPhone = `${countryCode}${phone}`;
    const { error } = await supabase.auth.signInWithOtp({
      phone: fullPhone,
    });

    if (error) throw new Error(error.message);
    return { success: true };
  },

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

  async loginAdmin(email: string, pass: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: pass,
    });

    if (error) throw new Error(error.message);
    return data;
  },

  async createProfile(userId: string, fullName: string, role: string, phone: string, countryCode: string) {
    const { data, error } = await supabase
      .from('profiles')
      .insert([{ id: userId, full_name: fullName, role, phone, country_code: countryCode }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  // --------------------------------------------------------
  // 2. دوال تفاصيل السائق (تمت إضافتها)
  // --------------------------------------------------------

  async saveDriverDetails(userId: string, details: any) {
    const { data, error } = await supabase
      .from('driver_details')
      .upsert({ user_id: userId, ...details })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async getDriverDetails(userId: string) {
    const { data, error } = await supabase
      .from('driver_details')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data;
  },

  async getAvailableDrivers() {
    // جلب السائقين مع تفاصيل مركباتهم
    const { data, error } = await supabase
      .from('profiles')
      .select('*, driver_details(*)')
      .eq('role', 'driver');

    if (error) throw new Error(error.message);
    
    // تنسيق البيانات لتناسب الواجهة
    return data.map((d: any) => ({
      id: d.id,
      name: d.full_name,
      phone: d.phone,
      countryCode: d.country_code,
      currentCity: d.current_city || 'الرياض', // افتراضي
      // التأكد من وجود تفاصيل السائق
      truckType: d.driver_details?.[0]?.truck_type || null, 
      created_at: d.created_at
    }));
  },

  // --------------------------------------------------------
  // 3. دوال الحمولات (تم تحديثها)
  // --------------------------------------------------------

  async postLoad(loadData: any, userId: string) {
    const { data, error } = await supabase
      .from('loads')
      .insert([{
        ...loadData,
        owner_id: userId,
        status: 'available',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

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
