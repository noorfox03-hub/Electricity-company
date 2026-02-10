// src/App.tsx

import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useTranslation } from 'react-i18next';

// --- صفحات المصادقة (Auth) ---
import WelcomePage from "./pages/WelcomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import NotFound from "./pages/NotFound";

// --- صفحات السائقين (Driver) ---
import DriverRegistration from "./pages/driver/DriverRegistration"; // المعالج الرباعي لاختيار السيارة
import DriverDashboard from "./pages/driver/DriverDashboard";
import DriverLoads from "./pages/driver/DriverLoads";
import LoadDetails from "./pages/driver/LoadDetails";
import DriverSearch from "./pages/driver/DriverSearch";
import DriverHistory from "./pages/driver/DriverHistory";
import DriverAccount from "./pages/driver/DriverAccount";
import RegisterTruckPage from "./pages/driver/RegisterTruckPage"; // صفحة إضافة شاحنة حقيقية
import AddSubDriverPage from "./pages/driver/AddSubDriverPage";    // صفحة إضافة سائق تابع

// --- صفحات أصحاب الحمولات (Shipper) ---
import ShipperTrucks from "./pages/shipper/ShipperTrucks";
import ShipperPostLoad from "./pages/shipper/ShipperPostLoad"; // معالج الـ 5 خطوات الحقيقي

// --- صفحات الإدارة (Admin) ---
import AdminDashboard from "./pages/admin/AdminDashboard";

// --- المكونات العامة ---
import FeedbackModal from "./components/FeedbackModal";

const queryClient = new QueryClient();

const App = () => {
  const { i18n } = useTranslation();

  // ضبط اتجاه الصفحة والخطوط بناءً على اللغة المختارة
  useEffect(() => {
    const dir = i18n.language === 'ar' || i18n.language === 'ur' ? 'rtl' : 'ltr';
    
    // ✅ تم تصحيح هذا الجزء ليكون على سطر واحد لمنع الأخطاء
    document.documentElement.dir = dir;
    document.documentElement.lang = i18n.language;
    
    if (i18n.language === 'ur') {
      document.body.style.fontFamily = "'Noto Nastaliq Urdu', serif";
    } else if (i18n.language === 'ar') {
      document.body.style.fontFamily = "'Cairo', sans-serif";
    } else {
      document.body.style.fontFamily = "ui-sans-serif, system-ui, sans-serif";
    }
  }, [i18n.language]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* مكونات التنبيهات (Popups) */}
        <Toaster />
        <Sonner />
        
        <BrowserRouter>
          <Routes>
            {/* المسارات الأساسية */}
            <Route path="/" element={<WelcomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            
            {/* مسارات السائق (Driver Routes) */}
            <Route path="/driver/registration" element={<DriverRegistration />} />
            <Route path="/driver/dashboard" element={<DriverDashboard />} />
            <Route path="/driver/add-truck" element={<RegisterTruckPage />} />
            <Route path="/driver/add-sub-driver" element={<AddSubDriverPage />} />
            <Route path="/driver/loads" element={<DriverLoads />} />
            <Route path="/driver/load/:id" element={<LoadDetails />} />
            <Route path="/driver/search" element={<DriverSearch />} />
            <Route path="/driver/history" element={<DriverHistory />} />
            <Route path="/driver/account" element={<DriverAccount />} />
            
            {/* مسارات صاحب الحمولة (Shipper Routes) */}
            <Route path="/shipper" element={<ShipperTrucks />} />
            <Route path="/shipper/post" element={<ShipperPostLoad />} />
            
            {/* مسارات الإدارة (Admin) */}
            <Route path="/admin" element={<AdminDashboard />} />
            
            {/* صفحة الخطأ 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          
          {/* نافذة التقييم/الاتفاق تظهر فوق أي صفحة عند تفعيلها */}
          <FeedbackModal />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
