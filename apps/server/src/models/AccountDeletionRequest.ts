import mongoose, { Schema, Document, model } from 'mongoose';
import {
  DeletionRequestStatus,
  DELETION_REQUEST_STATUSES,
  UserRole,
} from '@moola/shared';

export interface IDeletionInternalNote {
  noteId: string;
  authorId: mongoose.Types.ObjectId;
  authorName: string;
  note: string;
  createdAt: Date;
}

export interface IAccountDeletionRequest extends Document {
  requestId: string;
  userId: mongoose.Types.ObjectId;
  userName?: string;
  userPhone: string;
  userRole: UserRole;
  reason?: string;
  status: DeletionRequestStatus;
  verificationState: 'authenticated_session' | 'web_requested_pending_verification' | 'verified';
  activeOrdersCount: number;
  unresolvedComplaintsCount: number;
  processedBy?: mongoose.Types.ObjectId;
  completionReason?: string;
  rejectionReason?: string;
  internalNotes: IDeletionInternalNote[];
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  toUserJSON(): Record<string, unknown>;
}

const internalNoteSchema = new Schema<IDeletionInternalNote>(
  {
    noteId: { type: String, required: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, required: true },
    note: { type: String, required: true, maxlength: 1000 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const accountDeletionRequestSchema = new Schema<IAccountDeletionRequest>(
  {
    requestId: {
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
    userName: {
      type: String,
      trim: true,
    },
    userPhone: {
      type: String,
      required: true,
      trim: true,
    },
    userRole: {
      type: String,
      enum: ['buyer', 'seller', 'admin'],
      required: true,
      index: true,
    },
    reason: {
      type: String,
      trim: true,
      maxlength: [1000, 'Reason cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: DELETION_REQUEST_STATUSES,
      default: 'PENDING',
      index: true,
    },
    verificationState: {
      type: String,
      enum: ['authenticated_session', 'web_requested_pending_verification', 'verified'],
      default: 'authenticated_session',
      required: true,
    },
    activeOrdersCount: {
      type: Number,
      default: 0,
    },
    unresolvedComplaintsCount: {
      type: Number,
      default: 0,
    },
    processedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    completionReason: {
      type: String,
      trim: true,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    internalNotes: [internalNoteSchema],
    processedAt: Date,
  },
  {
    timestamps: true,
  },
);

accountDeletionRequestSchema.index({ userId: 1, status: 1 });
accountDeletionRequestSchema.index({ createdAt: -1 });

// Sanitize user output (never reveal internal notes)
accountDeletionRequestSchema.methods.toUserJSON = function () {
  const obj = this.toObject();
  delete obj.internalNotes;
  return obj;
};

export const AccountDeletionRequest = model<IAccountDeletionRequest>(
  'AccountDeletionRequest',
  accountDeletionRequestSchema,
);
