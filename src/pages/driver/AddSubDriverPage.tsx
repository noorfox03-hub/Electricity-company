import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/services/api';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function AddSubDriverPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ driver_name: '', driver_phone: '', id_number: '' });

    const handleSave = async () => {
        if (!formData.driver_name || !formData.driver_phone) return toast.error("يرجى إكمال البيانات");
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            await api.addSubDriver(formData, user!.id);
            toast.success("تمت إضافة السائق بنجاح");
            navigate('/driver/dashboard');
        } catch (e) { toast.error("حدث خطأ في الحفظ"); }
        setLoading(false);
    };

    return (
        <div className="mobile-container min-h-screen bg-white" dir="rtl">
            <div className="p-4 flex items-center gap-4 border-b bg-white sticky top-0 z-10">
                <button onClick={() => navigate(-1)}><ArrowLeft className="rotate-180"/></button>
                <h1 className="text-lg font-bold">إضافة سائق جديد</h1>
            </div>
            <div className="p-6 space-y-6">
                <div className="flex justify-center py-4">
                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center"><UserPlus className="w-10 h-10 text-indigo-600" /></div>
                </div>
                <div className="space-y-4">
                    <div><Label>اسم السائق</Label><Input placeholder="الاسم الثلاثي" onChange={e => setFormData({...formData, driver_name: e.target.value})} /></div>
                    <div><Label>رقم جوال السائق</Label><Input placeholder="05xxxxxxxx" onChange={e => setFormData({...formData, driver_phone: e.target.value})} /></div>
                    <div><Label>رقم الهوية / الإقامة</Label><Input type="number" placeholder="10xxxxxxxx" onChange={e => setFormData({...formData, id_number: e.target.value})} /></div>
                </div>
                <Button className="w-full h-12 text-lg font-bold" onClick={handleSave} disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : 'إضافة السائق'}
                </Button>
            </div>
        </div>
    );
}
