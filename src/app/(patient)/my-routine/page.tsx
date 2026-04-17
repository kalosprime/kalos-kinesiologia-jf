'use client';

import { Dumbbell, PlayCircle, Activity, ClipboardList, Clock, Flame } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface RoutineItem {
  id: string;
  name: string;
  series: number;
  reps: string;
  description?: string | null;
}

export default function MyRoutinePage() {
  const [routine, setRoutine] = useState<RoutineItem[]>([]);
  const [routineName, setRoutineName] = useState('Mi Plan de Rehabilitación');
  const [loading, setLoading] = useState(true);

  const fetchRoutine = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) return;

      const { data: routines, error: routineError } = await supabase
        .from('Routine')
        .select(`
          id,
          name,
          RoutineItem (
            id,
            series,
            reps,
            Exercise ( name, description )
          )
        `)
        .eq('patientId', user.id)
        .eq('isActive', true)
        .order('createdAt', { ascending: false });

      if (routineError) {
        console.error('Database error:', routineError);
        return;
      }

      if (routines && routines.length > 0) {
        setRoutineName(routines[0].name);
        const rawItems = routines[0].RoutineItem as unknown as Array<{ id: string, series: number, reps: string, Exercise: { name: string, description: string | null } | null }>;
        
        const items = rawItems.map(item => ({
          id: item.id,
          name: item.Exercise?.name || 'Ejercicio',
          series: item.series,
          reps: item.reps,
          description: item.Exercise?.description
        }));
        setRoutine(items);
      }
    } catch (err) {
      console.error('Error loading routine:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoutine();
  }, [fetchRoutine]);

  if (loading) return (
    <div className="min-h-[80vh] flex items-center justify-center text-emerald-500 font-bold flex-col gap-4">
      <Activity className="animate-spin" size={32} />
      <p className="text-xs tracking-[0.2em] uppercase text-white">Cargando tu entrenamiento...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <header className="relative">
        <div className="flex items-center gap-2 text-emerald-500 font-bold text-[10px] uppercase tracking-[0.4em] mb-3">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
          Rutina Personalizada
        </div>
        <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">{routineName}</h1>
        <div className="flex gap-4 mt-6">
           <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/5 flex items-center gap-2">
              <Clock size={14} className="text-emerald-500" />
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">45-60 MIN</span>
           </div>
           <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/5 flex items-center gap-2">
              <Flame size={14} className="text-orange-500" />
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Intensidad Media</span>
           </div>
        </div>
      </header>

      <div className="pb-24">
        {routine.length === 0 ? (
          <div className="bg-[#111] p-16 rounded-[3rem] border border-white/5 text-center flex flex-col items-center">
             <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                <ClipboardList size={40} className="text-slate-800" strokeWidth={1} />
             </div>
             <p className="font-bold text-slate-400 text-lg">No hay ejercicios asignados</p>
             <p className="text-slate-600 text-sm mt-2 max-w-[250px]">Tu plan de rehabilitación aparecerá aquí apenas sea asignado por tu kinesiólogo.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {routine.map((ex, i) => (
              <div 
                key={ex.id} 
                className="bg-[#111] aspect-square sm:aspect-auto sm:min-h-[220px] rounded-[2.5rem] border border-white/5 p-8 flex flex-col justify-between group hover:border-emerald-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/5 relative overflow-hidden"
              >
                {/* Badge de Orden */}
                <div className="absolute top-6 right-8 text-4xl font-black text-white/5 group-hover:text-emerald-500/10 transition-colors">
                  {i + 1 < 10 ? `0${i + 1}` : i + 1}
                </div>

                <div className="relative z-10">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-6 group-hover:scale-110 transition-transform duration-500">
                    <Dumbbell size={24} />
                  </div>
                  <h3 className="font-black text-white text-xl uppercase leading-tight tracking-tighter group-hover:text-emerald-400 transition-colors">
                    {ex.name}
                  </h3>
                </div>

                <div className="mt-8 flex items-end justify-between relative z-10">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black text-white tracking-tighter">{ex.series}</span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Series</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-emerald-500 tracking-tighter">{ex.reps}</span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Reps</span>
                    </div>
                  </div>
                  
                  <button className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center text-white hover:bg-emerald-500 hover:text-black transition-all group-hover:shadow-lg group-hover:shadow-emerald-500/20">
                    <PlayCircle size={28} />
                  </button>
                </div>

                {/* Overlay sutil para el efecto de cuadrícula */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
