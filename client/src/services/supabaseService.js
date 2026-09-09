/**
 * supabaseService.js
 * Data service layer handling interactions with Supabase database & storage bucket.
 */
import { supabase } from '../supabase';

/**
 * Uploads a document to PRIVATE Supabase Storage bucket 'hirecraft_docs'.
 * Returns internal storage_path rather than public URLs.
 * @param {File} file 
 * @param {string} sessionId 
 * @param {string} docType ('resume' | 'jd')
 * @returns {Promise<object>} { storage_path, file_name, file_size, file_type }
 */
export async function uploadDocument(file, sessionId = 'temp', docType = 'resume') {
  if (!file) return null;
  
  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storage_path = `diagnostic/${sessionId}/${docType}/${Date.now()}_${cleanName}`;
  
  try {
    const { data, error } = await supabase.storage
      .from('hirecraft_docs')
      .upload(storage_path, file, { upsert: true });

    if (error) {
      console.warn('Storage upload note:', error.message);
      return { storage_path, file_name: file.name, file_size: file.size, file_type: file.type };
    }

    return {
      storage_path: data.path || storage_path,
      file_name: file.name,
      file_size: file.size,
      file_type: file.type
    };
  } catch (e) {
    console.warn('Storage fallback activated:', e.message);
    return { storage_path, file_name: file.name, file_size: file.size, file_type: file.type };
  }
}

/**
 * Generates a short-lived signed URL for authorized admin viewing of private documents.
 * @param {string} storage_path 
 * @param {number} expiresInSeconds (default 3600 = 1 hour)
 * @returns {Promise<string>} Signed URL
 */
export async function getSignedDocumentUrl(storage_path, expiresInSeconds = 3600) {
  if (!storage_path) return null;
  
  try {
    const { data, error } = await supabase.storage
      .from('hirecraft_docs')
      .createSignedUrl(storage_path, expiresInSeconds);

    if (error) throw error;
    return data?.signedUrl || null;
  } catch (e) {
    console.warn('Signed URL note:', e.message);
    return null;
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
 * Updates lead status and internal admin notes in diagnostic_sessions table
 * @param {string} sessionId 
 * @param {string} status 
 * @param {string} internalNotes 
 */
export async function updateLeadStatus(sessionId, status, internalNotes) {
  if (!sessionId) return;
  try {
    const { error } = await supabase
      .from('diagnostic_sessions')
      .update({
        status,
        internal_notes: internalNotes,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    if (error) console.warn('Supabase status update note:', error.message);
  } catch (e) {
    console.warn('Status update fallback:', e.message);
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
 * Saves extracted document metadata and text to documents table
 */
export async function saveDocumentRecord(docPayload) {
  try {
    const { data, error } = await supabase
      .from('documents')
      .insert([docPayload])
      .select();

    if (error) console.warn('Save document record note:', error.message);
    return data ? data[0] : null;
  } catch (e) {
    console.warn('Save document record fallback:', e.message);
    return null;
  }
}

/**
 * Saves detected sections to document_sections table
 */
export async function saveDocumentSections(sectionsPayload = []) {
  if (!sectionsPayload.length) return;
  try {
    const { error } = await supabase
      .from('document_sections')
      .insert(sectionsPayload);
    if (error) console.warn('Save sections note:', error.message);
  } catch (e) {
    console.warn('Save sections fallback:', e.message);
  }
}

/**
 * Saves extracted evidence items to evidence_items table
 */
export async function saveEvidenceItems(evidencePayload = []) {
  if (!evidencePayload.length) return;
  try {
    const { error } = await supabase
      .from('evidence_items')
      .insert(evidencePayload);
    if (error) console.warn('Save evidence note:', error.message);
  } catch (e) {
    console.warn('Save evidence fallback:', e.message);
  }
}

/**
 * Saves structured job description to job_opportunities table
 */
export async function saveJobOpportunity(jdPayload) {
  try {
    const { data, error } = await supabase
      .from('job_opportunities')
      .insert([jdPayload])
      .select();
    if (error) console.warn('Save JD opportunity note:', error.message);
    return data ? data[0] : null;
  } catch (e) {
    console.warn('Save JD fallback:', e.message);
    return null;
  }
}
