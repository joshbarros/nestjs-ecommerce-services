import {
  Injectable,
  NotFoundException,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfile } from '../entities/user-profile.entity';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { MESSAGES } from '@app/common';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(
    @InjectRepository(UserProfile)
    private profileRepository: Repository<UserProfile>,
  ) {}

  async findByUserId(userId: string): Promise<UserProfile> {
    const profile = await this.profileRepository.findOne({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException(
        MESSAGES.GENERAL.NOT_FOUND('User profile'),
      );
    }

    return profile;
  }

  async findOrCreate(userId: string): Promise<UserProfile> {
    let profile = await this.profileRepository.findOne({
      where: { userId },
    });

    if (!profile) {
      profile = await this.create(userId);
    }

    return profile;
  }

  async create(userId: string): Promise<UserProfile> {
    // Check if profile already exists
    const existingProfile = await this.profileRepository.findOne({
      where: { userId },
    });

    if (existingProfile) {
      throw new ConflictException('User profile already exists');
    }

    const profile = this.profileRepository.create({ userId });
    const savedProfile = await this.profileRepository.save(profile);

    this.logger.log(`Profile created for user: ${userId}`);

    return savedProfile;
  }

  async update(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<UserProfile> {
    const profile = await this.findOrCreate(userId);

    Object.assign(profile, updateProfileDto);
    const updatedProfile = await this.profileRepository.save(profile);

    this.logger.log(`Profile updated for user: ${userId}`);

    return updatedProfile;
  }

  async updatePhoneVerification(
    userId: string,
    isVerified: boolean,
  ): Promise<UserProfile> {
    const profile = await this.findByUserId(userId);

    profile.isPhoneVerified = isVerified;
    const updatedProfile = await this.profileRepository.save(profile);

    this.logger.log(
      `Phone verification updated for user ${userId}: ${isVerified}`,
    );

    return updatedProfile;
  }

  async updateTwoFactor(
    userId: string,
    enabled: boolean,
    secret?: string,
  ): Promise<UserProfile> {
    const profile = await this.findByUserId(userId);

    profile.twoFactorEnabled = enabled;
    if (secret) {
      profile.twoFactorSecret = secret;
    } else if (!enabled) {
      profile.twoFactorSecret = null;
    }

    const updatedProfile = await this.profileRepository.save(profile);

    this.logger.log(`Two-factor authentication updated for user ${userId}`);

    return updatedProfile;
  }

  async updateLastPasswordChange(userId: string): Promise<UserProfile> {
    const profile = await this.findOrCreate(userId);

    profile.lastPasswordChange = new Date();
    const updatedProfile = await this.profileRepository.save(profile);

    this.logger.log(`Last password change updated for user: ${userId}`);

    return updatedProfile;
  }

  async delete(userId: string): Promise<void> {
    const profile = await this.findByUserId(userId);

    await this.profileRepository.softDelete(profile.id);

    this.logger.log(`Profile deleted for user: ${userId}`);
  }
}
