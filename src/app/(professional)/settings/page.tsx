'use client';

import { useState, useEffect } from 'react';
import { Save, Calendar as CalendarIcon, Settings, User as UserIcon, Activity } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface DaySchedule {
  active: boolean;
  start: string;
  end: string;
}

export default function ProfessionalSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  const [specialty, setSpecialty] = useState('');
  const [duration, setDuration] = useState('45');
  
  const [schedule, setSchedule] = useState<Record<string, DaySchedule>>({
    monday: { active: true, start: '09:00', end: '18:00' },
    tuesday: { active: true, start: '09:00', end: '18:00' },
    wednesday: { active: true, start: '09:00', end: '18:00' },
    thursday: { active: true, start: '09:00', end: '18:00' },
    friday: { active: true, start: '09:00', end: '18:00' },
    saturday: { active: false, start: '09:00', end: '13:00' },
    sunday: { active: false, start: '09:00', end: '13:00' }
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('User').select('specialty, schedule').eq('id', user.id).single();
        if (data) {
          if (data.specialty) setSpecialty(data.specialty);
          if (data.schedule) {
            const savedSched = data.schedule as { complex?: Record<string, DaySchedule>, duration?: number };
            if (savedSched.complex) {
              setSchedule(savedSched.complex);
            }
            if (savedSched.duration) setDuration(savedSched.duration.toString());
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

    const finalSchedule = {
      complex: schedule,
      duration: parseInt(duration)
    };

    const { error } = await supabase.from('User').update({
      specialty: specialty,
      schedule: finalSchedule,
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

  const updateDay = (day: string, field: keyof DaySchedule, value: string | boolean) => {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-teal-600"><Activity className="animate-spin" /></div>;

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
          <p className="text-slate-500 mt-2">Ajusta tu perfil y horarios de atención personalizados por día.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-teal-200 hover:bg-teal-300 text-teal-900 px-8 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-sm disabled:opacity-50"
        >
          <Save size={20} /> {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </header>

      {message && (
        <div className={`p-4 rounded-xl font-bold text-center ${message.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
          {message}
        </div>
      )}

      {/* Perfil */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-4">
          <UserIcon className="text-teal-500" /> Perfil Profesional
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Mi Especialidad</label>
            <input 
              type="text" 
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              placeholder="Ej: Kinesiólogo Deportivo" 
              className="w-full bg-slate-50 border-none p-4 rounded-2xl text-slate-800 outline-none focus:ring-2 ring-teal-200 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Duración de Turno</label>
            <select 
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-slate-50 border-none p-4 rounded-2xl text-slate-800 font-bold outline-none focus:ring-2 ring-teal-200"
            >
              <option value="30">30 Minutos</option>
              <option value="45">45 Minutos</option>
              <option value="60">1 Hora</option>
            </select>
          </div>
        </div>
      </div>

      {/* Agenda Detallada */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-4">
          <CalendarIcon className="text-teal-500" /> Mi Agenda Semanal
        </h2>
        
        <div className="space-y-4">
          {dayNames.map(day => (
            <div key={day.key} className={`p-6 rounded-3xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${schedule[day.key].active ? 'bg-teal-50/30 border-teal-100' : 'bg-slate-50/50 border-slate-100 opacity-60'}`}>
              <div className="flex items-center gap-4 min-w-[120px]">
                <input 
                  type="checkbox" 
                  checked={schedule[day.key].active}
                  onChange={(e) => updateDay(day.key, 'active', e.target.checked)}
                  className="w-6 h-6 rounded-lg accent-teal-500 cursor-pointer"
                />
                <span className={`font-bold ${schedule[day.key].active ? 'text-teal-900' : 'text-slate-400'}`}>{day.label}</span>
              </div>

              {schedule[day.key].active && (
                <div className="flex items-center gap-4 animate-in slide-in-from-left-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Desde</span>
                    <input 
                      type="time" 
                      value={schedule[day.key].start}
                      onChange={(e) => updateDay(day.key, 'start', e.target.value)}
                      className="bg-white border-none p-2 rounded-xl text-sm font-bold text-teal-800 shadow-sm outline-none focus:ring-2 ring-teal-200"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Hasta</span>
                    <input 
                      type="time" 
                      value={schedule[day.key].end}
                      onChange={(e) => updateDay(day.key, 'end', e.target.value)}
                      className="bg-white border-none p-2 rounded-xl text-sm font-bold text-teal-800 shadow-sm outline-none focus:ring-2 ring-teal-200"
                    />
                  </div>
                </div>
              )}
              
              {!schedule[day.key].active && (
                <span className="text-sm italic text-slate-400">No laborable</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
