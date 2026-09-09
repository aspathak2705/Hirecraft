/**
 * llmProvider.js
 * Decoupled Provider Interface Abstraction.
 * Application layer calls LLMProvider interface rather than depending directly on OpenRouter.
 */

import { OpenRouterProvider } from './openRouterProvider.js';

export class LLMProvider {
  constructor() {
    // Currently uses OpenRouterProvider, expandable to future providers
    this.provider = new OpenRouterProvider();
  }

  /**
   * Delegates structured generation call to active provider.
   * @param {Array<object>} messages 
   * @returns {Promise<object>}
   */
  async generateStructuredAnalysis(messages) {
    return await this.provider.generateStructuredAnalysis(messages);
  }
}

export const llmProvider = new LLMProvider();
