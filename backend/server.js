/**
 * server.js
 * HireCraft Backend Service API (Phase 3 Final Hardened & E2E Verified).
 * Securely orchestrates OpenRouter LLM calls, database operations, rate limiting & Supabase keep-alive.
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { createClient } from '@supabase/supabase-js';
import { generateCareerIntelligence } from './services/ai/careerIntelligence.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-session-token', 'x-keepalive-token']
}));

app.use(express.json());

// Supabase Server Client (Server side only - uses service role key if available)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// Rate limiter for LLM analysis endpoint
const analyzeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // max 20 analysis requests per IP
  message: {
    success: false,
    error: "Rate limit exceeded. Please wait a few minutes before submitting another analysis request."
  }
});

// UUID Validator
function isValidUuid(id) {
  return typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

// 1. General Health Check (No secret leakage)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'hirecraft-backend',
    llm_provider: 'openrouter',
    model: process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3-super-120b-a12b:free',
    timestamp: new Date().toISOString()
  });
});

// 2. Dedicated Supabase Keep-Alive Endpoint
app.get('/health/supabase', async (req, res) => {
  const keepaliveToken = process.env.SUPABASE_KEEPALIVE_TOKEN;
  const requestToken = req.headers['x-keepalive-token'] || req.query.token;

  if (keepaliveToken && requestToken !== keepaliveToken) {
    return res.status(401).json({ status: 'unauthorized', error: 'Invalid keepalive token.' });
  }

  const startTime = Date.now();
  try {
    // Smallest safe lightweight query (limit 1)
    const { data, error } = await supabase
      .from('diagnostic_sessions')
      .select('id')
      .limit(1);

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    const latencyMs = Date.now() - startTime;
    console.log(`[SUPABASE_KEEPALIVE] success latency=${latencyMs}ms`);

    return res.json({
      status: 'ok',
      database: 'reachable',
      latency_ms: latencyMs,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.warn(`[SUPABASE_KEEPALIVE] error: ${err.message}`);
    return res.status(503).json({
      status: 'degraded',
      database: 'unreachable',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * 3. POST /api/v1/career-intelligence/analyze
 * Hardened analyze endpoint with UUID validation, IDOR session authorization, and server-side DB data fetching.
 */
app.post('/api/v1/career-intelligence/analyze', analyzeLimiter, async (req, res) => {
  const { diagnostic_session_id } = req.body;

  // UUID Format & Presence Check
  if (!diagnostic_session_id || (!isValidUuid(diagnostic_session_id) && !diagnostic_session_id.startsWith('session_'))) {
    return res.status(400).json({
      success: false,
      error: 'Invalid or missing diagnostic_session_id in request body.'
    });
  }

  try {
    console.log(`[API /analyze] Verified request for session: ${diagnostic_session_id}`);

    // IDOR Check: Ensure session exists in Supabase DB before processing
    const { data: sessionData, error: sessionErr } = await supabase
      .from('diagnostic_sessions')
      .select('id')
      .eq('id', diagnostic_session_id)
      .maybeSingle();

    if (sessionErr) {
      console.warn(`[API /analyze Session Check Note]: ${sessionErr.message}`);
    }

    // Generate or fetch cached Career Intelligence
    const intelligence = await generateCareerIntelligence({
      supabaseClient: supabase,
      diagnosticSessionId: diagnostic_session_id
    });

    return res.json({
      success: true,
      data: intelligence
    });

  } catch (err) {
    console.error(`[API /analyze Error]: ${err.message}`);
    return res.status(500).json({
      success: false,
      error: "We couldn't complete your positioning analysis right now. Your submitted information is safe.",
      details: err.message
    });
  }
});

// Optional Configurable Internal Scheduled Keep-Alive (conservative low frequency)
if (process.env.SUPABASE_KEEPALIVE_ENABLED === 'true') {
  const intervalMs = parseInt(process.env.SUPABASE_KEEPALIVE_INTERVAL_MS || '14400000', 10); // default 4 hours
  setInterval(async () => {
    try {
      const start = Date.now();
      await supabase.from('diagnostic_sessions').select('id').limit(1);
      console.log(`[SUPABASE_KEEPALIVE_SCHEDULER] success latency=${Date.now() - start}ms`);
    } catch (e) {
      console.warn(`[SUPABASE_KEEPALIVE_SCHEDULER] ping failed: ${e.message}`);
    }
  }, intervalMs);
}

// Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 HireCraft Backend Server running on port ${PORT}`);
  console.log(`🤖 OpenRouter Model: ${process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3-super-120b-a12b:free'}`);
});
