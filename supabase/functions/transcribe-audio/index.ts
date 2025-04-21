// Updated transcribe-audio Edge Function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
    // Authentication logic
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({
        error: 'Missing authorization header'
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({
        error: 'Invalid token'
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Get the JSON body instead of FormData
    const { audioBase64, fileName, fileType } = await req.json();
    if (!audioBase64) {
      return new Response(JSON.stringify({
        error: 'No audio data provided'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Convert base64 to Uint8Array
    const binaryData = Uint8Array.from(atob(audioBase64), (c)=>c.charCodeAt(0));
    // Create a blob from the binary data
    const audioBlob = new Blob([
      binaryData
    ], {
      type: fileType || 'audio/m4a'
    });
    // Create FormData to send to OpenAI
    const openAIFormData = new FormData();
    openAIFormData.append('file', new File([
      audioBlob
    ], fileName || 'audio.m4a', {
      type: fileType || 'audio/m4a'
    }));
    openAIFormData.append('model', 'whisper-1');
    openAIFormData.append('language', 'pt');
    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`
      },
      body: openAIFormData
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API error');
    }
    const result = await response.json();
    // Return the transcription text
    return new Response(JSON.stringify({
      text: result.text
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
