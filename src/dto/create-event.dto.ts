import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateEventDto {
  @ApiProperty({
    description: 'Event name (metric in Klaviyo terms)',
    example: 'Purchase',
  })
  @IsString()
  @IsNotEmpty()
  eventName: string;

  @ApiProperty({
    description: 'Event attributes as key-value pairs',
    example: { productId: '123', amount: 99.99, currency: 'USD' },
    required: false,
  })
  @IsObject()
  @IsOptional()
  eventAttributes?: Record<string, any>;

  @ApiProperty({
    description: 'Profile attributes as key-value pairs',
    example: { firstName: 'John', lastName: 'Doe', age: 30 },
    required: false,
  })
  @IsObject()
  @IsOptional()
  profileAttributes?: Record<string, any>;

  @ApiProperty({
    description: 'Email address of the profile',
    example: 'john.doe@example.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;
}
