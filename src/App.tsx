import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useTranslation } from 'react-i18next';

// Pages
import WelcomePage from "./pages/WelcomePage";
import LoginPage from "./pages/LoginPage";
// --- إضافة الصفحات الجديدة هنا ---
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import NotFound from "./pages/NotFound";

// Driver Pages
import DriverRegistration from "./pages/driver/DriverRegistration";
import DriverDashboard from "./pages/driver/DriverDashboard";
import DriverLoads from "./pages/driver/DriverLoads";
import DriverSearch from "./pages/driver/DriverSearch";
import DriverHistory from "./pages/driver/DriverHistory";
import DriverAccount from "./pages/driver/DriverAccount";
import LoadDetails from "./pages/driver/LoadDetails";

// Shipper Pages
import ShipperTrucks from "./pages/shipper/ShipperTrucks";
import ShipperPostLoad from "./pages/shipper/ShipperPostLoad";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";

// Components
import FeedbackModal from "./components/FeedbackModal";

const queryClient = new QueryClient();

const App = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    const dir = i18n.language === 'ar' || i18n.language === 'ur' ? 'rtl' : 'ltr';
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
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/login" element={<LoginPage />} />
            
            {/* --- المسارات الجديدة --- */}
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            
            {/* Driver Routes */}
            <Route path="/driver/registration" element={<DriverRegistration />} />
            <Route path="/driver/dashboard" element={<DriverDashboard />} />
            <Route path="/driver/loads" element={<DriverLoads />} />
            <Route path="/driver/load/:id" element={<LoadDetails />} />
            <Route path="/driver/search" element={<DriverSearch />} />
            <Route path="/driver/history" element={<DriverHistory />} />
            <Route path="/driver/account" element={<DriverAccount />} />
            
            {/* Shipper Routes */}
            <Route path="/shipper" element={<ShipperTrucks />} />
            <Route path="/shipper/post" element={<ShipperPostLoad />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
          
          <FeedbackModal />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
