import mongoose, { Schema, Document, Types } from 'mongoose';
import { PAYMENT_STATUS } from '../config/constants.js';

interface CustomerInfo {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

interface PriceBreakdown {
  subtotal: number;
  fees: number;
  tax: number;
  total: number;
}

export interface IOrder extends Document {
  orderNumber: string;
  eventId: Types.ObjectId;
  userId?: Types.ObjectId;
  guestEmail?: string;
  customerInfo: CustomerInfo;
  seatIds: string[];
  ticketIds: Types.ObjectId[];
  paymentStatus: typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];
  paymentIntentId: string;
  totalAmount: number;
  currency: 'USD';
  breakdown: PriceBreakdown;
  stripeCustomerId?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    guestEmail: {
      type: String,
      lowercase: true,
      trim: true,
      index: true,
    },
    customerInfo: {
      email: { type: String, required: true },
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      phoneNumber: { type: String },
    },
    seatIds: {
      type: [String],
      required: true,
    },
    ticketIds: [{
      type: Schema.Types.ObjectId,
      ref: 'Ticket',
    }],
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
      index: true,
    },
    paymentIntentId: {
      type: String,
      required: true,
      index: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    breakdown: {
      subtotal: { type: Number, required: true },
      fees: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      total: { type: Number, required: true },
    },
    stripeCustomerId: {
      type: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for event orders
orderSchema.index({ eventId: 1, paymentStatus: 1 });

// Index for user order history
orderSchema.index({ userId: 1, createdAt: -1 });

export const Order = mongoose.model<IOrder>('Order', orderSchema);
