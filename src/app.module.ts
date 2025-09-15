import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { KlaviyoModule } from './modules/klaviyo/klaviyo.module';
import { EventsModule } from './modules/events/events.module';
import { CleanupService } from './services/cleanup/cleanup.service';
import { CleanupController } from './controllers/cleanup.controller';
import { Event } from './entities/event.entity';
import { Profile } from './entities/profile.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    TypeOrmModule.forFeature([Event, Profile]),
    KlaviyoModule,
    EventsModule,
  ],
  controllers: [AppController, CleanupController],
  providers: [AppService, CleanupService],
})
export class AppModule {}
