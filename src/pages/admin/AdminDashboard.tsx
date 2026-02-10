import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { 
  Users, Truck, Package, LayoutDashboard, Settings, 
  FileText, Headphones, CreditCard, LogOut, Menu
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // إحصائيات وهمية للمثال، يجب ربطها بالـ API الحقيقي
  const stats = {
    users: 1250,
    shipments_today: 45,
    commissions: 15200,
    performance: '95%'
  };

  const menuItems = [
    { id: 'dashboard', label: t('admin_dashboard'), icon: LayoutDashboard },
    { id: 'users', label: t('users_management'), icon: Users },
    { id: 'shipments', label: t('shipments_management'), icon: Package },
    { id: 'support', label: t('support_reports'), icon: Headphones },
    { id: 'finance', label: t('finance_operations'), icon: CreditCard },
    { id: 'settings', label: t('system_settings'), icon: Settings },
  ];

  const SidebarContent = () => (
    <div className="h-full flex flex-col bg-slate-900 text-white">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-primary">{t('app_name')}</h1>
        <p className="text-xs text-slate-400 mt-1">{t('admin_login')}</p>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => { setActiveTab(item.id); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === item.id 
                ? 'bg-primary text-white shadow-lg shadow-primary/30 font-bold' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-800">
        <button onClick={() => navigate('/login')} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
          <LogOut className="w-5 h-5" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50" dir="rtl">
      {/* Sidebar Desktop */}
      <div className="hidden lg:block w-72 shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile Header */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="lg:hidden bg-white p-4 flex items-center justify-between shadow-sm border-b">
          <div className="flex items-center gap-2">
            <img src="/logo.png" className="w-8 h-8" alt="Logo" />
            <span className="font-bold text-lg">{t('admin_dashboard')}</span>
          </div>
          <Sheet>
            <SheetTrigger>
              <Menu className="w-6 h-6 text-slate-700" />
            </SheetTrigger>
            <SheetContent side="right" className="p-0 border-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-4 lg:p-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">نظرة عامة</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                      <Users className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span>
                  </div>
                  <p className="text-gray-500 text-sm mb-1">{t('active_users')}</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.users}</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                      <Package className="w-6 h-6" />
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm mb-1">{t('today_shipments')}</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.shipments_today}</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                      <CreditCard className="w-6 h-6" />
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm mb-1">{t('total_commissions')}</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.commissions} ر.س</p>
                </div>
              </div>

              {/* Chart Placeholder based on OCR "Performance Reports" */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-96 flex flex-col justify-center items-center text-gray-400">
                  <FileText className="w-16 h-16 mb-4 opacity-20" />
                  <p>رسم بياني: نمو الشحنات (قريباً)</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-96">
                  <h3 className="font-bold text-gray-800 mb-4">تنبيهات هامة</h3>
                  <div className="space-y-4">
                    <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-bold text-red-800">مستندات منتهية</p>
                        <p className="text-xs text-red-600">5 سائقين لديهم رخص منتهية</p>
                      </div>
                    </div>
                    <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-lg flex gap-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-bold text-yellow-800">شكاوى جديدة</p>
                        <p className="text-xs text-yellow-600">2 شكاوى قيد الانتظار</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Placeholder for other tabs */}
          {activeTab !== 'dashboard' && (
            <div className="flex items-center justify-center h-full text-gray-400 flex-col gap-4">
              <Settings className="w-20 h-20 opacity-20" />
              <p className="text-lg">قسم {menuItems.find(i => i.id === activeTab)?.label} قيد التطوير</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
