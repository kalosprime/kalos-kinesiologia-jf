'use client';

import { Home, Calendar, Dumbbell, User } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userInitials, setUserInitials] = useState('P');

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.full_name) {
        const fullName = user.user_metadata.full_name;
        const splitName = fullName.split(' ');
        if (splitName.length > 1) {
          setUserInitials(splitName[0][0].toUpperCase() + splitName[1][0].toUpperCase());
        } else {
          setUserInitials(fullName.substring(0, 2).toUpperCase());
        }
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      {/* Top Header para móvil */}
      <header className="bg-white p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 z-10 md:hidden">
        <span className="font-bold text-xl tracking-tight text-slate-800">Kalos<span className="text-purple-600">Paciente</span></span>
        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-sm">
          {userInitials}
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-3xl mx-auto p-4 md:p-8">
        {children}
      </main>

      {/* Bottom Navigation para móvil (Sidebar en Desktop) */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-slate-100 px-6 py-4 flex justify-between items-center md:hidden z-20">
        <Link href="/dashboard" className="flex flex-col items-center text-purple-600">
          <Home size={24} />
          <span className="text-[10px] font-bold mt-1">Inicio</span>
        </Link>
        <Link href="/book" className="flex flex-col items-center text-slate-400 hover:text-purple-500 transition-colors">
          <Calendar size={24} />
          <span className="text-[10px] font-bold mt-1">Turnos</span>
        </Link>
        <Link href="#" className="flex flex-col items-center text-slate-400 hover:text-purple-500 transition-colors">
          <Dumbbell size={24} />
          <span className="text-[10px] font-bold mt-1">Mi Rutina</span>
        </Link>
        <Link href="#" className="flex flex-col items-center text-slate-400 hover:text-purple-500 transition-colors">
          <User size={24} />
          <span className="text-[10px] font-bold mt-1">Perfil</span>
        </Link>
      </nav>
    </div>
  );
}
