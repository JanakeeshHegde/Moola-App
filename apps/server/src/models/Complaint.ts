import mongoose, { Schema, Document, model } from 'mongoose';
import {
  ComplaintCategory,
  ComplaintStatus,
  COMPLAINT_CATEGORIES,
  COMPLAINT_STATUSES,
} from '@moola/shared';

export interface IComplaintInternalNote {
  noteId: string;
  authorId: mongoose.Types.ObjectId;
  authorName: string;
  note: string;
  createdAt: Date;
}

export interface IComplaintStatusHistory {
  status: ComplaintStatus;
  changedAt: Date;
  changedBy?: mongoose.Types.ObjectId;
  changedByRole: 'user' | 'admin' | 'system';
  note?: string;
}

export interface IComplaint extends Document {
  ticketId: string;
  userId: mongoose.Types.ObjectId;
  category: ComplaintCategory;
  subject: string;
  description: string;
  orderId?: mongoose.Types.ObjectId;
  attachmentUrl?: string;
  status: ComplaintStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  publicResponse?: string;
  internalNotes: IComplaintInternalNote[];
  statusHistory: IComplaintStatusHistory[];
  slaDeadline: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Sanitized output for user view
  toUserJSON(): Record<string, unknown>;
}

const internalNoteSchema = new Schema<IComplaintInternalNote>(
  {
    noteId: { type: String, required: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, required: true },
    note: { type: String, required: true, maxlength: 1000 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const statusHistorySchema = new Schema<IComplaintStatusHistory>(
  {
    status: { type: String, enum: COMPLAINT_STATUSES, required: true },
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    changedByRole: { type: String, enum: ['user', 'admin', 'system'], required: true },
    note: { type: String, maxlength: 500 },
  },
  { _id: false },
);

const complaintSchema = new Schema<IComplaint>(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: COMPLAINT_CATEGORIES,
      required: [true, 'Complaint category is required'],
      index: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: [200, 'Subject cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      index: true,
    },
    attachmentUrl: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: COMPLAINT_STATUSES,
      default: 'SUBMITTED',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      index: true,
    },
    publicResponse: {
      type: String,
      trim: true,
      maxlength: [2000, 'Public response cannot exceed 2000 characters'],
    },
    internalNotes: [internalNoteSchema],
    statusHistory: [statusHistorySchema],
    slaDeadline: {
      type: Date,
      required: true,
      index: true,
    },
    resolvedAt: Date,
    closedAt: Date,
  },
  {
    timestamps: true,
  },
);

// Indexes
complaintSchema.index({ userId: 1, createdAt: -1 });
complaintSchema.index({ status: 1, slaDeadline: 1 });

// Helper to serialize for normal users (guarantees internalNotes are never leaked)
complaintSchema.methods.toUserJSON = function () {
  const obj = this.toObject();
  delete obj.internalNotes;
  return obj;
};

export const Complaint = model<IComplaint>('Complaint', complaintSchema);
