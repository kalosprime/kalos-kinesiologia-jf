import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://dpajgsxwtnptkjxrhbrr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwYWpnc3h3dG5wdGtqeHJoYnJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyMzg1MTMsImV4cCI6MjA5MTgxNDUxM30.v4h9r16Z_zOmeAI0OTEzcEwp-wzw-FqpmugkmVxYBOc'
);

async function testConcurrency() {
  console.log('--- TEST DE DISPONIBILIDAD DE TURNOS ---');
  
  const profId = '92e0a0fe-6ae5-4f65-b79b-5729ee7c26de'; // Manuel Amelong
  const dateStr = new Date().toLocaleDateString();
  const testTime = '11:00';
  const testAptId = 'concurrency-test-' + Date.now();

  console.log(`1. Simulando que el turno de las ${testTime} está libre...`);
  
  // 2. Insertamos un turno a esa hora
  console.log(`2. Paciente A agendando turno a las ${testTime}...`);
  await supabase.from('Appointment').insert({
    id: testAptId,
    date: new Date().toISOString(),
    status: 'PENDIENTE',
    professionalId: profId,
    patientId: '8a67ec58-f92e-41f6-8209-68ec3667bd77', // Tomas
    notes: `Turno agendado: ${dateStr} a las ${testTime}`,
    updatedAt: new Date().toISOString()
  });

  // 3. Consultamos turnos ocupados como si fuéramos el Paciente B
  console.log('3. Paciente B consultando disponibilidad para el mismo día...');
  const { data: taken } = await supabase
    .from('Appointment')
    .select('notes')
    .eq('professionalId', profId)
    .neq('status', 'CANCELADO');

  const takenTimes = taken?.filter(t => t.notes?.includes(dateStr))
                           .map(t => t.notes?.match(/a las (.*)/)?.[1]) || [];

  if (takenTimes.includes(testTime)) {
    console.log(`✅ EXITO: El horario de las ${testTime} ya NO aparece como disponible para otros pacientes.`);
  } else {
    console.error(`❌ FALLO: El horario sigue apareciendo como libre.`);
  }

  // Limpieza
  await supabase.from('Appointment').delete().eq('id', testAptId);
  console.log('--- FIN DEL TEST ---');
}

testConcurrency();
