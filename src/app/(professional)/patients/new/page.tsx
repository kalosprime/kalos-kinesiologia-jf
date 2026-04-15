'use client';

import { ArrowLeft, UserPlus, Save } from 'lucide-react';
import Link from 'next/link';

export default function NewPatientPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-8 flex items-center gap-6">
          <Link href="/patients" className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-teal-600 transition-all shadow-sm">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Nuevo Paciente</h1>
            <p className="text-slate-500 font-medium">Completa los datos para iniciar el historial.</p>
          </div>
        </header>

        <form className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Nombre Completo</label>
                <input 
                  type="text" 
                  placeholder="Ej: Juan Pérez" 
                  className="w-full bg-slate-50 border-none p-4 rounded-2xl text-slate-800 placeholder:text-slate-300 outline-none focus:ring-2 ring-teal-100 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Email</label>
                <input 
                  type="email" 
                  placeholder="juan@email.com" 
                  className="w-full bg-slate-50 border-none p-4 rounded-2xl text-slate-800 placeholder:text-slate-300 outline-none focus:ring-2 ring-teal-100 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Patología / Motivo de Consulta</label>
              <input 
                type="text" 
                placeholder="Ej: Rehabilitación de hombro" 
                className="w-full bg-slate-50 border-none p-4 rounded-2xl text-slate-800 placeholder:text-slate-300 outline-none focus:ring-2 ring-teal-100 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Historial Clínico Inicial</label>
              <textarea 
                rows={4}
                placeholder="Notas iniciales sobre el paciente..." 
                className="w-full bg-slate-50 border-none p-4 rounded-2xl text-slate-800 placeholder:text-slate-300 outline-none focus:ring-2 ring-teal-100 transition-all resize-none"
              ></textarea>
            </div>
          </div>

          <button className="w-full bg-teal-200 hover:bg-teal-300 text-teal-900 p-5 rounded-2xl font-bold text-lg shadow-sm transition-all flex items-center justify-center gap-3 active:scale-[0.98]">
            <Save size={20} /> Crear Paciente
          </button>
        </form>
    </div>
  );
}
