import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Package, User, MapPin, Plus, Trash2, Calendar, Route, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { SmartLocationSelect } from '@/components/SmartLocationSelect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import { Product, Receiver } from '@/types';
import { calculateDistanceOSM } from '@/services/mapService';

export default function ShipperPostLoad() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [routeInfo, setRouteInfo] = useState<{distance: string, duration: string} | null>(null);

  // حالة النموذج
  const [shipmentData, setShipmentData] = useState({
    type: '',
    package_type: '',
    origin: '',
    originLat: 0,
    originLng: 0,
    destination: '',
    destLat: 0,
    destLng: 0,
    date: '',
    price: '',
    weight: '',
    truck_type: ''
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});
  
  const [receiver, setReceiver] = useState<Receiver>({
    name: '',
    phone: '',
    address: ''
  });

  // حساب المسافة تلقائياً
  useEffect(() => {
    const getRoute = async () => {
      if (shipmentData.originLat && shipmentData.destLat) {
        setCalculating(true);
        const info = await calculateDistanceOSM(
          shipmentData.originLat, 
          shipmentData.originLng, 
          shipmentData.destLat, 
          shipmentData.destLng
        );
        if (info) {
          setRouteInfo({ distance: info.distance, duration: info.duration });
        }
        setCalculating(false);
      }
    };
    getRoute();
  }, [shipmentData.originLat, shipmentData.destLat, shipmentData.originLng, shipmentData.destLng]);

  const handleAddProduct = () => {
    if (!currentProduct.name || !currentProduct.quantity) return;
    setProducts([...products, { ...currentProduct, id: Math.random().toString() } as Product]);
    setCurrentProduct({});
  };

  const handleRemoveProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const handleSubmit = async () => {
    if (!shipmentData.origin || !shipmentData.destination) {
      toast.error(t('fill_fields_error'));
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not logged in');

      const distNum = routeInfo ? parseFloat(routeInfo.distance) : 0;

      await api.postLoad({
        ...shipmentData,
        distance: distNum,
        estimatedTime: routeInfo?.duration || '',
        weight: Number(shipmentData.weight),
        price: Number(shipmentData.price),
        products,
        receiver,
        truck_type_required: shipmentData.truck_type as any
      }, user.id);

      toast.success(t('post_success'));
      navigate('/shipper');
    } catch (e) {
      console.error(e);
      toast.error(t('error_generic'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary p-4 text-primary-foreground flex items-center gap-4 shadow-md sticky top-0 z-50">
        <button onClick={() => navigate('/shipper')}><ArrowLeft /></button>
        <h1 className="text-xl font-bold">{t('post_new_load')}</h1>
      </div>

      {/* Wizard Steps Indicator */}
      <div className="flex justify-center gap-2 p-6 bg-muted/30">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`h-2 flex-1 rounded-full transition-all duration-300 ${s <= step ? 'bg-primary shadow-glow' : 'bg-gray-200'}`} />
        ))}
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-6">
        
        {/* الخطوة 1: تفاصيل الشحنة */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="brand-card p-5">
              <h3 className="font-bold mb-4 flex items-center gap-2 text-primary border-b border-border pb-2">
                <Package className="w-5 h-5" /> {t('shipment_type')}
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Label className="mb-2 block">{t('shipment_type')}</Label>
                  <Select onValueChange={(v) => setShipmentData({...shipmentData, type: v})}>
                    <SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">{t('general_goods')}</SelectItem>
                      <SelectItem value="food">{t('food_stuff')}</SelectItem>
                      <SelectItem value="building">{t('building_materials')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-2 block">{t('package_type')}</Label>
                  <Select onValueChange={(v) => setShipmentData({...shipmentData, package_type: v})}>
                    <SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="carton">{t('carton')}</SelectItem>
                      <SelectItem value="sack">{t('sack')}</SelectItem>
                      <SelectItem value="pallet">{t('pallet')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block">{t('pickup_location')}</Label>
                  <SmartLocationSelect 
                    placeholder={t('choose_city')}
                    onSelect={(l, lat, lng) => setShipmentData({...shipmentData, origin: l, originLat: lat, originLng: lng})} 
                  />
                </div>
                <div>
                  <Label className="mb-2 block">{t('delivery_location')}</Label>
                  <SmartLocationSelect 
                    iconColor="text-secondary"
                    placeholder={t('choose_city')}
                    onSelect={(l, lat, lng) => setShipmentData({...shipmentData, destination: l, destLat: lat, destLng: lng})} 
                  />
                </div>

                {(routeInfo || calculating) && (
                  <div className="bg-muted/30 border border-primary/20 p-4 rounded-xl flex items-center justify-between animate-fade-in">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-border">
                        {calculating ? <Loader2 className="w-5 h-5 animate-spin text-primary"/> : <Route className="w-5 h-5 text-primary" />}
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t('estimated_distance')}</p>
                        <p className="font-bold text-foreground text-lg dir-ltr">
                          {calculating ? '...' : routeInfo?.distance}
                        </p>
                      </div>
                    </div>
                    <div className="text-left border-r border-border/50 pr-4 pl-2">
                      <p className="text-xs text-muted-foreground">{t('time_label')}</p>
                      <p className="font-bold text-secondary text-sm">
                        {calculating ? '...' : routeInfo?.duration}
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <Label className="mb-2 block">{t('req_date')}</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input type="date" className="pl-10" onChange={(e) => setShipmentData({...shipmentData, date: e.target.value})} />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label className="mb-2 block">{t('price_label')}</Label>
                        <Input type="number" placeholder="SAR" onChange={(e) => setShipmentData({...shipmentData, price: e.target.value})} />
                    </div>
                    <div>
                        <Label className="mb-2 block">{t('weight_label')}</Label>
                        <Input type="number" placeholder="KG" onChange={(e) => setShipmentData({...shipmentData, weight: e.target.value})} />
                    </div>
                </div>
              </div>
            </div>
            
            <Button className="w-full h-12 text-lg font-bold" onClick={() => setStep(2)}>{t('next')}</Button>
          </div>
        )}

        {/* الخطوة 2: إضافة المنتجات */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="brand-card p-5">
              <h3 className="font-bold mb-4 flex items-center gap-2 text-primary border-b border-border pb-2">
                <Plus className="w-5 h-5" /> {t('add_products')}
              </h3>

              <div className="grid gap-3 mb-6 p-4 bg-muted/20 rounded-xl border border-dashed border-primary/30">
                <Input placeholder={t('product_name')} value={currentProduct.name || ''} onChange={e => setCurrentProduct({...currentProduct, name: e.target.value})} />
                <Input placeholder={t('product_desc')} value={currentProduct.description || ''} onChange={e => setCurrentProduct({...currentProduct, description: e.target.value})} />
                <div className="grid grid-cols-2 gap-3">
                  <Input type="number" placeholder={t('quantity')} value={currentProduct.quantity || ''} onChange={e => setCurrentProduct({...currentProduct, quantity: Number(e.target.value)})} />
                  <Input placeholder={t('unit')} value={currentProduct.unit || ''} onChange={e => setCurrentProduct({...currentProduct, unit: e.target.value})} />
                </div>
                <Button size="sm" variant="secondary" className="mt-2" onClick={handleAddProduct}>
                  <Plus className="w-4 h-4 ml-2"/> {t('add_product_btn')}
                </Button>
              </div>

              <div className="space-y-2">
                {products.length > 0 ? products.map((prod) => (
                  <div key={prod.id} className="flex justify-between items-center p-3 bg-card border rounded-lg shadow-sm">
                    <div>
                      <p className="font-bold text-foreground">{prod.name}</p>
                      <p className="text-xs text-muted-foreground">{prod.quantity} {prod.unit} - {prod.description}</p>
                    </div>
                    <button onClick={() => handleRemoveProduct(prod.id)} className="text-red-500 p-2 hover:bg-red-50 rounded-full transition-colors"><Trash2 className="w-4 h-4"/></button>
                  </div>
                )) : (
                  <div className="text-center py-8 text-muted-foreground bg-muted/10 rounded-xl border border-dashed border-border">
                    لا يوجد منتجات مضافة حالياً
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 h-12" onClick={() => setStep(1)}>{t('previous')}</Button>
              <Button className="flex-1 h-12" onClick={() => setStep(3)}>{t('next')}</Button>
            </div>
          </div>
        )}

        {/* الخطوة 3: المستلم والحفظ */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div className="brand-card p-5">
              <h3 className="font-bold mb-4 flex items-center gap-2 text-primary border-b border-border pb-2">
                <User className="w-5 h-5" /> {t('receiver_info')}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block">{t('receiver_name')}</Label>
                  <Input placeholder="الاسم" value={receiver.name} onChange={e => setReceiver({...receiver, name: e.target.value})} />
                </div>
                <div>
                  <Label className="mb-2 block">{t('receiver_phone')}</Label>
                  <Input placeholder="05xxxxxxxx" type="tel" value={receiver.phone} onChange={e => setReceiver({...receiver, phone: e.target.value})} dir="ltr" className="text-right" />
                </div>
                <div>
                  <Label className="mb-2 block">{t('receiver_address')}</Label>
                  <Input placeholder="العنوان التفصيلي" value={receiver.address} onChange={e => setReceiver({...receiver, address: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1 h-12" onClick={() => setStep(2)}>{t('previous')}</Button>
              <Button className="flex-[2] h-12 text-lg font-bold shadow-lg shadow-primary/20" onClick={handleSubmit} disabled={loading}>
                {loading ? <Loader2 className="animate-spin"/> : t('post_now_btn')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
