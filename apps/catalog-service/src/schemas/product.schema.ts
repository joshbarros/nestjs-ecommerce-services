import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

export enum ProductStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
}

@Schema({ _id: false })
export class ProductImage {
  @Prop({ required: true, maxlength: 500 })
  url: string;

  @Prop({ maxlength: 200 })
  alt?: string;

  @Prop({ default: false })
  isPrimary: boolean;

  @Prop({ default: 0 })
  sortOrder: number;
}

@Schema({ _id: false })
export class ProductVariant {
  @Prop({ required: true, maxlength: 100 })
  name: string;

  @Prop({ required: true, maxlength: 100 })
  value: string;

  @Prop()
  sku?: string;

  @Prop({ min: 0 })
  price?: number;

  @Prop({ min: 0 })
  stock?: number;
}

@Schema({ _id: false })
export class ProductDimensions {
  @Prop({ min: 0 })
  length?: number;

  @Prop({ min: 0 })
  width?: number;

  @Prop({ min: 0 })
  height?: number;

  @Prop({ min: 0 })
  weight?: number;

  @Prop({ default: 'cm' })
  unit?: string; // 'cm', 'in', etc.

  @Prop({ default: 'kg' })
  weightUnit?: string; // 'kg', 'lb', etc.
}

@Schema({ _id: false })
export class ProductSEO {
  @Prop({ maxlength: 200 })
  metaTitle?: string;

  @Prop({ maxlength: 500 })
  metaDescription?: string;

  @Prop({ type: [String] })
  keywords?: string[];
}

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class Product {
  @Prop({ required: true, trim: true, maxlength: 200 })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ required: true, trim: true, maxlength: 2000 })
  description: string;

  @Prop({ trim: true })
  longDescription?: string;

  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  sku: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ min: 0 })
  compareAtPrice?: number; // Original price for showing discounts

  @Prop({ min: 0 })
  costPrice?: number; // Cost to business (not shown to customers)

  @Prop({ default: 'USD', length: 3 })
  currency: string;

  @Prop({ required: true, min: 0, default: 0 })
  stock: number;

  @Prop({ default: false })
  trackInventory: boolean;

  @Prop({ min: 0, default: 0 })
  lowStockThreshold: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Category' }] })
  categoryIds: Types.ObjectId[];

  @Prop({ type: [ProductImage], default: [] })
  images: ProductImage[];

  @Prop({ type: [ProductVariant], default: [] })
  variants: ProductVariant[];

  @Prop({ type: ProductDimensions })
  dimensions?: ProductDimensions;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ maxlength: 100 })
  brand?: string;

  @Prop({ maxlength: 100 })
  vendor?: string; // For marketplace scenarios

  @Prop({ type: Types.ObjectId })
  vendorId?: Types.ObjectId; // Reference to vendor/seller user

  @Prop({
    type: String,
    enum: ProductStatus,
    default: ProductStatus.DRAFT,
  })
  status: ProductStatus;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop({ default: false })
  isDigital: boolean; // Digital products don't need shipping

  @Prop({ default: false })
  requiresShipping: boolean;

  @Prop({ default: true })
  taxable: boolean;

  @Prop({ type: ProductSEO })
  seo?: ProductSEO;

  // Reviews and ratings
  @Prop({ min: 0, max: 5, default: 0 })
  averageRating: number;

  @Prop({ min: 0, default: 0 })
  reviewCount: number;

  @Prop({ min: 0, default: 0 })
  viewCount: number;

  @Prop({ min: 0, default: 0 })
  purchaseCount: number;

  // Metadata for extensibility
  @Prop({ type: Object })
  metadata?: Record<string, any>;

  // Timestamps (automatically managed by Mongoose)
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date; // For soft deletes
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Indexes for performance
ProductSchema.index({ slug: 1 });
ProductSchema.index({ sku: 1 });
ProductSchema.index({ categoryIds: 1 });
ProductSchema.index({ status: 1 });
ProductSchema.index({ isActive: 1 });
ProductSchema.index({ isFeatured: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ averageRating: -1 });
ProductSchema.index({ purchaseCount: -1 });
ProductSchema.index({ tags: 1 });
ProductSchema.index({ brand: 1 });
ProductSchema.index({ vendorId: 1 });

// Text index for search
ProductSchema.index({
  name: 'text',
  description: 'text',
  tags: 'text',
  brand: 'text',
});

// Compound indexes
ProductSchema.index({ isActive: 1, status: 1, price: 1 });
ProductSchema.index({ categoryIds: 1, isActive: 1 });
