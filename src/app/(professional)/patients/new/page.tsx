'use client';

import { ArrowLeft, Save, Activity } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function NewPatientPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [condition, setCondition] = useState('');
  const [history, setHistory] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No se encontró sesión de profesional');

      const { error } = await supabase.from('Patient').insert({
        id: crypto.randomUUID(),
        name,
        email,
        clinicalHistory: history || condition,
        professionalId: user.id, // Vinculamos al profesional logueado
        updatedAt: new Date().toISOString()
      });

      if (error) throw error;

      setMessage('¡Paciente creado con éxito!');
      setTimeout(() => router.push('/patients'), 1500);
    } catch (error: unknown) {
      setMessage('Error: ' + (error instanceof Error ? error.message : 'Desconocido'));
    } finally {
      setLoading(false);
    }
  };

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

      <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
        {message && (
          <div className={`p-4 rounded-xl text-center font-bold ${message.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
            {message}
          </div>
        )}

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Nombre Completo</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Juan Pérez" 
                className="w-full bg-slate-50 border-none p-4 rounded-2xl text-slate-800 placeholder:text-slate-300 outline-none focus:ring-2 ring-teal-100 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Email (Opcional)</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="juan@email.com" 
                className="w-full bg-slate-50 border-none p-4 rounded-2xl text-slate-800 placeholder:text-slate-300 outline-none focus:ring-2 ring-teal-100 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Patología Principal</label>
            <input 
              type="text" 
              required
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              placeholder="Ej: Rehabilitación de hombro" 
              className="w-full bg-slate-50 border-none p-4 rounded-2xl text-slate-800 placeholder:text-slate-300 outline-none focus:ring-2 ring-teal-100 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Notas del Historial Clínico</label>
            <textarea 
              rows={4}
              value={history}
              onChange={(e) => setHistory(e.target.value)}
              placeholder="Notas iniciales sobre el paciente..." 
              className="w-full bg-slate-50 border-none p-4 rounded-2xl text-slate-800 placeholder:text-slate-300 outline-none focus:ring-2 ring-teal-100 transition-all resize-none"
            ></textarea>
          </div>
        </div>

        <button 
          disabled={loading}
          className="w-full bg-teal-200 hover:bg-teal-300 text-teal-900 p-5 rounded-2xl font-bold text-lg shadow-sm transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? <Activity className="animate-spin" /> : <Save size={20} />}
          {loading ? 'Guardando...' : 'Crear Paciente'}
        </button>
      </form>
    </div>
  );
}
