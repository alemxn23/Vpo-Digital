import React from 'react';
import { CreditCard, X, ShieldCheck, Zap } from 'lucide-react';

interface PaywallModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PaywallModal: React.FC<PaywallModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

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
                            <p className="text-gray-700 font-medium text-sm">Desbloquea generación de PDFs ilimitada</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                                <ShieldCheck size={20} />
                            </div>
                            <p className="text-gray-700 font-medium text-sm">Respaldo seguro en la nube (Google Drive)</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button className="w-full bg-clinical-navy hover:bg-blue-900 text-white font-bold py-4 px-6 rounded-xl flex justify-center items-center gap-2 transition-transform active:scale-95 shadow-lg shadow-blue-900/20">
                            <CreditCard size={20} />
                            Adquirir Créditos
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full bg-gray-50 hover:bg-gray-100 text-gray-500 font-medium py-3 px-6 rounded-xl transition-colors"
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
