'use client';

import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, CheckCircle2, ChevronRight, User } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Pro {
  id: string;
  name: string;
  specialty: string | null;
}

export default function BookAppointmentPage() {
  const [step, setStep] = useState(1);
  const [selectedProId, setSelectedProId] = useState<string | null>(null);
  const [selectedProName, setSelectedProName] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  const [professionals, setProfessionals] = useState<Pro[]>([]);

  useEffect(() => {
    const fetchProfessionals = async () => {
      const { data } = await supabase.from('User').select('id, name, specialty');
      if (data) {
        setProfessionals(data);
      }
    };
    fetchProfessionals();
  }, []);

  const dates = ['Hoy', 'Mañana', 'Viernes 19', 'Lunes 22'];
  const times = ['09:00', '10:30', '14:00', '16:45', '18:00'];

  const handleConfirm = async () => {
    // Buscar qué paciente inició sesión
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !selectedProId) return;

    // Guardar turno en Supabase (Appointment)
    const { error } = await supabase.from('Appointment').insert({
      id: crypto.randomUUID(), // Generar un ID único para el turno
      date: new Date().toISOString(), // Guardamos la fecha actual como aproximación técnica por ahora
      status: 'PENDIENTE',
      professionalId: selectedProId,
      patientId: user.id,
      notes: `Turno agendado: ${selectedDate} a las ${selectedTime}`,
      updatedAt: new Date().toISOString()
    });

    if (!error) {
      setStep(4);
    } else {
      console.error('Error al guardar turno:', error);
      alert('Hubo un problema al agendar el turno. Intenta nuevamente.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Sacar Turno</h1>
        <p className="text-slate-500 mt-2">Agenda tu próxima sesión de kinesiología.</p>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-2">1. Selecciona Profesional</h2>
          {professionals.length === 0 ? (
            <p className="text-slate-400 italic">Cargando profesionales...</p>
          ) : (
            professionals.map(pro => (
              <div 
                key={pro.id} 
                onClick={() => { setSelectedProId(pro.id); setSelectedProName(pro.name); setStep(2); }}
                className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between cursor-pointer hover:border-purple-200 transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 font-bold">
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{pro.name}</h3>
                    <p className="text-xs text-slate-500">{pro.specialty || 'Kinesiólogo'}</p>
                  </div>
                </div>
                <ChevronRight className="text-slate-300" />
              </div>
            ))
          )}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 animate-in slide-in-from-right-4">
          <button onClick={() => setStep(1)} className="text-sm font-bold text-slate-400 hover:text-purple-600 flex items-center gap-1">
             Volver
          </button>
          
          <div>
            <h2 className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-4">2. Elige el Día con {selectedProName}</h2>
            <div className="grid grid-cols-2 gap-4">
              {dates.map(date => (
                <div 
                  key={date} 
                  onClick={() => { setSelectedDate(date); setStep(3); }}
                  className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center cursor-pointer hover:border-purple-200 hover:bg-purple-50 transition-all active:scale-[0.95]"
                >
                  <CalendarIcon className="mx-auto mb-2 text-purple-400" size={24} />
                  <span className="font-bold text-slate-700">{date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6 animate-in slide-in-from-right-4">
          <button onClick={() => setStep(2)} className="text-sm font-bold text-slate-400 hover:text-purple-600 flex items-center gap-1">
             Volver
          </button>

          <div>
            <h2 className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-4">3. Horarios Disponibles ({selectedDate})</h2>
            <div className="grid grid-cols-3 gap-3">
              {times.map(time => (
                <div 
                  key={time} 
                  onClick={() => setSelectedTime(time)}
                  className={`p-3 rounded-xl border text-center font-bold cursor-pointer transition-all ${selectedTime === time ? 'bg-purple-600 text-white border-purple-600 shadow-md' : 'bg-white border-slate-100 text-slate-600 hover:border-purple-200'}`}
                >
                  {time}
                </div>
              ))}
            </div>
          </div>

          <button 
            disabled={!selectedTime}
            onClick={handleConfirm}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-200 disabled:text-slate-400 text-white p-4 rounded-2xl font-bold text-lg shadow-md transition-all flex items-center justify-center gap-2 mt-8"
          >
            Confirmar Turno
          </button>
        </div>
      )}

      {step === 4 && (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-center animate-in zoom-in-95 duration-500 mt-10">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="text-green-600" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">¡Turno Confirmado!</h2>
          <p className="text-slate-500 mb-6">
            Tu sesión con <strong>{selectedProName}</strong> ha sido agendada para el <strong>{selectedDate}</strong> a las <strong>{selectedTime}</strong>.
          </p>
          <Link href="/dashboard" className="bg-purple-50 text-purple-700 hover:bg-purple-100 px-6 py-3 rounded-xl font-bold transition-all inline-block">
            Volver a mi Panel
          </Link>
        </div>
      )}
    </div>
  );
}
