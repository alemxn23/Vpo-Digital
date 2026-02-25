import React, { useState } from 'react';
import { supabase } from '../utils/supabase';
import { Mail, Lock, IdCard, Loader2, X, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

interface AuthModalProps {
    onClose?: () => void;
}

type Tab = 'login' | 'register';

const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
    const [tab, setTab] = useState<Tab>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [cedula, setCedula] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const clearMessages = () => { setError(''); setSuccess(''); };

    const handleGoogleLogin = async () => {
        if (!supabase) return setError('Servicio no disponible.');
        setGoogleLoading(true);
        clearMessages();
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin,
                    queryParams: { access_type: 'offline', prompt: 'consent' }
                }
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message || 'Error al conectar con Google');
            setGoogleLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supabase) return setError('Servicio no disponible.');
        setLoading(true);
        clearMessages();
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                if (error.message.includes('Invalid login credentials')) {
                    throw new Error('Correo o contraseña incorrectos.');
                }
                throw error;
            }
            // Auth state change will be handled by AuthGuard
        } catch (err: any) {
            setError(err.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supabase) return setError('Servicio no disponible.');
        if (!fullName.trim() || fullName.trim().length < 3) return setError('El nombre completo es requerido (mín. 3 caracteres).');
        if (!cedula.trim()) return setError('La Cédula Profesional es requerida.');
        if (cedula.trim().length < 4) return setError('La Cédula Profesional no es válida.');
        if (password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres.');

        setLoading(true);
        clearMessages();
        try {
            // 1. Check if cedula already exists
            const { data: existing } = await supabase
                .from('profiles')
                .select('id')
                .eq('cedula_profesional', cedula.trim())
                .maybeSingle();

            if (existing) {
                throw new Error('Esta Cédula Profesional ya está registrada. Si es tuya, inicia sesión con tu correo.');
            }

            // 2. Create auth user
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: window.location.origin
                }
            });

            if (signUpError) {
                if (signUpError.message.includes('already registered')) {
                    throw new Error('Este correo ya está registrado. Usa "Iniciar Sesión".');
                }
                throw signUpError;
            }

            // 3. Insert profile with cedula
            if (data.user) {
                const { error: profileError } = await supabase.from('profiles').upsert({
                    id: data.user.id,
                    full_name: fullName.trim(),
                    cedula_profesional: cedula.trim(),
                    plan_type: 'free',
                    paid_credits: 0,
                    free_vpos_used_today: 0,
                    last_vpo_date: null,
                    verification_status: 'unverified',
                    verified: false
                });

                if (profileError && profileError.code === '23505') {
                    // Unique violation on cedula
                    throw new Error('Esta Cédula Profesional ya está en uso.');
                }
            }

            if (data.session) {
                // User is auto-confirmed, auth guard will pick it up
            } else {
                setSuccess('✅ Registro exitoso. Revisa tu correo para confirmar tu cuenta.');
            }
        } catch (err: any) {
            setError(err.message || 'Error al registrar usuario');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = `w-full bg-slate-800/60 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-400 
    focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/50 transition-all text-sm`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl shadow-teal-900/20 overflow-hidden">
                {/* Gradient accent top */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-cyan-400 to-indigo-500" />

                {/* Header */}
                <div className="px-8 pt-8 pb-4">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-black text-white tracking-tight">VPO Digital</h2>
                            <p className="text-slate-400 text-sm mt-0.5">Plataforma de Valoración Preoperatoria</p>
                        </div>
                        {onClose && (
                            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800">
                                <X size={18} />
                            </button>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className="flex bg-slate-800/50 rounded-xl p-1 mb-6">
                        {(['login', 'register'] as Tab[]).map(t => (
                            <button
                                key={t}
                                onClick={() => { setTab(t); clearMessages(); }}
                                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${tab === t
                                    ? 'bg-teal-500 text-white shadow-md shadow-teal-500/30'
                                    : 'text-slate-400 hover:text-slate-200'
                                    }`}
                            >
                                {t === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="px-8 pb-8">
                    {/* Google Button */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={googleLoading || loading}
                        className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-xl 
              border border-gray-200 transition-all text-sm shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed mb-4"
                    >
                        {googleLoading ? <Loader2 size={18} className="animate-spin" /> : <GoogleIcon />}
                        {googleLoading ? 'Conectando...' : 'Continuar con Google'}
                    </button>

                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex-1 h-px bg-slate-700" />
                        <span className="text-slate-500 text-xs font-medium">o con correo</span>
                        <div className="flex-1 h-px bg-slate-700" />
                    </div>

                    {/* Form */}
                    <form onSubmit={tab === 'login' ? handleLogin : handleRegister} className="space-y-3">
                        {/* Full name (register only) */}
                        {tab === 'register' && (
                            <div className="relative">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={e => setFullName(e.target.value)}
                                    placeholder="Nombre completo (Dr. Juan García López)"
                                    required
                                    className={`${inputClass} pl-11`}
                                />
                            </div>
                        )}

                        {/* Email */}
                        <div className="relative">
                            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="correo@ejemplo.com"
                                required
                                className={`${inputClass} pl-11`}
                            />
                        </div>

                        {/* Cédula (register only) */}
                        {tab === 'register' && (
                            <div className="relative">
                                <IdCard size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={cedula}
                                    onChange={e => setCedula(e.target.value)}
                                    placeholder="Cédula Profesional (ej. 14098958)"
                                    required
                                    className={`${inputClass} pl-11`}
                                />
                            </div>
                        )}

                        {/* Password */}
                        <div className="relative">
                            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder={tab === 'register' ? 'Contraseña (mín. 6 caracteres)' : 'Contraseña'}
                                required
                                className={`${inputClass} pl-11 pr-11`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>

                        {/* Register note */}
                        {tab === 'register' && (
                            <p className="text-[11px] text-slate-500 leading-relaxed px-1">
                                🔐 Tu Cédula Profesional es única a tu cuenta y previene registros duplicados.
                            </p>
                        )}

                        {/* Error / Success */}
                        {error && (
                            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2.5">
                                <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
                                <p className="text-red-300 text-xs leading-relaxed">{error}</p>
                            </div>
                        )}
                        {success && (
                            <div className="flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3 py-2.5">
                                <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                                <p className="text-emerald-300 text-xs leading-relaxed">{success}</p>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading || googleLoading}
                            className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 
                text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-teal-900/30 
                hover:shadow-teal-800/40 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed 
                disabled:translate-y-0 text-sm mt-1"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 size={16} className="animate-spin" />
                                    {tab === 'login' ? 'Iniciando...' : 'Registrando...'}
                                </span>
                            ) : (
                                tab === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'
                            )}
                        </button>
                    </form>

                    {/* Footer note for register with Google */}
                    {tab === 'register' && (
                        <p className="text-center text-slate-500 text-[11px] mt-4 leading-relaxed">
                            Al registrarte verificaremos tu cédula en el Registro Nacional de Profesionistas (SEP) y tu INE.<br />
                            <span className="text-teal-400 font-semibold">Tu cuenta estará activa al instante — la verificación médica es opcional pero recomendada.</span>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
