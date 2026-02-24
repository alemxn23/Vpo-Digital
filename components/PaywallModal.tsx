import React, { useState } from 'react';
import { CreditCard, X, ShieldCheck, Zap, Loader2 } from 'lucide-react';
import { supabase } from '../utils/supabase';

interface PaywallModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PaywallModal: React.FC<PaywallModalProps> = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleBuy = async (priceId: string, creditsAmount: number, packName: string) => {
        setLoading(packName);
        try {
            const { data, error } = await supabase.functions.invoke('create-checkout-session', {
                body: {
                    priceId: priceId,
                    mode: 'payment',
                    successUrl: `${window.location.origin}/?success=true`,
                    cancelUrl: `${window.location.origin}/?canceled=true`,
                    credits: creditsAmount, // We pass this so the webhook can read metadata.credits
                }
            });

            if (error) throw error;

            if (data?.url) {
                window.location.href = data.url;
            }
        } catch (error) {
            console.error('Error creating checkout session:', error);
            alert('Ocurrió un error al procesar el pago. Por favor intenta de nuevo.');
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in duration-300">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
                >
                    <X size={24} />
                </button>

                <div className="bg-gradient-to-br from-clinical-navy to-blue-900 p-8 text-center text-white relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-300 via-transparent to-transparent"></div>
                    <ShieldCheck size={48} className="mx-auto mb-4 text-blue-200" />
                    <h2 className="text-2xl font-black tracking-tight mb-2">Límite Diario Alcanzado</h2>
                    <p className="text-blue-100 text-sm opacity-90">
                        Has utilizado tus 2 valoraciones gratuitas de hoy.
                    </p>
                </div>

                <div className="p-8">
                    <div className="space-y-4 mb-8">
                        <div className="flex items-center gap-3">
                            <div className="bg-green-100 p-2 rounded-full text-green-600">
                                <Zap size={20} />
                            </div>
                            <p className="text-gray-700 font-medium text-sm">Desbloquea generación de PDFs al instante</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                                <ShieldCheck size={20} />
                            </div>
                            <p className="text-gray-700 font-medium text-sm">Respaldo seguro en la nube y privacidad</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => handleBuy('price_1T4HWkKtp6JiUcWzTNSg9D8h', 5, '5vpos')}
                            disabled={loading !== null}
                            className="w-full bg-clinical-navy hover:bg-blue-900 text-white font-bold py-4 px-6 rounded-xl flex justify-between items-center transition-transform active:scale-95 shadow-lg shadow-blue-900/20 disabled:opacity-70 disabled:active:scale-100"
                        >
                            <div className="flex items-center gap-2">
                                {loading === '5vpos' ? <Loader2 size={20} className="animate-spin" /> : <CreditCard size={20} />}
                                Paquete 5 VPOs
                            </div>
                            <span>$250 MXN</span>
                        </button>

                        <button
                            onClick={() => handleBuy('price_1T4HX1Ktp6JiUcWzb6Jm2Utk', 10, '10vpos')}
                            disabled={loading !== null}
                            className="w-full bg-clinical-navy hover:bg-blue-900 text-white font-bold py-4 px-6 rounded-xl flex justify-between items-center transition-transform active:scale-95 shadow-lg shadow-blue-900/20 disabled:opacity-70 disabled:active:scale-100"
                        >
                            <div className="flex items-center gap-2">
                                {loading === '10vpos' ? <Loader2 size={20} className="animate-spin" /> : <CreditCard size={20} />}
                                Paquete 10 VPOs
                            </div>
                            <span>$400 MXN</span>
                        </button>

                        <button
                            onClick={onClose}
                            className="w-full bg-gray-50 hover:bg-gray-100 text-gray-500 font-medium py-3 px-6 rounded-xl transition-colors mt-2"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaywallModal;
