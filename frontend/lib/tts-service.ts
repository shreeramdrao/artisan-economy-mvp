interface TTSResponse {
  success: boolean
  audioUrl: string
  textLength: number
  voice: string
  language: string
}

interface TTSRequest {
  text: string
  language?: string
  voice?: string
}

class TTSService {
  private cache = new Map<string, TTSResponse>()
  private readonly CACHE_PREFIX = 'tts_cache_'
  private readonly CACHE_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours

  constructor() {
    this.loadCacheFromStorage()
  }

  private loadCacheFromStorage() {
    try {
      const cacheData = localStorage.getItem(this.CACHE_PREFIX + 'data')
      if (cacheData) {
        const parsed = JSON.parse(cacheData)
        const now = Date.now()
        
        // Clean expired entries
        for (const [key, value] of Object.entries(parsed)) {
          if (now - (value as any).timestamp < this.CACHE_EXPIRY) {
            this.cache.set(key, value as TTSResponse)
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load TTS cache:', error)
    }
  }

  private saveCacheToStorage() {
    try {
      const cacheData: Record<string, any> = {}
      const now = Date.now()
      
      for (const [key, value] of this.cache.entries()) {
        cacheData[key] = { ...value, timestamp: now }
      }
      
      localStorage.setItem(this.CACHE_PREFIX + 'data', JSON.stringify(cacheData))
    } catch (error) {
      console.warn('Failed to save TTS cache:', error)
    }
  }

  private generateCacheKey(text: string, language: string, voice: string): string {
    // Create a Unicode-safe hash of the text + language + voice for caching
    // Using TextEncoder to safely handle Unicode characters
    const encoder = new TextEncoder()
    const data = encoder.encode(text + language + voice)
    
    // Simple hash function for cache key generation
    let hash = 0
    for (let i = 0; i < data.length; i++) {
      const byte = data[i]
      hash = ((hash << 5) - hash + byte) & 0xffffffff
    }
    
    // Convert to base36 string and take first 32 characters
    return Math.abs(hash).toString(36).substring(0, 32)
  }

  async generateSpeech(request: TTSRequest): Promise<TTSResponse> {
    const { text, language = 'en', voice } = request
    
    // Ensure language and voice are consistent
    const languageCode = this.getLanguageCode(language)
    const selectedVoice = voice || this.getVoiceForLanguage(languageCode)
    
    // Check cache first
    const cacheKey = this.generateCacheKey(text, languageCode, selectedVoice)
    const cached = this.cache.get(cacheKey)
    
    if (cached) {
      console.log('🎤 Using cached TTS audio')
      return cached
    }

    try {
      console.log('🎤 Generating new TTS audio...')
      console.log('🎤 Language:', languageCode, 'Voice:', selectedVoice)
      
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, language: languageCode, voice: selectedVoice }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'TTS API request failed')
      }

      const result: TTSResponse = await response.json()
      
      // Cache the result
      this.cache.set(cacheKey, result)
      this.saveCacheToStorage()
      
      console.log('✅ TTS audio generated and cached')
      return result

    } catch (error) {
      console.error('❌ TTS generation failed:', error)
      throw error
    }
  }

  // Get available voices for a language
  getVoiceForLanguage(language: string): string {
    const voiceMap: Record<string, string> = {
      'en': 'en-IN-Neural2-B',
      'en-US': 'en-US-Neural2-D',
      'en-IN': 'en-IN-Neural2-B',
      'hi': 'hi-IN-Wavenet-A',      // ✅ Valid Hindi voice
      'hi-IN': 'hi-IN-Wavenet-A',   // ✅ Valid Hindi voice
      'kn': 'hi-IN-Wavenet-A',      // ✅ Fallback to Hindi (Kannada not supported)
      'kn-IN': 'hi-IN-Wavenet-A',   // ✅ Fallback to Hindi (Kannada not supported)
    }
    
    return voiceMap[language] || 'en-IN-Neural2-B'
  }

  // Get language code for TTS API
  getLanguageCode(language: string): string {
    const languageMap: Record<string, string> = {
      'en': 'en-IN',
      'en-US': 'en-US',
      'en-IN': 'en-IN',
      'hi': 'hi-IN',
      'hi-IN': 'hi-IN',
      'kn': 'hi-IN',      // ✅ Fallback to Hindi (Kannada not supported)
      'kn-IN': 'hi-IN',   // ✅ Fallback to Hindi (Kannada not supported)
    }
    
    return languageMap[language] || 'en-IN'
  }

  // Clear cache
  clearCache() {
    this.cache.clear()
    localStorage.removeItem(this.CACHE_PREFIX + 'data')
    console.log('🗑️ TTS cache cleared')
  }

  // Get cache stats
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    }
  }
}

// Export singleton instance
export const ttsService = new TTSService()
export default ttsService
