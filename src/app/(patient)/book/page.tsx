'use client';

import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, ChevronRight, User, Clock, Activity } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Pro {
  id: string;
  name: string;
  specialty: string | null;
  schedule: {
    complex?: Record<string, { active: boolean; start: string; end: string }>;
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
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    const fetchProfessionals = async () => {
      const { data } = await supabase.from('User').select('id, name, specialty, schedule');
      if (data) {
        setProfessionals(data);
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
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const config = pro.schedule?.complex?.[dayName];
    
    if (!config || !config.active) {
      setAvailableSlots([]);
      setLoadingSlots(false);
      return;
    }

    const slots = [];
    const [startH, startM] = config.start.split(':').map(Number);
    const [endH, endM] = config.end.split(':').map(Number);
    const duration = pro.schedule?.duration || 60;

    const current = new Date(date);
    current.setHours(startH, startM, 0, 0);
    const endTime = new Date(date);
    endTime.setHours(endH, endM, 0, 0);

    while (current < endTime) {
      slots.push(current.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
      current.setMinutes(current.getMinutes() + duration);
    }

    // 2. Buscar turnos ya tomados
    const { data: taken } = await supabase
      .from('Appointment')
      .select('*')
      .eq('professionalId', pro.id)
      .eq('status', 'PENDIENTE');
    
    // Filtramos los turnos que coincidan con el día seleccionado buscando en la nota
    const searchString = date.toLocaleDateString();
    const takenTimes = taken?.filter(t => t.notes?.includes(searchString))
                             .map(t => {
                               const match = t.notes?.match(/a las (.*)/);
                               return match ? match[1] : null;
                             }).filter(Boolean) || [];

    setAvailableSlots(slots.filter(s => !takenTimes.includes(s)));
    setLoadingSlots(false);
  }, []);

  useEffect(() => {
    const loadSlots = async () => {
      if (selectedPro && selectedDate) {
        await fetchAvailableSlots(selectedPro, selectedDate);
      }
    };
    loadSlots();
  }, [selectedPro, selectedDate, fetchAvailableSlots]);

  const handleConfirm = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !selectedPro || !selectedTime || !selectedDate) return;

    const { error } = await supabase.from('Appointment').insert({
      id: crypto.randomUUID(),
      date: selectedDate.toISOString(),
      status: 'PENDIENTE',
      professionalId: selectedPro.id,
      patientId: user.id,
      notes: `Turno agendado: ${selectedDate.toLocaleDateString()} a las ${selectedTime}`,
      updatedAt: new Date().toISOString()
    });

    if (!error) {
      // 2. Vincular automáticamente al paciente con este profesional si aún no lo está
      await supabase
        .from('Patient')
        .update({ professionalId: selectedPro.id })
        .eq('id', user.id);

      setStep(4);
    } else {
      alert('Hubo un problema: ' + error.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Sacar Turno</h1>
        <p className="text-slate-500 mt-2">Agenda tu próxima sesión personalizada.</p>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-2">1. Selecciona Profesional</h2>
          <div className="grid grid-cols-1 gap-4">
            {professionals.map(pro => (
              <div 
                key={pro.id} 
                onClick={() => { setSelectedPro(pro); setStep(2); }}
                className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between cursor-pointer hover:border-purple-200 transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 font-bold">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-slate-800">{pro.name}</h3>
                    <p className="text-sm text-slate-500">{pro.specialty || 'Kinesiólogo'}</p>
                  </div>
                </div>
                <ChevronRight className="text-slate-300" />
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 animate-in slide-in-from-right-4">
          <button onClick={() => setStep(1)} className="text-sm font-bold text-slate-400 hover:text-purple-600 flex items-center gap-1">
             ← Volver a Profesionales
          </button>
          
          <div>
            <h2 className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-4">2. Elige el Día con {selectedPro?.name}</h2>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {generateDates().map(date => (
                <div 
                  key={date.toISOString()} 
                  onClick={() => { setSelectedDate(date); setStep(3); }}
                  className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center cursor-pointer hover:border-purple-200 hover:bg-purple-50 transition-all"
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
          <button onClick={() => setStep(2)} className="text-sm font-bold text-slate-400 hover:text-purple-600 flex items-center gap-1">
             ← Volver al Calendario
          </button>

          <div>
            <h2 className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-4">3. Horarios Disponibles ({selectedDate?.toLocaleDateString()})</h2>
            
            {loadingSlots ? (
              <div className="flex justify-center p-10"><Activity className="animate-spin text-purple-600" /></div>
            ) : availableSlots.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {availableSlots.map(time => (
                  <div 
                    key={time} 
                    onClick={() => setSelectedTime(time)}
                    className={`p-3 rounded-xl border text-center font-bold cursor-pointer transition-all ${selectedTime === time ? 'bg-purple-600 text-white border-purple-600 shadow-md' : 'bg-white border-slate-100 text-slate-600 hover:border-purple-200'}`}
                  >
                    {time}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-3xl border border-slate-100 text-center">
                <Clock className="mx-auto mb-3 text-slate-200" size={32} />
                <p className="text-slate-500 font-medium text-sm">No hay horarios disponibles para este día.</p>
              </div>
            )}
          </div>

          <button 
            disabled={!selectedTime}
            onClick={handleConfirm}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-200 disabled:text-slate-400 text-white p-5 rounded-2xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 mt-8"
          >
            Confirmar Turno
          </button>
        </div>
      )}

      {step === 4 && (
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm text-center animate-in zoom-in-95 duration-500 mt-10">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="text-green-600" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">¡Turno Confirmado!</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Tu sesión con <strong>{selectedPro?.name}</strong> ha sido agendada con éxito.
          </p>
          <a href="/dashboard" className="bg-purple-600 text-white px-8 py-4 rounded-2xl font-bold shadow-md hover:bg-purple-700 transition-all inline-block">
            Volver a mi Panel
          </a>
        </div>
      )}
    </div>
  );
}
