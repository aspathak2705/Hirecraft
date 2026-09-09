/**
 * supabaseService.js
 * Data service layer handling interactions with Supabase database & storage bucket.
 */
import { supabase } from '../supabase';

/**
 * Uploads a file to Supabase Storage bucket 'hirecraft_docs' or returns local object URL as fallback.
 * @param {File} file 
 * @param {string} folder 
 * @returns {Promise<string>} File URL
 */
export async function uploadDocument(file, folder = 'resumes') {
  if (!file) return null;
  
  const fileName = `${folder}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  
  try {
    const { data, error } = await supabase.storage
      .from('hirecraft_docs')
      .upload(fileName, file, { upsert: true });

    if (error) {
      console.warn('Storage upload note:', error.message);
      // Fallback: return descriptive reference string
      return `[Uploaded File: ${file.name}]`;
    }

    const { data: publicUrlData } = supabase.storage
      .from('hirecraft_docs')
      .getPublicUrl(data.path);

    return publicUrlData?.publicUrl || `[Uploaded File: ${file.name}]`;
  } catch (e) {
    console.warn('Storage fallback activated:', e.message);
    return `[Uploaded File: ${file.name}]`;
  }
}

/**
 * Creates or updates a diagnostic session record in Supabase
 * @param {object} sessionPayload 
 * @returns {Promise<object>} Record data or fallback object
 */
export async function saveDiagnosticSession(sessionPayload) {
  try {
    const { data, error } = await supabase
      .from('diagnostic_sessions')
      .insert([sessionPayload])
      .select();

    if (error) {
      console.warn('Supabase DB save note (using schema fallback):', error.message);
      return { id: `session_${Date.now()}`, ...sessionPayload };
    }

    return data[0] || sessionPayload;
  } catch (e) {
    console.warn('Database fallback activated:', e.message);
    return { id: `session_${Date.now()}`, ...sessionPayload };
  }
}

/**
 * Updates diagnostic session with consultation request details & status update
 * @param {string} sessionId 
 * @param {object} updateData 
 */
export async function updateSessionConsultation(sessionId, updateData) {
  if (!sessionId) return;
  
  try {
    const { error } = await supabase
      .from('diagnostic_sessions')
      .update({
        ...updateData,
        status: 'Consultation Requested',
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    if (error) console.warn('Supabase update note:', error.message);
  } catch (e) {
    console.warn('Update fallback:', e.message);
  }
}

/**
 * Retrieves all diagnostic sessions for the Admin Intelligence Dashboard
 */
export async function fetchDiagnosticSessions() {
  try {
    const { data, error } = await supabase
      .from('diagnostic_sessions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (e) {
    console.warn('Admin fetch fallback:', e.message);
    return null;
  }
}

/**
 * Updates lead status in admin dashboard
 */
export async function updateLeadStatus(sessionId, status, internal_notes) {
  try {
    const { error } = await supabase
      .from('diagnostic_sessions')
      .update({ status, internal_notes, updated_at: new Date().toISOString() })
      .eq('id', sessionId);

    if (error) console.warn('Admin update error:', error.message);
  } catch (e) {
    console.warn('Admin update fallback:', e.message);
  }
}
