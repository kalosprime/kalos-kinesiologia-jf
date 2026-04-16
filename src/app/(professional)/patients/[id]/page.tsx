'use client';

import { ArrowLeft, Calendar, FileText, Activity, Save, Edit3 } from 'lucide-react';
import Link from 'next/link';
import RoutineBuilder from '@/components/RoutineBuilder';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useSearchParams } from 'next/navigation';

interface Patient {
  id: string;
  name: string;
  email?: string | null;
  condition?: string | null;
  clinicalHistory?: string | null;
  lastSession: string;
}

export default function PatientDetailPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') === 'rutina' ? 'rutina' : 'historial';
  
  const [activeTab, setActiveTab] = useState<'historial' | 'rutina'>(defaultTab);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [patient, setPatient] = useState<Patient>({
    id: params.id,
    name: "Cargando...",
    lastSession: "-"
  });

  const fetchPatient = useCallback(async () => {
    const { data, error } = await supabase
      .from('Patient')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Error fetching patient details:', error);
      return;
    }

    if (data) {
      setPatient({
        ...data,
        lastSession: new Date(data.updatedAt).toLocaleDateString()
      });
    }
    setLoading(false);
  }, [params.id]);

  useEffect(() => {
    const loadPatient = async () => {
      await fetchPatient();
    };
    loadPatient();
  }, [fetchPatient]);

  const handleSaveHistory = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('Patient')
      .update({ 
        clinicalHistory: patient.clinicalHistory,
        updatedAt: new Date().toISOString()
      })
      .eq('id', params.id);

    if (!error) {
      setIsEditing(false);
      fetchPatient();
    } else {
      alert('Error al guardar: ' + error.message);
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-teal-600"><Activity className="animate-spin" /></div>;
  }

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
              <p className="text-slate-500 font-medium">{patient.email || 'Sin email'}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="bg-white border border-slate-100 text-slate-600 px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 transition-all opacity-50 cursor-not-allowed">
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
            <FileText size={18} /> Historia Clínica
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
                      <span className="text-slate-500 text-sm">Última Sesión</span>
                      <span className="text-slate-800 font-bold">{patient.lastSession}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Historia Clínica */}
              <div className="md:col-span-2 space-y-6">
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative group">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <FileText className="text-teal-500" /> Historia Clínica y Evolución
                    </h3>
                    {!isEditing ? (
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="text-teal-600 hover:bg-teal-50 p-2 rounded-xl transition-all flex items-center gap-2 text-sm font-bold"
                      >
                        <Edit3 size={16} /> Editar
                      </button>
                    ) : (
                      <button 
                        onClick={handleSaveHistory}
                        disabled={saving}
                        className="bg-teal-200 text-teal-900 px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-sm font-bold disabled:opacity-50 shadow-sm"
                      >
                        <Save size={16} /> {saving ? 'Guardando...' : 'Guardar'}
                      </button>
                    )}
                  </div>
                  
                  {isEditing ? (
                    <textarea 
                      value={patient.clinicalHistory || ''}
                      onChange={(e) => setPatient({ ...patient, clinicalHistory: e.target.value })}
                      className="w-full h-64 p-6 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 ring-teal-100 text-slate-700 leading-relaxed resize-none font-medium"
                      placeholder="Escribe aquí la evolución del paciente, patologías, estudios, etc..."
                    ></textarea>
                  ) : (
                    <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 text-slate-700 leading-relaxed whitespace-pre-wrap min-h-[150px]">
                      {patient.clinicalHistory || "No hay información registrada en la historia clínica."}
                    </div>
                  )}
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                  <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Calendar className="text-purple-500" /> Registro de Sesiones
                  </h3>
                  <div className="p-8 text-center text-slate-400 italic text-sm">
                    El registro detallado por sesiones se habilitará próximamente.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <RoutineBuilder patientId={params.id} />
            </div>
          )}
        </div>
      </div>
  );
}
