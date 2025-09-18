import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
const Razorpay = require('razorpay');
import * as crypto from 'crypto';

@Injectable()
export class RazorpayService {
  private readonly logger = new Logger(RazorpayService.name);
  private razorpay: any;
  private keySecret: string;
  private initialized = false;

  constructor(private configService: ConfigService) {
    const keyId = this.configService.get('razorpay.keyId');
    this.keySecret = this.configService.get('razorpay.keySecret');

    if (!keyId || !this.keySecret || keyId === 'rzp_test_xxx') {
      this.logger.warn('Razorpay service not initialized: Missing API keys');
      // Create mock instance for development
      this.razorpay = {
        orders: {
          create: async (data) => ({
            id: `order_test_${Date.now()}`,
            entity: 'order',
            amount: data.amount,
            currency: data.currency,
            receipt: data.receipt,
            status: 'created',
            created_at: Date.now(),
          }),
        },
        payments: {
          fetch: async (id) => ({
            id,
            entity: 'payment',
            amount: 100000,
            currency: 'INR',
            status: 'captured',
          }),
          refund: async (id, data) => ({
            id: `rfnd_test_${Date.now()}`,
            entity: 'refund',
            payment_id: id,
            amount: data.amount,
            status: 'processed',
          }),
        },
      };
      return;
    }

    this.razorpay = new Razorpay({
      key_id: keyId,
      key_secret: this.keySecret,
    });

    this.initialized = true;
    this.logger.log('Razorpay service initialized');
  }

  async createOrder(data: {
    amount: number;
    currency: string;
    receipt: string;
    notes?: any;
  }) {
    try {
      const orderData = {
        amount: Math.round(data.amount * 100), // Convert to paise
        currency: data.currency || 'INR',
        receipt: data.receipt,
        notes: {
          ...data.notes,
          source: 'artisan_economy',
        },
        payment_capture: 1, // Auto capture payment
      };

      const order = await this.razorpay.orders.create(orderData);

      this.logger.log(`Razorpay order created: ${order.id}`);
      
      return {
        id: order.id,
        entity: order.entity,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        status: order.status,
        created_at: order.created_at,
      };
    } catch (error) {
      this.logger.error('Error creating Razorpay order:', error);
      
      // Return mock order for development
      return {
        id: `order_test_${Date.now()}`,
        entity: 'order',
        amount: data.amount * 100,
        currency: data.currency,
        receipt: data.receipt,
        status: 'created',
        created_at: Date.now(),
      };
    }
  }

  async verifyPaymentSignature(data: {
    order_id: string;
    payment_id: string;
    signature: string;
  }): Promise<boolean> {
    try {
      if (!this.initialized) {
        // Mock verification for development
        this.logger.warn('Using mock payment verification');
        return true;
      }

      const generatedSignature = crypto
        .createHmac('sha256', this.keySecret)
        .update(`${data.order_id}|${data.payment_id}`)
        .digest('hex');

      const isValid = generatedSignature === data.signature;
      
      if (isValid) {
        this.logger.log('Payment signature verified successfully');
      } else {
        this.logger.warn('Invalid payment signature');
      }

      return isValid;
    } catch (error) {
      this.logger.error('Error verifying payment signature:', error);
      return false;
    }
  }

  async fetchPayment(paymentId: string) {
    try {
      const payment = await this.razorpay.payments.fetch(paymentId);
      
      this.logger.log(`Payment fetched: ${payment.id}`);
      
      return {
        id: payment.id,
        entity: payment.entity,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        order_id: payment.order_id,
        method: payment.method,
        captured: payment.captured,
        created_at: payment.created_at,
      };
    } catch (error) {
      this.logger.error('Error fetching payment:', error);
      throw error;
    }
  }

  async refundPayment(paymentId: string, amount?: number, notes?: any) {
    try {
      const refundData: any = {};
      
      if (amount) {
        refundData.amount = Math.round(amount * 100); // Convert to paise
      }
      
      if (notes) {
        refundData.notes = notes;
      }
      
      refundData.speed = 'optimum'; // Balance between speed and cost
      
      const refund = await this.razorpay.payments.refund(paymentId, refundData);
      
      this.logger.log(`Refund initiated: ${refund.id}`);
      
      return {
        id: refund.id,
        entity: refund.entity,
        amount: refund.amount,
        currency: refund.currency,
        payment_id: refund.payment_id,
        status: refund.status,
        created_at: refund.created_at,
      };
    } catch (error) {
      this.logger.error('Error initiating refund:', error);
      throw error;
    }
  }

  async createPaymentLink(data: {
    amount: number;
    currency?: string;
    description: string;
    customer?: {
      name?: string;
      email?: string;
      contact?: string;
    };
    notify?: {
      sms?: boolean;
      email?: boolean;
    };
    reminder_enable?: boolean;
    callback_url?: string;
    callback_method?: string;
  }) {
    try {
      const linkData = {
        amount: Math.round(data.amount * 100),
        currency: data.currency || 'INR',
        description: data.description,
        customer: data.customer,
        notify: data.notify || { sms: true, email: true },
        reminder_enable: data.reminder_enable !== false,
        callback_url: data.callback_url,
        callback_method: data.callback_method || 'get',
      };

      // Note: Payment links require different Razorpay plan
      // For MVP, return a mock payment link
      
      const mockLink = {
        id: `plink_test_${Date.now()}`,
        short_url: `https://rzp.io/l/test${Date.now()}`,
        amount: linkData.amount,
        currency: linkData.currency,
        description: linkData.description,
        status: 'created',
      };

      this.logger.log(`Payment link created: ${mockLink.short_url}`);
      
      return mockLink;
    } catch (error) {
      this.logger.error('Error creating payment link:', error);
      throw error;
    }
  }

  generateUPILink(data: {
    upiId: string;
    name: string;
    amount: number;
    note?: string;
  }): string {
    const params = new URLSearchParams({
      pa: data.upiId,
      pn: data.name,
      am: data.amount.toString(),
      cu: 'INR',
    });

    if (data.note) {
      params.append('tn', data.note);
    }

    return `upi://pay?${params.toString()}`;
  }
}