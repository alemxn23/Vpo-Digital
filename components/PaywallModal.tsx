import React, { useState, useEffect } from 'react';
import {
    CreditCard, X, ShieldCheck, Zap, Loader2, Star,
    Gift, Calendar, CheckCircle, Lock, Sparkles, TrendingUp,
    Award, FileText
} from 'lucide-react';
import { supabase } from '../utils/supabase';

// ─── Types ──────────────────────────────────────────────────────────────────

interface PaywallModalProps {
    isOpen: boolean;
    onClose: () => void;
    /** 'paywall' = límite alcanzado, 'account' = ver estatus/comprar créditos */
    mode?: 'paywall' | 'account';
}

interface Profile {
    paid_credits: number;
    free_vpos_used_today: number;
    plan_type: string;
    last_vpo_date: string | null;
}

// ─── Package Card ────────────────────────────────────────────────────────────

const PackageCard: React.FC<{
    emoji: string;
    title: string;
    credits: number;
    price: number;
    priceId: string;
    badge?: string;
    highlight?: boolean;
    loading: string | null;
    onBuy: (priceId: string, credits: number, packName: string) => void;
}> = ({ emoji, title, credits, price, priceId, badge, highlight, loading, onBuy }) => {
    const packId = `${credits}vpos`;
    const isLoading = loading === packId;
    const perUnit = (price / credits).toFixed(0);

    return (
        <button
            onClick={() => onBuy(priceId, credits, packId)}
            disabled={loading !== null}
            className={`
                relative w-full text-left rounded-2xl border-2 p-5 transition-all duration-300 group
                ${highlight
                    ? 'border-clinical-navy bg-clinical-navy shadow-xl shadow-clinical-navy/25 text-white hover:brightness-110'
                    : 'border-slate-200 bg-white hover:border-clinical-navy hover:shadow-lg'}
                ${loading !== null ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer active:scale-[0.98]'}
            `}
        >
            {badge && (
                <span className={`
                    absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border
                    ${highlight
                        ? 'bg-amber-400 text-amber-900 border-amber-300'
                        : 'bg-clinical-navy text-white border-clinical-navy'}
                `}>
                    {badge}
                </span>
            )}

            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">{emoji}</span>
                    <div>
                        <p className={`font-black text-base leading-tight ${highlight ? 'text-white' : 'text-slate-800'}`}>
                            {title}
                        </p>
                        <p className={`text-[11px] font-bold ${highlight ? 'text-blue-200' : 'text-slate-400'}`}>
                            ${perUnit} MXN · por VPO
                        </p>
                    </div>
                </div>

                <div className="text-right">
                    <p className={`text-2xl font-black leading-none ${highlight ? 'text-white' : 'text-clinical-navy'}`}>
                        ${price}
                    </p>
                    <p className={`text-[10px] font-bold uppercase ${highlight ? 'text-blue-200' : 'text-slate-400'}`}>MXN</p>
                </div>
            </div>

            <div className={`flex items-center justify-between pt-3 border-t ${highlight ? 'border-white/20' : 'border-slate-100'}`}>
                <div className="flex items-center gap-1.5">
                    <FileText size={14} className={highlight ? 'text-blue-200' : 'text-clinical-navy'} />
                    <span className={`text-xs font-bold ${highlight ? 'text-blue-100' : 'text-slate-600'}`}>
                        {credits} reportes PDF
                    </span>
                </div>

                <div className={`
                    flex items-center gap-1.5 text-[11px] font-black px-3 py-1.5 rounded-lg transition-all
                    ${highlight
                        ? 'bg-white/20 text-white group-hover:bg-white/30'
                        : 'bg-clinical-navy text-white group-hover:bg-blue-800'}
                `}>
                    {isLoading
                        ? <><Loader2 size={14} className="animate-spin" /> Cargando...</>
                        : <><CreditCard size={14} /> Comprar</>
                    }
                </div>
            </div>
        </button>
    );
};

// ─── Main Modal ──────────────────────────────────────────────────────────────

const PaywallModal: React.FC<PaywallModalProps> = ({ isOpen, onClose, mode = 'paywall' }) => {
    const [loading, setLoading] = useState<string | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isVIP, setIsVIP] = useState(false);
    const [tab, setTab] = useState<'status' | 'buy'>('buy');

    useEffect(() => {
        if (!isOpen) return;
        // Default tab: 'status' when opened from account button, 'buy' from paywall
        setTab(mode === 'account' ? 'status' : 'buy');
        fetchProfile();
    }, [isOpen, mode]);

    const fetchProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('profiles')
            .select('paid_credits, free_vpos_used_today, plan_type, last_vpo_date')
            .eq('id', user.id)
            .single();

        if (data) setProfile(data);
        setIsVIP(user.email === 'mcfidel98@gmail.com');
    };

    const handleBuy = async (priceId: string, creditsAmount: number, packName: string) => {
        setLoading(packName);

        // Payment Links directos de Stripe
        const paymentLinks: Record<string, string> = {
            'price_1T4HWkKtp6JiUcWzTNSg9D8h': 'https://buy.stripe.com/dRm4gA7Rs8SxgdV5SW24001', // Starter: 5 VPOs $250 MXN
            'price_1T4HX1Ktp6JiUcWzb6Jm2Utk': 'https://buy.stripe.com/14A6oI5JkecRaTBa9c24002', // Pro: 10 VPOs $400 MXN
        };

        try {
            // Intentar Edge Function primero (si está desplegada)
            const { data, error } = await supabase.functions.invoke('create-checkout-session', {
                body: {
                    priceId,
                    mode: 'payment',
                    successUrl: `${window.location.origin}/?success=true`,
                    cancelUrl: `${window.location.origin}/?canceled=true`,
                    credits: creditsAmount,
                }
            });

            if (!error && data?.url) {
                window.location.href = data.url;
                return;
            }

            // Fallback: abrir Payment Link directo de Stripe
            const link = paymentLinks[priceId];
            if (link) window.open(link, '_blank');
        } catch (error) {
            console.error('Error creating checkout session:', error);
            // Fallback garantizado: abrir Payment Link de Stripe directamente
            const link = paymentLinks[priceId];
            if (link) {
                window.open(link, '_blank');
            } else {
                alert('Ocurrió un error. Contacta soporte: mcfidel98@gmail.com');
            }
        } finally {
            setLoading(null);
        }
    };

    if (!isOpen) return null;

    const freeUsed = profile?.free_vpos_used_today ?? 0;
    const paidCredits = profile?.paid_credits ?? 0;
    const hasFreeToday = freeUsed < 1;

    return (
        <div
            className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden relative flex flex-col max-h-[95dvh]">

                {/* ── Header Gradient ── */}
                <div className="relative bg-gradient-to-br from-[#0a1628] via-[#0d2040] to-[#152a5a] p-6 pb-4 text-white overflow-hidden shrink-0">
                    {/* Decorative orbs */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors z-10 bg-white/10 rounded-full p-1.5"
                    >
                        <X size={18} />
                    </button>

                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
                            <Sparkles size={22} className="text-cyan-300" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black tracking-tight leading-tight">VPO Digital</h2>
                            <p className="text-[11px] text-blue-200/80 font-bold uppercase tracking-widest">Pasarela de Pagos</p>
                        </div>
                    </div>

                    {/* Credit Summary Chips */}
                    <div className="flex flex-wrap gap-2">
                        <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10 text-[11px] font-bold">
                            <CreditCard size={12} className="text-cyan-300" />
                            <span>{isVIP ? '∞' : paidCredits} créditos pagados</span>
                        </div>
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-bold backdrop-blur-sm
                            ${hasFreeToday
                                ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-200'
                                : 'bg-white/5 border-white/10 text-white/50'}`}
                        >
                            <Gift size={12} />
                            <span>{hasFreeToday ? '1 VPO gratis disponible hoy' : 'Cortesía diaria usada'}</span>
                        </div>
                    </div>

                    {mode === 'paywall' && (
                        <div className="mt-4 bg-red-500/20 border border-red-400/30 rounded-xl px-4 py-2.5 flex items-center gap-2.5">
                            <Lock size={16} className="text-red-300 shrink-0" />
                            <p className="text-[12px] text-red-100 font-semibold">
                                Has alcanzado tu límite diario. Adquiere créditos para continuar.
                            </p>
                        </div>
                    )}
                </div>

                {/* ── Tabs ── */}
                <div className="flex gap-1 p-3 bg-slate-50 border-b border-slate-100 shrink-0">
                    {[
                        { id: 'status', label: 'Estatus de Cuenta', icon: Award },
                        { id: 'buy', label: 'Comprar Créditos', icon: TrendingUp },
                    ].map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setTab(id as 'status' | 'buy')}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-[12px] font-black uppercase tracking-wider transition-all
                                ${tab === id
                                    ? 'bg-clinical-navy text-white shadow-md shadow-clinical-navy/20'
                                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
                        >
                            <Icon size={14} />
                            {label}
                        </button>
                    ))}
                </div>

                {/* ── Scrollable Content ── */}
                <div className="overflow-y-auto overscroll-contain flex-1">

                    {/* ── ACCOUNT STATUS TAB ── */}
                    {tab === 'status' && (
                        <div className="p-5 space-y-4">
                            {/* Plan badge */}
                            <div className="bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-4">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner
                                    ${isVIP ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 'bg-gradient-to-br from-clinical-navy to-blue-700'}`}>
                                    {isVIP ? '👑' : '🏥'}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan Activo</p>
                                    <p className="text-lg font-black text-slate-800 leading-tight">
                                        {isVIP ? 'Desarrollador VIP' : profile?.plan_type === 'unlimited' ? 'Ilimitado' : 'Estándar'}
                                    </p>
                                    <p className="text-[11px] text-slate-500 font-medium">
                                        {isVIP ? 'Acceso completo de desarrollador' : 'Créditos por VPO generado'}
                                    </p>
                                </div>
                            </div>

                            {/* Stats grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
                                    <p className="text-3xl font-black text-clinical-navy">
                                        {isVIP ? '∞' : paidCredits}
                                    </p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                        Créditos Pagados
                                    </p>
                                </div>
                                <div className={`rounded-2xl p-4 border text-center
                                    ${hasFreeToday
                                        ? 'bg-emerald-50 border-emerald-100'
                                        : 'bg-slate-50 border-slate-100'}`}
                                >
                                    <p className={`text-3xl font-black ${hasFreeToday ? 'text-emerald-600' : 'text-slate-400'}`}>
                                        {hasFreeToday ? '1' : '0'}
                                    </p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                        VPO Gratis Hoy
                                    </p>
                                </div>
                            </div>

                            {/* Free VPO Reminder */}
                            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
                                        <Gift size={18} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-emerald-800">1 VPO gratuito cada día</p>
                                        <p className="text-[11px] text-emerald-700 mt-0.5 leading-relaxed">
                                            Cada día recibes <strong>1 VPO de cortesía</strong> para generar un reporte clínico sin costo.
                                            Esta cortesía <strong>no es acumulable</strong> — se reinicia diariamente y no se guarda si no se usa.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Status items */}
                            {[
                                { icon: Calendar, label: 'Último VPO generado', value: profile?.last_vpo_date ? new Date(profile.last_vpo_date).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Nunca', color: 'text-slate-600' },
                                { icon: CheckCircle, label: 'Estado de cuenta', value: 'Activa y verificada', color: 'text-emerald-600' },
                            ].map(({ icon: Icon, label, value, color }) => (
                                <div key={label} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="flex items-center gap-2.5">
                                        <Icon size={16} className={color} />
                                        <span className="text-xs font-bold text-slate-600">{label}</span>
                                    </div>
                                    <span className={`text-xs font-black ${color}`}>{value}</span>
                                </div>
                            ))}

                            <button
                                onClick={() => setTab('buy')}
                                className="w-full bg-clinical-navy text-white font-black py-4 rounded-2xl text-sm hover:brightness-110 transition-all shadow-lg shadow-clinical-navy/20 flex items-center justify-center gap-2 mt-2"
                            >
                                <CreditCard size={18} />
                                Comprar más créditos
                            </button>
                        </div>
                    )}

                    {/* ── BUY CREDITS TAB ── */}
                    {tab === 'buy' && (
                        <div className="p-5 space-y-4">
                            {/* Free daily reminder */}
                            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
                                <span className="text-2xl shrink-0">🎁</span>
                                <div>
                                    <p className="text-[12px] font-black text-amber-800">1 VPO gratis al día — sin acumular</p>
                                    <p className="text-[11px] text-amber-700 leading-relaxed">
                                        Cada día tienes <strong>1 cortesía</strong> para generar un reporte sin costo.
                                        Adquiere créditos para generar múltiples VPOs sin restricciones.
                                    </p>
                                </div>
                            </div>

                            {/* Feature highlights */}
                            <div className="space-y-2">
                                {[
                                    { icon: Zap, text: 'Generación PDF de alta resolución al instante', color: 'bg-yellow-100 text-yellow-600' },
                                    { icon: ShieldCheck, text: 'Datos seguros y respaldo en la nube', color: 'bg-blue-100 text-blue-600' },
                                    { icon: Star, text: 'Acceso a todas las escalas clínicas avanzadas', color: 'bg-purple-100 text-purple-600' },
                                ].map(({ icon: Icon, text, color }) => (
                                    <div key={text} className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${color} shrink-0`}>
                                            <Icon size={16} />
                                        </div>
                                        <p className="text-[12px] font-medium text-slate-700">{text}</p>
                                    </div>
                                ))}
                            </div>

                            <hr className="border-slate-100" />

                            {/* Package cards */}
                            <div className="space-y-3 mt-1">
                                <PackageCard
                                    emoji="⚡"
                                    title="Paquete Starter"
                                    credits={5}
                                    price={250}
                                    priceId="price_1T4HWkKtp6JiUcWzTNSg9D8h"
                                    loading={loading}
                                    onBuy={handleBuy}
                                />
                                <PackageCard
                                    emoji="🚀"
                                    title="Paquete Pro"
                                    credits={10}
                                    price={400}
                                    priceId="price_1T4HX1Ktp6JiUcWzb6Jm2Utk"
                                    badge="Mejor Valor"
                                    highlight={true}
                                    loading={loading}
                                    onBuy={handleBuy}
                                />
                            </div>

                            {/* Trust notice */}
                            <p className="text-center text-[10px] text-slate-400 font-medium flex items-center justify-center gap-1 pb-2">
                                <Lock size={11} />
                                Pago seguro procesado por Stripe. No almacenamos datos de tarjeta.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaywallModal;
