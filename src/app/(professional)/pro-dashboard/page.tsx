'use client';

import { Users, Activity, Clock, Plus, Search, CalendarX } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Appointment {
  id: string;
  patientId: string;
  patient: string;
  time: string;
  type: string;
  status: string;
  color: string;
}

export default function ProfessionalDashboard() {
  const [userName, setUserName] = useState('Profesional');
  const [loading, setLoading] = useState(true);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState({ today: 0, activePatients: 0, routines: 0 });

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      if (user.user_metadata?.full_name) {
        setUserName(user.user_metadata.full_name.split(' ')[0]);
      }

      // Obtener los turnos de este profesional
      const { data: apts, error } = await supabase
        .from('Appointment')
        .select(`
          id,
          date,
          status,
          notes,
          Patient!Appointment_patientId_fkey ( id, name )
        `)
        .eq('professionalId', user.id)
        .neq('status', 'CANCELADO')
        .order('createdAt', { ascending: false });

      if (error) console.error('Error fetching pro appointments:', error);

      if (apts) {
        const now = new Date();
        const toUpdate: string[] = [];

        const loadedApts = apts.map((a, idx: number) => {
          const match = a.notes?.match(/Turno agendado: (.*) a las (.*)/);
          const pRaw: unknown = Array.isArray(a.Patient) ? a.Patient[0] : a.Patient;
          const patientData = pRaw as { id: string, name: string } | null;

          // Lógica de Autocompletado:
          // Si el turno tiene fecha anterior a la actual y sigue pendiente, lo completamos.
          const aptDate = new Date(a.date);
          const isPast = aptDate < now;
          let currentStatus = a.status;

          if (a.status === 'PENDIENTE' && isPast) {
            toUpdate.push(a.id);
            currentStatus = 'COMPLETADO';
          }

          return {
            id: a.id || idx.toString(),
            patientId: patientData?.id || '',
            patient: patientData?.name || 'Paciente Nuevo',
            time: match ? match[2] : 'Sin horario',
            type: 'Consulta Inicial',
            status: currentStatus,
            color: currentStatus === 'COMPLETADO' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
          };
        });

        // Actualización silenciosa en la base de datos
        if (toUpdate.length > 0) {
          supabase.from('Appointment').update({ status: 'COMPLETADO' }).in('id', toUpdate).then();
        }

        setAppointments(loadedApts);
        setStats(prev => ({ ...prev, today: loadedApts.filter(a => a.status === 'PENDIENTE').length }));
      }

      setLoading(false);
    };
    fetchData();
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
        <Link href="/patients/new" className="bg-teal-200 hover:bg-teal-300 text-teal-900 px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 transition-all shadow-sm">
          <Plus size={20} /> Nuevo Paciente
        </Link>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-6 mb-10">
        {[
          { label: 'Turnos Activos', val: stats.today, icon: <Clock />, color: 'bg-teal-100' },
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
              <Link 
                key={apt.id} 
                href={`/patients/${apt.patientId}`}
                className="flex items-center justify-between p-6 hover:bg-teal-50/50 transition-colors border-b last:border-0 border-slate-50 cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-bold text-slate-600 text-lg uppercase">
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
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
