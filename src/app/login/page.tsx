import { Activity, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-teal-50/30 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-teal-900/5">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-teal-200 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
            <Activity className="text-teal-800" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight text-center">Bienvenido a Kalos JF</h1>
          <p className="text-slate-400 mt-2 font-medium text-center">Gestión clínica para kinesiólogos</p>
        </div>

        <form className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Email Profesional</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="email" 
                placeholder="hola@tuemail.com" 
                className="w-full bg-slate-50 border-none p-4 pl-12 rounded-2xl text-slate-800 placeholder:text-slate-300 outline-none focus:ring-2 ring-teal-200 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full bg-slate-50 border-none p-4 pl-12 rounded-2xl text-slate-800 placeholder:text-slate-300 outline-none focus:ring-2 ring-teal-200 transition-all"
              />
            </div>
          </div>

          <button className="w-full bg-teal-200 hover:bg-teal-300 text-teal-900 p-4 rounded-2xl font-bold text-lg shadow-md shadow-teal-900/10 transition-all transform active:scale-[0.98]">
            Entrar al Dashboard
          </button>
        </form>

        <p className="text-center mt-10 text-sm text-slate-400 font-medium">
          ¿Problemas con tu acceso? <span className="text-teal-600 cursor-pointer">Contactar soporte</span>
        </p>
      </div>
    </div>
  );
}
