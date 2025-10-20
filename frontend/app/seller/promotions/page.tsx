'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Megaphone, 
  Plus, 
  Calendar, 
  Users, 
  TrendingUp, 
  Eye,
  Edit,
  Trash2,
  Copy,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'

// Mock promotions data
const mockPromotions = [
  {
    id: '1',
    name: 'Festival Sale',
    type: 'percentage',
    value: 20,
    description: '20% off on all handmade products',
    startDate: '2024-01-20',
    endDate: '2024-01-30',
    status: 'active',
    usage: 45,
    limit: 100,
    revenue: 25000
  },
  {
    id: '2',
    name: 'New Customer Discount',
    type: 'fixed',
    value: 500,
    description: '₹500 off for first-time buyers',
    startDate: '2024-01-15',
    endDate: '2024-02-15',
    status: 'active',
    usage: 12,
    limit: 50,
    revenue: 6000
  },
  {
    id: '3',
    name: 'Bulk Purchase Offer',
    type: 'percentage',
    value: 15,
    description: '15% off on orders above ₹5000',
    startDate: '2024-01-10',
    endDate: '2024-01-25',
    status: 'expired',
    usage: 8,
    limit: 25,
    revenue: 12000
  },
  {
    id: '4',
    name: 'Weekend Special',
    type: 'percentage',
    value: 10,
    description: '10% off on weekends',
    startDate: '2024-01-25',
    endDate: '2024-02-25',
    status: 'scheduled',
    usage: 0,
    limit: 200,
    revenue: 0
  }
]

const promotionStats = {
  total: mockPromotions.length,
  active: mockPromotions.filter(p => p.status === 'active').length,
  scheduled: mockPromotions.filter(p => p.status === 'scheduled').length,
  expired: mockPromotions.filter(p => p.status === 'expired').length,
  totalRevenue: mockPromotions.reduce((sum, p) => sum + p.revenue, 0),
  totalUsage: mockPromotions.reduce((sum, p) => sum + p.usage, 0)
}

export default function PromotionsPage() {
  const [statusFilter, setStatusFilter] = useState('all')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'expired': return 'bg-gray-100 text-gray-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />
      case 'scheduled': return <Clock className="w-4 h-4" />
      case 'expired': return <XCircle className="w-4 h-4" />
      case 'paused': return <Clock className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const filteredPromotions = mockPromotions.filter(promotion => 
    statusFilter === 'all' || promotion.status === statusFilter
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🎯 Promotions & Marketing</h1>
          <p className="text-gray-600">Create and manage promotional campaigns to boost sales</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            Analytics
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Create Promotion
          </Button>
        </div>
      </div>

      {/* Promotion Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{promotionStats.total}</div>
            <div className="text-sm text-gray-600">Total Campaigns</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{promotionStats.active}</div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{promotionStats.scheduled}</div>
            <div className="text-sm text-gray-600">Scheduled</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{promotionStats.expired}</div>
            <div className="text-sm text-gray-600">Expired</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{promotionStats.totalUsage}</div>
            <div className="text-sm text-gray-600">Total Usage</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">₹{promotionStats.totalRevenue.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Revenue Generated</div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Promotions</option>
              <option value="active">Active</option>
              <option value="scheduled">Scheduled</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Calendar View
          </Button>
        </div>
      </Card>

      {/* Promotions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPromotions.map((promotion) => (
          <Card key={promotion.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Megaphone className="w-5 h-5 text-orange-500" />
                <h3 className="font-semibold text-gray-900">{promotion.name}</h3>
              </div>
              <Badge className={getStatusColor(promotion.status)}>
                <div className="flex items-center">
                  {getStatusIcon(promotion.status)}
                  <span className="ml-1 capitalize">{promotion.status}</span>
                </div>
              </Badge>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">Discount</p>
                <p className="font-semibold text-gray-900">
                  {promotion.type === 'percentage' 
                    ? `${promotion.value}% off` 
                    : `₹${promotion.value} off`
                  }
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Description</p>
                <p className="text-sm text-gray-700">{promotion.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500">Start Date</p>
                  <p className="text-sm font-medium">{new Date(promotion.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">End Date</p>
                  <p className="text-sm font-medium">{new Date(promotion.endDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500">Usage</p>
                  <p className="text-sm font-medium">{promotion.usage}/{promotion.limit}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Revenue</p>
                  <p className="text-sm font-medium">₹{promotion.revenue.toLocaleString()}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Usage Progress</span>
                  <span>{Math.round((promotion.usage / promotion.limit) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(promotion.usage / promotion.limit) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 pt-3 border-t border-gray-200">
                <Button size="sm" variant="outline" className="flex-1">
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                <Button size="sm" variant="outline">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredPromotions.length === 0 && (
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="text-2xl font-semibold mb-2">No promotions found</h2>
          <p className="text-gray-600 mb-6">
            {statusFilter !== 'all' 
              ? 'No promotions match your current filter'
              : 'Create your first promotional campaign to boost sales'
            }
          </p>
          <Button>Create Promotion</Button>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
            <Megaphone className="w-6 h-6 mb-2" />
            Create Discount
          </Button>
          <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
            <Users className="w-6 h-6 mb-2" />
            Customer Segment
          </Button>
          <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
            <TrendingUp className="w-6 h-6 mb-2" />
            Flash Sale
          </Button>
          <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
            <Calendar className="w-6 h-6 mb-2" />
            Schedule Campaign
          </Button>
        </div>
      </Card>

      {/* Coming Soon Features */}
      <Card className="p-6 bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">🚀 Advanced Marketing Features Coming Soon</h3>
          <p className="text-gray-600 mb-4">
            We&apos;re working on email campaigns, social media integration, 
            and AI-powered promotion recommendations.
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant="outline" size="sm">Email Campaigns</Button>
            <Button variant="outline" size="sm">Social Media</Button>
            <Button variant="outline" size="sm">AI Recommendations</Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
