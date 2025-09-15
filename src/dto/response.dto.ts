import { ApiProperty } from '@nestjs/swagger';

export class EventResponseDto {
  @ApiProperty({
    description: 'Event ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Event name',
    example: 'Purchase',
  })
  eventName: string;

  @ApiProperty({
    description: 'Event attributes',
    example: { productId: '123', amount: 99.99 },
  })
  eventAttributes: Record<string, any>;

  @ApiProperty({
    description: 'Profile attributes',
    example: { firstName: 'John', lastName: 'Doe' },
  })
  profileAttributes: Record<string, any>;

  @ApiProperty({
    description: 'Email address',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Event creation date',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: Date;
}

export class MetricsResponseDto {
  @ApiProperty({
    description: 'List of unique event names (metrics)',
    example: ['Purchase', 'Page View', 'Add to Cart'],
  })
  metrics: string[];
}

export class EventCountResponseDto {
  @ApiProperty({
    description: 'Event name (metric)',
    example: 'Purchase',
  })
  metric: string;

  @ApiProperty({
    description: 'Date',
    example: '2024-01-15',
  })
  date: string;

  @ApiProperty({
    description: 'Number of events',
    example: 42,
  })
  count: number;
}

export class EmailListResponseDto {
  @ApiProperty({
    description: 'List of email addresses',
    example: ['john.doe@example.com', 'jane.smith@example.com'],
  })
  emails: string[];
}

export class ProfileAttributesResponseDto {
  @ApiProperty({
    description: 'Profile email',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Profile attributes',
    example: { firstName: 'John', lastName: 'Doe', age: 30 },
  })
  attributes: Record<string, any>;
}

export class ProfileMetricsResponseDto {
  @ApiProperty({
    description: 'Profile email',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'List of metrics (event names) for this profile',
    example: ['Purchase', 'Page View', 'Add to Cart'],
  })
  metrics: string[];
}
