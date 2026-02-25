import React, { useState } from 'react';
import { AuthModal } from './AuthModal';
import {
    Stethoscope, FileText, Shield, ChevronRight, Star, Zap, BarChart3,
    ClipboardCheck, Printer, CloudUpload, LogIn, UserPlus
} from 'lucide-react';

interface LandingPageProps {
    onShowAuth: (tab: 'login' | 'register') => void;
}

const FEATURE_COLOR_MAP: Record<string, { card: string; iconBg: string; iconText: string }> = {
    teal: { card: 'hover:border-teal-400/40 hover:shadow-teal-900/20', iconBg: 'bg-teal-500/10 border-teal-400/20 group-hover:bg-teal-500/20', iconText: 'text-teal-400' },
    cyan: { card: 'hover:border-cyan-400/40 hover:shadow-cyan-900/20', iconBg: 'bg-cyan-500/10 border-cyan-400/20 group-hover:bg-cyan-500/20', iconText: 'text-cyan-400' },
    indigo: { card: 'hover:border-indigo-400/40 hover:shadow-indigo-900/20', iconBg: 'bg-indigo-500/10 border-indigo-400/20 group-hover:bg-indigo-500/20', iconText: 'text-indigo-400' },
    violet: { card: 'hover:border-violet-400/40 hover:shadow-violet-900/20', iconBg: 'bg-violet-500/10 border-violet-400/20 group-hover:bg-violet-500/20', iconText: 'text-violet-400' },
    rose: { card: 'hover:border-rose-400/40 hover:shadow-rose-900/20', iconBg: 'bg-rose-500/10 border-rose-400/20 group-hover:bg-rose-500/20', iconText: 'text-rose-400' },
    amber: { card: 'hover:border-amber-400/40 hover:shadow-amber-900/20', iconBg: 'bg-amber-500/10 border-amber-400/20 group-hover:bg-amber-500/20', iconText: 'text-amber-400' },
};

const FeatureCard = ({
    icon: Icon, title, desc, color
}: { icon: any; title: string; desc: string; color: string }) => {
    const c = FEATURE_COLOR_MAP[color] || FEATURE_COLOR_MAP.teal;
    return (
        <div className={`relative group bg-slate-900/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 
    transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${c.card}`}>
            <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 transition-colors ${c.iconBg}`}>
                <Icon size={22} className={c.iconText} />
            </div>
            <h3 className="text-white font-bold text-base mb-2">{title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
        </div>
    );
};


const PricingCard = ({
    plan, price, features, highlight, onCTA, ctaLabel, badge
}: {
    plan: string; price: string; features: string[]; highlight?: boolean;
    onCTA: () => void; ctaLabel: string; badge?: string;
}) => (
    <div className={`relative rounded-2xl p-px transition-all duration-300 hover:-translate-y-1
    ${highlight
            ? 'bg-gradient-to-b from-teal-400 via-cyan-500 to-indigo-600 shadow-2xl shadow-teal-900/40'
            : 'bg-slate-700/50 hover:bg-slate-600/60'
        }`}>
        {badge && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-teal-400 to-cyan-400 
        text-slate-900 text-xs font-black px-4 py-1 rounded-full shadow-lg whitespace-nowrap">
                {badge}
            </div>
        )}
        <div className={`rounded-2xl p-7 h-full ${highlight ? 'bg-slate-900' : 'bg-slate-900/80'}`}>
            <p className="text-slate-400 text-sm font-semibold mb-1">{plan}</p>
            <div className="flex items-end gap-1 mb-6">
                <span className="text-white text-4xl font-black">{price}</span>
                {price !== '---' && <span className="text-slate-400 text-sm mb-1.5">/mes</span>}
            </div>
            <ul className="space-y-3 mb-8">
                {features.map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 
              ${highlight ? 'bg-teal-400/20' : 'bg-slate-700'}`}>
                            <ChevronRight size={10} className={highlight ? 'text-teal-400' : 'text-slate-400'} />
                        </div>
                        <span className="text-slate-300">{f}</span>
                    </li>
                ))}
            </ul>
            <button
                onClick={onCTA}
                className={`w-full py-3 rounded-xl font-bold text-sm transition-all
          ${highlight
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-400 hover:to-cyan-400 shadow-lg shadow-teal-900/40'
                        : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
                    }`}
            >
                {ctaLabel}
            </button>
        </div>
    </div>
);

const ScalePill: React.FC<{ label: string }> = ({ label }) => (
    <span className="inline-flex items-center px-3 py-1 bg-slate-800/80 border border-slate-700/60 
    rounded-full text-[11px] font-bold text-teal-300 tracking-wider">
        {label}
    </span>
);


export const LandingPage: React.FC<LandingPageProps> = ({ onShowAuth }) => {
    // Animated ECG line effect via CSS
    return (
        <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
            {/* Background radial gradients */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-teal-900/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-900/20 rounded-full blur-[100px]" />
            </div>

            {/* ── NAVBAR ── */}
            <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-4 border-b border-slate-800/60 backdrop-blur-sm">
                <div className="flex items-center">
                    <img
                        src="/logo.png?v=9"
                        alt="VPO Digital"
                        className="h-12 w-auto object-contain drop-shadow-[0_0_12px_rgba(34,211,238,0.25)] hover:drop-shadow-[0_0_18px_rgba(34,211,238,0.45)] transition-all duration-300"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => onShowAuth('login')}
                        className="flex items-center gap-1.5 text-slate-300 hover:text-white text-sm font-semibold 
              transition-colors px-4 py-2 rounded-xl hover:bg-slate-800"
                    >
                        <LogIn size={15} />
                        Iniciar Sesión
                    </button>
                    <button
                        onClick={() => onShowAuth('register')}
                        className="flex items-center gap-1.5 bg-teal-500 hover:bg-teal-400 text-white text-sm font-bold 
              px-4 py-2 rounded-xl transition-all shadow-md shadow-teal-900/30 hover:-translate-y-0.5"
                    >
                        <UserPlus size={15} />
                        Registrarse
                    </button>
                </div>
            </nav>

            {/* ── HERO ── */}
            <section className="relative z-10 pt-20 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left: Copy */}
                    <div>
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-400/20 rounded-full px-4 py-1.5 mb-6">
                            <Star size={12} className="text-teal-400 fill-teal-400" />
                            <span className="text-teal-300 text-xs font-semibold tracking-wide">Plataforma Médica Certificada</span>
                        </div>

                        <h1 className="text-5xl md:text-6xl font-black leading-[1.08] tracking-tight mb-6">
                            Valoración{' '}
                            <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                                Preoperatoria
                            </span>{' '}
                            <br />Digital
                        </h1>

                        <p className="text-slate-400 text-lg leading-relaxed mb-8 max-w-lg">
                            Genera VPOs institucionales completas con escalas de riesgo validadas, notas médicas automáticas y exportación a PDF en segundos. Para médicos internistas y anestesiólogos.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 mb-10">
                            <button
                                onClick={() => onShowAuth('register')}
                                className="flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 
                  hover:from-teal-400 hover:to-cyan-400 text-white font-bold px-7 py-4 rounded-xl transition-all 
                  shadow-xl shadow-teal-900/40 hover:-translate-y-0.5 text-base"
                            >
                                Comenzar Gratis
                                <ChevronRight size={18} />
                            </button>
                            <button
                                onClick={() => onShowAuth('login')}
                                className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border 
                  border-slate-700 text-slate-200 font-semibold px-7 py-4 rounded-xl transition-all text-base"
                            >
                                <LogIn size={17} />
                                Ya tengo cuenta
                            </button>
                        </div>

                        {/* Scales showcase */}
                        <div>
                            <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-3">Incluye todas las escalas</p>
                            <div className="flex flex-wrap gap-2">
                                {['ASA', 'LEE', 'Goldman', 'Caprini', 'ARISCAT', 'Gupta', 'STOP-BANG', 'CFS', 'METs', 'Duke', 'CHA₂DS₂', 'HAS-BLED', 'Khorana', 'NSQIP'].map(s => (
                                    <ScalePill key={s} label={s} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Hero Image */}
                    <div className="relative flex items-center justify-center">
                        <div className="absolute inset-0 bg-gradient-to-br from-teal-900/30 to-indigo-900/20 rounded-3xl blur-xl" />
                        <img
                            src="/hero.png"
                            alt="VPO Digital - Valoración Preoperatoria"
                            className="relative w-full max-w-md lg:max-w-full object-contain drop-shadow-2xl 
                hover:scale-[1.02] transition-transform duration-500 rounded-2xl"
                        />
                    </div>
                </div>
            </section>

            {/* ── FEATURES ── */}
            <section className="relative z-10 py-20 px-6 md:px-12 border-t border-slate-800/40">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-14">
                        <p className="text-teal-400 text-sm font-bold uppercase tracking-widest mb-3">Características</p>
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Todo lo que necesitas</h2>
                        <p className="text-slate-400 max-w-xl mx-auto">Diseñado por médicos, para médicos. Sin curva de aprendizaje.</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                        <FeatureCard
                            icon={BarChart3} color="teal" title="14 Escalas de Riesgo"
                            desc="ASA, Goldman, Lee, Caprini, ARISCAT, Gupta, CFS, METs, STOP-BANG, Duke, CHA₂DS₂-VASc, HAS-BLED, Khorana y NSQIP — todas calculadas automáticamente."
                        />
                        <FeatureCard
                            icon={FileText} color="cyan" title="PDF Institucional"
                            desc="Exporta la valoración como un documento profesional de 2 páginas listo para firma y archivo en expediente clínico."
                        />
                        <FeatureCard
                            icon={CloudUpload} color="indigo" title="Google Drive"
                            desc="Sube el PDF y las imágenes de ECG y RX directamente a tu carpeta de Drive desde la app."
                        />
                        <FeatureCard
                            icon={ClipboardCheck} color="violet" title="Nota Médica Auto"
                            desc="Genera la nota de valoración completa en segundos, lista para copiar al expediente electrónico."
                        />
                        <FeatureCard
                            icon={Shield} color="rose" title="Acceso Seguro"
                            desc="Autenticación con Cédula Profesional única. Un registro por médico. Tus datos protegidos con Supabase."
                        />
                        <FeatureCard
                            icon={Zap} color="amber" title="Tiempo Real"
                            desc="Todos los puntajes de riesgo se actualizan mientras llenas los datos del paciente. Sin botones, sin espera."
                        />
                    </div>
                </div>
            </section>

            {/* ── PRICING ── */}
            <section className="relative z-10 py-20 px-6 md:px-12 border-t border-slate-800/40">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-14">
                        <p className="text-teal-400 text-sm font-bold uppercase tracking-widest mb-3">Planes</p>
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Simple y transparente</h2>
                        <p className="text-slate-400">Comienza gratis. Escala cuando lo necesites.</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        <PricingCard
                            plan="Plan Gratuito"
                            price="$0"
                            ctaLabel="Comenzar Gratis"
                            onCTA={() => onShowAuth('register')}
                            features={[
                                '1 VPO gratuita por día',
                                'Todas las escalas de riesgo',
                                'Exportación a PDF',
                                'Nota médica automática',
                                'Google Drive (1/día)',
                            ]}
                        />
                        <PricingCard
                            plan="Plan VIP"
                            price="---"
                            badge="⭐ Contactar"
                            highlight
                            ctaLabel="Solicitar Acceso VIP"
                            onCTA={() => window.open('mailto:mcfidel98@gmail.com?subject=Acceso VIP VPO Digital', '_blank')}
                            features={[
                                'VPOs ilimitadas',
                                'Todo el plan gratuito incluido',
                                'Soporte prioritario',
                                'Créditos adicionales disponibles',
                                'Acceso a nuevas funciones primero',
                            ]}
                        />
                    </div>
                    <p className="text-center text-slate-600 text-sm mt-6">
                        ¿Necesitas más VPOs hoy? También puedes comprar paquetes de créditos desde tu cuenta.
                    </p>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="relative z-10 border-t border-slate-800/60 py-10 px-6 md:px-12">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* Left: VPO Logo + copyright */}
                    <div className="flex items-center gap-3">
                        <img src="/logo.png?v=9" alt="VPO Digital" className="h-9 w-auto object-contain opacity-70" />
                        <span className="text-slate-500 text-xs font-medium">© {new Date().getFullYear()} Todos los derechos reservados</span>
                    </div>
                    {/* Center: Support link */}
                    <a href="mailto:mcfidel98@gmail.com" className="text-slate-500 hover:text-teal-400 text-sm font-medium transition-colors">
                        Soporte
                    </a>
                    {/* Right: Med-Tech Labs logo */}
                    <a
                        href="mailto:mcfidel98@gmail.com"
                        title="Desarrollado por Med-Tech Labs"
                        className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity group"
                    >
                        <span className="text-slate-600 text-[10px] font-semibold uppercase tracking-widest group-hover:text-slate-400 transition-colors">Powered by</span>
                        <img
                            src="/medtech_logo.png?v=9"
                            alt="Med-Tech Labs"
                            className="h-10 w-auto object-contain"
                        />
                    </a>
                </div>
            </footer>
        </div>
    );
};
