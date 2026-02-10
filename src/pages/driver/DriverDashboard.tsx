import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Search, History, Truck, PlusCircle, Users, FileText, Bell, Star, ArrowUpRight, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { api } from '@/services/api'; 
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

const DriverDashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { userProfile } = useAppStore();
  const [recentLoads, setRecentLoads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentLoads = async () => {
      try {
        const loads = await api.getLoads();
        setRecentLoads(loads);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchRecentLoads();
  }, []);

  // قائمة الإجراءات السريعة (حسب الـ OCR)
  const fleetActions = [
    {
      id: 'add_truck',
      title: t('register_truck'),
      icon: Truck,
      color: 'bg-blue-600',
      onClick: () => toast.info('فتح نموذج تسجيل شاحنة جديدة...'),
    },
    {
      id: 'add_driver',
      title: t('register_driver'),
      icon: Users,
      color: 'bg-indigo-600',
      onClick: () => toast.info('فتح نموذج إضافة سائق...'),
    },
    {
      id: 'offers',
      title: t('submit_offer'),
      icon: PlusCircle,
      color: 'bg-emerald-600',
      onClick: () => navigate('/driver/search'),
    },
    {
      id: 'statement',
      title: t('account_statement'),
      icon: FileText,
      color: 'bg-orange-500',
      onClick: () => navigate('/driver/account'),
    }
  ];

  const mainStats = [
    { label: t('active_shipments'), value: '2', icon: Truck },
    { label: t('rating'), value: '4.8', icon: '⭐' },
    { label: t('total_commissions'), value: '15,000', unit: t('sar') },
  ];

  return (
    <div className="mobile-container min-h-screen bg-gray-50/50">
      {/* Header Area */}
      <div className="bg-primary px-5 pt-8 pb-20 rounded-b-[40px] shadow-xl relative overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
          <div className="absolute top-20 right-0 w-32 h-32 bg-secondary rounded-full blur-3xl"></div>
        </div>

        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center p-1 border border-white/20 shadow-inner">
              <img src="/logo.png" alt="SAS" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="text-white/80 text-xs font-medium">{t('carrier_dashboard')}</p>
              <h1 className="text-lg font-bold text-white tracking-wide">
                {userProfile?.full_name || t('visitor')}
              </h1>
            </div>
          </div>
          <button className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center relative hover:bg-white/20 transition-all border border-white/10">
            <Bell className="w-5 h-5 text-white" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-primary animate-pulse"></span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="flex justify-between px-2 relative z-10">
          {mainStats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-white/70 text-xs mb-1 font-medium">{stat.label}</p>
              <p className="text-2xl font-black text-white flex justify-center items-end gap-1">
                {stat.value}
                {stat.unit && <span className="text-xs font-normal mb-1.5 opacity-80">{stat.unit}</span>}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Fleet Actions Grid (Floating Cards) */}
      <div className="px-5 -mt-14 grid grid-cols-2 gap-4 relative z-20">
        {fleetActions.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            className="bg-white p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-3 shadow-lg shadow-gray-200/50 hover:translate-y-[-4px] active:scale-95 transition-all border border-gray-100"
          >
            <div className={`w-12 h-12 ${action.color} rounded-2xl flex items-center justify-center shadow-md text-white rotate-3`}>
              <action.icon className="w-6 h-6" />
            </div>
            <span className="font-bold text-sm text-gray-800">{action.title}</span>
          </button>
        ))}
      </div>

      {/* Marketplace Section */}
      <div className="px-5 mt-8 pb-24">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span className="w-1 h-5 bg-primary rounded-full"></span>
            {t('nearby_loads')}
          </h2>
          <button onClick={() => navigate('/driver/loads')} className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
            {t('view_all')} <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>
          ) : recentLoads.slice(0, 3).map((load) => (
            <div 
              key={load.id} 
              onClick={() => navigate(`/driver/load/${load.id}`)} 
              className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all active:scale-[0.99]"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100">
                  {t('status_active')}
                </span>
                <span className="font-black text-primary text-xl tracking-tight">
                  {Number(load.price).toLocaleString()} <span className="text-sm font-normal text-gray-500">{t('sar')}</span>
                </span>
              </div>
              
              <div className="flex items-center gap-4 relative pl-4">
                {/* Visual Route Line */}
                <div className="flex flex-col items-center h-full absolute right-0 top-1 bottom-1">
                  <div className="w-2.5 h-2.5 bg-primary rounded-full ring-4 ring-primary/10"></div>
                  <div className="w-0.5 flex-1 bg-gradient-to-b from-primary/30 to-secondary/30 my-1"></div>
                  <div className="w-2.5 h-2.5 bg-secondary rounded-full ring-4 ring-secondary/10"></div>
                </div>
                
                <div className="flex-1 pr-6 space-y-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">{t('pickup_location')}</p>
                    <p className="font-bold text-base text-gray-800">{load.origin}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">{t('delivery_location')}</p>
                    <p className="font-bold text-base text-gray-800">{load.destination}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-primary/70" />
                  <span>{t(load.truck_type_required as any) || load.truck_type_required}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <History className="w-4 h-4 text-primary/70" />
                  <span>{load.distance} {t('km')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
