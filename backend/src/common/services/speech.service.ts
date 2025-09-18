import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SpeechClient } from '@google-cloud/speech';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { StorageService } from './storage.service';

@Injectable()
export class SpeechService {
  private readonly logger = new Logger(SpeechService.name);
  private speechClient: SpeechClient;
  private ttsClient: TextToSpeechClient;
  private initialized = false;

  constructor(
    private configService: ConfigService,
    private storageService: StorageService,
  ) {
    try {
      const projectId = this.configService.get('googleCloud.projectId');
      const keyFilename = this.configService.get('googleCloud.credentials');

      if (!projectId) {
        this.logger.warn('Speech services not initialized: Missing configuration');
        return;
      }

      const config = {
        projectId,
        keyFilename: keyFilename || undefined,
      };

      this.speechClient = new SpeechClient(config);
      this.ttsClient = new TextToSpeechClient(config);

      this.initialized = true;
      this.logger.log('Speech services initialized');
    } catch (error) {
      this.logger.error('Failed to initialize Speech services:', error);
    }
  }

  private checkInitialized() {
    if (!this.initialized) {
      throw new Error('Speech services not available');
    }
  }

  /**
   * ✅ Transcribe audio and detect spoken language (English, Hindi, Kannada)
   */
  async speechToText(audioBuffer: Buffer) {
    try {
      this.checkInitialized();

      const audio = {
        content: audioBuffer.toString('base64'),
      };

      const config = {
        encoding: 'WEBM_OPUS' as const,
        sampleRateHertz: 48000,
        languageCode: 'en-IN', // Default
        alternativeLanguageCodes: ['hi-IN', 'kn-IN'], // Auto detect
        model: 'latest_long',
        useEnhanced: true,
        enableAutomaticPunctuation: true,
      };

      const request = {
        audio,
        config,
      };

      const [response] = await this.speechClient.recognize(request);

      const transcription =
        response.results?.map(result => result.alternatives?.[0]?.transcript).join(' ') || '';

      const confidence =
        response.results?.[0]?.alternatives?.[0]?.confidence || 0;

      // ✅ Detect actual language from recognition metadata
      let detectedLanguage = 'en';
      if (response.results?.[0]?.languageCode) {
        const langCode = response.results[0].languageCode;
        if (langCode.startsWith('hi')) detectedLanguage = 'hi';
        else if (langCode.startsWith('kn')) detectedLanguage = 'kn';
        else detectedLanguage = 'en';
      }

      this.logger.log(
        `Speech transcribed [${detectedLanguage}]: ${transcription.substring(0, 50)}...`
      );

      return {
        transcript: transcription,
        confidence,
        language: detectedLanguage,
      };
    } catch (error) {
      this.logger.error('Error in speech to text:', error);
      return {
        transcript: '',
        confidence: 0,
        language: 'en',
      };
    }
  }

  /**
   * ✅ Convert polished text to speech and upload to storage
   */
  async textToSpeech(text: string, language: string, productId?: string) {
    try {
      this.checkInitialized();

      const voiceConfig = this.getVoiceConfig(language);

      const request = {
        input: { text },
        voice: voiceConfig,
        audioConfig: {
          audioEncoding: 'MP3' as const,
          speakingRate: 1.0,
          pitch: 0,
          volumeGainDb: 0,
        },
      };

      const [response] = await this.ttsClient.synthesizeSpeech(request);

      if (!response.audioContent) {
        throw new Error('No audio content generated');
      }

      const audioBuffer = Buffer.from(response.audioContent as string, 'base64');

      let audioUrl = '';
      if (productId) {
        const fileName = `products/${productId}/story_${language}.mp3`;
        audioUrl = await this.storageService.uploadFile(
          audioBuffer,
          fileName,
          'audio/mp3',
          true,
        );
      }

      this.logger.log(`Text-to-speech generated for language: ${language}`);

      return {
        audioUrl,
        audioBuffer,
        duration: Math.ceil(text.length / 15),
        language,
      };
    } catch (error) {
      this.logger.error('Error in text to speech:', error);
      return {
        audioUrl: '',
        audioBuffer: null,
        duration: 0,
        language,
      };
    }
  }

  private getVoiceConfig(language: string) {
    const voiceMap = {
      en: {
        languageCode: 'en-IN',
        name: 'en-IN-Standard-D',
        ssmlGender: 'MALE' as const,
      },
      hi: {
        languageCode: 'hi-IN',
        name: 'hi-IN-Standard-D',
        ssmlGender: 'MALE' as const,
      },
      kn: {
        languageCode: 'kn-IN',
        name: 'kn-IN-Standard-B',
        ssmlGender: 'MALE' as const,
      },
    };

    return voiceMap[language] || voiceMap['en'];
  }

  /**
   * ✅ Generate audio for all languages from polished stories
   */
  async generateAudioForAllLanguages(productId: string, translations: {
    en: string;
    hi: string;
    kn: string;
  }) {
    try {
      const audioUrls = { en: '', hi: '', kn: '' };

      const audioPromises = Object.entries(translations).map(async ([lang, text]) => {
        const result = await this.textToSpeech(text, lang, productId);
        return { lang, url: result.audioUrl };
      });

      const results = await Promise.all(audioPromises);

      results.forEach(({ lang, url }) => {
        audioUrls[lang] = url;
      });

      this.logger.log(`Generated audio for all languages for product: ${productId}`);
      return audioUrls;
    } catch (error) {
      this.logger.error('Error generating audio for all languages:', error);
      return { en: '', hi: '', kn: '' };
    }
  }
}