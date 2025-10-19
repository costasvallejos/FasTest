import { useState } from 'react';
import { generateTest } from '../backendApi/generateTest';
import { supabase } from '../supabase';

export const useTestGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generate = async ({ testId, url, description }) => {
    if (!url || !description) {
      throw new Error('URL and description are required');
    }

    if (!testId) {
      throw new Error('Test ID is required for regeneration');
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await generateTest({
        target_url: url,
        test_case_description: description,
      });

      const { error: updateError } = await supabase
        .from('tests')
        .update({
          plan: response.test_plan,
          test_script: response.test_script,
        })
        .eq('id', testId);

      if (updateError) throw updateError;

      return {
        testPlan: response.test_plan,
        testScript: response.test_script,
      };
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  return { generate, isGenerating, error };
};
