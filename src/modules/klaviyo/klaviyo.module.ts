import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from 'src/entities/event.entity';
import { Profile } from 'src/entities/profile.entity';
import { KlaviyoController } from './klaviyo.controller';
import { KlaviyoService } from './klaviyo.service';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([Event, Profile])],
  controllers: [KlaviyoController],
  providers: [KlaviyoService],
  exports: [KlaviyoService],
})
export class KlaviyoModule {}
