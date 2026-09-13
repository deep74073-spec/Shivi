class AIProvider {
  async generateResponse({ messages, systemInstruction, tools, stream }) {
    throw new Error("Method 'generateResponse()' must be implemented.");
  }
  
  async processVision({ imageBuffer, prompt }) {
    throw new Error("Method 'processVision()' must be implemented.");
  }
}

module.exports = AIProvider;
