import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { Activity, ShieldCheck, Clock, FileText, Lock, Mail, Loader2, KeyRound } from 'lucide-react';

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
    // Bypassing AuthGuard as requested until polished
    return <>{children}</>;
};
