'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Lightbulb,
  RefreshCw,
  Loader2,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { AIInsight, generateInsights } from '@/lib/ai/aiService'
import { useToast } from '@/components/ui/use-toast'

interface AIInsightsPanelProps {
  data: any
  className?: string
  compact?: boolean
}

export function AIInsightsPanel({ data, className = '', compact = false }: AIInsightsPanelProps) {
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(!compact)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      loadInsights()
    }
  }, [data])

  const loadInsights = async () => {
    setLoading(true)
    setError(null)
    try {
      const aiInsights = await generateInsights(data)
      setInsights(aiInsights)
    } catch (err) {
      console.error('Failed to load AI insights:', err)
      setError('Unable to generate AI insights')
      toast({
        title: "AI Insights Unavailable",
        description: "Using fallback insights. AI service may be temporarily unavailable.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'revenue': return <TrendingUp className="w-4 h-4" />
      case 'inventory': return <AlertTriangle className="w-4 h-4" />
      case 'product': return <Lightbulb className="w-4 h-4" />
      case 'customer': return <CheckCircle className="w-4 h-4" />
      case 'trend': return <TrendingDown className="w-4 h-4" />
      default: return <Brain className="w-4 h-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600'
    if (confidence >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (compact && !expanded) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Brain className="w-5 h-5 text-purple-600 mr-2" />
            <h3 className="font-semibold text-gray-900">AI Insights</h3>
            {insights.length > 0 && (
              <Badge variant="outline" className="ml-2">
                {insights.length} insights
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(true)}
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Brain className="w-6 h-6 text-purple-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">🤖 AI Business Insights</h3>
          {insights.length > 0 && (
            <Badge variant="outline" className="ml-2">
              {insights.length} insights
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadInsights}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {compact && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(false)}
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span className="text-gray-600">Generating AI insights...</span>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button variant="outline" onClick={loadInsights}>
            Try Again
          </Button>
        </div>
      ) : insights.length > 0 ? (
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div
              key={index}
              className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center">
                  <div className="text-purple-600 mr-2">
                    {getInsightIcon(insight.type)}
                  </div>
                  <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getPriorityColor(insight.priority)}>
                    {insight.priority}
                  </Badge>
                  <span className={`text-sm font-medium ${getConfidenceColor(insight.confidence)}`}>
                    {insight.confidence}%
                  </span>
                </div>
              </div>
              
              <p className="text-gray-700 mb-3">{insight.description}</p>
              
              {insight.action && (
                <div className="bg-white p-3 rounded border border-purple-100">
                  <div className="flex items-center mb-1">
                    <Lightbulb className="w-4 h-4 text-yellow-600 mr-1" />
                    <span className="text-sm font-medium text-gray-900">Recommended Action:</span>
                  </div>
                  <p className="text-sm text-gray-700">{insight.action}</p>
                </div>
              )}
              
              <div className="flex items-center justify-between mt-3">
                <Badge variant="outline" className="text-xs">
                  {insight.category}
                </Badge>
                <div className="text-xs text-gray-500">
                  Confidence: {insight.confidence}%
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">No Insights Available</h4>
          <p className="text-gray-600 mb-4">
            AI insights will appear here once you have sufficient data
          </p>
          <Button variant="outline" onClick={loadInsights}>
            Generate Insights
          </Button>
        </div>
      )}

      {/* AI Disclaimer */}
      <div className="mt-6 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-start">
          <AlertTriangle className="w-4 h-4 text-gray-500 mr-2 mt-0.5" />
          <div className="text-xs text-gray-600">
            <strong>AI Disclaimer:</strong> These insights are generated by AI and should be used as guidance. 
            Always verify recommendations with your own business knowledge and market research.
          </div>
        </div>
      </div>
    </Card>
  )
}

// Compact AI Insights Widget for Dashboard
export function AIInsightsWidget({ data }: { data: any }) {
  const [topInsight, setTopInsight] = useState<AIInsight | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      loadTopInsight()
    }
  }, [data])

  const loadTopInsight = async () => {
    setLoading(true)
    try {
      const insights = await generateInsights(data)
      if (insights.length > 0) {
        setTopInsight(insights[0]) // Get the first (highest priority) insight
      }
    } catch (error) {
      console.error('Failed to load top insight:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="p-4">
        <div className="flex items-center">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          <span className="text-sm text-gray-600">Loading AI insight...</span>
        </div>
      </Card>
    )
  }

  if (!topInsight) {
    return (
      <Card className="p-4">
        <div className="flex items-center">
          <Brain className="w-4 h-4 text-gray-400 mr-2" />
          <span className="text-sm text-gray-600">AI insights coming soon</span>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-1">
            <Brain className="w-4 h-4 text-purple-600 mr-1" />
            <span className="text-sm font-medium text-gray-900">AI Insight</span>
            <Badge variant="outline" className="ml-2 text-xs">
              {topInsight.priority}
            </Badge>
          </div>
          <h4 className="font-semibold text-gray-900 text-sm mb-1">
            {topInsight.title}
          </h4>
          <p className="text-xs text-gray-600 line-clamp-2">
            {topInsight.description}
          </p>
        </div>
        <Button variant="ghost" size="sm" className="ml-2">
          <ChevronDown className="w-3 h-3" />
        </Button>
      </div>
    </Card>
  )
}
