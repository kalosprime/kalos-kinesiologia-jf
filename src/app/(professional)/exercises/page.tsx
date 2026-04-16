'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Dumbbell, Activity, Save, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  description: string | null;
}

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Formulario para nuevo ejercicio
  const [newName, setNewName] = useState('');
  const [newGroup, setNewGroup] = useState('Core');
  const [newDesc, setNewDesc] = useState('');
  const [saving, setSaving] = useState(false);

  const muscleGroups = [
    'Core', 'Hombro', 'Cuádriceps', 'Isquios', 'Cadera', 
    'Espalda', 'Pecho', 'Brazos', 'Tobillo/Pie', 'Cervical'
  ];

  const fetchExercises = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('Exercise')
      .select('*')
      .order('muscleGroup', { ascending: true })
      .order('name', { ascending: true });

    if (error) console.error('Error fetching exercises:', error);
    if (data) setExercises(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  const handleAddExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    setSaving(true);

    try {
      const { error } = await supabase.from('Exercise').insert({
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
        name: newName,
        muscleGroup: newGroup,
        description: newDesc,
      });

      if (error) throw error;

      // Limpiar y recargar
      setNewName('');
      setNewDesc('');
      setIsAdding(false);
      await fetchExercises();
    } catch (err: unknown) {
      alert('Error al guardar ejercicio: ' + (err instanceof Error ? err.message : 'Desconocido'));
    } finally {
      setSaving(false);
    }
  };

  const filteredExercises = exercises.filter(ex => 
    ex.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    ex.muscleGroup.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="min-h-screen flex items-center justify-center text-teal-600"><Activity className="animate-spin" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Catálogo Global</h1>
          <p className="text-slate-500 mt-1 font-medium">Ejercicios compartidos por toda la comunidad Kalos JF.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={`px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-sm ${isAdding ? 'bg-slate-200 text-slate-700' : 'bg-teal-200 text-teal-900 hover:bg-teal-300'}`}
        >
          {isAdding ? 'Cancelar' : <><Plus size={20} /> Nuevo Ejercicio</>}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lado Izquierdo: Lista / Buscador */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-3">
            <Search className="text-slate-300 ml-2" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por nombre o grupo muscular..." 
              className="flex-1 bg-transparent outline-none text-slate-700 font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredExercises.length === 0 ? (
              <div className="col-span-full py-20 text-center text-slate-400">
                <Dumbbell className="mx-auto mb-4 opacity-20" size={64} />
                <p>No se encontraron ejercicios</p>
              </div>
            ) : (
              filteredExercises.map(ex => (
                <div key={ex.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:border-teal-200 transition-all group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 group-hover:bg-teal-100 transition-colors">
                      <Activity size={24} />
                    </div>
                    <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full uppercase tracking-wider">
                      {ex.muscleGroup}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg mb-1">{ex.name}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                    {ex.description || 'Sin descripción técnica registrada.'}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Lado Derecho: Formulario (Solo si isAdding es true) o Resumen */}
        <div className="lg:col-span-1">
          {isAdding ? (
            <div className="bg-white p-8 rounded-[2.5rem] border-2 border-teal-100 shadow-xl shadow-teal-900/5 space-y-6 sticky top-8 animate-in slide-in-from-right-4">
              <h2 className="text-xl font-bold text-slate-800">Agregar Ejercicio</h2>
              <form onSubmit={handleAddExercise} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Nombre</label>
                  <input 
                    type="text" 
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ej: Sentadilla con fitball" 
                    className="w-full bg-slate-50 border-none p-4 rounded-2xl text-slate-800 outline-none focus:ring-2 ring-teal-100 transition-all font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Grupo Muscular</label>
                  <select 
                    value={newGroup}
                    onChange={(e) => setNewGroup(e.target.value)}
                    className="w-full bg-slate-50 border-none p-4 rounded-2xl text-slate-800 outline-none focus:ring-2 ring-teal-100 transition-all font-bold appearance-none cursor-pointer"
                  >
                    {muscleGroups.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Instrucciones</label>
                  <textarea 
                    rows={4}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Describe brevemente cómo realizar el ejercicio..." 
                    className="w-full bg-slate-50 border-none p-4 rounded-2xl text-slate-800 outline-none focus:ring-2 ring-teal-100 transition-all resize-none text-sm leading-relaxed"
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  disabled={saving}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white p-4 rounded-2xl font-bold shadow-lg shadow-teal-900/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
                >
                  {saving ? <Activity className="animate-spin" size={20} /> : <Save size={20} />}
                  {saving ? 'Guardando...' : 'Guardar en Catálogo'}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-teal-900 text-white p-8 rounded-[2.5rem] shadow-xl space-y-6 sticky top-8">
              <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center">
                <AlertCircle size={32} />
              </div>
              <h2 className="text-2xl font-bold">Catálogo Comunitario</h2>
              <p className="text-teal-100 leading-relaxed font-medium">
                Cada ejercicio que agregues aquí estará disponible para todos los kinesiólogos de Kalos JF. 
                <br/><br/>
                Ayúdanos a construir la base de datos de rehabilitación más completa.
              </p>
              <div className="pt-4 border-t border-white/10">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-teal-300">Total Ejercicios</span>
                  <span className="font-bold text-xl">{exercises.length}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
