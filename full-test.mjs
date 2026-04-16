import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://dpajgsxwtnptkjxrhbrr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwYWpnc3h3dG5wdGtqeHJoYnJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyMzg1MTMsImV4cCI6MjA5MTgxNDUxM30.v4h9r16Z_zOmeAI0OTEzcEwp-wzw-FqpmugkmVxYBOc'
);

async function fullSystemTest() {
  console.log('--- INICIANDO TEST INTEGRAL DEL SISTEMA ---');
  
  const testProfId = '92e0a0fe-6ae5-4f65-b79b-5729ee7c26de'; // Manuel Amelong
  const testPatientId = '8a67ec58-f92e-41f6-8209-68ec3667bd77'; // Tomas Argento

  // 1. Verificar Kinesiólogo y su Agenda
  console.log('1. Verificando Kinesiólogo...');
  const { data: prof } = await supabase.from('User').select('*').eq('id', testProfId).single();
  if (prof) {
    console.log('✅ Profesional encontrado:', prof.name);
    console.log('📅 Agenda configurada:', prof.schedule ? 'SÍ' : 'NO');
  } else {
    console.error('❌ Profesional no encontrado');
  }

  // 2. Verificar Paciente
  console.log('2. Verificando Paciente...');
  const { data: patient } = await supabase.from('Patient').select('*').eq('id', testPatientId).single();
  if (patient) {
    console.log('✅ Paciente encontrado:', patient.name);
  } else {
    console.error('❌ Paciente no encontrado');
  }

  // 3. Simular Carga de Historia Clínica (UPDATE)
  console.log('3. Testeando Edición de Historia Clínica...');
  const newHistory = 'Evolución test ' + new Date().toLocaleTimeString();
  const { error: updateErr } = await supabase
    .from('Patient')
    .update({ clinicalHistory: newHistory })
    .eq('id', testPatientId);
  
  if (!updateErr) {
    console.log('✅ Historia clínica actualizada correctamente.');
  } else {
    console.error('❌ Error actualizando historia:', updateErr.message);
  }

  // 4. Simular Sacar Turno (INSERT)
  console.log('4. Testeando Reserva de Turno...');
  const appointmentId = 'test-apt-' + Date.now();
  const { error: aptErr } = await supabase.from('Appointment').insert({
    id: appointmentId,
    date: new Date().toISOString(),
    status: 'PENDIENTE',
    professionalId: testProfId,
    patientId: testPatientId,
    notes: 'Turno de prueba técnica'
  });

  if (!aptErr) {
    console.log('✅ Turno agendado con éxito.');
    
    // 5. Simular Cancelación de Turno (UPDATE)
    console.log('5. Testeando Cancelación de Turno...');
    const { error: cancelErr } = await supabase
      .from('Appointment')
      .update({ status: 'CANCELADO' })
      .eq('id', appointmentId);
    
    if (!cancelErr) {
      console.log('✅ Turno cancelado con éxito.');
    } else {
      console.error('❌ Error al cancelar turno:', cancelErr.message);
    }
  } else {
    console.error('❌ Error al agendar turno:', aptErr.message);
  }

  // 6. Verificar Rutinas (INSERT)
  console.log('6. Testeando Asignación de Rutina...');
  const routineId = 'test-routine-' + Date.now();
  const { error: routErr } = await supabase.from('Routine').insert({
    id: routineId,
    patientId: testPatientId,
    name: 'Rutina de Test'
  });

  if (!routErr) {
    console.log('✅ Rutina creada. Testeando asignación de ejercicio...');
    const { error: itemErr } = await supabase.from('RoutineItem').insert({
      id: 'test-item-' + Date.now(),
      routineId: routineId,
      exerciseId: 'ex1', // Sentadilla mono-podal
      series: 3,
      reps: '12'
    });
    if (!itemErr) {
      console.log('✅ Ejercicio asignado a la rutina correctamente.');
    } else {
      console.error('❌ Error asignando ejercicio:', itemErr.message);
    }
  } else {
    console.error('❌ Error creando rutina:', routErr.message);
  }

  console.log('--- FIN DEL TEST ---');
}

fullSystemTest();
