'use client';

import { CalendarClock, Dumbbell, CheckCircle2, PlayCircle, Activity, Plus, XCircle } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface RoutineItem {
  id: string;
  name: string;
  series: number;
  reps: string;
}

interface Session {
  id: string;
  date: string;
  time: string;
  professionalName: string;
}

export default function PatientDashboard() {
  const [userName, setUserName] = useState('Paciente');
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  
  const [routine, setRoutine] = useState<RoutineItem[]>([]);
  const [nextSession, setNextSession] = useState<Session | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    if (user.user_metadata?.full_name) {
      setUserName(user.user_metadata.full_name.split(' ')[0]);
    }

    // 1. Buscar el último turno PENDIENTE
    const { data: apts } = await supabase
      .from('Appointment')
      .select(`
        id,
        date,
        notes,
        User!Appointment_professionalId_fkey ( name )
      `)
      .eq('patientId', user.id)
      .eq('status', 'PENDIENTE')
      .order('createdAt', { ascending: false })
      .limit(1);

    if (apts && apts.length > 0) {
      const apt = apts[0];
      const match = apt.notes?.match(/Turno agendado: (.*) a las (.*)/);
      const userData = Array.isArray(apt.User) ? apt.User[0] : apt.User;
      
      setNextSession({
        id: apt.id,
        date: match ? match[1] : new Date(apt.date).toLocaleDateString(),
        time: match ? match[2] : 'Por definir',
        professionalName: (userData as { name?: string })?.name || 'Tu Kinesiólogo'
      });
    } else {
      setNextSession(null);
    }

    // 2. Buscar la rutina activa
    const { data: routines } = await supabase
      .from('Routine')
      .select(`
        id,
        RoutineItem (
          id,
          series,
          reps,
          Exercise ( name )
        )
      `)
      .eq('patientId', user.id)
      .eq('isActive', true)
      .order('createdAt', { ascending: false })
      .limit(1);

    if (routines && routines.length > 0) {
      const activeRoutine = routines[0];
      const rawItems = activeRoutine.RoutineItem as unknown as Array<{ id: string, series: number, reps: string, Exercise: { name: string } | null }>;
      
      const items = rawItems.map(item => ({
        id: item.id,
        name: item.Exercise?.name || 'Ejercicio',
        series: item.series,
        reps: item.reps
      }));
      setRoutine(items);
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    const load = async () => {
      await fetchData();
    };
    load();
  }, [fetchData]);

  const handleCancel = async () => {
    if (!nextSession || !confirm('¿Estás seguro de que deseas cancelar este turno?')) return;
    
    setCancelling(true);
    const { error } = await supabase
      .from('Appointment')
      .update({ status: 'CANCELADO' })
      .eq('id', nextSession.id);

    if (!error) {
      fetchData();
    } else {
      alert('Error al cancelar: ' + error.message);
    }
    setCancelling(false);
  };

  if (loading && !cancelling) {
    return <div className="min-h-[80vh] flex items-center justify-center text-emerald-500 font-bold flex-col gap-4">
      <Activity className="animate-spin" size={32} />
      <p className="text-xs tracking-[0.2em] uppercase">Preparando tu sesión...</p>
    </div>;
  }

  return (
    <div className="space-y-10">
      {/* Saludo Elite */}
      <div>
        <div className="flex items-center gap-2 text-emerald-500 font-bold text-[10px] uppercase tracking-[0.3em] mb-2">
          <Activity size={12} /> Plan de Alto Rendimiento
        </div>
        <h1 className="text-4xl font-black text-white tracking-tighter">Hola, {userName}</h1>
        <p className="text-slate-500 mt-2 font-medium">Tu progreso es nuestra prioridad.</p>
      </div>

      {/* Próximo Turno Premium */}
      {nextSession ? (
        <div className="bg-[#111] rounded-[2.5rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden group border-l-4 border-l-emerald-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-[100px] -z-0"></div>
          <div className="flex items-start justify-between relative z-10">
            <div className="space-y-6">
              <div>
                <p className="text-emerald-500 font-black text-[10px] uppercase tracking-[0.2em] mb-4">Próxima Sesión</p>
                <h2 className="text-3xl font-black text-white">{nextSession.date}</h2>
              </div>
              <div className="flex items-center gap-2 bg-emerald-500 text-black w-fit px-6 py-3 rounded-2xl font-black shadow-lg shadow-emerald-500/20">
                <CalendarClock size={20} />
                <span>{nextSession.time}</span>
              </div>
            </div>
            <button 
              onClick={handleCancel}
              disabled={cancelling}
              className="w-12 h-12 bg-white/5 hover:bg-red-500/20 rounded-2xl flex items-center justify-center transition-all text-slate-500 hover:text-red-500 border border-white/5"
            >
              <XCircle size={24} />
            </button>
          </div>
          <p className="mt-8 text-sm text-slate-500 font-bold flex items-center gap-2 pt-6 border-t border-white/5">
            KINESIÓLOGO: <span className="text-white uppercase tracking-wider">{nextSession.professionalName}</span>
          </p>
        </div>
      ) : (
        <div className="bg-[#111] rounded-[2.5rem] p-10 border border-white/5 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 text-slate-600">
            <CalendarClock size={40} strokeWidth={1} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Sin turnos agendados</h2>
          <p className="text-slate-500 text-sm mb-8 max-w-[200px]">Agenda tu próxima sesión para continuar tu progreso.</p>
          <Link href="/book" className="bg-emerald-500 hover:bg-emerald-400 text-black px-10 py-4 rounded-2xl font-black transition-all shadow-lg shadow-emerald-500/10 active:scale-95 flex items-center gap-2">
            <Plus size={20} strokeWidth={3} /> AGENDAR TURNO
          </Link>
        </div>
      )}

      {/* Rutina de Entrenamiento Pro */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <Dumbbell className="text-emerald-500" /> Mi Rutina
          </h2>
          <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-4 py-1.5 rounded-full uppercase tracking-widest border border-emerald-500/20">
            {routine.length} Ejercicios
          </span>
        </div>

        <div className="space-y-4">
          {routine.length === 0 ? (
            <div className="bg-[#111] p-12 rounded-[2.5rem] border border-white/5 text-center flex flex-col items-center">
               <Dumbbell size={48} className="text-slate-800 mb-4" strokeWidth={1} />
               <p className="font-bold text-slate-500">No hay ejercicios asignados</p>
               <p className="text-slate-600 text-xs mt-1">Pronto recibirás tu plan personalizado.</p>
            </div>
          ) : (
            routine.map((ex, i) => (
              <div key={ex.id} className="bg-[#111] p-6 rounded-3xl border border-white/5 flex items-center gap-5 hover:border-emerald-500/30 transition-all group">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center font-black text-slate-500 group-hover:text-emerald-500 group-hover:bg-emerald-500/10 transition-all text-xl">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-lg truncate uppercase tracking-tight">{ex.name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{ex.series} SERIES</span>
                    <span className="w-1 h-1 bg-slate-800 rounded-full"></span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{ex.reps} REPS</span>
                  </div>
                </div>
                <button className="w-12 h-12 bg-white/5 hover:bg-emerald-500 text-slate-400 hover:text-black rounded-full flex items-center justify-center transition-all shadow-inner">
                  <PlayCircle size={28} />
                </button>
              </div>
            ))
          )}
        </div>

        {routine.length > 0 && (
          <button className="w-full mt-6 bg-emerald-500 hover:bg-emerald-400 text-black p-5 rounded-2xl font-black shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-3 text-lg active:scale-95 uppercase tracking-tighter">
            <CheckCircle2 size={24} strokeWidth={3} /> Completar Entrenamiento
          </button>
        )}
      </div>
    </div>
  );
}
