import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KlaviyoModule } from './modules/klaviyo/klaviyo.module';
import { EventsModule } from './modules/events/events.module';
import { CleanupService } from './services/cleanup/cleanup.service';

@Module({
  imports: [KlaviyoModule, EventsModule],
  controllers: [AppController],
  providers: [AppService, CleanupService],
})
export class AppModule {}
