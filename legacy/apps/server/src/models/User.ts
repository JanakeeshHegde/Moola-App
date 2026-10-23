import { Schema, Document, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole, Language } from '@moola/shared';

export interface IUser extends Document {
  name: string;
  phone: string;
  email?: string;
  passwordHash: string;
  role: UserRole;
  avatar?: string;
  preferredLanguage: Language;
  location?: {
    state: string;
    district: string;
    pincode: string;
    coordinates?: { lat: number; lng: number };
  };
  isActive: boolean;
  pushTokens: string[];
  fcmTokens: string[];
  refreshTokens: string[];
  passwordResetOTP?: string;
  passwordResetExpires?: Date;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  comparePassword(password: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Invalid Indian phone number'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address'],
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ['buyer', 'seller', 'admin'],
      required: true,
    },
    avatar: String,
    preferredLanguage: {
      type: String,
      enum: ['en', 'kn'],
      default: 'en',
    },
    location: {
      state: String,
      district: String,
      pincode: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    pushTokens: [{ type: String }],
    fcmTokens: [{ type: String }],
    refreshTokens: [{ type: String, select: false }],
    passwordResetOTP: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    lastLoginAt: Date,
  },
  {
    timestamps: true,
    toJSON: {
      transform(_, ret: Record<string, any>) {
        delete ret.passwordHash;
        delete ret.refreshTokens;
        delete ret.passwordResetOTP;
        delete ret.passwordResetExpires;
        return ret;
      },
    },
  },
);

// Indexes
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Compare password method
userSchema.methods.comparePassword = async function (
  password: string,
): Promise<boolean> {
  return bcrypt.compare(password, this.passwordHash);
};

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  // passwordHash field actually holds the plain text before first hash
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

export const User = model<IUser>('User', userSchema);
