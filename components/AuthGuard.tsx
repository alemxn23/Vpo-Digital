import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { Activity, ShieldCheck, Clock, FileText, Lock, Mail, Loader2, KeyRound } from 'lucide-react';

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isLogin, setIsLogin] = useState(true);

    // Form states
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [authLoading, setAuthLoading] = useState(false);
    const [authError, setAuthError] = useState('');

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthLoading(true);
        setAuthError('');

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                alert('Revisa tu correo para verificar tu cuenta.');
            }
        } catch (error: any) {
            setAuthError(error.message || 'Error en la autenticación');
        } finally {
            setAuthLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-clinical-bg flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-clinical-navy animate-spin" />
            </div>
        );
    }

    if (session) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col md:flex-row relative overflow-hidden font-sans">
            {/* Dynamic Background */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
                <div className="absolute w-[500px] h-[500px] bg-blue-600 rounded-full blur-[100px] max-w-full -top-32 -left-32 animate-pulse"></div>
                <div className="absolute w-[400px] h-[400px] bg-cyan-400 rounded-full blur-[100px] max-w-full bottom-0 right-0 animate-pulse delay-700"></div>
            </div>

            {/* Landing Page Content (Left/Top) */}
            <div className="flex-1 z-10 p-8 md:p-16 flex flex-col justify-center text-white bg-slate-900/60 backdrop-blur-sm border-r border-white/10">
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center gap-3 mb-8">
                        <Activity className="w-10 h-10 text-cyan-400" />
                        <h1 className="text-3xl font-bold tracking-widest uppercase">VPO Digital</h1>
                    </div>

                    <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        La Evolución de la Valoración Preoperatoria
                    </h2>
                    <p className="text-lg md:text-xl text-gray-300 mb-10 font-medium">
                        Optimiza tu tiempo, reduce el error humano y genera notas clínicas perfectas en segundos. Diseñado por médicos, para médicos.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-md">
                            <Clock className="w-8 h-8 text-cyan-400 mb-3" />
                            <h3 className="text-white font-bold text-lg mb-2">Ahorro de Tiempo</h3>
                            <p className="text-sm text-gray-400">Automatiza cálculos complejos (LEE, CApRiNi, ASA, Gupta) al instante.</p>
                        </div>
                        <div className="bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-md">
                            <FileText className="w-8 h-8 text-blue-400 mb-3" />
                            <h3 className="text-white font-bold text-lg mb-2">Notas Perfectas</h3>
                            <p className="text-sm text-gray-400">Genera notas clínicas estructuradas y listas para el expediente en un clic.</p>
                        </div>
                        <div className="bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-md">
                            <ShieldCheck className="w-8 h-8 text-green-400 mb-3" />
                            <h3 className="text-white font-bold text-lg mb-2">Medicina Basada en Evidencia</h3>
                            <p className="text-sm text-gray-400">Algoritmos actualizados según las últimas guías internacionales.</p>
                        </div>
                        <div className="bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-md">
                            <Lock className="w-8 h-8 text-purple-400 mb-3" />
                            <h3 className="text-white font-bold text-lg mb-2">Seguridad y Respaldo</h3>
                            <p className="text-sm text-gray-400">Integración nativa con Google Drive y generación rápida de PDFs.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Auth Form (Right/Bottom) */}
            <div className="w-full md:w-[450px] lg:w-[500px] z-10 flex items-center justify-center p-8 bg-black/40 backdrop-blur-xl">
                <div className="w-full max-w-sm">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-white mb-2">{isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}</h2>
                        <p className="text-gray-400 text-sm">Bienvenido al futuro de la medicina interna</p>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-5">
                        {authError && (
                            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm font-medium text-center">
                                {authError}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-gray-400 tracking-wider mb-2 uppercase">Correo Electrónico</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-500" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-medium"
                                    placeholder="dr@hospital.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 tracking-wider mb-2 uppercase">Contraseña</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <KeyRound className="h-5 w-5 text-gray-500" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-medium"
                                    placeholder="••••••••"
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={authLoading}
                            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {authLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                            {isLogin ? 'Acceder al Sistema' : 'Comenzar Ahora'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-sm text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                        >
                            {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
                        </button>
                    </div>

                    <div className="mt-12 text-center text-xs text-gray-600">
                        <p>&copy; {new Date().getFullYear()} VPO Digital. Aura Medical.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
