import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from 'src/entities/event.entity';
import { Profile } from 'src/entities/profile.entity';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { KlaviyoModule } from '../klaviyo/klaviyo.module';

@Module({
  imports: [TypeOrmModule.forFeature([Event, Profile]), KlaviyoModule],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
