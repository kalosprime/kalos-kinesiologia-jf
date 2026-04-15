'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Save, Dumbbell, Activity } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  series?: number;
  reps?: string;
}

export default function RoutineBuilder({ patientId }: { patientId: string }) {
  const [catalog, setCatalog] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchExercises = async () => {
      const { data } = await supabase.from('Exercise').select('*');
      if (data) {
        const formatted = data.map((e: { id: string; name: string; muscleGroup: string }) => ({
          id: e.id,
          name: e.name,
          muscleGroup: e.muscleGroup
        }));
        setCatalog(formatted);
      }
      setLoading(false);
    };
    fetchExercises();
  }, []);

  const addExercise = (ex: Exercise) => {
    if (!selectedExercises.find(e => e.id === ex.id)) {
      setSelectedExercises([...selectedExercises, { ...ex, series: 3, reps: '12' }]);
    }
  };

  const removeExercise = (id: string) => {
    setSelectedExercises(selectedExercises.filter(e => e.id !== id));
  };

  const updateExercise = (id: string, field: keyof Exercise, value: string | number) => {
    setSelectedExercises(selectedExercises.map(ex => 
      ex.id === id ? { ...ex, [field]: value } : ex
    ));
  };

  const saveRoutine = async () => {
    if (selectedExercises.length === 0) return;
    setSaving(true);
    setMessage('');

    try {
      // 1. Crear la cabecera de la rutina
      const routineId = crypto.randomUUID();
      const { error: rError } = await supabase.from('Routine').insert({
        id: routineId,
        patientId: patientId,
        name: 'Rutina de Rehabilitación',
        updatedAt: new Date().toISOString()
      });

      if (rError) throw rError;

      // 2. Insertar los ejercicios (RoutineItems)
      const items = selectedExercises.map(ex => ({
        id: crypto.randomUUID(),
        routineId: routineId,
        exerciseId: ex.id,
        series: ex.series || 3,
        reps: ex.reps || '12'
      }));

      const { error: iError } = await supabase.from('RoutineItem').insert(items);
      if (iError) throw iError;

      setMessage('¡Rutina guardada y asignada con éxito!');
    } catch (error: unknown) {
      setMessage('Error al guardar: ' + (error instanceof Error ? error.message : 'Desconocido'));
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading) return <div className="flex justify-center p-10 text-teal-600"><Activity className="animate-spin" /></div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[600px]">
      {/* Columna Izquierda: Catálogo Real */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-50">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Catálogo Global</h3>
          <div className="flex items-center bg-slate-50 px-4 py-3 rounded-2xl">
            <Search size={18} className="text-slate-400 mr-2" />
            <input 
              type="text" 
              placeholder="Buscar ejercicio..." 
              className="bg-transparent outline-none text-sm text-slate-600 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {catalog.filter(ex => ex.name.toLowerCase().includes(searchTerm.toLowerCase())).map((ex) => (
            <div key={ex.id} className="group flex items-center justify-between p-4 bg-slate-50/50 hover:bg-teal-50 rounded-2xl transition-all cursor-pointer" onClick={() => addExercise(ex)}>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-teal-100 text-teal-700">
                  <Dumbbell size={20} />
                </div>
                <div>
                  <p className="font-bold text-slate-800">{ex.name}</p>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{ex.muscleGroup}</p>
                </div>
              </div>
              <Plus size={20} className="text-slate-300 group-hover:text-teal-600 transition-colors" />
            </div>
          ))}
        </div>
      </div>

      {/* Columna Derecha: Armando Rutina */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-teal-50/30">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Nueva Rutina</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase">Asignando al paciente</p>
          </div>
          <button 
            onClick={saveRoutine}
            disabled={saving || selectedExercises.length === 0}
            className="bg-teal-200 hover:bg-teal-300 text-teal-900 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm text-sm disabled:opacity-50"
          >
            <Save size={18} /> {saving ? 'Guardando...' : 'Guardar Rutina'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {message && (
            <div className={`p-3 rounded-xl text-center text-xs font-bold ${message.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              {message}
            </div>
          )}
          
          {selectedExercises.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4 opacity-50 py-20">
              <Dumbbell size={64} strokeWidth={1} />
              <p className="font-medium text-sm text-center">Toca los ejercicios de la izquierda<br/>para armar el plan</p>
            </div>
          ) : (
            selectedExercises.map((ex, index) => (
              <div key={ex.id} className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm hover:border-teal-200 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-slate-800 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                    <h4 className="font-bold text-slate-800">{ex.name}</h4>
                  </div>
                  <button onClick={() => removeExercise(ex.id)} className="text-slate-300 hover:text-red-400 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Series</label>
                    <input 
                      type="number" 
                      value={ex.series} 
                      onChange={(e) => updateExercise(ex.id, 'series', parseInt(e.target.value))}
                      className="w-full bg-slate-50 p-2 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 ring-teal-100 transition-all" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Repeticiones</label>
                    <input 
                      type="text" 
                      value={ex.reps} 
                      onChange={(e) => updateExercise(ex.id, 'reps', e.target.value)}
                      className="w-full bg-slate-50 p-2 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 ring-teal-100 transition-all" 
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
