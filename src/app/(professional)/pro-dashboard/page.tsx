'use client';

import { Users, Activity, Clock, Plus, Search, CalendarX, TrendingUp } from 'lucide-react';
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

        const loadedApts = (apts as unknown as Array<{ id: string, status: string, notes: string, date: string, Patient: { id: string, name: string } | Array<{ id: string, name: string }> | null }>).map((a, idx: number) => {
          const match = a.notes?.match(/Turno agendado: (.*) a las (.*)/);
          const pRaw = a.Patient;
          const patientData = Array.isArray(pRaw) ? pRaw[0] : pRaw;

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
            type: 'Sesión de Rehabilitación',
            status: currentStatus,
            color: currentStatus === 'COMPLETADO' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-400'
          };
        });

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
    return <div className="min-h-[60vh] flex items-center justify-center text-emerald-500 font-bold flex-col gap-4">
      <Activity className="animate-spin" size={32} />
      <p className="text-xs tracking-[0.2em] uppercase">Sincronizando Agenda...</p>
    </div>;
  }

  return (
    <div className="space-y-12">
      <header className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs uppercase tracking-[0.2em] mb-2">
            <TrendingUp size={14} /> Panel de Control
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Bienvenido, {userName}</h1>
          <p className="text-slate-500 mt-2 font-medium">Gestión de pacientes y monitoreo de rendimiento.</p>
        </div>
        <Link href="/patients/new" className="bg-emerald-500 hover:bg-emerald-400 text-black px-8 py-4 rounded-2xl font-black flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
          <Plus size={20} strokeWidth={3} /> NUEVO PACIENTE
        </Link>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Turnos Activos', val: stats.today, icon: <Clock />, color: 'bg-black text-emerald-500' },
          { label: 'Pacientes en Base', val: stats.activePatients, icon: <Users />, color: 'bg-white text-slate-800' },
          { label: 'Planes Creados', val: stats.routines, icon: <Activity />, color: 'bg-white text-slate-800' }
        ].map((stat, i) => (
          <div key={i} className={`${stat.color} p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:scale-[1.02] transition-transform`}>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2">{stat.label}</p>
              <p className="text-4xl font-black tracking-tighter">{stat.val}</p>
            </div>
            <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-500 group-hover:scale-110 transition-transform">
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Appointments Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Próximos Turnos</h2>
          <div className="flex items-center bg-white border border-slate-100 px-5 py-3 rounded-2xl w-72 shadow-sm focus-within:border-emerald-500 transition-all">
            <Search size={18} className="text-slate-300 mr-3" />
            <input type="text" placeholder="Buscar paciente..." className="bg-transparent outline-none text-sm text-slate-700 font-bold placeholder:text-slate-300 w-full" />
          </div>
        </div>
        
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-900/5 overflow-hidden">
          {appointments.length === 0 ? (
            <div className="p-20 text-center flex flex-col items-center justify-center text-slate-400">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <CalendarX size={40} className="text-slate-200" />
              </div>
              <p className="font-bold text-slate-600 text-lg">No hay sesiones para mostrar</p>
              <p className="text-sm mt-1 max-w-xs mx-auto">Tu agenda está limpia. Cuando un paciente reserve, aparecerá aquí.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {appointments.map((apt) => (
                <Link 
                  key={apt.id} 
                  href={`/patients/${apt.patientId}`}
                  className="flex items-center justify-between p-8 hover:bg-slate-50 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center font-black text-white text-xl shadow-lg shadow-black/10 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                      {apt.patient[0]}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-lg group-hover:text-emerald-600 transition-colors">{apt.patient}</h3>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">{apt.type}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-12">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                        <Clock size={16} />
                      </div>
                      <span className="text-lg font-black text-slate-700">{apt.time}</span>
                    </div>
                    <span className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${apt.color} border border-current opacity-80`}>
                      {apt.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
