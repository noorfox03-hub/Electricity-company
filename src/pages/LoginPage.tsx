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
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Validation schemas
const userLoginSchema = z.object({
  email: z.string().email(t('invalid_email') || 'Invalid email'),
  password: z.string().min(1, t('password_required') || 'Password is required'),
});

const adminLoginSchema = z.object({
  username: z.string().min(1, t('username_required') || 'Username is required'),
  password: z.string().min(1, t('password_required') || 'Password is required'),
});

type UserLoginForm = z.infer<typeof userLoginSchema>;
type AdminLoginForm = z.infer<typeof adminLoginSchema>;

const LoginPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { setCurrentRole, setUserProfile } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'user' | 'admin'>('user');

  // React Hook Form for User Login
  const {
    register: registerUser,
    handleSubmit: handleSubmitUser,
    formState: { errors: userErrors },
    setValue: setUserValue,
  } = useForm<UserLoginForm>({
    resolver: zodResolver(userLoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // React Hook Form for Admin Login
  const {
    register: registerAdmin,
    handleSubmit: handleSubmitAdmin,
    formState: { errors: adminErrors },
  } = useForm<AdminLoginForm>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const getErrorMessage = (error: any): string => {
    if (error.response?.data) {
      const data = error.response.data;
      return t(data.message) || data.message || data.error || t('unknown_error');
    }
    if (error.message) return t(error.message) || error.message;
    return t('unknown_error') || 'Unknown error occurred';
  };

  const handleUserLogin = async (data: UserLoginForm) => {
    setLoading(true);
    
    try {
      const response = await api.loginByEmail(data.email, data.password);
      
      if (response.profile) {
        setUserProfile(response.profile);
        setCurrentRole(response.profile.role);
        toast.success(t('login_success') || 'Login successful');
        
        // Navigate based on role
        const redirectPath = {
          driver: '/driver/dashboard',
          shipper: '/shipper/dashboard',
          admin: '/admin/dashboard',
          default: '/dashboard',
        }[response.profile.role] || redirectPath.default;
        
        navigate(redirectPath);
      }
    } catch (error: any) { 
      console.error('Login error:', error);
      const errorMessage = getErrorMessage(error);
      toast.error(`${t('login_failed')}: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (data: AdminLoginForm) => {
    setLoading(true);
    
    try {
      const response = await api.loginAdmin(data.username, data.password);
      
      // If admin API returns a different structure, adjust accordingly
      if (response.success) {
        setCurrentRole('admin');
        toast.success(t('admin_login_success') || 'Admin login successful');
        navigate('/admin/dashboard');
      }
    } catch (error: any) { 
      console.error('Admin login error:', error);
      const errorMessage = getErrorMessage(error);
      toast.error(`${t('admin_login_failed')}: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, submitFunction: () => void) => {
    if (e.key === 'Enter' && !loading) {
      submitFunction();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-gray-100 flex flex-col justify-center px-4 sm:px-6">
      <div className="max-w-md w-full mx-auto">
        {/* Logo Section */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <div className="w-32 h-32 flex items-center justify-center">
              <img 
                src="/logo.png" 
                alt="SAS" 
                className="w-full h-full object-contain drop-shadow-lg"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/128x128?text=SAS';
                }}
              />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-primary mb-2">SAS</h1>
          <p className="text-muted-foreground">{t('app_description') || 'Shipping & Logistics Platform'}</p>
        </div>

        {/* Login Card */}
        <div className="brand-card p-8 shadow-xl rounded-2xl border">
          <Tabs 
            value={activeTab} 
            onValueChange={(value) => setActiveTab(value as 'user' | 'admin')}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="user" className="text-base">
                {t('login_users') || 'User Login'}
              </TabsTrigger>
              <TabsTrigger value="admin" className="text-base">
                {t('admin_login') || 'Admin Login'}
              </TabsTrigger>
            </TabsList>

            {/* User Login Form */}
            <TabsContent value="user" className="space-y-6">
              <form 
                onSubmit={handleSubmitUser(handleUserLogin)} 
                className="space-y-5"
                noValidate
              >
                <div className="space-y-4">
                  <div>
                    <Input 
                      {...registerUser('email')}
                      type="email" 
                      placeholder={t('email_label') || "Email Address"}
                      className={`h-12 text-base ${userErrors.email ? 'border-destructive' : ''}`}
                      disabled={loading}
                      onKeyPress={(e) => handleKeyPress(e, handleSubmitUser(handleUserLogin))}
                    />
                    {userErrors.email && (
                      <p className="mt-1 text-sm text-destructive">
                        {userErrors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Input 
                      {...registerUser('password')}
                      type="password" 
                      placeholder={t('password_label') || "Password"}
                      className={`h-12 text-base ${userErrors.password ? 'border-destructive' : ''}`}
                      disabled={loading}
                      onKeyPress={(e) => handleKeyPress(e, handleSubmitUser(handleUserLogin))}
                    />
                    {userErrors.password && (
                      <p className="mt-1 text-sm text-destructive">
                        {userErrors.password.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <Link 
                    to="/forgot-password" 
                    className="text-sm text-primary hover:underline font-medium"
                  >
                    {t('forgot_password') || "Forgot Password?"}
                  </Link>
                  <Link 
                    to="/register" 
                    className="text-sm text-primary hover:underline font-medium"
                  >
                    {t('create_account') || "Create Account"}
                  </Link>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg font-semibold"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {t('logging_in') || 'Logging in...'}
                    </>
                  ) : (
                    t('login_btn') || 'Login'
                  )}
                </Button>

                <div className="text-center pt-4 border-t">
                  <span className="text-muted-foreground text-sm">
                    {t('no_account') || "Don't have an account?"}
                  </span>
                  {' '}
                  <Link 
                    to="/register" 
                    className="text-primary font-bold hover:underline"
                  >
                    {t('register_now') || "Register Now"}
                  </Link>
                </div>
              </form>
            </TabsContent>

            {/* Admin Login Form */}
            <TabsContent value="admin" className="space-y-6">
              <form 
                onSubmit={handleSubmitAdmin(handleAdminLogin)} 
                className="space-y-5"
                noValidate
              >
                <div className="space-y-4">
                  <div>
                    <Input 
                      {...registerAdmin('username')}
                      placeholder={t('admin_username') || "Admin Username/Email"}
                      className={`h-12 text-base ${adminErrors.username ? 'border-destructive' : ''}`}
                      disabled={loading}
                      onKeyPress={(e) => handleKeyPress(e, handleSubmitAdmin(handleAdminLogin))}
                    />
                    {adminErrors.username && (
                      <p className="mt-1 text-sm text-destructive">
                        {adminErrors.username.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Input 
                      {...registerAdmin('password')}
                      type="password" 
                      placeholder={t('password_label') || "Password"}
                      className={`h-12 text-base ${adminErrors.password ? 'border-destructive' : ''}`}
                      disabled={loading}
                      onKeyPress={(e) => handleKeyPress(e, handleSubmitAdmin(handleAdminLogin))}
                    />
                    {adminErrors.password && (
                      <p className="mt-1 text-sm text-destructive">
                        {adminErrors.password.message}
                      </p>
                    )}
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg font-semibold bg-gray-800 hover:bg-gray-900"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {t('admin_logging_in') || 'Admin Login...'}
                    </>
                  ) : (
                    t('admin_login_btn') || 'Admin Login'
                  )}
                </Button>

                <div className="text-center pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    {t('admin_access_note') || 'Admin access restricted to authorized personnel only.'}
                  </p>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            {t('need_help') || 'Need help?'}{' '}
            <Link to="/contact" className="text-primary hover:underline font-medium">
              {t('contact_support') || 'Contact Support'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
