import { supabase } from '@/lib/supabase';

export const api = {
  // --- حفظ بيانات مركبة السائق (تستخدم بعد تأكيد البريد) ---
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

  // --- المصادقة ---
  async loginByEmail(email: string, pass: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) throw error;
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
    return { session: data.session, user: data.user, profile };
  },

  async registerUser(payload: any) {
    const { data: authData, error: authError } = await supabase.auth.verifyOtp({
      email: payload.email, token: payload.otpCode, type: 'signup'
    });
    if (authError) throw authError;

    const { data: profile, error: pErr } = await supabase.from('profiles').insert([{
      id: authData.user!.id, full_name: payload.name, role: payload.role, phone: payload.phone, country_code: '+966'
    }]).select().single();
    if (pErr) throw pErr;
    return { user: authData.user, profile };
  },

  // --- الحمولات ---
  async getLoads() {
    const { data, error } = await supabase
      .from('loads')
      .select('*, profiles(full_name, phone)')
      .eq('status', 'available')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async postLoad(loadData: any, userId: string) {
    const { error } = await supabase.from('loads').insert([{
      owner_id: userId,
      origin: loadData.origin,
      destination: loadData.destination,
      weight: parseFloat(loadData.weight),
      price: parseFloat(loadData.price),
      truck_type_required: loadData.truck_type_required,
      status: 'available'
    }]);
    if (error) throw error;
  }
};
