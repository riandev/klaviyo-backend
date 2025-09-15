import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Param,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { EventsService } from './events.service';
import {
  CreateEventDto,
  CreateBulkEventsDto,
  GetEventsCountDto,
  GetEventsByDateDto,
  GetProfileDto,
  EventResponseDto,
  MetricsResponseDto,
  EventCountResponseDto,
  EmailListResponseDto,
  ProfileAttributesResponseDto,
  ProfileMetricsResponseDto,
} from '../../dto';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a single event' })
  @ApiResponse({
    status: 201,
    description: 'Event created successfully',
    type: EventResponseDto,
  })
  async createEvent(@Body() createEventDto: CreateEventDto) {
    return await this.eventsService.createEvent(createEventDto);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create multiple events in bulk' })
  @ApiResponse({
    status: 201,
    description: 'Events created successfully',
    type: [EventResponseDto],
  })
  async createBulkEvents(@Body() createBulkEventsDto: CreateBulkEventsDto) {
    return await this.eventsService.createBulkEvents(createBulkEventsDto);
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Get all unique event names (metrics)' })
  @ApiResponse({
    status: 200,
    description: 'List of all metrics',
    type: MetricsResponseDto,
  })
  async getAllMetrics() {
    const metrics = await this.eventsService.getAllMetrics();
    return { metrics };
  }

  @Get('count')
  @ApiOperation({ summary: 'Get event count by metric for a specific date' })
  @ApiQuery({ name: 'date', description: 'Date in YYYY-MM-DD format' })
  @ApiQuery({ name: 'metric', description: 'Event name (metric)' })
  @ApiResponse({
    status: 200,
    description: 'Event count for the specified metric and date',
    type: EventCountResponseDto,
  })
  async getEventsCount(@Query() query: GetEventsCountDto) {
    const count = await this.eventsService.getEventsCountByMetric(
      query.date,
      query.metric,
    );
    return {
      metric: query.metric,
      date: query.date,
      count,
    };
  }

  @Get('emails')
  @ApiOperation({
    summary: 'Get list of emails for a specific date and optional metric',
  })
  @ApiQuery({ name: 'date', description: 'Date in YYYY-MM-DD format' })
  @ApiQuery({
    name: 'metric',
    description: 'Event name (metric)',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'List of email addresses',
    type: EmailListResponseDto,
  })
  async getEmailsList(@Query() query: GetEventsByDateDto) {
    const emails = await this.eventsService.getEmailsByDateAndMetric(
      query.date,
      query.metric,
    );
    return { emails };
  }

  @Get('profiles/:email/attributes')
  @ApiOperation({ summary: 'Get profile attributes by email' })
  @ApiResponse({
    status: 200,
    description: 'Profile attributes',
    type: ProfileAttributesResponseDto,
  })
  async getProfileAttributes(@Param() params: GetProfileDto) {
    const profile = await this.eventsService.getProfileAttributes(params.email);
    if (!profile) {
      return {
        email: params.email,
        attributes: {},
      };
    }
    return {
      email: profile.email,
      attributes: profile.attributes,
    };
  }

  @Get('profiles/:email/metrics')
  @ApiOperation({ summary: 'Get profile metrics (event names) by email' })
  @ApiResponse({
    status: 200,
    description: 'List of metrics for the profile',
    type: ProfileMetricsResponseDto,
  })
  async getProfileMetrics(@Param() params: GetProfileDto) {
    const metrics = await this.eventsService.getProfileMetrics(params.email);
    return {
      email: params.email,
      metrics,
    };
  }
}
