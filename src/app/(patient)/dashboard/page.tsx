import { CalendarClock, Dumbbell, CheckCircle2, PlayCircle } from 'lucide-react';

export default function PatientDashboard() {
  const routine = [
    { id: 1, name: 'Sentadilla Mono-podal', series: 3, reps: '12' },
    { id: 2, name: 'Puente de Glúteo', series: 4, reps: '15' },
    { id: 3, name: 'Plancha Abdominal', series: 3, reps: '30 seg' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Saludo */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Hola, Mateo 👋</h1>
        <p className="text-slate-500 mt-2">Aquí tienes tu plan de rehabilitación.</p>
      </div>

      {/* Próximo Turno */}
      <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-[2rem] p-6 text-white shadow-lg shadow-purple-500/20 relative overflow-hidden">
        <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="flex items-start justify-between relative z-10">
          <div>
            <p className="text-purple-100 font-medium mb-1">Próxima Sesión</p>
            <h2 className="text-2xl font-bold mb-4">Jueves, 18 Abril</h2>
            <div className="flex items-center gap-2 bg-white/20 w-fit px-4 py-2 rounded-xl backdrop-blur-md">
              <CalendarClock size={18} className="text-purple-100" />
              <span className="font-bold">10:30 AM</span>
            </div>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
            <span className="font-bold text-lg">18</span>
          </div>
        </div>
        <p className="mt-6 text-sm text-purple-100 flex items-center gap-2">
          👨‍⚕️ Kinesiólogo: <span className="font-bold text-white">Manuel Amelong</span>
        </p>
      </div>

      {/* Rutina Asignada */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Dumbbell className="text-purple-500" /> Mi Rutina de Hoy
          </h2>
          <span className="text-xs font-bold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
            3 Ejercicios
          </span>
        </div>

        <div className="space-y-4">
          {routine.map((ex, i) => (
            <div key={ex.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center font-bold text-slate-400">
                {i + 1}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800">{ex.name}</h3>
                <p className="text-sm text-slate-500 mt-1">
                  {ex.series} series • {ex.reps}
                </p>
              </div>
              <button className="w-10 h-10 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-full flex items-center justify-center transition-colors">
                <PlayCircle size={24} />
              </button>
            </div>
          ))}
        </div>

        <button className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-2xl font-bold shadow-md shadow-purple-600/20 transition-all flex items-center justify-center gap-2">
          <CheckCircle2 size={20} /> Marcar rutina completada
        </button>
      </div>
    </div>
  );
}
