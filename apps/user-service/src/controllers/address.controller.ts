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
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AddressService } from '../services/address.service';
import { CreateAddressDto } from '../dto/create-address.dto';
import { UpdateAddressDto } from '../dto/update-address.dto';
import { AddressResponseDto } from '../dto/address-response.dto';
import { JwtAuthGuard, CurrentUser, ResponseDto } from '@app/common';

@ApiTags('Addresses')
@Controller('addresses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AddressController {
  private readonly logger = new Logger(AddressController.name);

  constructor(private readonly addressService: AddressService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create address',
    description: 'Create a new address for the current user',
  })
  @ApiResponse({
    status: 201,
    description: 'Address successfully created',
    type: AddressResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() createAddressDto: CreateAddressDto,
  ): Promise<ResponseDto<AddressResponseDto>> {
    this.logger.log(`Creating address for user: ${userId}`);
    const address = await this.addressService.create(userId, createAddressDto);
    return ResponseDto.success(address, 'Address created successfully');
  }

  @Get()
  @ApiOperation({
    summary: 'Get all addresses',
    description: 'Get all addresses for the current user',
  })
  @ApiResponse({
    status: 200,
    description: 'Addresses retrieved successfully',
    type: [AddressResponseDto],
  })
  async findAll(
    @CurrentUser('id') userId: string,
  ): Promise<ResponseDto<AddressResponseDto[]>> {
    this.logger.log(`Getting all addresses for user: ${userId}`);
    const addresses = await this.addressService.findAll(userId);
    return ResponseDto.success(addresses);
  }

  @Get('default')
  @ApiOperation({
    summary: 'Get default address',
    description: 'Get the default address for the current user',
  })
  @ApiResponse({
    status: 200,
    description: 'Default address retrieved successfully',
    type: AddressResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Default address not found' })
  async findDefault(
    @CurrentUser('id') userId: string,
  ): Promise<ResponseDto<AddressResponseDto | null>> {
    this.logger.log(`Getting default address for user: ${userId}`);
    const address = await this.addressService.findDefaultAddress(userId);
    return ResponseDto.success(address);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get address by ID',
    description: 'Get a specific address by ID',
  })
  @ApiParam({ name: 'id', description: 'Address ID' })
  @ApiResponse({
    status: 200,
    description: 'Address retrieved successfully',
    type: AddressResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Address not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ): Promise<ResponseDto<AddressResponseDto>> {
    this.logger.log(`Getting address ${id} for user: ${userId}`);
    const address = await this.addressService.findOne(id, userId);
    return ResponseDto.success(address);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update address',
    description: 'Update an existing address',
  })
  @ApiParam({ name: 'id', description: 'Address ID' })
  @ApiResponse({
    status: 200,
    description: 'Address successfully updated',
    type: AddressResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Address not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ): Promise<ResponseDto<AddressResponseDto>> {
    this.logger.log(`Updating address ${id} for user: ${userId}`);
    const address = await this.addressService.update(
      id,
      userId,
      updateAddressDto,
    );
    return ResponseDto.success(address, 'Address updated successfully');
  }

  @Patch(':id/set-default')
  @ApiOperation({
    summary: 'Set default address',
    description: 'Set an address as the default',
  })
  @ApiParam({ name: 'id', description: 'Address ID' })
  @ApiResponse({
    status: 200,
    description: 'Address set as default successfully',
    type: AddressResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Address not found' })
  async setDefault(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ): Promise<ResponseDto<AddressResponseDto>> {
    this.logger.log(`Setting address ${id} as default for user: ${userId}`);
    const address = await this.addressService.setDefault(id, userId);
    return ResponseDto.success(address, 'Address set as default successfully');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete address',
    description: 'Delete an address (soft delete)',
  })
  @ApiParam({ name: 'id', description: 'Address ID' })
  @ApiResponse({ status: 204, description: 'Address successfully deleted' })
  @ApiResponse({ status: 404, description: 'Address not found' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    this.logger.log(`Deleting address ${id} for user: ${userId}`);
    await this.addressService.remove(id, userId);
  }
}
