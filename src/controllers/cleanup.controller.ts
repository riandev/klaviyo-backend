import { Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CleanupService } from '../services/cleanup/cleanup.service';

@ApiTags('Cleanup')
@Controller('cleanup')
export class CleanupController {
  constructor(private readonly cleanupService: CleanupService) {}

  @Post('manual')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Trigger manual cleanup of old data' })
  @ApiResponse({
    status: 200,
    description: 'Cleanup completed successfully',
    schema: {
      type: 'object',
      properties: {
        deletedEvents: { type: 'number' },
        deletedProfiles: { type: 'number' },
      },
    },
  })
  async triggerManualCleanup() {
    return await this.cleanupService.manualCleanup();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get cleanup statistics' })
  @ApiResponse({
    status: 200,
    description: 'Cleanup statistics',
    schema: {
      type: 'object',
      properties: {
        totalEvents: { type: 'number' },
        eventsToDelete: { type: 'number' },
        totalProfiles: { type: 'number' },
        orphanedProfiles: { type: 'number' },
        retentionDays: { type: 'number' },
      },
    },
  })
  async getCleanupStats() {
    return await this.cleanupService.getCleanupStats();
  }
}
