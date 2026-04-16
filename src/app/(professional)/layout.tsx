'use client';

import { Calendar, Users, Activity, Clock, Settings, Dumbbell } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

import { useRouter } from 'next/navigation';

export default function ProfessionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userName, setUserName] = useState('Profesional');
  const [userInitials, setUserInitials] = useState('PR');
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        // Verificamos el rol guardado en la metadata del usuario de Supabase Auth
        if (!user || user.user_metadata?.role !== 'professional') {
          console.log('Usuario no autorizado para el panel profesional');
          setIsAuthorized(false);
          router.push('/login');
          return;
        }

        // Si es profesional, cargamos sus datos reales
        setIsAuthorized(true);
        const fullName = user.user_metadata.full_name || 'Kinesiólogo';
        setUserName(fullName);
        const splitName = fullName.split(' ');
        if (splitName.length > 1) {
          setUserInitials(splitName[0][0].toUpperCase() + splitName[1][0].toUpperCase());
        } else {
          setUserInitials(fullName.substring(0, 2).toUpperCase());
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        router.push('/login');
      }
    };
    checkAuth();
  }, [router]);

  if (isAuthorized === null) return <div className="min-h-screen flex items-center justify-center text-teal-600"><Activity className="animate-spin" /></div>;
  if (isAuthorized === false) return null;

  return (
    <div className="min-h-screen bg-[#fafafa] flex">
      {/* Menú Lateral Fijo */}
      <aside className="w-64 flex flex-col gap-6 p-8 border-r border-slate-100 bg-white/50 backdrop-blur-sm fixed h-screen">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-teal-200 rounded-2xl flex items-center justify-center shadow-sm">
            <Activity className="text-teal-800" size={24} />
          </div>
          <span className="font-bold text-2xl tracking-tight text-slate-800">Kalos<span className="text-teal-600">JF</span></span>
        </div>
        
        <nav className="flex flex-col gap-2">
          <Link href="/pro-dashboard" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-teal-50 hover:text-teal-700 rounded-2xl font-bold transition-all">
            <Calendar size={20} /> Dashboard
          </Link>
          <Link href="/patients" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-teal-50 hover:text-teal-700 rounded-2xl font-bold transition-all">
            <Users size={20} /> Mis Pacientes
          </Link>
          <Link href="/exercises" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-teal-50 hover:text-teal-700 rounded-2xl font-bold transition-all">
            <Dumbbell size={20} /> Catálogo de Ejercicios
          </Link>
          <Link href="/patients" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-teal-50 hover:text-teal-700 rounded-2xl font-bold transition-all">
            <Activity size={20} /> Rutinas
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-teal-50 hover:text-teal-700 rounded-2xl font-bold transition-all opacity-50 cursor-not-allowed">
            <Clock size={20} /> Historial
          </Link>
          <Link href="/settings" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-teal-50 hover:text-teal-700 rounded-2xl font-bold transition-all mt-4">
            <Settings size={20} /> Configuración
          </Link>
        </nav>

        {/* Perfil del Profesional abajo */}
        <div className="mt-auto flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
          <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600">
            {userInitials}
          </div>
          <div>
            <p className="font-bold text-sm text-slate-800 truncate w-32">{userName}</p>
            <p className="text-xs text-slate-500">Kinesiólogo</p>
          </div>
        </div>
      </aside>

      {/* Contenido Principal (Lo que cambia al navegar) */}
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
