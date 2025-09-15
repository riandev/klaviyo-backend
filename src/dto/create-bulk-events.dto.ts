import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CreateEventDto } from './create-event.dto';

export class CreateBulkEventsDto {
  @ApiProperty({
    description: 'Array of events to create',
    type: [CreateEventDto],
    example: [
      {
        eventName: 'Purchase',
        eventAttributes: { productId: '123', amount: 99.99 },
        profileAttributes: { firstName: 'John', lastName: 'Doe' },
        email: 'john.doe@example.com',
      },
      {
        eventName: 'Page View',
        eventAttributes: { page: '/products', category: 'electronics' },
        profileAttributes: { firstName: 'Jane', lastName: 'Smith' },
        email: 'jane.smith@example.com',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEventDto)
  events: CreateEventDto[];
}
