'use client';

import { Activity, Mail, Lock } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage('Error: Credenciales incorrectas');
      } else {
        // Redirigir según el rol del usuario (esto se pulirá luego con la DB)
        const userRole = data.user?.user_metadata?.role;
        if (userRole === 'professional') {
          router.push('/pro-dashboard');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (error: any) {
      setMessage('Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-teal-50/30 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-teal-900/5">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-teal-200 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
            <Activity className="text-teal-800" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight text-center">Bienvenido a Kalos JF</h1>
          <p className="text-slate-400 mt-2 font-medium text-center">Inicia sesión en tu portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full bg-slate-50 border-none p-4 pl-12 rounded-2xl text-slate-800 placeholder:text-slate-300 outline-none focus:ring-2 ring-teal-200 transition-all"
              />
            </div>
          </div>

          {message && (
            <p className={`text-sm text-center font-bold p-3 rounded-xl ${message.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              {message}
            </p>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-teal-200 hover:bg-teal-300 text-teal-900 p-4 rounded-2xl font-bold text-lg shadow-md shadow-teal-900/10 transition-all transform active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Iniciando sesión...' : 'Entrar al Dashboard'}
          </button>
        </form>

        <p className="text-center mt-10 text-sm text-slate-400 font-medium">
          ¿No tienes una cuenta? <Link href="/register" className="text-teal-600 font-bold hover:underline">Regístrate gratis</Link>
        </p>
      </div>
    </div>
  );
}
