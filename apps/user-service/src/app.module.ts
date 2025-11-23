import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@app/database';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AddressController } from './controllers/address.controller';
import { ProfileController } from './controllers/profile.controller';
import { AddressService } from './services/address.service';
import { ProfileService } from './services/profile.service';
import { Address } from './entities/address.entity';
import { UserProfile } from './entities/user-profile.entity';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),

    // Database
    DatabaseModule.forRoot('user_db'),
    DatabaseModule.forFeature([Address, UserProfile]),
  ],
  controllers: [AppController, AddressController, ProfileController],
  providers: [AppService, AddressService, ProfileService],
  exports: [AddressService, ProfileService],
})
export class AppModule {}
