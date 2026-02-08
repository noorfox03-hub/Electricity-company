import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Search, History, User, Bell, TrendingUp, Truck, Loader2 } from 'lucide-react';
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

  const menuCards = [
    {
      id: 'nearby',
      title: t('nearby_loads'),
      subtitle: t('loads_available_count', { count: recentLoads.length }),
      icon: MapPin,
      color: 'bg-primary',
      onClick: () => navigate('/driver/loads'),
    },
    {
      id: 'search',
      title: t('advanced_search'),
      subtitle: t('search_by_dest'),
      icon: Search,
      color: 'bg-secondary',
      onClick: () => navigate('/driver/search'),
    },
    {
      id: 'history',
      title: t('trip_history'),
      subtitle: t('previous_trips'),
      icon: History,
      color: 'bg-brand-orange-dark',
      onClick: () => navigate('/driver/history'),
    },
    {
      id: 'account',
      title: t('my_account'),
      subtitle: t('profile_settings'),
      icon: User,
      color: 'bg-muted-foreground',
      onClick: () => navigate('/driver/account'),
    },
  ];

  const stats = [
    { label: t('completed_trips'), value: '0', icon: TrendingUp },
    { label: t('rating'), value: '5.0', icon: '⭐' },
    { label: t('monthly_earnings'), value: '0', unit: t('sar') },
  ];

  return (
    <div className="mobile-container min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary px-4 pt-6 pb-16 rounded-b-3xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center p-2 border border-white/20">
              <img src="/logo.png" alt="SAS" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="text-primary-foreground/70 text-sm">{t('welcome_user')}</p>
              <h1 className="text-xl font-bold text-primary-foreground">
                {userProfile?.full_name || t('visitor')}
              </h1>
            </div>
          </div>
          <button className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center relative">
            <Bell className="w-5 h-5 text-primary-foreground" />
          </button>
        </div>

        {/* Stats Row */}
        <div className="flex justify-between">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-primary-foreground/70 text-xs mb-1">{stat.label}</p>
              <p className="text-xl font-bold text-primary-foreground">
                {stat.value}
                {stat.unit && <span className="text-sm font-normal mr-1">{stat.unit}</span>}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Menu Cards */}
      <div className="px-4 -mt-10">
        <div className="grid grid-cols-2 gap-4">
          {menuCards.map((card, index) => (
            <button
              key={card.id}
              onClick={card.onClick}
              className="brand-card p-5 text-right hover:scale-[1.02] transition-transform animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`w-12 h-12 ${card.color} rounded-2xl flex items-center justify-center mb-4`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-foreground mb-1">{card.title}</h3>
              <p className="text-sm text-muted-foreground">{card.subtitle}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Loads Section */}
      <div className="px-4 mt-8 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">{t('recent_loads')}</h2>
          <button 
            onClick={() => navigate('/driver/loads')}
            className="text-primary font-semibold text-sm"
          >
            {t('view_all')}
          </button>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-4"><Loader2 className="animate-spin text-primary" /></div>
          ) : recentLoads.slice(0, 3).map((load) => (
            <button
              key={load.id}
              onClick={() => navigate(`/driver/load/${load.id}`)}
              className="brand-card w-full p-4 text-right"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="badge-active">{t('available_status')}</span>
                <div className="text-left">
                  <p className="font-bold text-primary">{Number(load.price).toLocaleString()} {t('sar')}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <div className="w-0.5 h-6 bg-muted" />
                  <div className="w-3 h-3 rounded-full bg-secondary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{load.origin}</p>
                  <div className="h-4" />
                  <p className="font-semibold text-foreground">{load.destination}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-3">
                <span>{load.distance || 0} {t('km')}</span>
                <span>•</span>
                <span>{load.estimatedTime || '--'}</span>
                <span>•</span>
                <span>{Number(load.weight).toLocaleString()} {t('kg')}</span>
              </div>
            </button>
          ))}
          {!loading && recentLoads.length === 0 && (
            <p className="text-center text-muted-foreground py-4">{t('no_recent_loads')}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
