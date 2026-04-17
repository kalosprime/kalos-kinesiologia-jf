'use client';

import { Search, ClipboardList, Activity, Activity as ActivityIcon } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface PatientRoutine {
  id: string;
  name: string;
  email: string | null;
  lastRoutineUpdate: string;
  activeRoutineName: string;
}

export default function RoutinesMonitorPage() {
  const [patients, setPatients] = useState<PatientRoutine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Obtenemos los pacientes y sus rutinas activas
        const { data, error } = await supabase
          .from('Patient')
          .select(`
            id,
            name,
            email,
            Routine (
              id,
              name,
              updatedAt,
              isActive
            )
          `)
          .eq('professionalId', user.id);

        if (error) throw error;

        if (data) {
          const loaded = (data as unknown as Array<{ id: string, name: string, email: string | null, Routine: Array<{ id: string, name: string, updatedAt: string, isActive: boolean }> | null }>).map((p) => {
            const activeRoutine = p.Routine?.find((r) => r.isActive);
            return {
              id: p.id,
              name: p.name,
              email: p.email,
              lastRoutineUpdate: activeRoutine ? new Date(activeRoutine.updatedAt).toLocaleDateString() : 'Sin rutina',
              activeRoutineName: activeRoutine ? activeRoutine.name : 'Pendiente de asignar'
            };
          });
          setPatients(loaded);
        }
      } catch (err) {
        console.error('Error loading routines:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = patients.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-emerald-500 font-bold flex-col gap-4">
    <ActivityIcon className="animate-spin" size={32} />
    <p className="text-xs tracking-[0.2em] uppercase">Cargando Planes...</p>
  </div>;

  return (
    <div className="space-y-12">
      <header>
        <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs uppercase tracking-[0.2em] mb-2">
          <Activity size={14} /> Monitor de Entrenamiento
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Gestión de Rutinas</h1>
        <p className="text-slate-500 mt-2 font-medium">Asigna y supervisa los planes de ejercicios de tus pacientes.</p>
      </header>

      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-3 w-full max-w-md focus-within:border-emerald-500 transition-all">
        <Search className="text-slate-300 ml-2" size={20} />
        <input 
          type="text" 
          placeholder="Buscar paciente para asignar rutina..." 
          className="flex-1 bg-transparent outline-none text-slate-700 font-bold placeholder:text-slate-300"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-400">
            <ClipboardList className="mx-auto mb-4 opacity-20" size={64} />
            <p className="font-bold">No se encontraron pacientes para rutinas</p>
          </div>
        ) : (
          filtered.map(p => (
            <div key={p.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-900/5 hover:border-emerald-500/30 transition-all group flex flex-col h-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center font-black text-emerald-500 shadow-lg">
                  {p.name[0]}
                </div>
                <div className="min-w-0">
                  <h3 className="font-black text-slate-900 truncate uppercase tracking-tight">{p.name}</h3>
                  <p className="text-[10px] text-slate-400 font-bold truncate">{p.email || 'Sin contacto'}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl mb-8 flex-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Estado del Plan</p>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${p.lastRoutineUpdate === 'Sin rutina' ? 'bg-orange-400' : 'bg-emerald-500'}`}></div>
                  <span className="font-bold text-slate-700 text-sm">{p.activeRoutineName}</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-4">ÚLTIMA ACTUALIZACIÓN: <span className="text-slate-900">{p.lastRoutineUpdate}</span></p>
              </div>

              <Link 
                href={`/patients/${p.id}?tab=rutina`}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black p-4 rounded-xl font-black text-xs uppercase tracking-widest text-center transition-all shadow-lg shadow-emerald-500/10 active:scale-95"
              >
                Actualizar Plan
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
