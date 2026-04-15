import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://dpajgsxwtnptkjxrhbrr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwYWpnc3h3dG5wdGtqeHJoYnJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyMzg1MTMsImV4cCI6MjA5MTgxNDUxM30.v4h9r16Z_zOmeAI0OTEzcEwp-wzw-FqpmugkmVxYBOc'
);

async function test() {
  const patientId = '8a67ec58-f92e-41f6-8209-68ec3667bd77';

  const { data: apts, error } = await supabase
    .from('Appointment')
    .select(`
      date,
      notes,
      User!Appointment_professionalId_fkey ( name )
    `)
    .eq('patientId', patientId)
    .order('createdAt', { ascending: false })
    .limit(1);

  console.log('Patient Query:', apts);
  if (error) console.error('Patient Error:', error);

  const profId = '92e0a0fe-6ae5-4f65-b79b-5729ee7c26de';
  const { data: aptsPro, error: errPro } = await supabase
    .from('Appointment')
    .select(`
      id,
      date,
      status,
      notes,
      Patient!Appointment_patientId_fkey ( name )
    `)
    .eq('professionalId', profId)
    .order('createdAt', { ascending: false });

  console.log('Pro Query:', aptsPro);
  if (errPro) console.error('Pro Error:', errPro);
}

test();
