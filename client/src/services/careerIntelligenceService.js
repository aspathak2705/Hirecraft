/**
 * careerIntelligenceService.js
 * Client service layer for requesting Career Positioning Intelligence from HireCraft backend.
 */

import { supabase } from '../supabase';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

/**
 * Triggers or fetches Career Intelligence analysis for a diagnostic session.
 * @param {string} sessionId 
 * @returns {Promise<object>} Career Intelligence data or fallback
 */
export async function fetchCareerIntelligence(sessionId) {
  if (!sessionId) return null;

  // 1. Try DB direct lookup first (if already generated)
  try {
    const { data, error } = await supabase
      .from('career_intelligence')
      .select('*')
      .eq('diagnostic_session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (!error && data && data.length > 0) {
      return data[0];
    }
  } catch (e) {
    console.warn('[CareerIntelligence Client Direct DB Lookup]:', e.message);
  }

  // 2. Call backend server endpoint
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/career-intelligence/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ diagnostic_session_id: sessionId })
    });

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }

    const result = await response.json();
    return result?.data || null;

  } catch (err) {
    console.warn('[CareerIntelligence Backend Call Note]:', err.message);
    return null;
  }
}
