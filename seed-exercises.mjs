import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://dpajgsxwtnptkjxrhbrr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwYWpnc3h3dG5wdGtqeHJoYnJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyMzg1MTMsImV4cCI6MjA5MTgxNDUxM30.v4h9r16Z_zOmeAI0OTEzcEwp-wzw-FqpmugkmVxYBOc'
);

const EXERCISES = [
  { id: 'ex1', name: 'Sentadilla Mono-podal', muscleGroup: 'Cuádriceps', description: 'Bajar con una sola pierna controlando la rodilla.' },
  { id: 'ex2', name: 'Plancha Abdominal', muscleGroup: 'Core', description: 'Mantener cuerpo recto apoyado en antebrazos.' },
  { id: 'ex3', name: 'Puente de Glúteo', muscleGroup: 'Cadera', description: 'Elevar pelvis apretando glúteos.' },
  { id: 'ex4', name: 'Y-W Press', muscleGroup: 'Hombro', description: 'Movimiento de brazos en forma de Y y W para escápulas.' },
  { id: 'ex5', name: 'Deadlift Rumano', muscleGroup: 'Isquios', description: 'Bajada con espalda recta estirando isquiotibiales.' },
];

async function seed() {
  console.log('Insertando ejercicios reales...');
  const { error } = await supabase.from('Exercise').upsert(EXERCISES);
  if (error) console.error('Error al insertar:', error);
  else console.log('¡Ejercicios insertados con éxito!');
}

seed();
