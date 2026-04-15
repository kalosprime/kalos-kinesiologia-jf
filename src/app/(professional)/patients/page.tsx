import { Search, Plus, UserPlus, MoreVertical, FileText, ClipboardList } from 'lucide-react';
import Link from 'next/link';

export default function PatientsPage() {
  const patients = [
    { id: '1', name: "Mateo Rossi", email: "mateo@email.com", lastSession: "2024-04-12", condition: "Post-op Cruzado", color: "bg-blue-100" },
    { id: '2', name: "Lucía Fernández", email: "lucia@email.com", lastSession: "2024-04-14", condition: "Escoliosis Lumbar", color: "bg-teal-100" },
    { id: '3', name: "Carlos Gómez", email: "carlos@email.com", lastSession: "2024-04-10", condition: "Manguito Rotador", color: "bg-purple-100" },
    { id: '4', name: "Valentina Paz", email: "valen@email.com", lastSession: "2024-04-15", condition: "Esguince Tobillo", color: "bg-pink-100" },
  ];

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
              />
            </div>
          </div>
          
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
              {patients.map((p) => (
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
        </div>
      </main>
    </div>
  );
}
