import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ProductService } from '../services/product.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { FilterProductDto } from '../dto/filter-product.dto';
import {
  JwtAuthGuard,
  Roles,
  RolesGuard,
  ResponseDto,
  UserRole,
  PaginatedResponseDto,
} from '@app/common';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  private readonly logger = new Logger(ProductController.name);

  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create product',
    description: 'Create a new product (Admin/Vendor only)',
  })
  @ApiResponse({
    status: 201,
    description: 'Product successfully created',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 409, description: 'Product with SKU/slug already exists' })
  async create(
    @Body() createProductDto: CreateProductDto,
  ): Promise<ResponseDto<any>> {
    this.logger.log(`Creating product: ${createProductDto.name}`);
    const product = await this.productService.create(createProductDto);
    return ResponseDto.success(product, 'Product created successfully');
  }

  @Get()
  @ApiOperation({
    summary: 'Get all products',
    description: 'Get all products with filtering and pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
  })
  async findAll(
    @Query() filterDto: FilterProductDto,
  ): Promise<PaginatedResponseDto<any>> {
    this.logger.log('Getting all products with filters');
    const result = await this.productService.findAll(filterDto);
    return PaginatedResponseDto.success(result.data, result.meta);
  }

  @Get('featured')
  @ApiOperation({
    summary: 'Get featured products',
    description: 'Get featured products',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of products to return',
  })
  @ApiResponse({
    status: 200,
    description: 'Featured products retrieved successfully',
  })
  async findFeatured(
    @Query('limit') limit?: number,
  ): Promise<ResponseDto<any[]>> {
    this.logger.log('Getting featured products');
    const products = await this.productService.getFeaturedProducts(limit);
    return ResponseDto.success(products);
  }

  @Get('slug/:slug')
  @ApiOperation({
    summary: 'Get product by slug',
    description: 'Get a product by its slug',
  })
  @ApiParam({ name: 'slug', description: 'Product slug' })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findBySlug(@Param('slug') slug: string): Promise<ResponseDto<any>> {
    this.logger.log(`Getting product by slug: ${slug}`);
    const product = await this.productService.findBySlug(slug);
    return ResponseDto.success(product);
  }

  @Get('sku/:sku')
  @ApiOperation({
    summary: 'Get product by SKU',
    description: 'Get a product by its SKU',
  })
  @ApiParam({ name: 'sku', description: 'Product SKU' })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findBySku(@Param('sku') sku: string): Promise<ResponseDto<any>> {
    this.logger.log(`Getting product by SKU: ${sku}`);
    const product = await this.productService.findBySku(sku);
    return ResponseDto.success(product);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get product by ID',
    description: 'Get a product by its ID',
  })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findOne(@Param('id') id: string): Promise<ResponseDto<any>> {
    this.logger.log(`Getting product: ${id}`);
    const product = await this.productService.findOne(id);
    return ResponseDto.success(product);
  }

  @Get(':id/related')
  @ApiOperation({
    summary: 'Get related products',
    description: 'Get products related to a specific product',
  })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of products to return',
  })
  @ApiResponse({
    status: 200,
    description: 'Related products retrieved successfully',
  })
  async findRelated(
    @Param('id') id: string,
    @Query('limit') limit?: number,
  ): Promise<ResponseDto<any[]>> {
    this.logger.log(`Getting related products for: ${id}`);
    const products = await this.productService.getRelatedProducts(id, limit);
    return ResponseDto.success(products);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update product',
    description: 'Update a product (Admin/Vendor only)',
  })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Product successfully updated',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ResponseDto<any>> {
    this.logger.log(`Updating product: ${id}`);
    const product = await this.productService.update(id, updateProductDto);
    return ResponseDto.success(product, 'Product updated successfully');
  }

  @Patch(':id/stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update product stock',
    description: 'Update product stock quantity (Admin/Vendor only)',
  })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Stock successfully updated',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async updateStock(
    @Param('id') id: string,
    @Body('quantity') quantity: number,
  ): Promise<ResponseDto<any>> {
    this.logger.log(`Updating stock for product: ${id}, quantity: ${quantity}`);
    const product = await this.productService.updateStock(id, quantity);
    return ResponseDto.success(product, 'Stock updated successfully');
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete product',
    description: 'Delete a product (Admin only)',
  })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: 204, description: 'Product successfully deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async remove(@Param('id') id: string): Promise<void> {
    this.logger.log(`Deleting product: ${id}`);
    await this.productService.remove(id);
  }
}
