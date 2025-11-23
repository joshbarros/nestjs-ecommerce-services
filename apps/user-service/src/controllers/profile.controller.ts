import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ProfileService } from '../services/profile.service';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { ProfileResponseDto } from '../dto/profile-response.dto';
import { JwtAuthGuard, CurrentUser, ResponseDto } from '@app/common';

@ApiTags('User Profile')
@Controller('profile')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProfileController {
  private readonly logger = new Logger(ProfileController.name);

  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ApiOperation({
    summary: 'Get user profile',
    description: 'Get the profile of the current user',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
    type: ProfileResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(
    @CurrentUser('id') userId: string,
  ): Promise<ResponseDto<ProfileResponseDto>> {
    this.logger.log(`Getting profile for user: ${userId}`);
    const profile = await this.profileService.findOrCreate(userId);
    return ResponseDto.success(profile);
  }

  @Patch()
  @ApiOperation({
    summary: 'Update user profile',
    description: 'Update the profile of the current user',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile successfully updated',
    type: ProfileResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<ResponseDto<ProfileResponseDto>> {
    this.logger.log(`Updating profile for user: ${userId}`);
    const profile = await this.profileService.update(userId, updateProfileDto);
    return ResponseDto.success(profile, 'Profile updated successfully');
  }

  @Patch('verify-phone')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify phone number',
    description: 'Mark phone number as verified',
  })
  @ApiResponse({
    status: 200,
    description: 'Phone number verified successfully',
  })
  async verifyPhone(
    @CurrentUser('id') userId: string,
  ): Promise<ResponseDto<ProfileResponseDto>> {
    this.logger.log(`Verifying phone for user: ${userId}`);
    const profile = await this.profileService.updatePhoneVerification(
      userId,
      true,
    );
    return ResponseDto.success(profile, 'Phone number verified successfully');
  }
}
