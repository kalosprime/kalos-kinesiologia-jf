import { Activity } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-teal-50/30 flex flex-col items-center justify-center p-6">
      <div className="text-center mb-12 animate-in slide-in-from-bottom-4 duration-700">
        <div className="w-20 h-20 bg-teal-200 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-md shadow-teal-900/5">
          <Activity className="text-teal-800" size={40} />
        </div>
        <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Kalos Kinesiología</h1>
        <p className="text-slate-500 mt-2 font-medium text-lg">Tu plataforma de gestión clínica y rehabilitación</p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-sm">
        <Link href="/login" className="bg-teal-200 hover:bg-teal-300 text-teal-900 w-full p-4 rounded-2xl font-bold text-lg text-center shadow-sm transition-all active:scale-[0.98]">
          Iniciar Sesión
        </Link>
        <Link href="/register" className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 w-full p-4 rounded-2xl font-bold text-lg text-center shadow-sm transition-all active:scale-[0.98]">
          Crear una cuenta nueva
        </Link>
      </div>
    </div>
  );
}
