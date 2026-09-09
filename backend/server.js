/**
 * server.js
 * HireCraft Backend Service API (Phase 3).
 * Securely orchestrates OpenRouter LLM calls and database operations.
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
  allowedHeaders: ['Content-Type', 'Authorization', 'x-session-token']
}));

app.use(express.json());

// Supabase Server Client
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

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'hirecraft-career-intelligence',
    model: process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3-super-120b-a12b:free',
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /api/v1/career-intelligence/analyze
 * Triggers or retrieves cached Career Positioning Intelligence for a diagnostic session.
 */
app.post('/api/v1/career-intelligence/analyze', analyzeLimiter, async (req, res) => {
  const { diagnostic_session_id } = req.body;

  if (!diagnostic_session_id) {
    return res.status(400).json({
      success: false,
      error: 'Missing diagnostic_session_id in request body.'
    });
  }

  try {
    console.log(`[API /analyze] Starting Career Intelligence analysis for session: ${diagnostic_session_id}`);
    
    const intelligence = await generateCareerIntelligence({
      supabaseClient: supabase,
      diagnosticSessionId: diagnostic_session_id
    });

    return res.json({
      success: true,
      data: intelligence
    });

  } catch (err) {
    console.error('[API /analyze Error]:', err.message);
    return res.status(500).json({
      success: false,
      error: "We couldn't complete your positioning analysis right now. Your submitted information is safe.",
      details: err.message
    });
  }
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 HireCraft Backend Server running on port ${PORT}`);
  console.log(`🤖 OpenRouter Model: ${process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3-super-120b-a12b:free'}`);
});
