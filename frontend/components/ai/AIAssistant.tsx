'use client'

import { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  MessageCircle, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Globe,
  Loader2,
  X,
  Minimize2,
  Maximize2,
  Bot,
  User
} from 'lucide-react'
import { AIAssistantResponse, generateAssistantResponse } from '@/lib/ai/aiService'
import { useToast } from '@/components/ui/use-toast'

interface AIAssistantProps {
  context: any
  className?: string
}

interface ChatMessage {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
  language: 'en' | 'hi' | 'kn'
  suggestions?: string[]
}

export function AIAssistant({ context, className = '' }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi' | 'kn'>('en')
  const [recognition, setRecognition] = useState<any>(null)
  const [synthesis, setSynthesis] = useState<any>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const languages = {
    en: { name: 'English', flag: '🇺🇸' },
    hi: { name: 'Hindi', flag: '🇮🇳' },
    kn: { name: 'Kannada', flag: '🇮🇳' }
  }

  useEffect(() => {
    // Initialize speech recognition and synthesis
    if (typeof window !== 'undefined') {
      // Speech Recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = getLanguageCode(selectedLanguage)
        
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          setInputText(transcript)
          setIsListening(false)
        }
        
        recognition.onerror = () => {
          setIsListening(false)
          toast({
            title: "Speech Recognition Error",
            description: "Unable to process speech input",
            variant: "destructive"
          })
        }
        
        setRecognition(recognition)
      }

      // Speech Synthesis
      if ('speechSynthesis' in window) {
        setSynthesis(window.speechSynthesis)
      }
    }

    // Add welcome message
    if (messages.length === 0) {
      addMessage({
        text: getWelcomeMessage(selectedLanguage),
        isUser: false,
        timestamp: new Date(),
        language: selectedLanguage,
        suggestions: getDefaultSuggestions(selectedLanguage)
      })
    }
  }, [selectedLanguage])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const getLanguageCode = (lang: 'en' | 'hi' | 'kn') => {
    switch (lang) {
      case 'en': return 'en-US'
      case 'hi': return 'hi-IN'
      case 'kn': return 'kn-IN'
      default: return 'en-US'
    }
  }

  const getWelcomeMessage = (lang: 'en' | 'hi' | 'kn') => {
    switch (lang) {
      case 'en': return "Hello! I'm your AI business assistant. How can I help you today?"
      case 'hi': return "नमस्ते! मैं आपका AI व्यापार सहायक हूं। आज मैं आपकी कैसे मदद कर सकता हूं?"
      case 'kn': return "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ AI ವ್ಯಾಪಾರ ಸಹಾಯಕ. ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?"
      default: return "Hello! I'm your AI business assistant. How can I help you today?"
    }
  }

  const getDefaultSuggestions = (lang: 'en' | 'hi' | 'kn') => {
    switch (lang) {
      case 'en': return [
        "Show me my sales trends",
        "What are my top products?",
        "How is my inventory looking?",
        "Predict next month's revenue"
      ]
      case 'hi': return [
        "मेरे बिक्री के रुझान दिखाएं",
        "मेरे शीर्ष उत्पाद क्या हैं?",
        "मेरा इन्वेंटरी कैसा दिख रहा है?",
        "अगले महीने की आय का अनुमान लगाएं"
      ]
      case 'kn': return [
        "ನನ್ನ ಮಾರಾಟದ ಪ್ರವೃತ್ತಿಗಳನ್ನು ತೋರಿಸಿ",
        "ನನ್ನ ಉನ್ನತ ಉತ್ಪನ್ನಗಳು ಯಾವುವು?",
        "ನನ್ನ ಸ್ಟಾಕ್ ಹೇಗೆ ಕಾಣುತ್ತಿದೆ?",
        "ಮುಂದಿನ ತಿಂಗಳ ಆದಾಯವನ್ನು ಊಹಿಸಿ"
      ]
      default: return [
        "Show me my sales trends",
        "What are my top products?",
        "How is my inventory looking?",
        "Predict next month's revenue"
      ]
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const addMessage = (message: Omit<ChatMessage, 'id'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString()
    }
    setMessages(prev => [...prev, newMessage])
  }

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return

    const userMessage = inputText.trim()
    setInputText('')
    setIsLoading(true)

    // Add user message
    addMessage({
      text: userMessage,
      isUser: true,
      timestamp: new Date(),
      language: selectedLanguage
    })

    try {
      // Generate AI response
      const response = await generateAssistantResponse(userMessage, context, selectedLanguage)
      
      // Add AI response
      addMessage({
        text: response.text,
        isUser: false,
        timestamp: new Date(),
        language: selectedLanguage,
        suggestions: response.suggestions
      })

      // Speak the response if TTS is available
      if (synthesis && !isSpeaking) {
        speakText(response.text)
      }
    } catch (error) {
      console.error('Error generating response:', error)
      addMessage({
        text: getErrorMessage(selectedLanguage),
        isUser: false,
        timestamp: new Date(),
        language: selectedLanguage
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getErrorMessage = (lang: 'en' | 'hi' | 'kn') => {
    switch (lang) {
      case 'en': return "I apologize, but I encountered an error. Please try again."
      case 'hi': return "मुझे खेद है, लेकिन मुझे एक त्रुटि का सामना करना पड़ा। कृपया पुनः प्रयास करें।"
      case 'kn': return "ಕ್ಷಮಿಸಿ, ಆದರೆ ನಾನು ದೋಷವನ್ನು ಎದುರಿಸಿದ್ದೇನೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ."
      default: return "I apologize, but I encountered an error. Please try again."
    }
  }

  const handleVoiceInput = () => {
    if (!recognition) {
      toast({
        title: "Speech Recognition Not Available",
        description: "Your browser doesn't support speech recognition",
        variant: "destructive"
      })
      return
    }

    if (isListening) {
      recognition.stop()
      setIsListening(false)
    } else {
      recognition.lang = getLanguageCode(selectedLanguage)
      recognition.start()
      setIsListening(true)
    }
  }

  const speakText = (text: string) => {
    if (!synthesis) return

    setIsSpeaking(true)
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = getLanguageCode(selectedLanguage)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    
    synthesis.speak(utterance)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputText(suggestion)
  }

  const handleLanguageChange = (lang: 'en' | 'hi' | 'kn') => {
    setSelectedLanguage(lang)
    // Update welcome message for new language
    const welcomeMessage = messages.find(m => m.id === 'welcome')
    if (welcomeMessage) {
      setMessages(prev => prev.map(m => 
        m.id === 'welcome' 
          ? { ...m, text: getWelcomeMessage(lang), suggestions: getDefaultSuggestions(lang) }
          : m
      ))
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 shadow-lg ${className}`}
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
    )
  }

  return (
    <Card className={`fixed bottom-6 right-6 z-50 w-96 shadow-xl ${isMinimized ? 'h-16' : 'h-[500px]'} ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center">
          <Bot className="w-5 h-5 text-purple-600 mr-2" />
          <h3 className="font-semibold text-gray-900">AI Assistant</h3>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            {Object.entries(languages).map(([code, lang]) => (
              <Button
                key={code}
                variant={selectedLanguage === code ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleLanguageChange(code as 'en' | 'hi' | 'kn')}
                className="text-xs"
              >
                {lang.flag}
              </Button>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-80">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs p-3 rounded-lg ${
                    message.isUser
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="flex items-start">
                    {!message.isUser && (
                      <Bot className="w-4 h-4 mr-2 mt-0.5 text-purple-600" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm">{message.text}</p>
                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {message.suggestions.map((suggestion, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              className="text-xs mr-1 mb-1"
                              onClick={() => handleSuggestionClick(suggestion)}
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                    {message.isUser && (
                      <User className="w-4 h-4 ml-2 mt-0.5" />
                    )}
                  </div>
                  <div className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex items-center">
                    <Bot className="w-4 h-4 mr-2 text-purple-600" />
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    <span className="text-sm text-gray-600">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={`Ask me anything about your business...`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  disabled={isLoading}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleVoiceInput}
                className={isListening ? 'bg-red-100 text-red-600' : ''}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => isSpeaking ? synthesis?.cancel() : null}
                className={isSpeaking ? 'bg-green-100 text-green-600' : ''}
              >
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              <Button
                size="sm"
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isLoading}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </Card>
  )
}

// Compact AI Assistant Widget for Dashboard
export function AIAssistantWidget({ context }: { context: any }) {
  const [quickResponse, setQuickResponse] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const handleQuickQuery = async (query: string) => {
    setLoading(true)
    try {
      const response = await generateAssistantResponse(query, context)
      setQuickResponse(response.text)
    } catch (error) {
      setQuickResponse('Unable to process query at this time.')
    } finally {
      setLoading(false)
    }
  }

  const quickQueries = [
    "How are my sales?",
    "Any recommendations?",
    "Inventory status?",
    "Revenue forecast?"
  ]

  return (
    <Card className="p-4">
      <div className="flex items-center mb-3">
        <Bot className="w-4 h-4 text-purple-600 mr-2" />
        <h3 className="font-semibold text-gray-900">Quick AI Help</h3>
      </div>
      
      <div className="space-y-2">
        {quickQueries.map((query, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className="w-full text-left justify-start text-xs"
            onClick={() => handleQuickQuery(query)}
            disabled={loading}
          >
            {query}
          </Button>
        ))}
      </div>

      {loading && (
        <div className="mt-3 flex items-center">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          <span className="text-sm text-gray-600">Processing...</span>
        </div>
      )}

      {quickResponse && (
        <div className="mt-3 p-2 bg-purple-50 rounded text-sm text-gray-700">
          {quickResponse}
        </div>
      )}
    </Card>
  )
}
