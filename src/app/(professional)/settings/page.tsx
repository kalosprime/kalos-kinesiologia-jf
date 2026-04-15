'use client';

import { useState, useEffect } from 'react';
import { Save, Clock, Calendar as CalendarIcon, Settings, User as UserIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ProfessionalSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  const [specialty, setSpecialty] = useState('');
  const [duration, setDuration] = useState('45');
  
  const [days, setDays] = useState<Record<string, boolean>>({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false
  });

  const [hours, setHours] = useState({
    start: '09:00',
    end: '18:00'
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('User').select('specialty, schedule').eq('id', user.id).single();
        if (data) {
          if (data.specialty) setSpecialty(data.specialty);
          if (data.schedule) {
            // Formato JSON: { days: { ... }, hours: { start, end }, duration: 45 }
            const sched = data.schedule as Record<string, unknown>;
            if (sched.days) setDays(sched.days as Record<string, boolean>);
            if (sched.hours) setHours(sched.hours as {start: string, end: string});
            if (sched.duration) setDuration(String(sched.duration));
          }
        }
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const scheduleObj = {
      days,
      hours,
      duration: parseInt(duration)
    };

    const { error } = await supabase.from('User').update({
      specialty: specialty,
      schedule: scheduleObj,
      updatedAt: new Date().toISOString()
    }).eq('id', user.id);

    if (error) {
      setMessage('Error al guardar: ' + error.message);
    } else {
      setMessage('¡Configuración guardada con éxito!');
    }
    
    setSaving(false);
    setTimeout(() => setMessage(''), 3000);
  };

  if (loading) {
    return <div className="text-center text-teal-600 animate-pulse mt-10">Cargando configuración...</div>;
  }

  const dayNames = [
    { key: 'monday', label: 'Lunes' },
    { key: 'tuesday', label: 'Martes' },
    { key: 'wednesday', label: 'Miércoles' },
    { key: 'thursday', label: 'Jueves' },
    { key: 'friday', label: 'Viernes' },
    { key: 'saturday', label: 'Sábado' },
    { key: 'sunday', label: 'Domingo' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <Settings className="text-teal-600" /> Configuración
          </h1>
          <p className="text-slate-500 mt-2">Ajusta tu perfil y horarios de atención para los turnos.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-teal-200 hover:bg-teal-300 text-teal-900 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-sm disabled:opacity-50"
        >
          <Save size={20} /> {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </header>

      {message && (
        <div className={`p-4 rounded-xl font-bold text-center ${message.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Perfil */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-4">
            <UserIcon className="text-teal-500" /> Mi Perfil Público
          </h2>
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Especialidad</label>
            <input 
              type="text" 
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              placeholder="Ej: Kinesiólogo Deportivo" 
              className="w-full bg-slate-50 border-none p-4 rounded-2xl text-slate-800 outline-none focus:ring-2 ring-teal-200 transition-all"
            />
            <p className="text-xs text-slate-400 mt-1 ml-1">Esto es lo que verán los pacientes al sacar un turno.</p>
          </div>
        </div>

        {/* Horarios */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-4">
            <Clock className="text-teal-500" /> Horarios de Atención
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Hora Inicio</label>
              <input 
                type="time" 
                value={hours.start}
                onChange={(e) => setHours({ ...hours, start: e.target.value })}
                className="w-full bg-slate-50 border-none p-4 rounded-2xl text-slate-800 font-bold outline-none focus:ring-2 ring-teal-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Hora Fin</label>
              <input 
                type="time" 
                value={hours.end}
                onChange={(e) => setHours({ ...hours, end: e.target.value })}
                className="w-full bg-slate-50 border-none p-4 rounded-2xl text-slate-800 font-bold outline-none focus:ring-2 ring-teal-200"
              />
            </div>
          </div>

          <div className="space-y-2 pt-4">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Duración por Turno (Minutos)</label>
            <select 
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-slate-50 border-none p-4 rounded-2xl text-slate-800 font-bold outline-none focus:ring-2 ring-teal-200"
            >
              <option value="30">30 Minutos</option>
              <option value="45">45 Minutos</option>
              <option value="60">1 Hora (60 Minutos)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Días de Trabajo */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-4">
          <CalendarIcon className="text-teal-500" /> Días Laborales
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {dayNames.map(day => (
            <div 
              key={day.key}
              onClick={() => setDays({ ...days, [day.key]: !days[day.key] })}
              className={`p-4 rounded-2xl text-center font-bold cursor-pointer transition-all active:scale-95 ${
                days[day.key] 
                  ? 'bg-teal-500 text-white shadow-md border-teal-500' 
                  : 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-teal-50 hover:text-teal-600'
              }`}
            >
              {day.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
