import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from '../schemas/product.schema';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { FilterProductDto, SortBy } from '../dto/filter-product.dto';
import { IPaginatedResult } from '@app/common';
import { MESSAGES } from '@app/common';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    @InjectModel(Product.name)
    private productModel: Model<ProductDocument>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    // Check if SKU already exists
    const existingSKU = await this.productModel.findOne({
      sku: createProductDto.sku.toUpperCase(),
    });

    if (existingSKU) {
      throw new ConflictException('Product with this SKU already exists');
    }

    // Check if slug already exists
    const existingSlug = await this.productModel.findOne({
      slug: createProductDto.slug.toLowerCase(),
    });

    if (existingSlug) {
      throw new ConflictException('Product with this slug already exists');
    }

    // Convert category IDs to ObjectId
    const categoryIds = createProductDto.categoryIds.map(
      (id) => new Types.ObjectId(id),
    );

    const productData = {
      ...createProductDto,
      sku: createProductDto.sku.toUpperCase(),
      slug: createProductDto.slug.toLowerCase(),
      categoryIds,
    };

    const product = new this.productModel(productData);
    const savedProduct = await product.save();

    this.logger.log(
      `Product created: ${savedProduct.name} (${savedProduct.sku})`,
    );

    return savedProduct.toJSON();
  }

  async findAll(filterDto: FilterProductDto): Promise<IPaginatedResult<Product>> {
    const { page = 1, limit = 20, sortBy = SortBy.NEWEST } = filterDto;
    const skip = (page - 1) * limit;

    // Build filter query
    const filter: any = {};

    // Search query
    if (filterDto.search) {
      filter.$text = { $search: filterDto.search };
    }

    // Category filter
    if (filterDto.categoryId) {
      filter.categoryIds = new Types.ObjectId(filterDto.categoryId);
    }

    // Brand filter
    if (filterDto.brand) {
      filter.brand = new RegExp(filterDto.brand, 'i');
    }

    // Price range filter
    if (filterDto.minPrice !== undefined || filterDto.maxPrice !== undefined) {
      filter.price = {};
      if (filterDto.minPrice !== undefined) {
        filter.price.$gte = filterDto.minPrice;
      }
      if (filterDto.maxPrice !== undefined) {
        filter.price.$lte = filterDto.maxPrice;
      }
    }

    // Status filter
    if (filterDto.status) {
      filter.status = filterDto.status;
    }

    // Active filter
    if (filterDto.isActive !== undefined) {
      filter.isActive = filterDto.isActive;
    }

    // Featured filter
    if (filterDto.isFeatured !== undefined) {
      filter.isFeatured = filterDto.isFeatured;
    }

    // Tag filter
    if (filterDto.tag) {
      filter.tags = filterDto.tag;
    }

    // Rating filter
    if (filterDto.minRating !== undefined) {
      filter.averageRating = { $gte: filterDto.minRating };
    }

    // In stock filter
    if (filterDto.inStock) {
      filter.stock = { $gt: 0 };
    }

    // Build sort query
    const sort: any = {};
    switch (sortBy) {
      case SortBy.NEWEST:
        sort.createdAt = -1;
        break;
      case SortBy.OLDEST:
        sort.createdAt = 1;
        break;
      case SortBy.PRICE_LOW_HIGH:
        sort.price = 1;
        break;
      case SortBy.PRICE_HIGH_LOW:
        sort.price = -1;
        break;
      case SortBy.NAME_A_Z:
        sort.name = 1;
        break;
      case SortBy.NAME_Z_A:
        sort.name = -1;
        break;
      case SortBy.POPULAR:
        sort.purchaseCount = -1;
        break;
      case SortBy.RATING:
        sort.averageRating = -1;
        break;
      default:
        sort.createdAt = -1;
    }

    // Execute queries in parallel
    const [products, total] = await Promise.all([
      this.productModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments(filter).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: products,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };
  }

  async findOne(id: string): Promise<Product> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid product ID');
    }

    const product = await this.productModel.findById(id).exec();

    if (!product) {
      throw new NotFoundException(MESSAGES.GENERAL.NOT_FOUND('Product'));
    }

    // Increment view count
    await this.productModel
      .updateOne({ _id: id }, { $inc: { viewCount: 1 } })
      .exec();

    return product.toJSON();
  }

  async findBySlug(slug: string): Promise<Product> {
    const product = await this.productModel
      .findOne({ slug: slug.toLowerCase() })
      .exec();

    if (!product) {
      throw new NotFoundException(MESSAGES.GENERAL.NOT_FOUND('Product'));
    }

    // Increment view count
    await this.productModel
      .updateOne({ _id: product._id }, { $inc: { viewCount: 1 } })
      .exec();

    return product.toJSON();
  }

  async findBySku(sku: string): Promise<Product> {
    const product = await this.productModel
      .findOne({ sku: sku.toUpperCase() })
      .exec();

    if (!product) {
      throw new NotFoundException(MESSAGES.GENERAL.NOT_FOUND('Product'));
    }

    return product.toJSON();
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid product ID');
    }

    // Check if SKU is being changed and if it already exists
    if (updateProductDto.sku) {
      const existingSKU = await this.productModel.findOne({
        sku: updateProductDto.sku.toUpperCase(),
        _id: { $ne: id },
      });

      if (existingSKU) {
        throw new ConflictException('Product with this SKU already exists');
      }
      updateProductDto.sku = updateProductDto.sku.toUpperCase();
    }

    // Check if slug is being changed and if it already exists
    if (updateProductDto.slug) {
      const existingSlug = await this.productModel.findOne({
        slug: updateProductDto.slug.toLowerCase(),
        _id: { $ne: id },
      });

      if (existingSlug) {
        throw new ConflictException('Product with this slug already exists');
      }
      updateProductDto.slug = updateProductDto.slug.toLowerCase();
    }

    // Convert category IDs to ObjectId if provided
    if (updateProductDto.categoryIds) {
      updateProductDto.categoryIds = updateProductDto.categoryIds.map(
        (id) => new Types.ObjectId(id) as any,
      );
    }

    const product = await this.productModel
      .findByIdAndUpdate(id, updateProductDto, { new: true })
      .exec();

    if (!product) {
      throw new NotFoundException(MESSAGES.GENERAL.NOT_FOUND('Product'));
    }

    this.logger.log(`Product updated: ${product.name} (${product.sku})`);

    return product.toJSON();
  }

  async updateStock(id: string, quantity: number): Promise<Product> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid product ID');
    }

    const product = await this.productModel
      .findByIdAndUpdate(
        id,
        { $inc: { stock: quantity } },
        { new: true },
      )
      .exec();

    if (!product) {
      throw new NotFoundException(MESSAGES.GENERAL.NOT_FOUND('Product'));
    }

    this.logger.log(
      `Product stock updated: ${product.name} (${product.sku}) - New stock: ${product.stock}`,
    );

    return product.toJSON();
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid product ID');
    }

    const result = await this.productModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(MESSAGES.GENERAL.NOT_FOUND('Product'));
    }

    this.logger.log(`Product deleted: ${result.name} (${id})`);
  }

  async getFeaturedProducts(limit = 10): Promise<Product[]> {
    return this.productModel
      .find({ isFeatured: true, isActive: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async getRelatedProducts(
    productId: string,
    limit = 6,
  ): Promise<Product[]> {
    if (!Types.ObjectId.isValid(productId)) {
      throw new BadRequestException('Invalid product ID');
    }

    const product = await this.productModel.findById(productId).exec();

    if (!product) {
      throw new NotFoundException(MESSAGES.GENERAL.NOT_FOUND('Product'));
    }

    // Find products in the same categories, excluding the current product
    return this.productModel
      .find({
        _id: { $ne: productId },
        categoryIds: { $in: product.categoryIds },
        isActive: true,
      })
      .sort({ purchaseCount: -1, averageRating: -1 })
      .limit(limit)
      .exec();
  }

  async count(): Promise<number> {
    return this.productModel
      .countDocuments({ isActive: true, deletedAt: null })
      .exec();
  }
}
