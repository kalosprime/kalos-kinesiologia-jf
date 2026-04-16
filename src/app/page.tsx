import { User, Stethoscope, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 relative overflow-hidden text-white">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-[-10%] -left-[10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] -right-[10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[100px]"></div>

      <div className="text-center mb-16 z-10 animate-in fade-in slide-in-from-top-6 duration-1000">
        <div className="w-32 h-32 bg-white p-2 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/20 border-2 border-emerald-500/30 overflow-hidden">
          <Image src="/logo-kalos.jpg" alt="Kalos Logo" width={128} height={128} className="object-cover" />
        </div>
        <h1 className="text-5xl font-black tracking-tighter sm:text-6xl mb-4">
          KALOS <span className="text-emerald-500">KINESIOLOGÍA</span>
        </h1>
        <p className="text-slate-400 max-w-lg mx-auto text-lg font-medium leading-relaxed">
          Gestión clínica avanzada y rehabilitación personalizada de alto rendimiento.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl z-10">
        {/* Acceso Profesional */}
        <Link href="/login" className="group bg-[#111] p-10 rounded-[2rem] border border-white/5 hover:border-emerald-500/50 transition-all duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-[100px] -z-10 group-hover:bg-emerald-500/10 transition-colors"></div>
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-8 text-emerald-500 group-hover:scale-110 transition-transform">
            <Stethoscope size={32} />
          </div>
          <h2 className="text-2xl font-bold mb-3">Portal Profesional</h2>
          <p className="text-slate-400 font-medium leading-relaxed mb-8">
            Administra pacientes, historia clínica y diseña planes de ejercicios.
          </p>
          <div className="flex items-center text-emerald-500 font-bold gap-2 group-hover:gap-4 transition-all">
            Ingresar ahora <ChevronRight size={20} />
          </div>
        </Link>

        {/* Acceso Paciente */}
        <Link href="/login" className="group bg-[#111] p-10 rounded-[2rem] border border-white/5 hover:border-emerald-500/50 transition-all duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-[100px] -z-10 group-hover:bg-emerald-500/10 transition-colors"></div>
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-8 text-emerald-500 group-hover:scale-110 transition-transform">
            <User size={32} />
          </div>
          <h2 className="text-2xl font-bold mb-3">Portal Paciente</h2>
          <p className="text-slate-400 font-medium leading-relaxed mb-8">
            Revisa tus próximos turnos y sigue tu rutina personalizada en casa.
          </p>
          <div className="flex items-center text-emerald-500 font-bold gap-2 group-hover:gap-4 transition-all">
            Ver mis ejercicios <ChevronRight size={20} />
          </div>
        </Link>
      </div>
      
      <footer className="mt-20 text-slate-600 text-sm font-bold uppercase tracking-[0.2em]">
        © 2024 Kalos Kinesiología • Built for performance
      </footer>
    </div>
  );
}
