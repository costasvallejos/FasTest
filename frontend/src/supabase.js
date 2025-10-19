// src/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are set
if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase environment variables not found. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder-key');

export async function fetchTestById(testId) {
  const { data, error } = await supabase
    .from('tests')
    .select('*')
    .eq('id', testId)
    .single();

  if (error) {
    console.error('Error fetching test:', error);
    throw error;
  }

  return data;
}

export async function updateTestOnSuccess(testId) {
  const { error } = await supabase
    .from('tests')
    .update({
      last_run_at: new Date().toISOString(),
      last_passed: true,
      last_error_message: null,
      last_error_step: null,
      last_error_index: null
    })
    .eq('id', testId);

  if (error) {
    console.error('Error updating test on success:', error);
    throw error;
  }
}

export async function updateTestOnFailure(testId, { errorMessage, errorStep, errorIndex }) {
  const { error } = await supabase
    .from('tests')
    .update({
      last_run_at: new Date().toISOString(),
      last_passed: false,
      last_error_message: errorMessage,
      last_error_step: errorStep,
      last_error_index: errorIndex
    })
    .eq('id', testId);

  if (error) {
    console.error('Error updating test on failure:', error);
    throw error;
  }
}
