'use client';

import { Search, UserPlus, MoreVertical, FileText, ClipboardList, Users, Activity } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Patient {
  id: string;
  name: string;
  email: string;
  lastSession: string;
  condition: string;
  color: string;
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Obtenemos los pacientes (en un futuro filtrados por professionalId)
      const { data, error } = await supabase
        .from('Patient')
        .select('*')
        .order('name', { ascending: true });

      if (error) console.error('Error fetching patients:', error);

      if (data) {
        const loadedPatients = data.map((p: { id: string; name: string; email: string | null; updatedAt: string; clinicalHistory: string | null }) => ({
          id: p.id,
          name: p.name,
          email: p.email || 'Sin email',
          lastSession: new Date(p.updatedAt).toLocaleDateString(),
          condition: p.clinicalHistory || 'Sin diagnóstico',
          color: 'bg-teal-100'
        }));
        setPatients(loadedPatients);
      }
      setLoading(false);
    };
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.condition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-teal-600"><Activity className="animate-spin" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Gestor de Pacientes</h1>
          <p className="text-slate-500 mt-1">Administra tu base de datos clínica.</p>
        </div>
        <Link href="/patients/new" className="bg-teal-200 hover:bg-teal-300 text-teal-900 px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 transition-all shadow-sm">
          <UserPlus size={20} /> Nuevo Paciente
        </Link>
      </header>

      <main className="max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white/50 backdrop-blur-sm">
            <div className="flex items-center bg-slate-50 px-4 py-2 rounded-xl w-full max-w-md">
              <Search size={16} className="text-slate-400 mr-2" />
              <input 
                type="text" 
                placeholder="Buscar por nombre o patología..." 
                className="bg-transparent outline-none text-sm text-slate-600 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {filteredPatients.length === 0 ? (
            <div className="p-16 text-center flex flex-col items-center justify-center text-slate-400">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Users size={40} className="text-slate-300" />
              </div>
              <h2 className="text-xl font-bold text-slate-600 mb-2">No hay pacientes que coincidan</h2>
              <p className="text-sm max-w-md mb-6">Asegúrate de haber registrado pacientes o prueba con otro término de búsqueda.</p>
              <Link href="/patients/new" className="bg-teal-50 text-teal-700 hover:bg-teal-100 px-6 py-3 rounded-xl font-bold transition-all">
                Añadir mi primer paciente
              </Link>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-8 py-4">Paciente</th>
                  <th className="px-8 py-4">Patología</th>
                  <th className="px-8 py-4">Última Sesión</th>
                  <th className="px-8 py-4">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredPatients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 ${p.color} rounded-xl flex items-center justify-center font-bold text-slate-700`}>
                          {p.name[0]}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{p.name}</div>
                          <div className="text-xs text-slate-400 font-medium">{p.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                        {p.condition}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-sm text-slate-500 font-medium italic">
                      {p.lastSession}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex gap-2">
                        <Link href={`/patients/${p.id}`} className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all" title="Ver Historial">
                          <FileText size={18} />
                        </Link>
                        <Link href={`/patients/${p.id}`} className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all" title="Ver Rutina">
                          <ClipboardList size={18} />
                        </Link>
                        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
