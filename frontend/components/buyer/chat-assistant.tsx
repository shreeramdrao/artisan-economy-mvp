'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { buyerApi, aiApi } from '@/lib/api'
import { analytics } from '@/lib/analytics'
import { usePersonalizedFeed } from '@/hooks/use-personalized-feed'
import ImageWithFallback from '@/components/ImageWithFallback'
import { 
  MessageCircle, 
  X, 
  Send, 
  Mic, 
  MicOff, 
  Sparkles, 
  Bot, 
  User,
  Loader2
} from 'lucide-react'
import ProductCard from '@/components/buyer/product-card'

interface Message {
  id: string
  type: 'user' | 'assistant' | 'recommendations'
  content: string
  products?: any[]
  reasoning?: string
  timestamp: number
}

interface ChatAssistantProps {
  isOpen: boolean
  onToggle: () => void
}

export default function ChatAssistant({ isOpen, onToggle }: ChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hi! I\'m your AI shopping assistant. I can help you find handcrafted products, suggest items based on your preferences, or answer questions about our artisans. How can I help you today?',
      timestamp: Date.now()
    }
  ])

  // ✅ Debug log for ChatAssistant rendering
  useEffect(() => {
    console.log("✅ [ChatAssistant] rendered")
  }, [])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  
  // Use personalized feed hook for better recommendations
  const { products: personalizedProducts, refresh: refreshRecommendations } = usePersonalizedFeed()

  // Simple cache for chat responses to avoid duplicate API calls
  const chatCache = useRef<Map<string, { content: string; products: any[]; reasoning: string; timestamp: number }>>(new Map())
  const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Enhanced AI response using backend API with proper product recommendations
  const generateAIResponse = async (userMessage: string): Promise<{ content: string; products?: any[]; reasoning?: string }> => {
    try {
      // Check cache first
      const cacheKey = userMessage.toLowerCase().trim()
      const cached = chatCache.current.get(cacheKey)
      
      if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        console.log('Using cached AI response')
        return {
          content: cached.content,
          products: cached.products,
          reasoning: cached.reasoning
        }
      }

      // Call the real AI chat API
      const response = await aiApi.chat(userMessage, messages.map(m => ({ role: m.type, content: m.content })))
      
      // Extract AI response
      const aiText = response?.reply || 'I\'m here to help you find beautiful handcrafted items from our talented Indian artisans!'
      
      // Check if user query contains product-related keywords
      const shouldFetchProducts = analyzeQueryForProducts(userMessage)
      
      let products: any[] = []
      let reasoning: string = ''
      
      if (shouldFetchProducts) {
        try {
          // First try to get personalized recommendations
          if (personalizedProducts && personalizedProducts.length > 0) {
            // Filter personalized products based on user query
            const keywords = extractKeywords(userMessage)
            const filteredPersonalized = personalizedProducts.filter(product => {
              const productText = (product.title + ' ' + product.category).toLowerCase()
              return keywords.length === 0 || keywords.some(keyword => productText.includes(keyword))
            }).slice(0, 3)
            
            if (filteredPersonalized.length > 0) {
              products = filteredPersonalized.map(p => ({
                id: p.productId,
                name: p.title,
                title: p.title,
                price: p.price,
                images: p.images,
                sellerName: p.sellerName,
                category: p.category,
                reason: p.reason
              }))
              reasoning = 'Based on your preferences and browsing history'
            }
          }
          
          // If no personalized products match, try AI recommendations
          if (products.length === 0) {
            const recommendationsResponse = await aiApi.recommendations({ 
              userId: 'guest',
              history: [],
              query: userMessage // Pass the user query
            })
            
            if (recommendationsResponse?.data?.products) {
              products = recommendationsResponse.data.products
              reasoning = recommendationsResponse.data.reasoning || ''
            }
          }
          
          // Final fallback to keyword-based filtering
          if (products.length === 0) {
            const keywords = extractKeywords(userMessage)
            const allProducts = await buyerApi.getProducts()
            products = filterProductsByKeywords(allProducts, keywords).slice(0, 3)
            reasoning = 'Based on your search keywords'
          }
        } catch (productError) {
          console.error('Failed to fetch product recommendations:', productError)
          // Show user-friendly error message
          toast({
            title: '⚠️ Product Search Issue',
            description: 'I couldn\'t fetch products right now. Please try again.',
            variant: 'destructive'
          })
          // Continue without products
        }
      }
      
      // Cache the response
      chatCache.current.set(cacheKey, {
        content: aiText,
        products: products,
        reasoning: reasoning,
        timestamp: Date.now()
      })
      
      // Clean up old cache entries
      const now = Date.now()
      for (const [key, value] of chatCache.current.entries()) {
        if (now - value.timestamp > CACHE_DURATION) {
          chatCache.current.delete(key)
        }
      }
      
      return {
        content: aiText,
        products: products,
        reasoning: reasoning
      }
    } catch (error) {
      console.error('Failed to get AI response:', error)
      // Fallback response
      return {
        content: 'I\'m here to help you discover amazing handcrafted products from Indian artisans! You can ask me about specific categories like pottery, jewelry, textiles, or woodwork.',
        products: [],
        reasoning: ''
      }
    }
  }

  // Enhanced helper function to analyze if the query should include products
  const analyzeQueryForProducts = (userMessage: string): boolean => {
    const productKeywords = [
      'show', 'find', 'recommend', 'suggest', 'looking for', 'want', 'need', 'buy', 'purchase',
      'pottery', 'jewelry', 'jewellery', 'textiles', 'cloth', 'fabric', 'woodwork', 'wooden',
      'metalwork', 'paintings', 'sculptures', 'handicrafts', 'handcrafted', 'leather', 
      'home decor', 'traditional', 'accessories', 'gift', 'rajasthani', 'gujarati', 'punjabi',
      'bengali', 'tamil', 'kerala', 'kashmiri', 'artisan', 'craftsman', 'handmade'
    ]
    
    const message = userMessage.toLowerCase()
    return productKeywords.some(keyword => message.includes(keyword))
  }

  // Helper function to extract keywords from user message
  const extractKeywords = (message: string): string[] => {
    const categories = [
      'pottery', 'textiles', 'jewelry', 'woodwork', 'metalwork', 'paintings', 
      'sculptures', 'handicrafts', 'leather', 'home decor', 'traditional', 'accessories'
    ]
    
    const keywords: string[] = []
    const lowerMessage = message.toLowerCase()
    
    categories.forEach(category => {
      if (lowerMessage.includes(category)) {
        keywords.push(category)
      }
    })
    
    // Add price-related keywords
    if (lowerMessage.includes('cheap') || lowerMessage.includes('affordable') || lowerMessage.includes('budget')) {
      keywords.push('budget')
    }
    if (lowerMessage.includes('expensive') || lowerMessage.includes('premium') || lowerMessage.includes('luxury')) {
      keywords.push('premium')
    }
    
    return keywords
  }

  // Helper function to filter products based on keywords
  const filterProductsByKeywords = (products: any[], keywords: string[]): any[] => {
    const safeProducts = Array.isArray(products) ? products : []
    if (keywords.length === 0) return safeProducts.slice(0, 5) // Return random products if no keywords
    
    return safeProducts.filter(product => {
      const productText = (product.title + ' ' + product.category + ' ' + product.description).toLowerCase()
      return keywords.some(keyword => productText.includes(keyword))
    }).sort((a, b) => {
      // Sort by rating and price relevance
      const aScore = a.rating * 0.7 + (keywords.includes('budget') ? (1000 - a.price) / 1000 : a.price / 1000) * 0.3
      const bScore = b.rating * 0.7 + (keywords.includes('budget') ? (1000 - b.price) / 1000 : b.price / 1000) * 0.3
      return bScore - aScore
    })
  }

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: Date.now()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Track analytics
      analytics.trackEvent({
        event: 'ai_assistant_used',
        userId: analytics.userId,
        sessionId: analytics.sessionId,
        timestamp: Date.now(),
        properties: {
          query: input.trim(),
          messageCount: messages.length + 1
        },
        page: window.location.pathname,
        userAgent: navigator.userAgent
      })

      const response = await generateAIResponse(input.trim())
      
      // Create AI assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.content,
        timestamp: Date.now()
      }

      setMessages(prev => [...prev, assistantMessage])

      // If we have product recommendations, create a separate recommendations message
      if (response.products && response.products.length > 0) {
        const recommendationsMessage: Message = {
          id: (Date.now() + 2).toString(),
          type: 'recommendations',
          content: 'Here are some products I found for you:',
          products: response.products,
          reasoning: response.reasoning,
          timestamp: Date.now()
        }

        setMessages(prev => [...prev, recommendationsMessage])
      }
    } catch (error) {
      console.error('Failed to generate AI response:', error)
      toast({
        title: 'Error',
        description: 'Failed to get AI response. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl + Enter to send message
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const toggleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      const recognition = new SpeechRecognition()
      
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'

      if (!isListening) {
        recognition.start()
        setIsListening(true)
        
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          setInput(transcript)
          setIsListening(false)
        }

        recognition.onerror = () => {
          setIsListening(false)
          toast({
            title: 'Voice Input Error',
            description: 'Could not process voice input. Please try typing instead.',
            variant: 'destructive'
          })
        }

        recognition.onend = () => {
          setIsListening(false)
        }
      } else {
        recognition.stop()
        setIsListening(false)
      }
    } else {
      toast({
        title: 'Voice Input Not Supported',
        description: 'Your browser does not support voice input. Please type your message.',
        variant: 'destructive'
      })
    }
  }

  return (
    <>
      {/* Floating Chat Button */}
      <motion.div
        className="fixed bottom-8 right-8 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <Button
          onClick={onToggle}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110"
          aria-label="Open AI Assistant"
          data-testid="chat-assistant-button"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </motion.div>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-end p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button 
              className="absolute inset-0 bg-black/20 backdrop-blur-sm" 
              onClick={onToggle}
              aria-label="Close chat assistant"
              title="Close chat assistant"
            />
            
            <motion.div
              className="relative w-full max-w-md h-[600px] bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border-0 overflow-hidden"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              data-testid="chat-modal"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold">AI Shopping Assistant</h3>
                      <p className="text-xs opacity-90">Powered by AI</p>
                    </div>
                  </div>
                  <Button
                    onClick={onToggle}
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[400px]">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.type === 'recommendations' ? (
                      // Special rendering for recommendations
                      <div className="w-full max-w-[90%]">
                        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-2xl p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
                              <Sparkles className="w-3 h-3 text-white" />
                            </div>
                            <p className="text-sm font-medium text-gray-800">{message.content}</p>
                          </div>
                          
                          {/* AI Reasoning */}
                          {message.reasoning && (
                            <p className="text-xs text-gray-600 mb-3 italic bg-white/50 rounded-lg p-2">
                              {message.reasoning}
                            </p>
                          )}
                          
                          {/* Product Cards Grid */}
                          {message.products && message.products.length > 0 && (
                            <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto">
                              {message.products.map((product) => (
                                <div
                                  key={product.id || product.productId}
                                  className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                  onClick={() => window.open(`/buyer/product/${product.id || product.productId}`, '_blank')}
                                >
                                  <div className="aspect-square overflow-hidden rounded-t-lg">
                                    <ImageWithFallback
                                      src={product.images?.polished || product.images?.original || product.imageUrl || '/images/fallback.svg'}
                                      alt={product.title || product.name}
                                      width={120}
                                      height={120}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="p-2">
                                    <p className="text-xs font-medium text-gray-900 line-clamp-2 mb-1">
                                      {product.title || product.name}
                                    </p>
                                    <p className="text-xs text-gray-600 mb-1">
                                      by {product.sellerName || product.artisan || 'Artisan'}
                                    </p>
                                    <p className="text-sm font-bold text-green-600">
                                      ₹{product.price}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      // Regular message rendering
                      <div className={`flex items-start gap-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          message.type === 'user' 
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500' 
                            : 'bg-gradient-to-r from-blue-500 to-purple-500'
                        }`}>
                          {message.type === 'user' ? (
                            <User className="w-4 h-4 text-white" />
                          ) : (
                            <Bot className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div className={`p-3 rounded-2xl ${
                          message.type === 'user'
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
                
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="flex items-center gap-2 bg-gray-100 p-3 rounded-2xl">
                      <Bot className="w-4 h-4 text-gray-600" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask me about products..."
                    aria-label="Chat message input"
                    aria-describedby="chat-input-help"
                    className="flex-1 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    disabled={isLoading}
                    data-testid="chat-input"
                  />
                  <div id="chat-input-help" className="sr-only">
                    Type your message and press Enter to send, or Ctrl+Enter for alternative send method.
                  </div>
                  <Button
                    onClick={toggleVoiceInput}
                    size="sm"
                    variant="outline"
                    aria-label={isListening ? "Stop voice input" : "Start voice input"}
                    title={isListening ? "Stop voice input" : "Start voice input"}
                    className={`${isListening ? 'bg-red-500 text-white border-red-500' : 'bg-white/80 backdrop-blur-sm border-gray-200'} focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                    disabled={isLoading}
                  >
                    {isListening ? <MicOff className="w-4 h-4" aria-hidden="true" /> : <Mic className="w-4 h-4" aria-hidden="true" />}
                  </Button>
                  <Button
                    onClick={handleSendMessage}
                    size="sm"
                    aria-label="Send message"
                    title="Send message (or press Enter)"
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    disabled={isLoading || !input.trim()}
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Send className="w-4 h-4" aria-hidden="true" />}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
