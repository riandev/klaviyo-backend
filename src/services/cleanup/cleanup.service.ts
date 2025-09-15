import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../../entities/event.entity';
import { Profile } from '../../entities/profile.entity';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    private configService: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async performDailyCleanup() {
    this.logger.log('Starting daily cleanup process...');
    try {
      const deletedEvents = await this.cleanupOldEvents();
      const deletedProfiles = await this.cleanupOrphanedProfiles();

      this.logger.log(
        `Cleanup completed: ${deletedEvents} events deleted, ${deletedProfiles} profiles deleted`,
      );
    } catch (error) {
      this.logger.error('Cleanup process failed:', error);
    }
  }

  async cleanupOldEvents(): Promise<number> {
    const retentionDays = this.configService.get<number>(
      'dataRetentionDays',
      7,
    );
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const cutoffDateString = cutoffDate.toISOString().split('T')[0]; // YYYY-MM-DD format

    this.logger.log(
      `Deleting events older than ${cutoffDateString} (${retentionDays} days)`,
    );

    const result = await this.eventRepository
      .createQueryBuilder()
      .delete()
      .from(Event)
      .where('eventDate < :cutoffDate', { cutoffDate: cutoffDateString })
      .execute();

    this.logger.log(`Deleted ${result.affected} old events`);
    return result.affected || 0;
  }

  async cleanupOrphanedProfiles(): Promise<number> {
    this.logger.log(
      'Cleaning up orphaned profiles (profiles with no events)...',
    );
    const orphanedProfiles = await this.profileRepository
      .createQueryBuilder('profile')
      .leftJoin('events', 'event', 'event.email = profile.email')
      .where('event.id IS NULL')
      .getMany();

    if (orphanedProfiles.length === 0) {
      this.logger.log('No orphaned profiles found');
      return 0;
    }

    const profileIds = orphanedProfiles.map((profile) => profile.id);

    const result = await this.profileRepository
      .createQueryBuilder()
      .delete()
      .from(Profile)
      .where('id IN (:...ids)', { ids: profileIds })
      .execute();

    this.logger.log(`Deleted ${result.affected} orphaned profiles`);
    return result.affected || 0;
  }

  async manualCleanup(): Promise<{
    deletedEvents: number;
    deletedProfiles: number;
  }> {
    this.logger.log('Manual cleanup triggered');

    const deletedEvents = await this.cleanupOldEvents();
    const deletedProfiles = await this.cleanupOrphanedProfiles();

    return { deletedEvents, deletedProfiles };
  }

  async getCleanupStats(): Promise<{
    totalEvents: number;
    eventsToDelete: number;
    totalProfiles: number;
    orphanedProfiles: number;
    retentionDays: number;
  }> {
    const retentionDays = this.configService.get<number>(
      'dataRetentionDays',
      7,
    );
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    const cutoffDateString = cutoffDate.toISOString().split('T')[0];

    const totalEvents = await this.eventRepository.count();
    const eventsToDelete = await this.eventRepository
      .createQueryBuilder()
      .where('eventDate < :cutoffDate', { cutoffDate: cutoffDateString })
      .getCount();

    const totalProfiles = await this.profileRepository.count();
    const orphanedProfiles = await this.profileRepository
      .createQueryBuilder('profile')
      .leftJoin('events', 'event', 'event.email = profile.email')
      .where('event.id IS NULL')
      .getCount();

    return {
      totalEvents,
      eventsToDelete,
      totalProfiles,
      orphanedProfiles,
      retentionDays,
    };
  }
}
