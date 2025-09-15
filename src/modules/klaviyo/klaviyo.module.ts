import { Module } from '@nestjs/common';
import { KlaviyoController } from './klaviyo.controller';
import { KlaviyoService } from './klaviyo.service';

@Module({
  controllers: [KlaviyoController],
  providers: [KlaviyoService]
})
export class KlaviyoModule {}
