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

  const [step, setStep] = useState<number>(1); // 1: Role, 2: Info, 3: Email OTP
  const [loading, setLoading] = useState(false);

  // Form Data
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

  // Step 1 -> Step 2
  const confirmRole = () => {
    setStep(2);
  };

  // Step 2 -> Step 3 (Send Email OTP)
  const handleSendEmailOtp = async () => {
    // Validation
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      return toast.error(t('fill_all_fields'));
    }
    if (formData.password !== formData.confirmPassword) {
      return toast.error(t('passwords_no_match') || "Passwords do not match");
    }

    setLoading(true);
    try {
      // إرسال كود تحقق للبريد الإلكتروني
      await api.sendEmailOtp(formData.email);
      toast.success(`${t('otp_sent_email')} ${formData.email}`);
      setStep(3);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error sending OTP");
    }
    setLoading(false);
  };

  // Step 3 (Verify OTP & Create Account)
  const handleRegister = async () => {
    if (otp.length < 6) return;
    setLoading(true);

    try {
      // إرسال البيانات النهائية + كود التحقق للسيرفر
      const payload = {
        role,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        otpCode: otp
      };

      const { profile } = await api.registerUser(payload);
      
      setUserProfile(profile);
      setCurrentRole(profile.role);
      toast.success(t('account_created_success'));
      
      // التوجيه للوحة التحكم المناسبة
      navigate(profile.role === 'driver' ? '/driver/dashboard' : '/shipper');

    } catch (error: any) {
      toast.error(error.response?.data?.message || "Registration failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center px-6 py-10">
      <div className="max-w-md mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary">{t('create_account') || "Create Account"}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t('step') || "Step"} {step} / 3
          </p>
        </div>

        <div className="brand-card p-6 space-y-6">
          
          {/* --- STEP 1: Choose Role --- */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-center font-medium mb-4">{t('select_account_type') || "Are you a Driver or a Shipper?"}</p>
              
              <div 
                onClick={() => setRole('driver')}
                className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${role === 'driver' ? 'border-primary bg-primary/5' : 'hover:border-gray-300'}`}
              >
                <div className="bg-primary/10 p-3 rounded-full"><Truck className="text-primary w-6 h-6" /></div>
                <div>
                  <h3 className="font-bold">{t('driver') || "Driver"}</h3>
                  <p className="text-xs text-muted-foreground">{t('driver_desc') || "I want to transport goods"}</p>
                </div>
                {role === 'driver' && <div className="ml-auto w-4 h-4 bg-primary rounded-full" />}
              </div>

              <div 
                onClick={() => setRole('shipper')}
                className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${role === 'shipper' ? 'border-secondary bg-secondary/5' : 'hover:border-gray-300'}`}
              >
                <div className="bg-secondary/10 p-3 rounded-full"><Package className="text-secondary w-6 h-6" /></div>
                <div>
                  <h3 className="font-bold">{t('shipper') || "Shipper"}</h3>
                  <p className="text-xs text-muted-foreground">{t('shipper_desc') || "I want to ship goods"}</p>
                </div>
                {role === 'shipper' && <div className="ml-auto w-4 h-4 bg-secondary rounded-full" />}
              </div>

              <Button className="w-full mt-4" onClick={confirmRole}>
                {t('next') || "Next"} <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          )}

          {/* --- STEP 2: Basic Info --- */}
          {step === 2 && (
            <div className="space-y-4">
               <div className="flex items-center gap-2 mb-2 cursor-pointer text-sm text-muted-foreground" onClick={() => setStep(1)}>
                 <ArrowLeft className="w-4 h-4" /> {t('back')}
               </div>

               <div className="space-y-3">
                 <div>
                   <Label>{t('full_name') || "Full Name"}</Label>
                   <Input name="name" value={formData.name} onChange={handleChange} placeholder="ex: Ahmed Ali" />
                 </div>
                 <div>
                   <Label>{t('phone') || "Phone Number"}</Label>
                   <Input name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="05xxxxxxxx" />
                 </div>
                 <div>
                   <Label>{t('email') || "Email Address"}</Label>
                   <Input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="name@example.com" />
                 </div>
                 <div>
                   <Label>{t('password') || "Password"}</Label>
                   <Input name="password" type="password" value={formData.password} onChange={handleChange} />
                 </div>
                 <div>
                   <Label>{t('confirm_password') || "Confirm Password"}</Label>
                   <Input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} />
                 </div>
               </div>

               <Button className="w-full" onClick={handleSendEmailOtp} disabled={loading}>
                 {loading ? <Loader2 className="animate-spin" /> : t('verify_email_btn') || "Verify Email"}
               </Button>
            </div>
          )}

          {/* --- STEP 3: OTP Verification --- */}
          {step === 3 && (
            <div className="space-y-6 text-center">
               <div className="flex items-center gap-2 mb-2 cursor-pointer text-sm text-muted-foreground" onClick={() => setStep(2)}>
                 <ArrowLeft className="w-4 h-4" /> {t('back')}
               </div>

               <div>
                 <h3 className="font-bold text-lg">{t('check_email') || "Check your Email"}</h3>
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
                 {loading ? <Loader2 className="animate-spin" /> : t('complete_registration') || "Verify & Register"}
               </Button>
            </div>
          )}

        </div>

        <div className="text-center mt-6">
          <span className="text-muted-foreground">{t('have_account') || "Already have an account?"} </span>
          <Link to="/login" className="text-primary font-bold hover:underline">
            {t('login_btn')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
