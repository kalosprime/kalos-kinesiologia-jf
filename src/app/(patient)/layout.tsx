'use client';

import { Home, Calendar, Dumbbell, User } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userInitials, setUserInitials] = useState('P');
  const pathname = usePathname();

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

  const navItems = [
    { href: '/dashboard', icon: <Home size={24} />, label: 'Inicio' },
    { href: '/book', icon: <Calendar size={24} />, label: 'Turnos' },
    { href: '#', icon: <Dumbbell size={24} />, label: 'Mi Rutina' },
    { href: '#', icon: <User size={24} />, label: 'Perfil' },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-24 md:pb-0">
      {/* Top Header Pro */}
      <header className="bg-black/80 backdrop-blur-xl border-b border-white/5 p-5 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center overflow-hidden">
            <Image src="/logo-kalos.jpg" alt="Logo" width={40} height={40} className="object-cover" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-black text-lg tracking-tighter">KALOS</span>
            <span className="text-emerald-500 font-bold text-[8px] tracking-[0.3em] uppercase">PACIENTES</span>
          </div>
        </div>
        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-black font-black text-xs shadow-lg shadow-emerald-500/20">
          {userInitials}
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-3xl mx-auto p-6 md:p-12 animate-in fade-in duration-700">
        {children}
      </main>

      {/* Bottom Nav Pro */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-black/60 backdrop-blur-2xl border border-white/10 px-8 py-4 rounded-[2rem] flex justify-between items-center z-40 shadow-2xl shadow-emerald-500/5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.label}
              href={item.href} 
              className={`flex flex-col items-center transition-all duration-300 ${isActive ? 'text-emerald-500 scale-110' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {item.icon}
              <span className="text-[10px] font-bold mt-1 uppercase tracking-widest">{item.label}</span>
              {isActive && <div className="w-1 h-1 bg-emerald-500 rounded-full mt-1"></div>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
