'use client';

import { User, Mail, LogOut, Activity, ShieldCheck, MapPin, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function PatientProfilePage() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserData(user);
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) return <div className="min-h-[80vh] flex items-center justify-center text-emerald-500 font-bold flex-col gap-4">
    <Activity className="animate-spin" size={32} />
    <p className="text-xs tracking-[0.2em] uppercase text-white">Cargando perfil...</p>
  </div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header>
        <div className="flex items-center gap-2 text-emerald-500 font-bold text-[10px] uppercase tracking-[0.3em] mb-2">
          <User size={12} /> Mi Cuenta
        </div>
        <h1 className="text-4xl font-black text-white tracking-tighter">PERFIL</h1>
      </header>

      <div className="space-y-6">
        {/* Info Card */}
        <div className="bg-[#111] rounded-[2.5rem] p-10 border border-white/5 shadow-2xl flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-black font-black text-2xl mb-6 shadow-lg shadow-emerald-500/20">
            {userData?.user_metadata?.full_name?.substring(0, 2).toUpperCase() || 'P'}
          </div>
          <h2 className="text-2xl font-bold text-white mb-1 uppercase tracking-tight">{userData?.user_metadata?.full_name || 'Paciente'}</h2>
          <p className="text-emerald-500 font-bold text-xs uppercase tracking-widest mb-8">Paciente Kalos JF</p>
          
          <div className="w-full space-y-4 pt-8 border-t border-white/5">
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl">
              <Mail className="text-slate-500" size={20} />
              <div className="text-left">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Email</p>
                <p className="text-sm font-bold text-slate-200">{userData?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl">
              <MapPin className="text-slate-500" size={20} />
              <div className="text-left">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Sede</p>
                <p className="text-sm font-bold text-slate-200">Kalos Principal</p>
              </div>
            </div>
          </div>
        </div>

        {/* Seguridad & Logout */}
        <div className="bg-[#111] rounded-[2.5rem] p-6 border border-white/5 space-y-3">
          <button className="w-full flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl transition-colors group">
            <div className="flex items-center gap-4">
              <ShieldCheck className="text-slate-500 group-hover:text-emerald-500 transition-colors" size={20} />
              <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">Seguridad de la cuenta</span>
            </div>
            <ChevronRight size={18} className="text-slate-700" />
          </button>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-4 hover:bg-red-500/10 rounded-2xl transition-colors group mt-4 border-t border-white/5 pt-8"
          >
            <LogOut className="text-red-500/60 group-hover:text-red-500 transition-colors" size={20} />
            <span className="text-sm font-black text-red-500/60 group-hover:text-red-500 transition-colors uppercase tracking-widest">Cerrar Sesión</span>
          </button>
        </div>
      </div>
      
      <p className="text-center text-slate-700 text-[10px] font-bold uppercase tracking-[0.3em] py-10">
        Versión 1.0.0 Pro • Kalos JF
      </p>
    </div>
  );
}
