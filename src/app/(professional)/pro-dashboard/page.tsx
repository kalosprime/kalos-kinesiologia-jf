'use client';

import { Users, Activity, Clock, Plus, Search, CalendarX } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Appointment {
  id: number;
  patient: string;
  time: string;
  type: string;
  status: string;
  color: string;
}

export default function ProfessionalDashboard() {
  const [userName, setUserName] = useState('Profesional');
  const [loading, setLoading] = useState(true);

  // Estados reales (vacíos para una cuenta nueva)
  const [appointments] = useState<Appointment[]>([]);
  const [stats] = useState({ today: 0, activePatients: 0, routines: 0 });

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.full_name) {
        setUserName(user.user_metadata.full_name.split(' ')[0]);
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-teal-600"><Activity className="animate-spin" /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">¡Hola, {userName}! 👋</h1>
          <p className="text-slate-500 mt-1">Aquí tienes el resumen de tu clínica hoy.</p>
        </div>
        <button className="bg-teal-200 hover:bg-teal-300 text-teal-900 px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 transition-all shadow-sm">
          <Plus size={20} /> Nuevo Turno
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-6 mb-10">
        {[
          { label: 'Turnos de Hoy', val: stats.today, icon: <Clock />, color: 'bg-teal-100' },
          { label: 'Pacientes Activos', val: stats.activePatients, icon: <Users />, color: 'bg-purple-100' },
          { label: 'Rutinas Creadas', val: stats.routines, icon: <Activity />, color: 'bg-orange-100' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`${stat.color} p-4 rounded-2xl`}>{stat.icon}</div>
            <div>
              <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-800">{stat.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Appointments Section */}
      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">Próximos Turnos</h2>
          <div className="flex items-center bg-slate-50 px-4 py-2 rounded-xl">
            <Search size={16} className="text-slate-400 mr-2" />
            <input type="text" placeholder="Buscar paciente..." className="bg-transparent outline-none text-sm text-slate-600" />
          </div>
        </div>
        
        <div className="p-0">
          {appointments.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center text-slate-400">
              <CalendarX size={48} strokeWidth={1} className="mb-4 text-slate-300" />
              <p className="font-bold text-slate-600">No tienes turnos programados</p>
              <p className="text-sm mt-1">Cuando agendes sesiones con tus pacientes, aparecerán aquí.</p>
            </div>
          ) : (
            appointments.map((apt) => (
              <div key={apt.id} className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors border-b last:border-0 border-slate-50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-bold text-slate-600">
                    {apt.patient[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{apt.patient}</h3>
                    <p className="text-xs text-slate-500 font-medium">{apt.type}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Clock size={16} />
                    <span className="text-sm font-semibold">{apt.time}</span>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${apt.color}`}>
                    {apt.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
