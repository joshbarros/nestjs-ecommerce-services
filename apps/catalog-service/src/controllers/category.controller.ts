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
import { CategoryService } from '../services/category.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { JwtAuthGuard, Roles, RolesGuard, ResponseDto, UserRole } from '@app/common';

@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
  private readonly logger = new Logger(CategoryController.name);

  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create category',
    description: 'Create a new product category (Admin/Vendor only)',
  })
  @ApiResponse({
    status: 201,
    description: 'Category successfully created',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 409, description: 'Category with slug already exists' })
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<ResponseDto<any>> {
    this.logger.log(`Creating category: ${createCategoryDto.name}`);
    const category = await this.categoryService.create(createCategoryDto);
    return ResponseDto.success(category, 'Category created successfully');
  }

  @Get()
  @ApiOperation({
    summary: 'Get all categories',
    description: 'Get all product categories',
  })
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    type: Boolean,
    description: 'Include inactive categories',
  })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
  })
  async findAll(
    @Query('includeInactive') includeInactive?: boolean,
  ): Promise<ResponseDto<any[]>> {
    this.logger.log('Getting all categories');
    const categories = await this.categoryService.findAll(includeInactive);
    return ResponseDto.success(categories);
  }

  @Get('root')
  @ApiOperation({
    summary: 'Get root categories',
    description: 'Get top-level categories with subcategories',
  })
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    type: Boolean,
    description: 'Include inactive categories',
  })
  @ApiResponse({
    status: 200,
    description: 'Root categories retrieved successfully',
  })
  async findRoot(
    @Query('includeInactive') includeInactive?: boolean,
  ): Promise<ResponseDto<any[]>> {
    this.logger.log('Getting root categories');
    const categories = await this.categoryService.findRootCategories(
      includeInactive,
    );
    return ResponseDto.success(categories);
  }

  @Get('slug/:slug')
  @ApiOperation({
    summary: 'Get category by slug',
    description: 'Get a category by its slug',
  })
  @ApiParam({ name: 'slug', description: 'Category slug' })
  @ApiResponse({
    status: 200,
    description: 'Category retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findBySlug(@Param('slug') slug: string): Promise<ResponseDto<any>> {
    this.logger.log(`Getting category by slug: ${slug}`);
    const category = await this.categoryService.findBySlug(slug);
    return ResponseDto.success(category);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get category by ID',
    description: 'Get a category by its ID',
  })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({
    status: 200,
    description: 'Category retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findOne(@Param('id') id: string): Promise<ResponseDto<any>> {
    this.logger.log(`Getting category: ${id}`);
    const category = await this.categoryService.findOne(id);
    return ResponseDto.success(category);
  }

  @Get(':id/subcategories')
  @ApiOperation({
    summary: 'Get subcategories',
    description: 'Get all subcategories of a category',
  })
  @ApiParam({ name: 'id', description: 'Parent category ID' })
  @ApiResponse({
    status: 200,
    description: 'Subcategories retrieved successfully',
  })
  async findSubcategories(
    @Param('id') id: string,
  ): Promise<ResponseDto<any[]>> {
    this.logger.log(`Getting subcategories for: ${id}`);
    const subcategories = await this.categoryService.findSubcategories(id);
    return ResponseDto.success(subcategories);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update category',
    description: 'Update a category (Admin/Vendor only)',
  })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({
    status: 200,
    description: 'Category successfully updated',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<ResponseDto<any>> {
    this.logger.log(`Updating category: ${id}`);
    const category = await this.categoryService.update(id, updateCategoryDto);
    return ResponseDto.success(category, 'Category updated successfully');
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete category',
    description: 'Delete a category (Admin only)',
  })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({ status: 204, description: 'Category successfully deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async remove(@Param('id') id: string): Promise<void> {
    this.logger.log(`Deleting category: ${id}`);
    await this.categoryService.remove(id);
  }
}
