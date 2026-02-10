import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { api } from '@/services/api';
import { Loader2, Truck, Package, ArrowRight, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

// ⚙️ إعدادات الـ OTP
const OTP_LENGTH = 7; 
const RESEND_COOLDOWN = 60; // وقت الانتظار بالثواني لإعادة الإرسال

const RegisterPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { setUserProfile, setCurrentRole } = useAppStore();

  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  const [role, setRole] = useState<'driver' | 'shipper'>('driver');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [otp, setOtp] = useState('');

  // 🕒 تفعيل العداد التنازلي لإعادة إرسال الكود
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const confirmRole = () => setStep(2);

  // الخطوة 2: إرسال الرمز (بدء عملية التسجيل في Supabase)
  const handleSendEmailOtp = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      return toast.error("يرجى تعبئة جميع الحقول المطلوبة");
    }
    if (formData.password !== formData.confirmPassword) {
      return toast.error("كلمات المرور غير متطابقة");
    }

    setLoading(true);
    try {
      // استدعاء API لإرسال كود التحقق
      await api.sendEmailOtp(formData.email, formData.password, {
        full_name: formData.name,
        role: role,
        phone: formData.phone
      });
      
      toast.success(`تم إرسال كود التحقق إلى: ${formData.email}`);
      setStep(3);
      setTimer(RESEND_COOLDOWN); // بدء عداد إعادة الإرسال
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "حدث خطأ أثناء إرسال الكود");
    }
    setLoading(false);
  };

  // إعادة إرسال الرمز
  const handleResendOtp = async () => {
    if (timer > 0) return;
    
    setLoading(true);
    try {
      await api.sendEmailOtp(formData.email, formData.password, {
        full_name: formData.name,
        role: role,
        phone: formData.phone
      });
      
      toast.success("تم إعادة إرسال كود التحقق بنجاح");
      setTimer(RESEND_COOLDOWN);
    } catch (error: any) {
      toast.error(error.message || "فشل إعادة الإرسال، حاول لاحقاً");
    }
    setLoading(false);
  };

  // الخطوة 3: التحقق النهائي وإنشاء الحساب الحقيقي
  const handleRegister = async () => {
    if (otp.length < OTP_LENGTH) {
      return toast.error(`يرجى إدخال الكود المكون من ${OTP_LENGTH} أرقام`);
    }
    
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
      
      // حفظ بيانات المستخدم في التخزين المحلي (Store)
      setUserProfile(profile);
      setCurrentRole(profile.role);
      
      toast.success("تم إنشاء حسابك وتفعيله بنجاح!");
      
      // التوجيه التلقائي: السائق يذهب لاختيار شاحنته، والشاحن يذهب للوحة التحكم
      if (profile.role === 'driver') {
        navigate('/driver/registration');
      } else {
        navigate('/shipper');
      }

    } catch (error: any) {
      console.error(error);
      let msg = error.message;
      if (msg.includes("Invalid token")) msg = "كود التحقق الذي أدخلته غير صحيح";
      toast.error(msg || "فشل التحقق من الكود");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center px-6 py-10" dir="rtl">
      <div className="max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-primary tracking-tight">إنشاء حساب</h1>
          <p className="text-muted-foreground text-sm mt-2">
            انضم إلى منصة SAS للنقل - خطوة {step} من 3
          </p>
        </div>

        <div className="brand-card p-6 space-y-6 bg-white shadow-xl rounded-3xl border border-gray-100">
          
          {/* المرحلة 1: اختيار نوع الحساب */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <p className="text-center font-bold text-gray-700 mb-4">اختر نوع الحساب</p>
              
              <div 
                onClick={() => setRole('driver')}
                className={`flex items-center gap-4 p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${role === 'driver' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-100 hover:border-gray-200'}`}
              >
                <div className={`p-3 rounded-xl ${role === 'driver' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                  <Truck size={28} />
                </div>
                <div className="flex-1 text-right">
                  <h3 className="font-bold text-lg">سائق / ناقل</h3>
                  <p className="text-xs text-muted-foreground">أرغب في العمل ونقل الحمولات</p>
                </div>
                {role === 'driver' && <CheckCircle2 className="text-primary" size={24} />}
              </div>

              <div 
                onClick={() => setRole('shipper')}
                className={`flex items-center gap-4 p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${role === 'shipper' ? 'border-secondary bg-secondary/5 ring-1 ring-secondary' : 'border-gray-100 hover:border-gray-200'}`}
              >
                <div className={`p-3 rounded-xl ${role === 'shipper' ? 'bg-secondary text-white' : 'bg-gray-100 text-gray-400'}`}>
                  <Package size={28} />
                </div>
                <div className="flex-1 text-right">
                  <h3 className="font-bold text-lg">صاحب بضاعة</h3>
                  <p className="text-xs text-muted-foreground">أرغب في شحن ونقل بضائعي</p>
                </div>
                {role === 'shipper' && <CheckCircle2 className="text-secondary" size={24} />}
              </div>

              <Button className="w-full h-14 text-lg font-bold mt-4 shadow-lg rounded-2xl" onClick={confirmRole}>
                الخطوة التالية <ArrowRight className="mr-2 rotate-180" size={20} />
              </Button>
            </div>
          )}

          {/* المرحلة 2: إدخال البيانات الشخصية */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
               <button onClick={() => setStep(1)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-primary transition-colors mb-2">
                 <ArrowLeft className="rotate-180" size={16} /> العودة لاختيار النوع
               </button>

               <div className="space-y-4 text-right">
                 <div className="space-y-1.5">
                   <Label>الاسم الكامل</Label>
                   <Input name="name" value={formData.name} onChange={handleChange} placeholder="أدخل اسمك الثلاثي" className="h-12 text-right" />
                 </div>
                 <div className="space-y-1.5">
                   <Label>رقم الجوال</Label>
                   <Input name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="05xxxxxxxx" className="text-left h-12" dir="ltr" />
                 </div>
                 <div className="space-y-1.5">
                   <Label>البريد الإلكتروني</Label>
                   <Input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="example@mail.com" className="text-left h-12" dir="ltr" />
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5 text-right">
                      <Label>كلمة المرور</Label>
                      <Input name="password" type="password" value={formData.password} onChange={handleChange} className="h-12 text-left" dir="ltr" />
                    </div>
                    <div className="space-y-1.5 text-right">
                      <Label>تأكيد المرور</Label>
                      <Input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} className="h-12 text-left" dir="ltr" />
                    </div>
                 </div>
               </div>

               <Button className="w-full h-14 text-lg font-bold shadow-lg mt-4 rounded-2xl" onClick={handleSendEmailOtp} disabled={loading}>
                 {loading ? <Loader2 className="animate-spin" /> : "إرسال كود التفعيل"}
               </Button>
            </div>
          )}

          {/* المرحلة 3: التحقق من الـ OTP (7 خانات) */}
          {step === 3 && (
            <div className="space-y-6 text-center animate-fade-in">
                <button onClick={() => setStep(2)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-primary transition-colors mx-auto">
                    <ArrowLeft className="rotate-180" size={16} /> العودة لتعديل البيانات
                </button>

                <div>
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <RefreshCw className="text-primary animate-spin" style={{ animationDuration: '3s' }} size={32} />
                    </div>
                    <h3 className="font-bold text-xl text-gray-800">تحقق من بريدك</h3>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                        أدخل الكود المكون من {OTP_LENGTH} أرقام <br/> المرسل إلى: <span className="font-bold text-foreground block mt-1 dir-ltr">{formData.email}</span>
                    </p>
                </div>

                <div className="flex justify-center w-full" dir="ltr">
                    <InputOTP maxLength={OTP_LENGTH} value={otp} onChange={setOtp}>
                        <InputOTPGroup className="gap-2">
                            {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                                <InputOTPSlot 
                                    key={i} 
                                    index={i} 
                                    className="h-14 w-10 sm:w-12 border-2 rounded-xl text-xl font-bold focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm" 
                                />
                            ))}
                        </InputOTPGroup>
                    </InputOTP>
                </div>

                <div className="space-y-4 pt-2">
                    <Button className="w-full h-14 font-black text-xl rounded-2xl shadow-xl shadow-primary/20" onClick={handleRegister} disabled={loading || otp.length < OTP_LENGTH}>
                        {loading ? <Loader2 className="animate-spin" /> : "تفعيل الحساب الآن"}
                    </Button>

                    <div className="flex flex-col gap-2">
                        {timer > 0 ? (
                            <span className="text-xs text-muted-foreground bg-gray-50 py-2 px-4 rounded-full inline-block mx-auto">
                                يمكنك إعادة إرسال الكود بعد {timer} ثانية
                            </span>
                        ) : (
                            <button 
                                onClick={handleResendOtp}
                                disabled={loading}
                                className="flex items-center justify-center gap-2 text-sm font-bold text-primary hover:underline mx-auto transition-colors"
                            >
                                <RefreshCw size={16} /> إعادة إرسال كود التحقق
                            </button>
                        )}
                    </div>
                </div>
            </div>
          )}

        </div>

        <div className="text-center mt-10">
          <p className="text-gray-500 text-sm">
            لديك حساب بالفعل؟ 
            <Link to="/login" className="text-primary font-black mr-2 hover:underline transition-all">
              سجل دخولك من هنا
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
