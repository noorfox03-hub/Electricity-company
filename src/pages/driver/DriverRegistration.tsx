import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { api } from '@/services/api';
import { supabase } from '@/lib/supabase';
import { ArrowRight, ArrowLeft, Loader2, Check, Truck, Box, Ruler, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

// 1. قائمة الأنواع (مطابقة للصورة التي أرسلتها)
const TRUCK_TYPES = [
  { id: 'trella', name: 'تريلا (20+ طن)', icon: '🚛' },
  { id: 'sigs', name: 'سقس (13 طن)', icon: '🚛' },
  { id: 'lorry', name: 'لوري (5-8 طن)', icon: '🚚' },
  { id: 'dyna', name: 'دينا (3.5-4 طن)', icon: '🚚' },
  { id: 'van', name: 'فان - هايس', icon: '🚐' },
  { id: 'pickup', name: 'بيك اب (1 طن)', icon: '🛻' },
  { id: 'heavy', name: 'معدات الثقيل', icon: '🚜' },
  { id: 'cars', name: 'ناقلة سيارات', icon: '🚙' },
];

// 2. قائمة أنواع الصناديق
const BODY_TYPES = [
  { id: 'refrigerated', name: 'مبرد / ثلاجة', icon: '❄️' },
  { id: 'box', name: 'صندوق مغلق', icon: '📦' },
  { id: 'flatbed', name: 'سطحة / مفتوح', icon: '📏' },
  { id: 'curtain', name: 'ستارة', icon: '🎪' },
];

// 3. قائمة المقاسات
const DIMENSIONS = [
  { id: 'small', name: 'مقاس صغير', desc: 'مناسب للمدن' },
  { id: 'medium', name: 'مقاس وسط', desc: 'للحمولات المتوسطة' },
  { id: 'large', name: 'مقاس كبير', desc: 'للمسافات الطويلة' },
];

export default function DriverRegistration() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // حالة البيانات المختارة
  const [selection, setSelection] = useState({
    truck_type: '',
    body_type: '',
    dimensions: '',
    plate_number: ''
  });

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleFinish = async () => {
    if (!selection.plate_number) return toast.error("يرجى إدخال رقم اللوحة");
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("لم يتم العثور على المستخدم");

      // حفظ البيانات في قاعدة البيانات الحقيقية
      await api.saveDriverVehicle(user.id, selection);

      toast.success("تم إعداد حسابك بنجاح!");
      navigate('/driver/dashboard');
    } catch (e: any) {
      toast.error("خطأ في الحفظ: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mobile-container min-h-screen bg-white flex flex-col" dir="rtl">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b bg-white sticky top-0 z-50">
        <button onClick={step > 1 ? handleBack : () => navigate(-1)} className="p-2">
          <ArrowRight className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-lg font-bold text-gray-800">
          {step === 1 && "نوع السيارة"}
          {step === 2 && "نوع الصندوق"}
          {step === 3 && "مقاس الشاحنة"}
          {step === 4 && "بيانات المركبة"}
        </h1>
        <div className="w-10 text-xs font-bold text-primary">خطوة {step}/4</div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto pb-24">
        
        {/* الخطوة 1: اختيار نوع السيارة (من الصورة) */}
        {step === 1 && (
          <div className="animate-fade-in space-y-6">
            <h2 className="text-xl font-bold text-gray-700">اختر نوع سيارتك</h2>
            <div className="grid grid-cols-2 gap-4">
              {TRUCK_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setSelection({...selection, truck_type: t.id}); handleNext(); }}
                  className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${
                    selection.truck_type === t.id ? 'border-primary bg-primary/5' : 'border-gray-100 bg-white'
                  }`}
                >
                  <span className="text-4xl mb-3">{t.icon}</span>
                  <span className="text-xs font-bold text-center text-gray-600">{t.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* الخطوة 2: مبرد أو صندوق الخ */}
        {step === 2 && (
          <div className="animate-fade-in space-y-6">
            <h2 className="text-xl font-bold text-gray-700">ما هو نوع الصندوق؟</h2>
            <div className="space-y-3">
              {BODY_TYPES.map((b) => (
                <button
                  key={b.id}
                  onClick={() => { setSelection({...selection, body_type: b.id}); handleNext(); }}
                  className={`w-full p-5 rounded-xl border-2 flex items-center justify-between transition-all ${
                    selection.body_type === b.id ? 'border-primary bg-primary/5' : 'border-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{b.icon}</span>
                    <span className="font-bold text-gray-700">{b.name}</span>
                  </div>
                  {selection.body_type === b.id && <Check className="text-primary" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* الخطوة 3: المقاس (كبير/صغير) */}
        {step === 3 && (
          <div className="animate-fade-in space-y-6">
            <h2 className="text-xl font-bold text-gray-700">حدد مقاس الشاحنة</h2>
            <div className="space-y-3">
              {DIMENSIONS.map((d) => (
                <button
                  key={d.id}
                  onClick={() => { setSelection({...selection, dimensions: d.id}); handleNext(); }}
                  className={`w-full p-5 rounded-xl border-2 flex flex-col gap-1 transition-all ${
                    selection.dimensions === d.id ? 'border-primary bg-primary/5' : 'border-gray-100'
                  }`}
                >
                  <span className="font-bold text-gray-700 text-right w-full">{d.name}</span>
                  <span className="text-xs text-gray-400 text-right w-full">{d.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* الخطوة 4: رقم اللوحة */}
        {step === 4 && (
          <div className="animate-fade-in space-y-6">
            <h2 className="text-xl font-bold text-gray-700">البيانات النهائية</h2>
            <div className="brand-card p-5 space-y-4">
               <div>
                  <Label className="mb-2 block">رقم اللوحة</Label>
                  <Input 
                    placeholder="مثال: أ ب ج 1 2 3" 
                    className="h-12 text-lg text-center" 
                    onChange={e => setSelection({...selection, plate_number: e.target.value})}
                  />
               </div>
               <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm text-gray-500">
                  <div className="flex justify-between"><span>نوع السيارة:</span><span className="font-bold text-gray-800">{TRUCK_TYPES.find(t=>t.id===selection.truck_type)?.name}</span></div>
                  <div className="flex justify-between"><span>نوع الصندوق:</span><span className="font-bold text-gray-800">{BODY_TYPES.find(b=>b.id===selection.body_type)?.name}</span></div>
               </div>
            </div>
            <Button className="w-full h-14 text-lg font-bold" onClick={handleFinish} disabled={loading}>
              {loading ? <Loader2 className="animate-spin ml-2" /> : 'إتمام التسجيل والدخول'}
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}
