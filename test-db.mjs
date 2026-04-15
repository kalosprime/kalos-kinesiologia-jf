import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://dpajgsxwtnptkjxrhbrr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwYWpnc3h3dG5wdGtqeHJoYnJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyMzg1MTMsImV4cCI6MjA5MTgxNDUxM30.v4h9r16Z_zOmeAI0OTEzcEwp-wzw-FqpmugkmVxYBOc'
);

async function test() {
  const { data, error } = await supabase.from('Appointment').select('*');
  console.log('Appointments:', data);
  if (error) console.error('Error Appointments:', error);

  const { data: users, error: errU } = await supabase.from('User').select('*');
  console.log('Users:', users);
  if (errU) console.error('Error Users:', errU);
  
  const { data: patients, error: errP } = await supabase.from('Patient').select('*');
  console.log('Patients:', patients);
  if (errP) console.error('Error Patients:', errP);
}

test();
