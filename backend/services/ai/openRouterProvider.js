/**
 * openRouterProvider.js
 * OpenRouter OpenAI-compatible API wrapper for Nemotron reasoning models.
 * API key resides EXCLUSIVELY on the server.
 */

import { OpenAI } from 'openai';

export class OpenRouterProvider {
  constructor() {
    const apiKey = process.env.OPENROUTER_API_KEY || 'dummy_openrouter_key';
    const baseURL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
    
    this.model = process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3-super-120b-a12b:free';
    this.client = new OpenAI({
      baseURL,
      apiKey
    });
  }

  /**
   * Generates structured analysis from prompt messages.
   * Enables Nemotron reasoning while ensuring raw reasoning traces are NOT exposed.
   * @param {Array<object>} messages 
   * @returns {Promise<object>} Parsed JSON object
   */
  async generateStructuredAnalysis(messages) {
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY is not configured on the server.');
    }

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages,
        extra_body: {
          reasoning: {
            enabled: true
          }
        },
        temperature: 0.2 // Low temperature for consistent structured grounding
      });

      const choice = response?.choices?.[0];
      const messageContent = choice?.message?.content || '';

      if (!messageContent) {
        throw new Error('Received empty content response from OpenRouter provider.');
      }

      // Clean JSON markers if present
      const cleanedText = messageContent
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/, '')
        .trim();

      const parsedJSON = JSON.parse(cleanedText);
      return parsedJSON;

    } catch (err) {
      console.error('[OpenRouterProvider Error]:', err.message);
      throw err;
    }
  }
}
