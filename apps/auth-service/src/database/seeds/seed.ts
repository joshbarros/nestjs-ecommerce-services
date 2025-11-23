import { AppDataSource } from '../../config/data-source';
import { User } from '../../entities/user.entity';
import { UserRole } from '@app/common';
import * as bcrypt from 'bcrypt';

async function seed() {
  try {
    console.log('🌱 Starting database seeding...');

    // Initialize data source
    await AppDataSource.initialize();
    console.log('✅ Database connection established');

    const userRepository = AppDataSource.getRepository(User);

    // Check if admin already exists
    const existingAdmin = await userRepository.findOne({
      where: { email: 'admin@ecommerce.com' },
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists, skipping seed');
      await AppDataSource.destroy();
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    const admin = userRepository.create({
      email: 'admin@ecommerce.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      isEmailVerified: true,
      isActive: true,
    });

    await userRepository.save(admin);
    console.log('✅ Admin user created:', admin.email);

    // Create test users
    const testUsers = [
      {
        email: 'user@test.com',
        password: await bcrypt.hash('User@123', 10),
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.USER,
        isEmailVerified: true,
      },
      {
        email: 'vendor@test.com',
        password: await bcrypt.hash('Vendor@123', 10),
        firstName: 'Jane',
        lastName: 'Smith',
        role: UserRole.VENDOR,
        isEmailVerified: true,
      },
    ];

    for (const userData of testUsers) {
      const user = userRepository.create(userData);
      await userRepository.save(user);
      console.log(`✅ Test user created: ${user.email}`);
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Created users:');
    console.log('   - admin@ecommerce.com (password: Admin@123)');
    console.log('   - user@test.com (password: User@123)');
    console.log('   - vendor@test.com (password: Vendor@123)');

    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
}

seed();
