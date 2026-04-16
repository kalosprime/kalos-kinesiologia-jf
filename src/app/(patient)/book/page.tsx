'use client';

import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, ChevronRight, User, Clock, Activity, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface DaySchedule {
  active: boolean;
  start: string;
  end: string;
}

interface Pro {
  id: string;
  name: string;
  specialty: string | null;
  schedule: {
    complex?: Record<string, DaySchedule>;
    duration?: number;
  } | null;
}

export default function BookAppointmentPage() {
  const [step, setStep] = useState(1);
  const [selectedPro, setSelectedPro] = useState<Pro | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  const [professionals, setProfessionals] = useState<Pro[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingPros, setLoadingPros] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const fetchProfessionals = async () => {
      setLoadingPros(true);
      try {
        const { data, error } = await supabase.from('User').select('id, name, specialty, schedule');
        if (error) throw error;
        if (data) {
          setProfessionals(data as Pro[]);
        }
      } catch (err) {
        console.error('Error fetching professionals:', err);
      } finally {
        setLoadingPros(false);
      }
    };
    fetchProfessionals();
  }, []);

  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const fetchAvailableSlots = useCallback(async (pro: Pro, date: Date) => {
    setLoadingSlots(true);
    try {
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const config = pro.schedule?.complex?.[dayName];
      
      if (!config || !config.active) {
        setAvailableSlots([]);
        return;
      }

      // 1. Generar todos los slots posibles
      const slots = [];
      const [startH, startM] = config.start.split(':').map(Number);
      const [endH, endM] = config.end.split(':').map(Number);
      const duration = pro.schedule?.duration || 60;

      const current = new Date(date);
      current.setHours(startH, startM, 0, 0);
      const endTime = new Date(date);
      endTime.setHours(endH, endM, 0, 0);

      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();

      while (current < endTime) {
        // Solo agregamos el horario si no ha pasado (si es hoy) o si es un día futuro
        if (!isToday || current > now) {
          const timeStr = current.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
          slots.push(timeStr);
        }
        current.setMinutes(current.getMinutes() + duration);
      }

      // 2. Buscar turnos ya tomados
      const { data: taken, error } = await supabase
        .from('Appointment')
        .select('notes')
        .eq('professionalId', pro.id)
        .neq('status', 'CANCELADO');
      
      if (error) throw error;

      const searchString = date.toLocaleDateString();
      const takenTimes = taken?.filter(t => t.notes?.includes(searchString))
                               .map(t => {
                                 const match = t.notes?.match(/a las (.*)/);
                                 return match ? match[1] : null;
                               }).filter(Boolean) || [];

      setAvailableSlots(slots.filter(s => !takenTimes.includes(s)));
    } catch (err) {
      console.error('Error fetching slots:', err);
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      if (selectedPro && selectedDate) {
        await fetchAvailableSlots(selectedPro, selectedDate);
      }
    };
    load();
  }, [selectedPro, selectedDate, fetchAvailableSlots]);

  const handleConfirm = async () => {
    if (!selectedPro || !selectedTime || !selectedDate) return;
    setConfirming(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Debes iniciar sesión para sacar un turno.');

      // Generar ID único seguro
      const appointmentId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);

      const { error } = await supabase.from('Appointment').insert({
        id: appointmentId,
        date: selectedDate.toISOString(),
        status: 'PENDIENTE',
        professionalId: selectedPro.id,
        patientId: user.id,
        notes: `Turno agendado: ${selectedDate.toLocaleDateString()} a las ${selectedTime}`,
        updatedAt: new Date().toISOString()
      });

      if (error) throw error;

      // Intentar vincular al paciente (puede fallar si el paciente es antiguo y no está en la tabla Patient, pero no bloquearemos el éxito del turno)
      await supabase
        .from('Patient')
        .update({ professionalId: selectedPro.id })
        .eq('id', user.id);

      setStep(4);
    } catch (err: unknown) {
      alert('Error: ' + (err instanceof Error ? err.message : 'No se pudo agendar el turno'));
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Sacar Turno</h1>
        <p className="text-slate-500 mt-2 font-medium">Gestiona tu salud con profesionales expertos.</p>
      </header>

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-2">1. Selecciona Profesional</h2>
          {loadingPros ? (
            <div className="flex justify-center p-12"><Activity className="animate-spin text-purple-200" size={40} /></div>
          ) : professionals.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-100 text-center">
              <AlertCircle className="mx-auto mb-3 text-slate-200" size={32} />
              <p className="text-slate-500 font-medium">No se encontraron profesionales disponibles.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {professionals.map(pro => (
                <div 
                  key={pro.id} 
                  onClick={() => { setSelectedPro(pro); setStep(2); }}
                  className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between cursor-pointer hover:border-purple-200 transition-all active:scale-[0.98] group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 font-bold group-hover:bg-purple-100 transition-colors">
                      <User size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-slate-800">{pro.name}</h3>
                      <p className="text-sm text-slate-500">{pro.specialty || 'Kinesiólogo'}</p>
                    </div>
                  </div>
                  <ChevronRight className="text-slate-300 group-hover:text-purple-400 transition-colors" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 animate-in slide-in-from-right-4">
          <button onClick={() => setStep(1)} className="text-sm font-bold text-slate-400 hover:text-purple-600 flex items-center gap-1 transition-colors">
             ← Volver a Profesionales
          </button>
          
          <div>
            <h2 className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-4">2. Elige el Día con {selectedPro?.name}</h2>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {generateDates().map(date => (
                <div 
                  key={date.toISOString()} 
                  onClick={() => { setSelectedDate(date); setStep(3); }}
                  className={`bg-white p-4 rounded-2xl border shadow-sm text-center cursor-pointer transition-all active:scale-[0.95] ${selectedDate?.toDateString() === date.toDateString() ? 'border-purple-600 bg-purple-50/50' : 'border-slate-100 hover:border-purple-200'}`}
                >
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{date.toLocaleDateString([], { weekday: 'short' })}</p>
                  <p className="font-bold text-slate-800 text-lg">{date.getDate()}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{date.toLocaleDateString([], { month: 'short' })}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6 animate-in slide-in-from-right-4">
          <button onClick={() => setStep(2)} className="text-sm font-bold text-slate-400 hover:text-purple-600 flex items-center gap-1 transition-colors">
             ← Volver al Calendario
          </button>

          <div>
            <h2 className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-4">3. Horarios Disponibles ({selectedDate?.toLocaleDateString()})</h2>
            
            {loadingSlots ? (
              <div className="flex justify-center p-12"><Activity className="animate-spin text-purple-600" /></div>
            ) : availableSlots.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {availableSlots.map(time => (
                  <div 
                    key={time} 
                    onClick={() => setSelectedTime(time)}
                    className={`p-3 rounded-xl border text-center font-bold cursor-pointer transition-all ${selectedTime === time ? 'bg-purple-600 text-white border-purple-600 shadow-md scale-105' : 'bg-white border-slate-100 text-slate-600 hover:border-purple-200'}`}
                  >
                    {time}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-10 rounded-[2rem] border border-slate-100 text-center">
                <Clock className="mx-auto mb-3 text-slate-200" size={32} />
                <p className="text-slate-500 font-bold">No hay horarios disponibles</p>
                <p className="text-slate-400 text-xs mt-1">El profesional no atiende este día o ya tiene todos los turnos ocupados.</p>
              </div>
            )}
          </div>

          <button 
            disabled={!selectedTime || confirming}
            onClick={handleConfirm}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-200 disabled:text-slate-400 text-white p-5 rounded-3xl font-bold text-lg shadow-xl shadow-purple-600/20 transition-all flex items-center justify-center gap-2 mt-8 active:scale-[0.98]"
          >
            {confirming ? <Activity className="animate-spin" /> : <CheckCircle2 size={20} />}
            {confirming ? 'Confirmando...' : 'Confirmar Turno'}
          </button>
        </div>
      )}

      {step === 4 && (
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl text-center animate-in zoom-in-95 duration-500 mt-10">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <CheckCircle2 className="text-green-600" size={48} />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-3">¡Todo listo!</h2>
          <p className="text-slate-500 mb-10 leading-relaxed max-w-xs mx-auto text-lg">
            Tu sesión ha sido agendada con éxito. Te esperamos en la clínica.
          </p>
          <a href="/dashboard" className="bg-purple-600 text-white px-10 py-5 rounded-[2rem] font-bold shadow-lg shadow-purple-600/20 hover:bg-purple-700 transition-all inline-block text-lg">
            Volver a mi Panel
          </a>
        </div>
      )}
    </div>
  );
}
