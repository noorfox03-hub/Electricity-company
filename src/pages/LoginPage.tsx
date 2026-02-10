import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { api } from '@/services/api';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const LoginPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { setCurrentRole, setUserProfile } = useAppStore();
  
  const [loading, setLoading] = useState(false);
  
  // States for Email/Password Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // States for Admin Login
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');

  const getErrorMessage = (error: any) => {
    if (error.response && error.response.data) {
      return error.response.data.message || error.response.data.error || JSON.stringify(error.response.data);
    }
    if (error.message) return error.message;
    return "Unknown Error";
  };

  const handleUserLogin = async () => {
    if (!email || !password) return toast.error(t('fill_all_fields') || "Please fill all fields");
    setLoading(true);
    
    try {
      // افترضنا وجود دالة loginByEmail في الـ API
      const { profile } = await api.loginByEmail(email, password);
      
      if (profile) {
        setUserProfile(profile);
        setCurrentRole(profile.role);
        toast.success(t('success_login'));
        navigate(profile.role === 'driver' ? '/driver/dashboard' : '/shipper');
      }
    } catch (e: any) { 
      console.error(e);
      const detailedError = getErrorMessage(e);
      toast.error(`${t('login_failed')}: ${detailedError}`);
    }
    setLoading(false);
  };

  const handleAdminLogin = async () => {
    setLoading(true);
    try {
      await api.loginAdmin(adminUser, adminPass);
      setCurrentRole('admin');
      navigate('/admin');
    } catch (e: any) { 
        console.error(e);
        const detailedError = getErrorMessage(e);
        toast.error(`Login Failed: ${detailedError}`);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center px-6">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-28 h-28 flex items-center justify-center">
             <img src="/logo.png" alt="SAS" className="w-full h-full object-contain" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-primary">SAS</h1>
      </div>

      <div className="brand-card p-6">
        <Tabs defaultValue="user">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="user">{t('login_users') || 'Login'}</TabsTrigger>
            <TabsTrigger value="admin">{t('admin_login') || 'Admin'}</TabsTrigger>
          </TabsList>

          <TabsContent value="user" className="space-y-4">
            <div className="space-y-4">
              <Input 
                type="email" 
                placeholder={t('email_label') || "Email Address"} 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input 
                type="password" 
                placeholder={t('password_label') || "Password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              
              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                  {t('forgot_password') || "Forgot Password?"}
                </Link>
              </div>

              <Button className="w-full h-12 text-lg" onClick={handleUserLogin} disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : t('login_btn')}
              </Button>

              <div className="text-center mt-4">
                <span className="text-muted-foreground text-sm">{t('no_account') || "Don't have an account?"} </span>
                <Link to="/register" className="text-primary font-bold hover:underline">
                  {t('register_now') || "Create Account"}
                </Link>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="admin" className="space-y-4">
            <Input placeholder="Admin Email/User" value={adminUser} onChange={e => setAdminUser(e.target.value)} />
            <Input type="password" placeholder="Password" value={adminPass} onChange={e => setAdminPass(e.target.value)} />
            <Button className="w-full bg-slate-800" onClick={handleAdminLogin} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : t('login_btn')}
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LoginPage;
