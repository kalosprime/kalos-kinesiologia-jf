'use client';

import { CalendarClock, Dumbbell, CheckCircle2, PlayCircle, Activity, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface RoutineItem {
  id: string;
  name: string;
  series: number;
  reps: string;
}

interface Session {
  date: string;
  time: string;
  professionalName: string;
}

export default function PatientDashboard() {
  const [userName, setUserName] = useState('Paciente');
  const [loading, setLoading] = useState(true);
  
  const [routine] = useState<RoutineItem[]>([]);
  const [nextSession, setNextSession] = useState<Session | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      if (user.user_metadata?.full_name) {
        setUserName(user.user_metadata.full_name.split(' ')[0]);
      }

      // Buscar el último turno
      const { data: apts, error } = await supabase
        .from('Appointment')
        .select(`
          date,
          notes,
          User!Appointment_professionalId_fkey ( name )
        `)
        .eq('patientId', user.id)
        .order('createdAt', { ascending: false })
        .limit(1);

      if (error) console.error('Error fetching patient appointment:', error);

      if (apts && apts.length > 0) {
        const apt = apts[0];
        const match = apt.notes?.match(/Turno agendado: (.*) a las (.*)/);
        
        // Manejar si User es objeto o arreglo
        const userData = Array.isArray(apt.User) ? apt.User[0] : apt.User;
        
        setNextSession({
          date: match ? match[1] : new Date(apt.date).toLocaleDateString(),
          time: match ? match[2] : 'Por definir',
          professionalName: (userData as { name: string })?.name || 'Tu Kinesiólogo'
        });
      }
      
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-purple-600"><Activity className="animate-spin" /></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Saludo */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Hola, {userName} 👋</h1>
        <p className="text-slate-500 mt-2">Aquí tienes tu plan de rehabilitación.</p>
      </div>

      {/* Próximo Turno */}
      {nextSession ? (
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-[2rem] p-6 text-white shadow-lg shadow-purple-500/20 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-purple-100 font-medium mb-1">Próxima Sesión</p>
              <h2 className="text-2xl font-bold mb-4">{nextSession.date}</h2>
              <div className="flex items-center gap-2 bg-white/20 w-fit px-4 py-2 rounded-xl backdrop-blur-md">
                <CalendarClock size={18} className="text-purple-100" />
                <span className="font-bold">{nextSession.time}</span>
              </div>
            </div>
          </div>
          <p className="mt-6 text-sm text-purple-100 flex items-center gap-2">
            👨‍⚕️ Kinesiólogo: <span className="font-bold text-white">{nextSession.professionalName}</span>
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
            <CalendarClock size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Sin turnos próximos</h2>
          <p className="text-slate-500 mt-2 text-sm mb-6">Tu kinesiólogo aún no ha programado tu próxima sesión.</p>
          <Link href="/book" className="bg-purple-50 text-purple-700 hover:bg-purple-100 px-6 py-3 rounded-xl font-bold transition-all inline-flex items-center gap-2">
            <Plus size={18} /> Agendar un Turno
          </Link>
        </div>
      )}

      {/* Rutina Asignada */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Dumbbell className="text-purple-500" /> Mi Rutina de Hoy
          </h2>
          <span className="text-xs font-bold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
            {routine.length} Ejercicios
          </span>
        </div>

        <div className="space-y-4">
          {routine.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center flex flex-col items-center">
               <Dumbbell size={48} className="text-slate-200 mb-4" strokeWidth={1} />
               <p className="font-bold text-slate-700">No hay rutina asignada</p>
               <p className="text-slate-500 text-sm mt-1">Pronto tu profesional te asignará los ejercicios.</p>
            </div>
          ) : (
            routine.map((ex, i) => (
              <div key={ex.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center font-bold text-slate-400">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800">{ex.name}</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {ex.series} series • {ex.reps}
                  </p>
                </div>
                <button className="w-10 h-10 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-full flex items-center justify-center transition-colors">
                  <PlayCircle size={24} />
                </button>
              </div>
            ))
          )}
        </div>

        {routine.length > 0 && (
          <button className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-2xl font-bold shadow-md shadow-purple-600/20 transition-all flex items-center justify-center gap-2">
            <CheckCircle2 size={20} /> Marcar rutina completada
          </button>
        )}
      </div>
    </div>
  );
}
