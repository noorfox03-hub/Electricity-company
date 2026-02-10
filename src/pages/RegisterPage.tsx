import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { api } from '@/services/api';
import { Loader2, Truck, Package, ArrowRight, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { setUserProfile, setCurrentRole } = useAppStore();

  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  const [role, setRole] = useState<'driver' | 'shipper'>('driver');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [otp, setOtp] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const confirmRole = () => setStep(2);

  // الخطوة 2: إرسال الرمز (بدء الـ SignUp)
  const handleSendEmailOtp = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      return toast.error(t('fill_all_fields'));
    }
    if (formData.password !== formData.confirmPassword) {
      return toast.error(t('passwords_no_match'));
    }

    setLoading(true);
    try {
      // نرسل الباسورد والبيانات لإنشاء المستخدم وإرسال الرمز
      await api.sendEmailOtp(formData.email, formData.password, {
        full_name: formData.name,
        role: role,
        phone: formData.phone
      });
      
      toast.success(`${t('otp_sent_email')} ${formData.email}`);
      setStep(3);
    } catch (error: any) {
      console.error(error);
      // استخدام error.message للحصول على نص الخطأ الفعلي
      toast.error(error.message || t('error_generic'));
    }
    setLoading(false);
  };

  // الخطوة 3: التحقق النهائي
  const handleRegister = async () => {
    if (otp.length < 6) return;
    setLoading(true);

    try {
      const payload = {
        role,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        otpCode: otp
      };

      const { profile } = await api.registerUser(payload);
      
      setUserProfile(profile);
      setCurrentRole(profile.role);
      toast.success(t('account_created_success'));
      
      navigate(profile.role === 'driver' ? '/driver/dashboard' : '/shipper');

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || t('error_otp'));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center px-6 py-10">
      <div className="max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary">{t('create_account')}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t('step')} {step} / 3
          </p>
        </div>

        <div className="brand-card p-6 space-y-6">
          
          {/* STEP 1: Role */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-center font-medium mb-4">{t('select_account_type')}</p>
              
              <div 
                onClick={() => setRole('driver')}
                className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${role === 'driver' ? 'border-primary bg-primary/5' : 'hover:border-gray-300'}`}
              >
                <div className="bg-primary/10 p-3 rounded-full"><Truck className="text-primary w-6 h-6" /></div>
                <div>
                  <h3 className="font-bold">{t('driver')}</h3>
                  <p className="text-xs text-muted-foreground">{t('driver_desc')}</p>
                </div>
                {role === 'driver' && <div className="ml-auto w-4 h-4 bg-primary rounded-full" />}
              </div>

              <div 
                onClick={() => setRole('shipper')}
                className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${role === 'shipper' ? 'border-secondary bg-secondary/5' : 'hover:border-gray-300'}`}
              >
                <div className="bg-secondary/10 p-3 rounded-full"><Package className="text-secondary w-6 h-6" /></div>
                <div>
                  <h3 className="font-bold">{t('shipper')}</h3>
                  <p className="text-xs text-muted-foreground">{t('shipper_desc')}</p>
                </div>
                {role === 'shipper' && <div className="ml-auto w-4 h-4 bg-secondary rounded-full" />}
              </div>

              <Button className="w-full mt-4" onClick={confirmRole}>
                {t('next')} <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          )}

          {/* STEP 2: Info (تصحيح مفاتيح الترجمة هنا) */}
          {step === 2 && (
            <div className="space-y-4">
               <div className="flex items-center gap-2 mb-2 cursor-pointer text-sm text-muted-foreground" onClick={() => setStep(1)}>
                 <ArrowLeft className="w-4 h-4" /> {t('back')}
               </div>

               <div className="space-y-3">
                 <div>
                   <Label>{t('full_name')}</Label>
                   <Input name="name" value={formData.name} onChange={handleChange} placeholder={t('name_placeholder')} />
                 </div>
                 <div>
                   <Label>{t('phone_label')}</Label> {/* تم التصحيح */}
                   <Input name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="05xxxxxxxx" />
                 </div>
                 <div>
                   <Label>{t('email_label')}</Label> {/* تم التصحيح */}
                   <Input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="name@example.com" />
                 </div>
                 <div>
                   <Label>{t('password_label')}</Label> {/* تم التصحيح */}
                   <Input name="password" type="password" value={formData.password} onChange={handleChange} />
                 </div>
                 <div>
                   <Label>{t('confirm_password')}</Label>
                   <Input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} />
                 </div>
               </div>

               <Button className="w-full" onClick={handleSendEmailOtp} disabled={loading}>
                 {loading ? <Loader2 className="animate-spin" /> : t('verify_email_btn')}
               </Button>
            </div>
          )}

          {/* STEP 3: OTP */}
          {step === 3 && (
            <div className="space-y-6 text-center">
               <div className="flex items-center gap-2 mb-2 cursor-pointer text-sm text-muted-foreground" onClick={() => setStep(2)}>
                 <ArrowLeft className="w-4 h-4" /> {t('back')}
               </div>

               <div>
                 <h3 className="font-bold text-lg">{t('check_email')}</h3>
                 <p className="text-sm text-muted-foreground mt-2">
                   {t('otp_sent_to_msg')} <br/><span className="font-medium text-foreground">{formData.email}</span>
                 </p>
               </div>

               <div className="flex justify-center" dir="ltr">
                  <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                    <InputOTPGroup>
                      {[0,1,2,3,4,5].map(i => <InputOTPSlot key={i} index={i} className="h-12 w-10 sm:w-12" />)}
                    </InputOTPGroup>
                  </InputOTP>
               </div>

               <Button className="w-full h-12" onClick={handleRegister} disabled={loading || otp.length < 6}>
                 {loading ? <Loader2 className="animate-spin" /> : t('complete_registration')}
               </Button>
            </div>
          )}

        </div>

        <div className="text-center mt-6">
          <span className="text-muted-foreground">{t('have_account')} </span>
          <Link to="/login" className="text-primary font-bold hover:underline">
            {t('login_btn')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
