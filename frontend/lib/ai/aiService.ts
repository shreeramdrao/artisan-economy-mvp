'use client'

// Get the API base URL from environment
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000/api'

// AI Service Types
export interface AIInsight {
  type: 'revenue' | 'inventory' | 'product' | 'customer' | 'trend'
  title: string
  description: string
  confidence: number
  action?: string
  priority: 'low' | 'medium' | 'high'
  category: string
}

export interface AIRecommendation {
  type: 'pricing' | 'inventory' | 'marketing' | 'product'
  title: string
  description: string
  impact: 'low' | 'medium' | 'high'
  effort: 'low' | 'medium' | 'high'
  timeframe: string
  reasoning: string
}

export interface ForecastData {
  period: string
  predicted: number
  confidence: number
  trend: 'up' | 'down' | 'stable'
}

export interface AIAssistantResponse {
  text: string
  language: 'en' | 'hi' | 'kn'
  confidence: number
  suggestions?: string[]
  data?: any
}

// AI Service Class
export class AIService {
  constructor() {
    // No initialization needed - we'll call backend APIs
  }

  // Generate business insights from analytics data
  async generateInsights(data: any): Promise<AIInsight[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/insights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ data }),
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const result = await response.json()
      return result.insights || this.getFallbackInsights(data)
    } catch (error) {
      console.error('Error generating insights:', error)
      return this.getFallbackInsights(data)
    }
  }

  // Generate product recommendations
  async generateRecommendations(data: any): Promise<AIRecommendation[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ data }),
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const result = await response.json()
      return result.recommendations || this.getFallbackRecommendations(data)
    } catch (error) {
      console.error('Error generating recommendations:', error)
      return this.getFallbackRecommendations(data)
    }
  }

  // Generate sales forecast
  async generateForecast(historicalData: any[]): Promise<ForecastData[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/forecast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ historicalData }),
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const result = await response.json()
      return result.forecast || this.getFallbackForecast(historicalData)
    } catch (error) {
      console.error('Error generating forecast:', error)
      return this.getFallbackForecast(historicalData)
    }
  }

  // Generate AI assistant response
  async generateAssistantResponse(query: string, context: any, language: 'en' | 'hi' | 'kn' = 'en'): Promise<AIAssistantResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          prompt: query, 
          history: context,
          language 
        }),
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const result = await response.json()
      return {
        text: result.message || 'I apologize, but I encountered an error processing your request.',
        language,
        confidence: 85,
        suggestions: this.generateSuggestions(query),
        data: result.products || []
      }
    } catch (error) {
      console.error('Error generating assistant response:', error)
      return {
        text: 'I apologize, but I encountered an error processing your request. Please try again.',
        language,
        confidence: 0
      }
    }
  }

  // Generate product description
  async generateProductDescription(productData: any): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/polish-story`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          rawStory: productData.description || productData.title 
        }),
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const result = await response.json()
      return result.polishedStory || `Handcrafted ${productData.title} - A unique piece of art that showcases traditional craftsmanship and modern design. Perfect for collectors and art enthusiasts who appreciate quality and authenticity.`
    } catch (error) {
      console.error('Error generating product description:', error)
      return `Handcrafted ${productData.title} - A unique piece of art that showcases traditional craftsmanship and modern design. Perfect for collectors and art enthusiasts who appreciate quality and authenticity.`
    }
  }

  private generateSuggestions(query: string): string[] {
    const suggestions = [
      'Show me my top products',
      'What are my sales trends?',
      'How is my inventory looking?',
      'Predict next month sales',
      'Any recommendations for growth?'
    ]
    
    return suggestions.slice(0, 3)
  }

  // Fallback data generators
  private getFallbackInsights(data: any): AIInsight[] {
    return [
      {
        type: 'revenue',
        title: 'Revenue Growth Opportunity',
        description: 'Your sales have been consistent. Consider expanding your product range to increase revenue.',
        confidence: 75,
        action: 'Add 2-3 new products in popular categories',
        priority: 'medium',
        category: 'Growth'
      },
      {
        type: 'inventory',
        title: 'Inventory Optimization',
        description: 'Monitor your stock levels regularly to avoid stockouts during peak seasons.',
        confidence: 80,
        action: 'Set up automated reorder points',
        priority: 'high',
        category: 'Operations'
      }
    ]
  }

  private getFallbackRecommendations(data: any): AIRecommendation[] {
    return [
      {
        type: 'marketing',
        title: 'Social Media Promotion',
        description: 'Increase your social media presence to reach more customers.',
        impact: 'high',
        effort: 'medium',
        timeframe: '2-4 weeks',
        reasoning: 'Social media is a cost-effective way to reach new customers'
      },
      {
        type: 'pricing',
        title: 'Dynamic Pricing Strategy',
        description: 'Implement seasonal pricing adjustments based on demand patterns.',
        impact: 'medium',
        effort: 'low',
        timeframe: '1-2 weeks',
        reasoning: 'Optimizing prices can improve profit margins'
      }
    ]
  }

  private getFallbackForecast(historicalData: any[]): ForecastData[] {
    const currentMonth = new Date().getMonth()
    return [
      {
        period: `${currentMonth + 1}/2024`,
        predicted: 15000,
        confidence: 70,
        trend: 'up'
      },
      {
        period: `${currentMonth + 2}/2024`,
        predicted: 18000,
        confidence: 65,
        trend: 'up'
      },
      {
        period: `${currentMonth + 3}/2024`,
        predicted: 16500,
        confidence: 60,
        trend: 'stable'
      }
    ]
  }
}

// Export singleton instance
export const aiService = new AIService()

// Utility functions for AI features
export const generateInsights = (data: any) => aiService.generateInsights(data)
export const generateRecommendations = (data: any) => aiService.generateRecommendations(data)
export const generateForecast = (data: any[]) => aiService.generateForecast(data)
export const generateAssistantResponse = (query: string, context: any, language?: 'en' | 'hi' | 'kn') => 
  aiService.generateAssistantResponse(query, context, language)
export const generateProductDescription = (productData: any) => aiService.generateProductDescription(productData)
