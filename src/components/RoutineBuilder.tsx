'use client';

import { useState } from 'react';
import { Search, Plus, Trash2, Save, Dumbbell, ChevronRight } from 'lucide-react';

const GLOBAL_EXERCISES = [
  { id: '1', name: 'Sentadilla Mono-podal', group: 'Cuádriceps', color: 'bg-green-100 text-green-700' },
  { id: '2', name: 'Plancha Abdominal', group: 'Core', color: 'bg-blue-100 text-blue-700' },
  { id: '3', name: 'Puente de Glúteo', group: 'Cadera', color: 'bg-purple-100 text-purple-700' },
  { id: '4', name: 'Y-W Press', group: 'Hombro', color: 'bg-pink-100 text-pink-700' },
  { id: '5', name: 'Deadlift Rumano', group: 'Isquios', color: 'bg-orange-100 text-orange-700' },
];

export default function RoutineBuilder() {
  const [selectedExercises, setSelectedExercises] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const addExercise = (ex: any) => {
    if (!selectedExercises.find(e => e.id === ex.id)) {
      setSelectedExercises([...selectedExercises, { ...ex, series: 3, reps: '12' }]);
    }
  };

  const removeExercise = (id: string) => {
    setSelectedExercises(selectedExercises.filter(e => e.id !== id));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[700px]">
      {/* Columna Izquierda: Catálogo */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-50">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Catálogo de Ejercicios</h3>
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
          {GLOBAL_EXERCISES.filter(ex => ex.name.toLowerCase().includes(searchTerm.toLowerCase())).map((ex) => (
            <div key={ex.id} className="group flex items-center justify-between p-4 bg-slate-50/50 hover:bg-teal-50 rounded-2xl transition-all cursor-pointer" onClick={() => addExercise(ex)}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${ex.color.split(' ')[0]}`}>
                  <Dumbbell size={20} className={ex.color.split(' ')[1]} />
                </div>
                <div>
                  <p className="font-bold text-slate-800">{ex.name}</p>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{ex.group}</p>
                </div>
              </div>
              <Plus size={20} className="text-slate-300 group-hover:text-teal-600 transition-colors" />
            </div>
          ))}
        </div>
      </div>

      {/* Columna Derecha: Rutina Actual */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-teal-50/30">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Rutina del Paciente</h3>
            <p className="text-xs text-slate-500 font-medium">Personalizando plan de rehabilitación</p>
          </div>
          <button className="bg-teal-200 hover:bg-teal-300 text-teal-900 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm text-sm">
            <Save size={18} /> Guardar Rutina
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {selectedExercises.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4 opacity-50">
              <ClipboardList size={64} strokeWidth={1} />
              <p className="font-medium">Aún no has añadido ejercicios</p>
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
                    <input type="number" defaultValue={ex.series} className="w-full bg-slate-50 p-2 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 ring-teal-100 transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Reps / Tiempo</label>
                    <input type="text" defaultValue={ex.reps} className="w-full bg-slate-50 p-2 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 ring-teal-100 transition-all" />
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

function ClipboardList(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>
  );
}
