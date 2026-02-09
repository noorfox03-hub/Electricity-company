import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Users, Truck, Package, CheckCircle, ArrowLeft, Search, Activity, MoreVertical, Loader2 } from 'lucide-react';
import { truckTypes } from '@/data/mockData';
import { useTranslation } from 'react-i18next';

type TabType = 'overview' | 'drivers' | 'shippers' | 'loads';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDrivers: 0,
    totalShippers: 0,
    activeLoads: 0,
    completedTrips: 0
  });
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loads, setLoads] = useState<any[]>([]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const { count: driversCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'driver');
        const { count: shippersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'shipper');
        const { count: activeLoadsCount } = await supabase.from('loads').select('*', { count: 'exact', head: true }).in('status', ['available', 'in_progress']);
        const { count: completedLoadsCount } = await supabase.from('loads').select('*', { count: 'exact', head: true }).eq('status', 'completed');

        setStats({
          totalUsers: usersCount || 0,
          totalDrivers: driversCount || 0,
          totalShippers: shippersCount || 0,
          activeLoads: activeLoadsCount || 0,
          completedTrips: completedLoadsCount || 0
        });

        // جلب السائقين مع تفاصيل مركباتهم
        const { data: driversData } = await supabase
          .from('profiles')
          .select('*, driver_details(*)')
          .eq('role', 'driver')
          .order('created_at', { ascending: false });
          
        if (driversData) setDrivers(driversData);

        const { data: loadsData } = await supabase
          .from('loads')
          .select('*, profiles:owner_id(full_name)')
          .order('created_at', { ascending: false });
          
        if (loadsData) setLoads(loadsData);

      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const getTruckName = (typeId: string) => {
    const truck = truckTypes.find(t => t.id === typeId);
    return truck ? t(truck.id as any) : typeId;
  };

  const statCards = [
    { label: t('total_users'), value: stats.totalUsers, icon: Users, color: 'bg-primary' },
    { label: t('drivers_list'), value: stats.totalDrivers, icon: Truck, color: 'bg-secondary' },
    { label: t('active_loads'), value: stats.activeLoads, icon: Package, color: 'bg-brand-orange-light' },
    { label: t('completed_trips'), value: stats.completedTrips, icon: CheckCircle, color: 'bg-brand-green' },
  ];

  const tabs = [
    { id: 'overview', label: t('overview') },
    { id: 'drivers', label: t('drivers_list') },
    { id: 'shippers', label: t('shippers_list') },
    { id: 'loads', label: t('orders_list') },
  ];

  const filteredDrivers = drivers.filter(driver =>
    driver.full_name?.includes(searchQuery) || driver.phone?.includes(searchQuery)
  );

  const activeLoadsList = loads.filter(load => load.status === 'in_progress' || load.status === 'available');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border px-4 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="icon-btn w-10 h-10 lg:hidden">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center p-1.5 border border-primary/20">
                <img src="/logo.png" alt="SAS" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">{t('dashboard')}</h1>
                <p className="text-sm text-muted-foreground hidden lg:block">{t('system_management')}</p>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search_placeholder')}
                className="input-field pr-10 w-64"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border-b border-border px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 lg:p-8">
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((stat, index) => (
                <div key={index} className="brand-card p-4 lg:p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <p className="text-2xl lg:text-3xl font-bold text-foreground mb-1">{stat.value.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="brand-card p-4 lg:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  {t('recent_orders')}
                </h2>
                <span className="badge-active text-xs">{t('live_status')}</span>
              </div>

              <div className="space-y-3">
                {activeLoadsList.length > 0 ? activeLoadsList.slice(0, 5).map((load) => (
                  <div key={load.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${load.status === 'in_progress' ? 'bg-secondary animate-pulse' : 'bg-primary'}`} />
                      <div>
                        <p className="font-semibold text-foreground">{load.origin} ← {load.destination}</p>
                        <p className="text-sm text-muted-foreground">{load.profiles?.full_name || t('visitor')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-primary">{load.price} {t('sar')}</span>
                    </div>
                  </div>
                )) : (
                  <p className="text-center text-muted-foreground py-4">{t('no_recent_loads')}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'drivers' && (
          <div className="animate-fade-in">
            <div className="lg:hidden mb-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('search_placeholder')}
                  className="input-field pr-10"
                />
              </div>
            </div>

            <div className="brand-card overflow-hidden">
              <div className="overflow-x-auto">
                {/* تم إضافة min-w-[600px] لمنع انضغاط الجدول في الموبايل */}
                <table className="w-full min-w-[600px]">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-right p-4 font-semibold text-foreground">{t('driver')}</th>
                      <th className="text-right p-4 font-semibold text-foreground">{t('phone_label')}</th>
                      <th className="text-right p-4 font-semibold text-foreground">{t('truck_label')}</th>
                      <th className="text-right p-4 font-semibold text-foreground">{t('registration_date')}</th>
                      <th className="p-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDrivers.length > 0 ? filteredDrivers.map((driver) => (
                      <tr key={driver.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center shrink-0">
                              <Truck className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">{driver.full_name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground" dir="ltr">{driver.country_code} {driver.phone}</td>
                        <td className="p-4 text-muted-foreground">
                          {/* استرجاع نوع الشاحنة من مصفوفة driver_details */}
                          {driver.driver_details?.[0]?.truck_type 
                            ? getTruckName(driver.driver_details[0].truck_type) 
                            : <span className="text-muted-foreground/50">{t('no_data')}</span>}
                        </td>
                        <td className="p-4 text-muted-foreground text-sm">
                          {new Date(driver.created_at).toLocaleDateString('ar-SA')}
                        </td>
                        <td className="p-4">
                          <button className="icon-btn w-8 h-8">
                            <MoreVertical className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted-foreground">{t('no_registered_drivers')}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'shippers' && (
          <div className="animate-fade-in">
            <div className="brand-card p-8 text-center">
              <Users className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-2">{t('shippers_list')}</h3>
              <p className="text-muted-foreground mb-4">{t('total_registered')}: {stats.totalShippers}</p>
            </div>
          </div>
        )}

        {activeTab === 'loads' && (
          <div className="animate-fade-in space-y-3">
            {loads.length > 0 ? loads.map((load) => (
              <div key={load.id} className="brand-card p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {load.status === 'available' && <span className="badge-active">{t('available_status')}</span>}
                    {load.status === 'in_progress' && <span className="badge-active pulse-live">{t('in_progress_status')}</span>}
                    {load.status === 'completed' && <span className="badge-completed">{t('completed_status')}</span>}
                  </div>
                  <p className="font-bold text-primary">{load.price} {t('sar')}</p>
                </div>
                
                <p className="font-semibold text-foreground mb-2">{load.origin} ← {load.destination}</p>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{load.profiles?.full_name || t('shipper')}</span>
                  <span>{new Date(load.created_at).toLocaleDateString('ar-SA')}</span>
                </div>
              </div>
            )) : (
              <div className="text-center py-12 text-muted-foreground">{t('no_recent_loads')}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
