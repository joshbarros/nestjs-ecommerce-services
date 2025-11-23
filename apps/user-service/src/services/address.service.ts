import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from '../entities/address.entity';
import { CreateAddressDto } from '../dto/create-address.dto';
import { UpdateAddressDto } from '../dto/update-address.dto';
import { MESSAGES } from '@app/common';

@Injectable()
export class AddressService {
  private readonly logger = new Logger(AddressService.name);

  constructor(
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
  ) {}

  async create(
    userId: string,
    createAddressDto: CreateAddressDto,
  ): Promise<Address> {
    // If this is set as default, unset other default addresses of the same type
    if (createAddressDto.isDefault) {
      await this.unsetDefaultAddresses(userId, createAddressDto.type);
    }

    const address = this.addressRepository.create({
      ...createAddressDto,
      userId,
    });

    const savedAddress = await this.addressRepository.save(address);
    this.logger.log(
      `Address created for user ${userId}: ${savedAddress.id} (${savedAddress.type})`,
    );

    return savedAddress;
  }

  async findAll(userId: string): Promise<Address[]> {
    return this.addressRepository.find({
      where: { userId },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Address> {
    const address = await this.addressRepository.findOne({
      where: { id, userId },
    });

    if (!address) {
      throw new NotFoundException(MESSAGES.GENERAL.NOT_FOUND('Address'));
    }

    return address;
  }

  async findDefaultAddress(
    userId: string,
    type?: string,
  ): Promise<Address | null> {
    const where: any = { userId, isDefault: true };
    if (type) {
      where.type = type;
    }

    return this.addressRepository.findOne({ where });
  }

  async update(
    id: string,
    userId: string,
    updateAddressDto: UpdateAddressDto,
  ): Promise<Address> {
    const address = await this.findOne(id, userId);

    // If setting this as default, unset other default addresses of the same type
    if (
      updateAddressDto.isDefault &&
      updateAddressDto.isDefault !== address.isDefault
    ) {
      const type = updateAddressDto.type || address.type;
      await this.unsetDefaultAddresses(userId, type, id);
    }

    Object.assign(address, updateAddressDto);
    const updatedAddress = await this.addressRepository.save(address);

    this.logger.log(
      `Address updated for user ${userId}: ${updatedAddress.id}`,
    );

    return updatedAddress;
  }

  async setDefault(id: string, userId: string): Promise<Address> {
    const address = await this.findOne(id, userId);

    // Unset other default addresses of the same type
    await this.unsetDefaultAddresses(userId, address.type, id);

    address.isDefault = true;
    const updatedAddress = await this.addressRepository.save(address);

    this.logger.log(
      `Address set as default for user ${userId}: ${updatedAddress.id}`,
    );

    return updatedAddress;
  }

  async remove(id: string, userId: string): Promise<void> {
    const address = await this.findOne(id, userId);

    await this.addressRepository.softDelete(id);

    this.logger.log(`Address removed for user ${userId}: ${id}`);
  }

  async count(userId: string): Promise<number> {
    return this.addressRepository.count({ where: { userId } });
  }

  private async unsetDefaultAddresses(
    userId: string,
    type: string,
    excludeId?: string,
  ): Promise<void> {
    const query = this.addressRepository
      .createQueryBuilder()
      .update(Address)
      .set({ isDefault: false })
      .where('user_id = :userId', { userId })
      .andWhere('type = :type', { type });

    if (excludeId) {
      query.andWhere('id != :excludeId', { excludeId });
    }

    await query.execute();
  }
}
