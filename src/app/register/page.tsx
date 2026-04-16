'use client';

import { Mail, Lock, User } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'patient' | 'professional'>('patient');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // 1. Crear el usuario en Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role: role
          }
        }
      });

      if (error) {
        setMessage('Error al registrar: ' + error.message);
      } else {
        // 2. Guardar en la tabla pública correspondiente
        if (data.user) {
          if (role === 'professional') {
            await supabase.from('User').insert({
              id: data.user.id,
              email: email,
              password: 'auth-handled',
              name: name,
              updatedAt: new Date().toISOString()
            });
          } else {
            await supabase.from('Patient').insert({
              id: data.user.id,
              name: name,
              email: email,
              updatedAt: new Date().toISOString()
            });
          }
        }
        setMessage('¡Cuenta creada con éxito! Ahora puedes iniciar sesión.');
      }
    } catch (error: unknown) {
      setMessage('Error inesperado: ' + (error instanceof Error ? error.message : 'Desconocido'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-teal-50/30 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-teal-900/5">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-4 shadow-sm overflow-hidden border border-slate-100">
            <Image src="/logo-kalos.jpg" alt="Logo" width={80} height={80} className="object-cover" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight text-center">Crea tu cuenta</h1>
          <p className="text-slate-400 mt-2 font-medium text-center">Únete a Kalos Kinesiología</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          {/* Selector de Rol */}
          <div className="flex gap-4 p-1 bg-slate-50 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => setRole('patient')}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${role === 'patient' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-400'}`}
            >
              Soy Paciente
            </button>
            <button
              type="button"
              onClick={() => setRole('professional')}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${role === 'professional' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-400'}`}
            >
              Soy Profesional
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Nombre Completo</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Juan Pérez" 
                className="w-full bg-slate-50 border-none p-4 pl-12 rounded-2xl text-slate-800 placeholder:text-slate-300 outline-none focus:ring-2 ring-teal-200 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Email</label>
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
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Contraseña</label>
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
            className="w-full mt-4 bg-teal-200 hover:bg-teal-300 text-teal-900 p-4 rounded-2xl font-bold text-lg shadow-md shadow-teal-900/10 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-slate-400 font-medium">
          ¿Ya tienes una cuenta? <Link href="/login" className="text-teal-600 font-bold hover:underline">Inicia Sesión</Link>
        </p>
      </div>
    </div>
  );
}
