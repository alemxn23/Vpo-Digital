import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { Users, Search, ShieldCheck, Award, TrendingUp, Gift, DollarSign, Check, X } from 'lucide-react';

interface UserProfile {
  id: string;
  full_name: string | null;
  cedula_profesional: string | null;
  plan_type: string;
  paid_credits: number;
  free_vpos_used_today: number;
  last_vpo_date: string | null;
  created_at?: string;
}

interface PaymentInfo {
  count: number;
  total_mxn: number;
}

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [paymentsInfo, setPaymentsInfo] = useState<Record<string, PaymentInfo>>({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Inline action states to prevent prompt/confirm blocking UI
  const [editingCreditsId, setEditingCreditsId] = useState<string | null>(null);
  const [creditsInput, setCreditsInput] = useState<string>('');
  
  const [confirmVipId, setConfirmVipId] = useState<string | null>(null);
  const [confirmResetId, setConfirmResetId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();

    if (!supabase) return;
    const channel = supabase
      .channel('admin_profiles_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchUsers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchUsers = async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('id', { ascending: false });

      if (!error && data) {
        setUsers(data as UserProfile[]);

        // Fetch payments for all users to show purchase info
        const { data: payData, error: payError } = await supabase
          .from('stripe_payments')
          .select('user_id, amount_total');
          
        if (!payError && payData) {
           const info: Record<string, PaymentInfo> = {};
           payData.forEach((p: any) => {
               if (!p.user_id) return;
               if (!info[p.user_id]) info[p.user_id] = { total_mxn: 0, count: 0 };
               info[p.user_id].count += 1;
               info[p.user_id].total_mxn += (p.amount_total || 0) / 100;
           });
           setPaymentsInfo(info);
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const executeToggleVIP = async (userId: string, currentPlan: string) => {
    if (!supabase) return;
    const newPlan = currentPlan === 'unlimited' ? 'free' : 'unlimited';
    setConfirmVipId(null);
    await supabase.from('profiles').update({ plan_type: newPlan }).eq('id', userId);
    fetchUsers();
  };

  const executeAddCredits = async (userId: string, currentCredits: number) => {
    if (!supabase) return;
    const amount = Number(creditsInput);
    if (!isNaN(amount)) {
      const newCredits = Math.max(0, currentCredits + amount);
      await supabase.from('profiles').update({ paid_credits: newCredits }).eq('id', userId);
      fetchUsers();
    }
    setEditingCreditsId(null);
  };

  const executeResetVpo = async (userId: string) => {
    if (!supabase) return;
    setConfirmResetId(null);
    await supabase.from('profiles').update({ free_vpos_used_today: 0 }).eq('id', userId);
    fetchUsers();
  };

  const filteredUsers = users.filter(u => 
    (u.full_name || '').toLowerCase().includes(search.toLowerCase()) || 
    (u.cedula_profesional || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[600px] flex flex-col animate-fadeIn">
      {/* Header */}
      <div className="bg-clinical-navy p-5 text-white">
        <div className="flex items-center gap-3">
           <ShieldCheck size={24} className="text-blue-300" />
           <div>
             <h2 className="font-black text-xl leading-none">Panel de Administrador</h2>
             <p className="text-blue-200 text-xs font-bold mt-1">Base de datos de usuarios y compras</p>
           </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/10 rounded-xl p-3 border border-white/10">
            <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">Usuarios</p>
            <p className="text-2xl font-black">{users.length}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 border border-white/10">
            <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">VIPs</p>
            <p className="text-2xl font-black text-amber-400">
              {users.filter(u => u.plan_type === 'unlimited').length}
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 border border-white/10">
            <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">Créditos</p>
            <p className="text-2xl font-black text-emerald-400">
              {users.reduce((acc, u) => acc + (u.paid_credits || 0), 0)}
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 border border-white/10">
            <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">Ingresos MXN</p>
            <p className="text-2xl font-black text-green-300">
              ${(Object.values(paymentsInfo) as PaymentInfo[]).reduce((acc, curr) => acc + curr.total_mxn, 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="relative w-full max-w-sm flex items-center">
          <Search size={16} className="absolute left-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o cédula..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-clinical-navy focus:ring-1 focus:ring-clinical-navy"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto bg-slate-50">
        {loading ? (
          <div className="flex justify-center p-10"><p className="text-slate-400 text-sm font-bold animate-pulse">Cargando base de datos...</p></div>
        ) : (
          <table className="w-full text-left text-sm border-collapse">
            <thead className="sticky top-0 bg-slate-100 text-slate-500 font-bold uppercase text-[10px] tracking-widest outline outline-1 outline-slate-200 z-10">
              <tr>
                <th className="px-4 py-3">Usuario / Médico</th>
                <th className="px-4 py-3 text-center">Compras</th>
                <th className="px-4 py-3 text-center">Plan</th>
                <th className="px-4 py-3 text-center">Créditos</th>
                <th className="px-4 py-3 text-center">VPO Hoy</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map(user => {
                const userPays = paymentsInfo[user.id] || { count: 0, total_mxn: 0 };
                return (
                <tr key={user.id} className="bg-white hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-bold text-slate-800">{user.full_name || 'Sin Nombre'}</p>
                    <p className="text-[10px] text-slate-500">{user.cedula_profesional ? `Cédula: ${user.cedula_profesional}` : 'ID: ' + user.id.slice(0,8)}...</p>
                    <p className="text-[9px] text-slate-400">{user.created_at ? new Date(user.created_at).toLocaleDateString() : ''}</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-col items-center justify-center">
                       <span className="font-black text-emerald-600 text-sm">{userPays.count} compras</span>
                       <span className="text-[10px] font-bold text-slate-400">${userPays.total_mxn} MXN</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {confirmVipId === user.id ? (
                      <div className="flex flex-col gap-1 items-center">
                        <span className="text-[10px] font-bold text-red-500">¿Confirmar?</span>
                        <div className="flex gap-1">
                          <button onClick={() => executeToggleVIP(user.id, user.plan_type)} className="p-1 rounded bg-red-100 text-red-600 hover:bg-red-200"><Check size={12}/></button>
                          <button onClick={() => setConfirmVipId(null)} className="p-1 rounded bg-slate-100 text-slate-500 hover:bg-slate-200"><X size={12}/></button>
                        </div>
                      </div>
                    ) : (
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${
                        user.plan_type === 'unlimited' 
                        ? 'bg-amber-100 text-amber-800 border-amber-200' 
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {user.plan_type === 'unlimited' ? <><Award size={12}/> VIP</> : 'Estándar'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {editingCreditsId === user.id ? (
                      <div className="flex flex-col gap-1 items-center">
                        <input 
                          type="number" 
                          placeholder="+ / -"
                          className="w-14 text-center text-xs border border-slate-300 rounded p-1 text-slate-800"
                          value={creditsInput}
                          onChange={e => setCreditsInput(e.target.value)}
                        />
                        <div className="flex gap-1">
                          <button onClick={() => executeAddCredits(user.id, user.paid_credits || 0)} className="p-1 rounded bg-emerald-100 text-emerald-600 hover:bg-emerald-200"><Check size={12}/></button>
                          <button onClick={() => setEditingCreditsId(null)} className="p-1 rounded bg-slate-100 text-slate-500 hover:bg-slate-200"><X size={12}/></button>
                        </div>
                      </div>
                    ) : (
                      <span className="font-black text-clinical-navy text-lg">{user.paid_credits || 0}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {confirmResetId === user.id ? (
                      <div className="flex flex-col gap-1 items-center">
                        <span className="text-[10px] font-bold text-blue-500">¿Reiniciar?</span>
                        <div className="flex gap-1">
                          <button onClick={() => executeResetVpo(user.id)} className="p-1 rounded bg-blue-100 text-blue-600 hover:bg-blue-200"><Check size={12}/></button>
                          <button onClick={() => setConfirmResetId(null)} className="p-1 rounded bg-slate-100 text-slate-500 hover:bg-slate-200"><X size={12}/></button>
                        </div>
                      </div>
                    ) : (
                      <span className={`text-[11px] font-bold ${user.free_vpos_used_today >= 1 ? 'text-red-500' : 'text-emerald-500'}`}>
                        {user.free_vpos_used_today >= 1 ? 'Agotado' : 'Disponible'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 flex items-center justify-end gap-2">
                    <button
                      onClick={() => setConfirmVipId(user.id)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        user.plan_type === 'unlimited' 
                        ? 'border-red-200 text-red-600 hover:bg-red-50' 
                        : 'border-amber-200 text-amber-600 hover:bg-amber-50'
                      }`}
                      title="Alternar Plan VIP"
                    >
                      <Award size={16} />
                    </button>
                    <button
                      onClick={() => { setEditingCreditsId(user.id); setCreditsInput(''); }}
                      className="p-1.5 rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50 transition-colors"
                      title="Agregar o quitar créditos"
                    >
                      <TrendingUp size={16} />
                    </button>
                    <button
                      onClick={() => setConfirmResetId(user.id)}
                      className="p-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Reiniciar VPO Diario"
                    >
                      <Gift size={16} />
                    </button>
                  </td>
                </tr>
              )})}
              {filteredUsers.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400 text-sm">No se encontraron usuarios</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
