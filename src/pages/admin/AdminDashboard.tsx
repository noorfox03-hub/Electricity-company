import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { api } from '@/services/api';
import { 
  Users, Truck, Package, LayoutDashboard, Settings, 
  FileText, Headphones, CreditCard, LogOut, Menu,
  BarChart, Bell, ClipboardList, Shield
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AdminStats } from '@/types';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalDrivers: 0,
    totalShippers: 0,
    activeLoads: 0,
    completedTrips: 0
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await api.getAdminStats();
        setStats(data);
      } catch (e) {
        console.error(e);
      }
    };
    loadStats();
  }, []);

  // قائمة الإدارة حسب صورة الـ OCR بالضبط
  const menuItems = [
    { id: 'dashboard', label: t('admin_dashboard'), icon: LayoutDashboard },
    { id: 'users', label: t('users_management'), icon: Users },
    { id: 'shipments', label: t('shipments_management'), icon: Package },
    { id: 'drivers_manage', label: t('drivers_list'), icon: Truck }, // إدارة المركبات والسائقين
    { id: 'support', label: t('support_reports'), icon: Headphones },
    { id: 'finance', label: t('finance_operations'), icon: CreditCard },
    { id: 'settings', label: t('system_settings'), icon: Settings },
  ];

  const SidebarContent = () => (
    <div className="h-full flex flex-col bg-[#1e293b] text-white">
      <div className="p-6 border-b border-slate-700 bg-[#0f172a]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-primary/30">
            SAS
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">{t('app_name')}</h1>
            <p className="text-xs text-slate-400">{t('admin_dashboard')}</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => { setActiveTab(item.id); }}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
              activeTab === item.id 
                ? 'bg-primary text-white shadow-lg shadow-primary/20 font-bold border-r-4 border-white' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon className={`w-5 h-5 transition-transform ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </nav>
      
      <div className="p-4 border-t border-slate-700 bg-[#0f172a]">
        <button onClick={() => navigate('/login')} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
          <LogOut className="w-5 h-5" />
          <span className="font-bold">تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-100" dir="rtl">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-72 shrink-0 shadow-2xl z-20">
        <SidebarContent />
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="bg-white h-16 flex items-center justify-between px-6 shadow-sm z-10">
          <div className="flex items-center gap-4 lg:hidden">
            <Sheet>
              <SheetTrigger>
                <div className="p-2 hover:bg-gray-100 rounded-lg">
                  <Menu className="w-6 h-6 text-slate-700" />
                </div>
              </SheetTrigger>
              <SheetContent side="right" className="p-0 border-0 w-72">
                <SidebarContent />
              </SheetContent>
            </Sheet>
            <span className="font-bold text-lg text-slate-800">{t('admin_dashboard')}</span>
          </div>

          <div className="hidden lg:block">
            <h2 className="font-bold text-slate-800 text-lg">
              {menuItems.find(i => i.id === activeTab)?.label}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold border border-primary/20">
              A
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-auto p-4 lg:p-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fade-in">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { title: t('active_users'), value: stats.totalUsers, icon: Users, color: 'bg-blue-500' },
                  { title: t('today_shipments'), value: stats.activeLoads, icon: Package, color: 'bg-orange-500' },
                  { title: t('total_commissions'), value: `${stats.completedTrips * 50} ر.س`, icon: CreditCard, color: 'bg-green-500' },
                  { title: 'الشكاوى المفتوحة', value: '3', icon: Headphones, color: 'bg-red-500' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className={`absolute top-0 right-0 w-2 h-full ${stat.color}`}></div>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-gray-500 text-sm font-medium mb-1">{stat.title}</p>
                        <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
                      </div>
                      <div className={`w-10 h-10 ${stat.color.replace('bg-', 'bg-')}/10 rounded-xl flex items-center justify-center ${stat.color.replace('bg-', 'text-')}`}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reports & Alerts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Area (Mockup) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[300px]">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                      <BarChart className="w-5 h-5 text-primary" />
                      {t('performance_reports')}
                    </h3>
                    <select className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 text-sm outline-none">
                      <option>هذا الشهر</option>
                      <option>آخر 6 أشهر</option>
                    </select>
                  </div>
                  <div className="h-64 flex items-end justify-between gap-2 px-4 pb-4 border-b border-l border-gray-200">
                    {[40, 65, 30, 80, 55, 90, 45].map((h, i) => (
                      <div key={i} className="w-full bg-primary/10 rounded-t-lg hover:bg-primary/20 transition-colors relative group">
                        <div style={{ height: `${h}%` }} className="absolute bottom-0 w-full bg-primary rounded-t-lg"></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Important Alerts */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-red-500" />
                    إشعارات هامة
                  </h3>
                  <div className="space-y-3">
                    {[
                      { msg: 'وثائق 5 سائقين منتهية الصلاحية', type: 'error' },
                      { msg: 'شكوى عاجلة من العميل #4421', type: 'warning' },
                      { msg: 'طلب سحب رصيد من الناقل "سعد"', type: 'info' }
                    ].map((alert, i) => (
                      <div key={i} className={`p-3 rounded-xl border flex gap-3 items-start ${
                        alert.type === 'error' ? 'bg-red-50 border-red-100 text-red-700' :
                        alert.type === 'warning' ? 'bg-yellow-50 border-yellow-100 text-yellow-700' :
                        'bg-blue-50 border-blue-100 text-blue-700'
                      }`}>
                        <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                          alert.type === 'error' ? 'bg-red-500' :
                          alert.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                        }`} />
                        <span className="text-sm font-medium leading-tight">{alert.msg}</span>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-4 text-center text-primary text-sm font-bold hover:underline">
                    عرض الكل
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Default view for other tabs */}
          {activeTab !== 'dashboard' && (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ClipboardList className="w-12 h-12 opacity-20" />
              </div>
              <h2 className="text-xl font-bold text-gray-600 mb-2">
                قسم {menuItems.find(i => i.id === activeTab)?.label}
              </h2>
              <p>هذا القسم قيد التطوير حالياً، سيتم إتاحته قريباً.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
