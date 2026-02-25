import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { LandingPage } from './LandingPage';
import { AuthModal } from './AuthModal';
import { Loader2 } from 'lucide-react';

type AuthTab = 'login' | 'register';

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showAuth, setShowAuth] = useState(false);
    const [authTab, setAuthTab] = useState<AuthTab>('login');

    useEffect(() => {
        if (!supabase) {
            // No Supabase config — allow access (dev mode)
            setSession({ dev: true });
            setLoading(false);
            return;
        }

        // 1. Get current session
        supabase.auth.getSession().then(({ data }: any) => {
            setSession(data.session);
            setLoading(false);
        });

        // 2. Listen for auth changes
        const { data: listener } = supabase.auth.onAuthStateChange((_event: any, newSession: any) => {
            setSession(newSession);
            if (newSession) setShowAuth(false); // close modal on successful login
        });

        return () => {
            listener?.subscription?.unsubscribe?.();
        };
    }, []);

    const handleShowAuth = (tab: AuthTab) => {
        setAuthTab(tab);
        setShowAuth(true);
    };

    // ── Loading state ──
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-xl shadow-teal-900/50">
                        <Loader2 size={26} className="text-white animate-spin" />
                    </div>
                    <p className="text-slate-400 text-sm font-medium">Cargando VPO Digital...</p>
                </div>
            </div>
        );
    }

    // ── Unauthenticated ──
    if (!session) {
        return (
            <>
                <LandingPage onShowAuth={handleShowAuth} />
                {showAuth && (
                    <AuthModal onClose={() => setShowAuth(false)} />
                )}
            </>
        );
    }

    // ── Authenticated → render app ──
    return <>{children}</>;
};
