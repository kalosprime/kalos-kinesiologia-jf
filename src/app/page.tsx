import { Activity, User, Stethoscope } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-teal-50/30 flex flex-col items-center justify-center p-6">
      <div className="text-center mb-12 animate-in slide-in-from-bottom-4 duration-700">
        <div className="w-20 h-20 bg-teal-200 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-md shadow-teal-900/5">
          <Activity className="text-teal-800" size={40} />
        </div>
        <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Kalos Kinesiología</h1>
        <p className="text-slate-500 mt-2 font-medium text-lg">Selecciona tu portal de acceso</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
        {/* Acceso Profesional */}
        <Link href="/pro-dashboard" className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20 hover:shadow-teal-900/5 hover:border-teal-200 transition-all cursor-pointer relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="w-16 h-16 bg-teal-100 rounded-3xl flex items-center justify-center mb-6 text-teal-700">
            <Stethoscope size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Soy Profesional</h2>
          <p className="text-slate-500 font-medium">Gestiona tus pacientes, turnos y diseña rutinas de rehabilitación.</p>
        </Link>

        {/* Acceso Paciente */}
        <Link href="/dashboard" className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20 hover:shadow-purple-900/5 hover:border-purple-200 transition-all cursor-pointer relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="w-16 h-16 bg-purple-100 rounded-3xl flex items-center justify-center mb-6 text-purple-700">
            <User size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Soy Paciente</h2>
          <p className="text-slate-500 font-medium">Revisa tus próximos turnos y sigue tu rutina de ejercicios en casa.</p>
        </Link>
      </div>
    </div>
  );
}
