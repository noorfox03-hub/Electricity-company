import { supabase } from '@/lib/supabase';
import { Driver, Load, AdminStats, UserProfile, Receiver, Product } from '@/types';

export const api = {
  // --- Auth & Profiles ---
  async sendOtp(phone: string, countryCode: string) {
    const fullPhone = `${countryCode}${phone}`;
    const { error } = await supabase.auth.signInWithOtp({ phone: fullPhone });
    if (error) throw new Error(error.message);
    return { success: true };
  },

  async verifyOtp(phone: string, countryCode: string, token: string) {
    const fullPhone = `${countryCode}${phone}`;
    const { data: authData, error: authError } = await supabase.auth.verifyOtp({
      phone: fullPhone,
      token,
      type: 'sms',
    });

    if (authError) throw new Error(authError.message);
    if (!authData.user) throw new Error("Authentication failed");

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();
    
    return { session: authData.session, user: authData.user, profile: profile as UserProfile | null };
  },

  async loginAdmin(email: string, pass: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    if (error) throw new Error(error.message);
    return data;
  },

  async createProfile(id: string, full_name: string, role: string, phone: string, country_code: string) {
    const { data, error } = await supabase
      .from('profiles')
      .insert([{ id, full_name, role, phone, country_code, created_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async saveDriverDetails(id: string, details: { truck_type: string; trailer_type: string; dimensions: string }) {
    const { error } = await supabase
      .from('driver_details')
      .insert([{ id, ...details }]);
    if (error) throw new Error(error.message);
    return true;
  },

  async getDriverDetails(driverId: string) {
    const { data, error } = await supabase
      .from('driver_details')
      .select('*')
      .eq('id', driverId)
      .single();
    if (error && error.code !== 'PGRST116') console.error(error); 
    return data;
  },

  async getAvailableDrivers(): Promise<Driver[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, driver_details(*)')
      .eq('role', 'driver');

    if (error) throw new Error(error.message);

    return (data || []).map((d: any) => ({
      id: d.id,
      full_name: d.full_name,
      phone: d.phone,
      country_code: d.country_code,
      role: d.role,
      currentCity: 'الرياض',
      rating: 5.0,
      completedTrips: 0,
      isAvailable: true,
      created_at: d.created_at,
      truckType: d.driver_details?.[0]?.truck_type || 'unknown',
      driver_details: d.driver_details
    }));
  },

  // --- Loads & Shipments ---
  async getLoads(): Promise<Load[]> {
    const { data, error } = await supabase
      .from('loads')
      .select('*, profiles:owner_id(full_name, phone, country_code)')
      .eq('status', 'available')
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data as Load[];
  },

  async getLoadById(loadId: string): Promise<Load> {
    const { data, error } = await supabase
      .from('loads')
      .select('*, profiles:owner_id(full_name, phone, country_code)')
      .eq('id', loadId)
      .single();

    if (error) throw new Error(error.message);
    return data as Load;
  },

  // Updated postLoad to handle Products and Receiver (JSONB assumed or simplified)
  async postLoad(loadData: Partial<Load> & { products?: Product[], receiver?: Receiver }, userId: string) {
    // 1. Insert Load main data
    // Note: This assumes your DB 'loads' table has columns or a JSONB column 'details' to store extras.
    // For this example, we'll assume standard columns + 'receiver_info' JSONB column.
    
    const { data: load, error: loadError } = await supabase
      .from('loads')
      .insert([{
        owner_id: userId,
        origin: loadData.origin,
        destination: loadData.destination,
        originLat: loadData.originLat,
        originLng: loadData.originLng,
        destLat: loadData.destLat,
        destLng: loadData.destLng,
        weight: loadData.weight,
        price: loadData.price,
        truck_type_required: loadData.truck_type_required,
        status: 'available',
        // Storing complex objects as JSONB if supported by your schema, otherwise adjust accordingly
        receiver_info: loadData.receiver, 
        package_type: loadData.package_type,
        type: loadData.type,
        pickup_date: loadData.pickupDate,
        estimatedTime: loadData.estimatedTime
      }])
      .select()
      .single();

    if (loadError) throw new Error(loadError.message);

    // 2. Insert Products (Assuming a 'shipment_products' table)
    if (loadData.products && loadData.products.length > 0) {
       const productsToInsert = loadData.products.map(p => ({
         load_id: load.id,
         name: p.name,
         description: p.description,
         quantity: p.quantity,
         unit: p.unit,
         type: p.type
       }));
       
       const { error: prodError } = await supabase.from('shipment_products').insert(productsToInsert);
       // We log error but don't fail the whole operation if products fail (optional logic)
       if (prodError) console.error("Error saving products:", prodError);
    }

    return true;
  },

  async getDriverHistory(driverId: string): Promise<Load[]> {
    const { data, error } = await supabase
      .from('loads')
      .select('*, profiles:owner_id(full_name)')
      .eq('driver_id', driverId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data as Load[];
  },

  async acceptLoad(loadId: string, driverId: string) {
    const { error } = await supabase
      .from('loads')
      .update({ status: 'in_progress', driver_id: driverId })
      .eq('id', loadId);
    if (error) throw new Error(error.message);
  },

  async cancelLoad(loadId: string) {
    const { error } = await supabase
      .from('loads')
      .update({ status: 'available', driver_id: null })
      .eq('id', loadId);
    if (error) throw new Error(error.message);
  },

  // --- Stats ---
  async getAdminStats(): Promise<AdminStats> {
    // This aggregates counts using Supabase 'count' feature
    const [users, drivers, shippers, activeLoads, completed] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'driver'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'shipper'),
      supabase.from('loads').select('*', { count: 'exact', head: true }).in('status', ['available', 'in_progress']),
      supabase.from('loads').select('*', { count: 'exact', head: true }).eq('status', 'completed')
    ]);

    return {
      totalUsers: users.count || 0,
      totalDrivers: drivers.count || 0,
      totalShippers: shippers.count || 0,
      activeLoads: activeLoads.count || 0,
      completedTrips: completed.count || 0
    };
  }
};
