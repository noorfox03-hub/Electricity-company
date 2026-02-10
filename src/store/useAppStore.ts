import { supabase } from '@/lib/supabase';
import { UserProfile, Load, AdminStats } from '@/types';

export const api = {
  // ==========================================
  // 1. نظام المصادقة (Authentication)
  // ==========================================

  // إرسال كود التحقق للبريد الإلكتروني (بدء التسجيل)
  async sendEmailOtp(email: string, pass: string, metadata: any) {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: pass,
      options: {
        data: metadata,
        emailRedirectTo: window.location.origin
      },
    });
    if (error) throw error;
    return data;
  },

  // التحقق من الكود وإنشاء البروفايل النهائي
  async registerUser(payload: any) {
    const { data: authData, error: authError } = await supabase.auth.verifyOtp({
      email: payload.email,
      token: payload.otpCode,
      type: 'signup',
    });

    if (authError) throw authError;

    // إنشاء سجل في جدول البروفايلات الحقيقي
    const { data: profile, error: pErr } = await supabase
      .from('profiles')
      .insert([
        {
          id: authData.user!.id,
          full_name: payload.name,
          role: payload.role,
          phone: payload.phone,
          email: payload.email,
          country_code: '+966',
        },
      ])
      .select()
      .single();

    if (pErr) throw pErr;
    return { user: authData.user, profile };
  },

  // تسجيل دخول المستخدمين (سائق / شاحن)
  async loginByEmail(email: string, pass: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    if (error) throw error;

    const { data: profile, error: pErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (pErr) throw pErr;
    return { session: data.session, user: data.user, profile: profile as UserProfile };
  },

  // تسجيل دخول الإدارة (Admin)
  async loginAdmin(email: string, pass: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    if (error) throw error;

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (profile?.role !== 'admin') {
      await supabase.auth.signOut();
      throw new Error("عذراً، لا تملك صلاحيات دخول الإدارة");
    }
    return data;
  },

  // استعادة كلمة المرور
  async forgotPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    });
    if (error) throw error;
    return true;
  },

  // ==========================================
  // 2. نظام السائقين والمركبات (Drivers & Trucks)
  // ==========================================

  // حفظ بيانات الشاحنة المختارة في المعالج الرباعي (Sigs, Trella, etc.)
  async saveDriverVehicle(userId: string, data: any) {
    const { error } = await supabase
      .from('driver_details')
      .upsert({
        id: userId,
        truck_type: data.truck_type,
        body_type: data.body_type,
        dimensions: data.dimensions,
        plate_number: data.plate_number,
        is_available: true
      });

    if (error) throw error;
    return true;
  },

  // إضافة شاحنة جديدة من الداشبورد
  async addTruck(truckData: any, userId: string) {
    const { error } = await supabase
      .from('trucks')
      .insert([{
        owner_id: userId,
        plate_number: truckData.plate_number,
        brand: truckData.brand,
        model_year: truckData.model_year,
        truck_type: truckData.truck_type
      }]);
    if (error) throw error;
  },

  // إضافة سائق تابع
  async addSubDriver(driverData: any, carrierId: string) {
    const { error } = await supabase
      .from('sub_drivers')
      .insert([{
        carrier_id: carrierId,
        driver_name: driverData.driver_name,
        driver_phone: driverData.driver_phone,
        id_number: driverData.id_number
      }]);
    if (error) throw error;
  },

  // جلب السائقين المتاحين لأصحاب الحمولات
  async getAvailableDrivers() {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id, full_name, phone,
        driver_details ( truck_type, body_type, current_city, is_available )
      `)
      .eq('role', 'driver');
    if (error) throw error;
    return data;
  },

  // جلب تفاصيل السائق لحسابي
  async getDriverDetails(userId: string) {
    const { data, error } = await supabase
        .from('driver_details')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
    if (error) throw error;
    return data;
  },

  // ==========================================
  // 3. نظام الحمولات (Loads)
  // ==========================================

  // نشر حمولة جديدة (من معالج الـ 5 خطوات الحقيقي)
  async postLoad(loadData: any, userId: string) {
    const { error } = await supabase
      .from('loads')
      .insert([{
        owner_id: userId,
        origin: loadData.origin,
        destination: loadData.destination,
        origin_lat: loadData.originLat,
        origin_lng: loadData.originLng,
        dest_lat: loadData.destLat,
        dest_lng: loadData.destLng,
        weight: parseFloat(loadData.weight) || 0,
        price: parseFloat(loadData.price) || 0,
        truck_size: loadData.selectedSize,
        body_type: loadData.selectedBodyType,
        description: loadData.description || '',
        receiver_name: loadData.receiver.name,
        receiver_phone: loadData.receiver.phone,
        receiver_address: loadData.receiver.address,
        status: 'available'
      }]);

    if (error) throw error;
  },

  // جلب كل الحمولات المتاحة للسائقين
  async getLoads() {
    const { data, error } = await supabase
      .from('loads')
      .select('*, profiles(full_name, phone)')
      .eq('status', 'available')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  // جلب تفاصيل حمولة محددة
  async getLoadById(id: string) {
    const { data, error } = await supabase
      .from('loads')
      .select('*, profiles(full_name, phone)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  // ==========================================
  // 4. الإحصائيات (Statistics)
  // ==========================================

  // إحصائيات لوحة تحكم السائق
  async getDriverStats(userId: string) {
    const { count } = await supabase
      .from('loads')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'in_progress');
    
    return {
      activeLoads: count || 0,
      earnings: 15000,
      rating: 4.8
    };
  },

  // إحصائيات الإدارة الشاملة
  async getAdminStats(): Promise<AdminStats> {
    const { count: users } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { count: loads } = await supabase.from('loads').select('*', { count: 'exact', head: true });
    const { count: trucks } = await supabase.from('trucks').select('*', { count: 'exact', head: true });
    
    return {
      totalUsers: users || 0,
      totalDrivers: trucks || 0,
      totalShippers: (users || 0) - (trucks || 0),
      activeLoads: loads || 0,
      completedTrips: 0
    };
  }
};
