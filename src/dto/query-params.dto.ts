import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsOptional, IsString } from 'class-validator';

export class GetEventsByDateDto {
  @ApiProperty({
    description: 'Date in YYYY-MM-DD format',
    example: '2024-01-15',
  })
  @IsDateString()
  date: string;

  @ApiProperty({
    description: 'Event name (metric)',
    example: 'Purchase',
    required: false,
  })
  @IsString()
  @IsOptional()
  metric?: string;
}

export class GetProfileDto {
  @ApiProperty({
    description: 'Email address of the profile',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  email: string;
}

export class GetEventsCountDto {
  @ApiProperty({
    description: 'Date in YYYY-MM-DD format',
    example: '2024-01-15',
  })
  @IsDateString()
  date: string;

  @ApiProperty({
    description: 'Event name (metric)',
    example: 'Purchase',
  })
  @IsString()
  metric: string;
}
