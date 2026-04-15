'use client';

import { ArrowLeft, Calendar, FileText, Activity } from 'lucide-react';
import Link from 'next/link';
import RoutineBuilder from '@/components/RoutineBuilder';
import { useState } from 'react';

export default function PatientDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<'historial' | 'rutina'>('historial');

  const patient = {
    id: params.id,
    name: "Mateo Rossi",
    age: 28,
    condition: "Post-op Ligamento Cruzado Anterior",
    lastSession: "12 Abril, 2024",
    notes: "Evolución favorable. Persiste leve dolor en flexión máxima. Se recomienda iniciar carga progresiva en ejercicios mono-podales.",
    history: [
      { date: "10 Abril, 2024", note: "Sesión 4: Movilidad articular activa y pasiva." },
      { date: "08 Abril, 2024", note: "Sesión 3: Control de inflamación y drenaje linfático." },
    ]
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header con Back Button */}
      <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/patients" className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-teal-600 transition-all shadow-sm">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">{patient.name}</h1>
              <p className="text-slate-500 font-medium">{patient.condition}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="bg-white border border-slate-100 text-slate-600 px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 transition-all">
              Editar Perfil
            </button>
            <button className="bg-teal-200 text-teal-900 px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-teal-300 transition-all">
              Programar Turno
            </button>
          </div>
        </header>

        {/* Tabs de Navegación */}
        <div className="flex gap-4 mb-8 bg-white/50 p-1.5 rounded-2xl w-fit border border-slate-100 shadow-sm">
          <button 
            onClick={() => setActiveTab('historial')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'historial' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <FileText size={18} /> Historial Clínico
          </button>
          <button 
            onClick={() => setActiveTab('rutina')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'rutina' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Activity size={18} /> Gestionar Rutina
          </button>
        </div>

        {/* Contenido según Tab */}
        <div className="space-y-8">
          {activeTab === 'historial' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Resumen */}
              <div className="md:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Información</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-slate-500 text-sm">Edad</span>
                      <span className="text-slate-800 font-bold">{patient.age} años</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 text-sm">Última Sesión</span>
                      <span className="text-slate-800 font-bold">{patient.lastSession}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notas y Logs */}
              <div className="md:col-span-2 space-y-6">
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                  <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <FileText className="text-teal-500" /> Nota de Evolución
                  </h3>
                  <div className="p-6 bg-teal-50/50 rounded-2xl border border-teal-100/50 text-slate-700 italic leading-relaxed">
                    &quot;{patient.notes}&quot;
                  </div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                  <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Calendar className="text-purple-500" /> Registro de Sesiones
                  </h3>
                  <div className="space-y-4">
                    {patient.history.map((h, i) => (
                      <div key={i} className="flex gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all">
                        <div className="w-2 h-2 bg-purple-200 rounded-full mt-2 shrink-0"></div>
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase">{h.date}</p>
                          <p className="text-slate-700 mt-1">{h.note}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <RoutineBuilder />
            </div>
          )}
        </div>
      </div>
  );
}
