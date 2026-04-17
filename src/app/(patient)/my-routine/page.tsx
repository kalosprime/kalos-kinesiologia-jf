'use client';

import { Dumbbell, PlayCircle, Activity, ChevronRight, ClipboardList } from 'lucide-react';
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
      const { data: { user } } = await supabase.auth.getUser();
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

  if (loading) return <div className="min-h-[80vh] flex items-center justify-center text-emerald-500 font-bold flex-col gap-4">
    <Activity className="animate-spin" size={32} />
    <p className="text-xs tracking-[0.2em] uppercase text-white">Cargando ejercicios...</p>
  </div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header>
        <div className="flex items-center gap-2 text-emerald-500 font-bold text-[10px] uppercase tracking-[0.3em] mb-2">
          <Dumbbell size={12} /> Entrenamiento Activo
        </div>
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase">{routineName}</h1>
      </header>

      <div className="space-y-4 pb-20">
        {routine.length === 0 ? (
          <div className="bg-[#111] p-12 rounded-[2.5rem] border border-white/5 text-center flex flex-col items-center">
             <ClipboardList size={48} className="text-slate-800 mb-4" strokeWidth={1} />
             <p className="font-bold text-slate-500">No hay ejercicios asignados todavía</p>
             <p className="text-slate-600 text-xs mt-1">Tu kinesiólogo está preparando tu plan.</p>
          </div>
        ) : (
          routine.map((ex, i) => (
            <div key={ex.id} className="bg-[#111] rounded-[2rem] border border-white/5 overflow-hidden group hover:border-emerald-500/30 transition-all">
              <div className="p-6 flex items-center gap-5">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center font-black text-slate-500 group-hover:text-emerald-500 group-hover:bg-emerald-500/10 transition-all text-xl">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-lg uppercase tracking-tight">{ex.name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{ex.series} SERIES</span>
                    <span className="w-1 h-1 bg-slate-800 rounded-full"></span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{ex.reps} REPS</span>
                  </div>
                </div>
                <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-slate-600">
                  <PlayCircle size={24} />
                </div>
              </div>
              {ex.description && (
                <div className="px-6 pb-6 pt-0">
                  <p className="text-xs text-slate-500 leading-relaxed bg-black/40 p-4 rounded-xl border border-white/5 italic">
                    &ldquo;{ex.description}&rdquo;
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
