import { Controller, Get, Post, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { KlaviyoService } from './klaviyo.service';

@ApiTags('Klaviyo')
@Controller('klaviyo')
export class KlaviyoController {
  constructor(private readonly klaviyoService: KlaviyoService) {}

  @Get('test-connection')
  @ApiOperation({ summary: 'Test Klaviyo API connection' })
  @ApiResponse({
    status: 200,
    description: 'Connection test result',
    schema: {
      type: 'object',
      properties: {
        connected: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  async testConnection() {
    const connected = await this.klaviyoService.testConnection();
    return {
      connected,
      message: connected
        ? 'Klaviyo API connection successful'
        : 'Klaviyo API connection failed',
    };
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Get metrics from Klaviyo API' })
  @ApiResponse({
    status: 200,
    description: 'List of metrics from Klaviyo',
    schema: {
      type: 'object',
      properties: {
        metrics: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    },
  })
  async getKlaviyoMetrics() {
    const metrics = await this.klaviyoService.getMetrics();
    return { metrics };
  }

  @Get('profiles/:email')
  @ApiOperation({ summary: 'Get profile from Klaviyo by email' })
  @ApiResponse({
    status: 200,
    description: 'Profile data from Klaviyo',
  })
  async getKlaviyoProfile(@Param('email') email: string) {
    try {
      const profile = await this.klaviyoService.getProfile(email);
      return {
        success: true,
        profile,
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to fetch profile from Klaviyo',
        error: error.message,
      };
    }
  }

  @Get('events')
  @ApiOperation({ summary: 'Get events from Klaviyo' })
  @ApiResponse({
    status: 200,
    description: 'Events data from Klaviyo',
  })
  async getKlaviyoEvents() {
    try {
      const events = await this.klaviyoService.getEvents();
      return {
        success: true,
        events,
        count: events.length,
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to fetch events from Klaviyo',
        error: error.message,
      };
    }
  }

  @Post('sync-test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Test event sync to Klaviyo' })
  @ApiResponse({
    status: 200,
    description: 'Test sync result',
  })
  async testSync() {
    const testEvent = {
      eventName: 'Test Event',
      eventAttributes: { test: true, timestamp: new Date().toISOString() },
      profileAttributes: { firstName: 'Test', lastName: 'User' },
      email: 'test@example.com',
    };

    try {
      const result = await this.klaviyoService.createEvent(testEvent);
      return {
        success: true,
        message: 'Test event sent to Klaviyo successfully',
        klaviyoResponse: result,
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to send test event to Klaviyo',
        error: error.message,
      };
    }
  }
}
