import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Search, History, Truck, PlusCircle, Users, FileText, Bell, TrendingUp, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { api } from '@/services/api'; 
import { useTranslation } from 'react-i18next';

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

  const fleetActions = [
    {
      id: 'add_truck',
      title: t('register_truck'),
      icon: Truck,
      color: 'bg-primary',
      onClick: () => toast.info('فتح نموذج تسجيل شاحنة جديدة...'), // Placeholder
    },
    {
      id: 'add_driver',
      title: t('register_driver'),
      icon: Users,
      color: 'bg-secondary',
      onClick: () => toast.info('فتح نموذج إضافة سائق...'),
    },
    {
      id: 'offers',
      title: t('submit_offer'),
      icon: PlusCircle,
      color: 'bg-green-600',
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
    { label: t('monthly_earnings'), value: '15,000', unit: t('sar') },
  ];

  return (
    <div className="mobile-container min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary px-4 pt-6 pb-20 rounded-b-[40px] shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center p-1 border border-white/20">
              <img src="/logo.png" alt="SAS" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="text-primary-foreground/70 text-xs">{t('welcome')}</p>
              <h1 className="text-lg font-bold text-primary-foreground">
                {userProfile?.full_name || t('visitor')}
              </h1>
            </div>
          </div>
          <button className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center relative hover:bg-white/20 transition">
            <Bell className="w-5 h-5 text-primary-foreground" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-primary"></span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="flex justify-between px-2">
          {mainStats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-primary-foreground/70 text-xs mb-1">{stat.label}</p>
              <p className="text-xl font-bold text-primary-foreground flex justify-center items-end gap-1">
                {stat.value}
                {stat.unit && <span className="text-xs font-normal mb-1">{stat.unit}</span>}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Fleet Actions Grid (Floating Cards) */}
      <div className="px-4 -mt-14 grid grid-cols-2 gap-4">
        {fleetActions.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            className="brand-card p-4 flex flex-col items-center justify-center text-center gap-3 shadow-lg hover:translate-y-[-2px] transition-all bg-card"
          >
            <div className={`w-12 h-12 ${action.color} rounded-full flex items-center justify-center shadow-md`}>
              <action.icon className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-sm text-foreground">{action.title}</span>
          </button>
        ))}
      </div>

      {/* Available Shipments (Marketplace) */}
      <div className="px-4 mt-8 pb-20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" />
            {t('nearby_loads')}
          </h2>
          <button onClick={() => navigate('/driver/loads')} className="text-primary text-sm font-semibold">
            {t('view_all')}
          </button>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-4"><Loader2 className="animate-spin text-primary" /></div>
          ) : recentLoads.slice(0, 3).map((load) => (
            <div key={load.id} onClick={() => navigate(`/driver/load/${load.id}`)} className="brand-card p-4 cursor-pointer hover:shadow-card-hover transition-all">
              <div className="flex justify-between items-start mb-3">
                <span className="badge-active bg-green-100 text-green-700 border-green-200">{t('available_status')}</span>
                <span className="font-bold text-primary text-lg">{Number(load.price).toLocaleString()} {t('sar')}</span>
              </div>
              
              <div className="flex items-center gap-3 relative">
                <div className="flex flex-col items-center h-full absolute right-0 top-1 bottom-1">
                  <div className="w-2 h-2 bg-primary rounded-full ring-4 ring-primary/20"></div>
                  <div className="w-0.5 flex-1 bg-border my-1"></div>
                  <div className="w-2 h-2 bg-secondary rounded-full ring-4 ring-secondary/20"></div>
                </div>
                <div className="flex-1 pr-6 space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">{t('pickup_location')}</p>
                    <p className="font-bold text-sm text-foreground">{load.origin}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">{t('delivery_location')}</p>
                    <p className="font-bold text-sm text-foreground">{load.destination}</p>
                  </div>
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
