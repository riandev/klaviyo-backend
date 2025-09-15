import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';

dotenv.config();

const configService = new ConfigService();

export const AppDataSource = new DataSource({
  type: 'mysql',
  url: configService.get('DATABASE_URL'),
  ssl: { rejectUnauthorized: false },
  entities: ['src/entities/**/*.ts'],
  migrations: ['src/database/migrations/**/*.ts'],
  synchronize: false,
  logging: configService.get('NODE_ENV') === 'development',
});

export default AppDataSource;
