import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getTypeOrmConfig = (
  configService: ConfigService,
  database: string,
): TypeOrmModuleOptions => {
  return {
    type: 'postgres',
    host: configService.get<string>('POSTGRES_HOST', 'localhost'),
    port: configService.get<number>('POSTGRES_PORT', 5432),
    username: configService.get<string>('POSTGRES_USER', 'postgres'),
    password: configService.get<string>('POSTGRES_PASSWORD', 'postgres'),
    database: database,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: configService.get<string>('NODE_ENV') === 'development',
    logging: configService.get<string>('NODE_ENV') === 'development',
    migrations: [__dirname + '/../migrations/**/*{.ts,.js}'],
    migrationsRun: true,
    ssl: configService.get<string>('NODE_ENV') === 'production'
      ? { rejectUnauthorized: false }
      : false,
    extra: {
      max: 10, // maximum number of connections
      min: 2,  // minimum number of connections
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    },
  };
};
