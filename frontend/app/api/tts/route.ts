import { NextRequest, NextResponse } from 'next/server'
import { TextToSpeechClient } from '@google-cloud/text-to-speech'

// Initialize Google Cloud TTS client
const client = new TextToSpeechClient({
  // Use service account key from environment variables
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  // Or use project ID and credentials
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
})

export async function POST(request: NextRequest) {
  try {
    const { text, language = 'en-US', voice } = await request.json()

    if (!text || text.trim() === '') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    // Proper voice mapping for different languages (with correct gender and valid voices)
    const voiceMap: Record<string, { languageCode: string; name: string; gender: 'MALE' | 'FEMALE' }> = {
      'en': { languageCode: 'en-in', name: 'en-IN-Neural2-B', gender: 'MALE' },
      'en-US': { languageCode: 'en-us', name: 'en-US-Neural2-D', gender: 'FEMALE' },
      'en-IN': { languageCode: 'en-in', name: 'en-IN-Neural2-B', gender: 'MALE' },
      'hi': { languageCode: 'hi-in', name: 'hi-IN-Wavenet-A', gender: 'FEMALE' },
      'hi-IN': { languageCode: 'hi-in', name: 'hi-IN-Wavenet-A', gender: 'FEMALE' },
      // Kannada is not supported by Google Cloud TTS, fallback to Hindi
      'kn': { languageCode: 'hi-in', name: 'hi-IN-Wavenet-A', gender: 'FEMALE' },
      'kn-IN': { languageCode: 'hi-in', name: 'hi-IN-Wavenet-A', gender: 'FEMALE' },
    }

    // Get voice configuration
    const voiceConfig = voiceMap[language] || voiceMap['en']
    const selectedVoice = voice || voiceConfig.name
    const selectedGender = voiceConfig.gender

    // Configure the TTS request
    const request_config = {
      input: { text: text.trim() },
      voice: {
        languageCode: voiceConfig.languageCode,
        name: selectedVoice,
        ssmlGender: selectedGender,
      },
      audioConfig: {
        audioEncoding: 'MP3' as const,
        speakingRate: 0.9,
        pitch: 0.0,
        volumeGainDb: 0.0,
      },
    }

    console.log('🎤 Generating TTS for text:', text.substring(0, 100) + '...')
    console.log('🎤 Using voice:', selectedVoice, 'for language:', voiceConfig.languageCode, 'with gender:', selectedGender)
    
    // Warn if Kannada was requested but Hindi is being used as fallback
    if (language === 'kn' || language === 'kn-IN') {
      console.warn('⚠️ Kannada (kn-IN) is not supported by Google Cloud TTS. Using Hindi (hi-IN) as fallback.')
    }

    // Call Google Cloud TTS API
    const [response] = await client.synthesizeSpeech(request_config)
    
    if (!response.audioContent) {
      throw new Error('No audio content received from TTS API')
    }

    // response.audioContent is already a Buffer, convert directly to base64
    const audioBase64 = response.audioContent.toString('base64')
    const audioDataUrl = `data:audio/mp3;base64,${audioBase64}`

    console.log('✅ TTS generated successfully, size:', response.audioContent.length, 'bytes')

    return NextResponse.json({
      success: true,
      audioUrl: audioDataUrl,
      audioContent: audioBase64, // Also return raw base64 for frontend processing
      textLength: text.length,
      voice: selectedVoice,
      language: voiceConfig.languageCode,
    })

  } catch (error) {
    console.error('❌ TTS API Error:', error)
    
    // Fallback to browser speech synthesis if Google Cloud fails
    return NextResponse.json(
      { 
        error: 'TTS service unavailable',
        fallback: true,
        message: 'Please use browser text-to-speech instead'
      },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  try {
    // List available voices to verify what's actually supported
    const [voices] = await client.listVoices()
    
    // Filter for Hindi and Kannada voices
    const hindiVoices = voices.voices?.filter(voice => voice.languageCodes?.includes('hi-IN')) || []
    const kannadaVoices = voices.voices?.filter(voice => voice.languageCodes?.includes('kn-IN')) || []
    const englishVoices = voices.voices?.filter(voice => voice.languageCodes?.includes('en-IN')) || []
    
    return NextResponse.json({
      status: 'TTS API is running',
      timestamp: new Date().toISOString(),
      features: ['Google Cloud TTS', 'MP3 output', 'Multiple voices'],
      availableVoices: {
        hindi: hindiVoices.map(v => ({ name: v.name, gender: v.ssmlGender })),
        kannada: kannadaVoices.map(v => ({ name: v.name, gender: v.ssmlGender })),
        english: englishVoices.map(v => ({ name: v.name, gender: v.ssmlGender }))
      }
    })
  } catch (error) {
    console.error('Error listing voices:', error)
    return NextResponse.json({
      status: 'TTS API is running',
      timestamp: new Date().toISOString(),
      features: ['Google Cloud TTS', 'MP3 output', 'Multiple voices'],
      error: 'Could not list voices'
    })
  }
}
