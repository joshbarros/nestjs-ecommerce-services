import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category, CategoryDocument } from '../schemas/category.schema';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { MESSAGES } from '@app/common';

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);

  constructor(
    @InjectModel(Category.name)
    private categoryModel: Model<CategoryDocument>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    // Check if slug already exists
    const existingCategory = await this.categoryModel.findOne({
      slug: createCategoryDto.slug,
    });

    if (existingCategory) {
      throw new ConflictException('Category with this slug already exists');
    }

    // Validate parent category if provided
    if (createCategoryDto.parentId) {
      const parentExists = await this.categoryModel.exists({
        _id: createCategoryDto.parentId,
      });

      if (!parentExists) {
        throw new NotFoundException('Parent category not found');
      }
    }

    const category = new this.categoryModel(createCategoryDto);
    const savedCategory = await category.save();

    this.logger.log(`Category created: ${savedCategory.name} (${savedCategory.id})`);

    return savedCategory.toJSON();
  }

  async findAll(includeInactive = false): Promise<Category[]> {
    const filter = includeInactive ? {} : { isActive: true };

    return this.categoryModel
      .find(filter)
      .sort({ sortOrder: 1, name: 1 })
      .exec();
  }

  async findAllWithSubcategories(
    includeInactive = false,
  ): Promise<Category[]> {
    const filter = includeInactive ? {} : { isActive: true };

    return this.categoryModel
      .find(filter)
      .populate('subcategories')
      .sort({ sortOrder: 1, name: 1 })
      .exec();
  }

  async findRootCategories(includeInactive = false): Promise<Category[]> {
    const filter: any = { parentId: null };
    if (!includeInactive) {
      filter.isActive = true;
    }

    return this.categoryModel
      .find(filter)
      .populate('subcategories')
      .sort({ sortOrder: 1, name: 1 })
      .exec();
  }

  async findOne(id: string): Promise<Category> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid category ID');
    }

    const category = await this.categoryModel
      .findById(id)
      .populate('subcategories')
      .exec();

    if (!category) {
      throw new NotFoundException(MESSAGES.GENERAL.NOT_FOUND('Category'));
    }

    return category.toJSON();
  }

  async findBySlug(slug: string): Promise<Category> {
    const category = await this.categoryModel
      .findOne({ slug })
      .populate('subcategories')
      .exec();

    if (!category) {
      throw new NotFoundException(MESSAGES.GENERAL.NOT_FOUND('Category'));
    }

    return category.toJSON();
  }

  async findSubcategories(parentId: string): Promise<Category[]> {
    if (!Types.ObjectId.isValid(parentId)) {
      throw new BadRequestException('Invalid parent category ID');
    }

    return this.categoryModel
      .find({ parentId, isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .exec();
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid category ID');
    }

    // Check if slug is being changed and if it already exists
    if (updateCategoryDto.slug) {
      const existingCategory = await this.categoryModel.findOne({
        slug: updateCategoryDto.slug,
        _id: { $ne: id },
      });

      if (existingCategory) {
        throw new ConflictException('Category with this slug already exists');
      }
    }

    // Validate parent category if being updated
    if (updateCategoryDto.parentId) {
      // Prevent category from being its own parent
      if (updateCategoryDto.parentId === id) {
        throw new BadRequestException(
          'Category cannot be its own parent',
        );
      }

      const parentExists = await this.categoryModel.exists({
        _id: updateCategoryDto.parentId,
      });

      if (!parentExists) {
        throw new NotFoundException('Parent category not found');
      }
    }

    const category = await this.categoryModel
      .findByIdAndUpdate(id, updateCategoryDto, { new: true })
      .exec();

    if (!category) {
      throw new NotFoundException(MESSAGES.GENERAL.NOT_FOUND('Category'));
    }

    this.logger.log(`Category updated: ${category.name} (${category.id})`);

    return category.toJSON();
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid category ID');
    }

    // Check if category has subcategories
    const hasSubcategories = await this.categoryModel.exists({ parentId: id });

    if (hasSubcategories) {
      throw new BadRequestException(
        'Cannot delete category with subcategories. Delete subcategories first.',
      );
    }

    const result = await this.categoryModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(MESSAGES.GENERAL.NOT_FOUND('Category'));
    }

    this.logger.log(`Category deleted: ${result.name} (${id})`);
  }

  async count(): Promise<number> {
    return this.categoryModel.countDocuments({ isActive: true }).exec();
  }
}
