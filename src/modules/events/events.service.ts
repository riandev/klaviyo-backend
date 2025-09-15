import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBulkEventsDto, CreateEventDto } from '../../dto';
import { Event } from '../../entities/event.entity';
import { Profile } from '../../entities/profile.entity';
import { KlaviyoProfileResponse } from '../../interfaces/klaviyo.interface';
import { KlaviyoService } from '../klaviyo/klaviyo.service';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    private klaviyoService: KlaviyoService,
  ) {}

  async createEvent(createEventDto: CreateEventDto): Promise<Event> {
    const { eventName, eventAttributes, profileAttributes, email } =
      createEventDto;
    let profile: Profile | null = null;
    if (email) {
      profile = await this.profileRepository.findOne({ where: { email } });

      if (profile) {
        if (profileAttributes) {
          profile.attributes = { ...profile.attributes, ...profileAttributes };
          profile.lastEventAttributes = eventAttributes || {};
          profile.lastEventName = eventName;
          profile.lastEventDate = new Date();
          await this.profileRepository.save(profile);
        }
      } else {
        profile = this.profileRepository.create({
          email,
          attributes: profileAttributes || {},
          lastEventAttributes: eventAttributes || {},
          lastEventName: eventName,
          lastEventDate: new Date(),
          isActive: true,
        });
        await this.profileRepository.save(profile);
      }
    }
    const event = this.eventRepository.create({
      eventName,
      eventAttributes: eventAttributes || {},
      profileAttributes: profileAttributes || {},
      email,
      profileId: profile?.id,
      eventDate: new Date().toISOString().split('T')[0],
      sentToKlaviyo: false,
    });

    const savedEvent = await this.eventRepository.save(event);
    if (email) {
      try {
        this.logger.log(`Syncing event to Klaviyo: ${eventName} for ${email}`);

        await this.klaviyoService.createEvent(createEventDto);
        savedEvent.sentToKlaviyo = true;
        savedEvent.klaviyoResponse = 'Successfully sent to Klaviyo';
        await this.eventRepository.save(savedEvent);

        this.logger.log(
          `Event successfully synced to Klaviyo:${savedEvent.id}`,
        );
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        const errorStack = error instanceof Error ? error.stack : undefined;

        this.logger.error(
          `Failed to sync event to Klaviyo: ${errorMessage}`,
          errorStack,
        );
        savedEvent.klaviyoResponse = `Failed to sync: ${errorMessage}`;
        await this.eventRepository.save(savedEvent);
      }
    } else {
      this.logger.warn(
        `Event created without email, skipping Klaviyo sync: ${savedEvent.id}`,
      );
    }

    return savedEvent;
  }

  async createBulkEvents(
    createBulkEventsDto: CreateBulkEventsDto,
  ): Promise<Event[]> {
    const { events } = createBulkEventsDto;
    const createdEvents: Event[] = [];

    for (const eventDto of events) {
      const createdEvent = await this.createEvent(eventDto);
      createdEvents.push(createdEvent);
    }

    return createdEvents;
  }

  async getAllMetrics(): Promise<string[]> {
    try {
      this.logger.log('Fetching metrics from Klaviyo API');
      const klaviyoMetrics = await this.klaviyoService.getMetrics();

      if (klaviyoMetrics.length > 0) {
        this.logger.log(
          `Retrieved ${klaviyoMetrics.length} metrics from Klaviyo`,
        );
        return klaviyoMetrics;
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(
        `Failed to fetch metrics from Klaviyo, falling back to local: ${errorMessage}`,
      );
    }
    this.logger.log('Fetching metrics from local database');
    const result = await this.eventRepository
      .createQueryBuilder('event')
      .select('DISTINCT event.eventName', 'eventName')
      .getRawMany();

    const localMetrics = result.map(
      (row: { eventName: string }) => row.eventName,
    );
    this.logger.log(
      `Retrieved ${localMetrics.length} metrics from local database`,
    );

    return localMetrics;
  }

  async getEventsCountByMetric(date: string, metric: string): Promise<number> {
    const count = await this.eventRepository
      .createQueryBuilder('event')
      .where('event.eventDate = :date', { date })
      .andWhere('event.eventName = :metric', { metric })
      .getCount();

    return count;
  }

  async getEmailsByDateAndMetric(
    date: string,
    metric?: string,
  ): Promise<string[]> {
    const query = this.eventRepository
      .createQueryBuilder('event')
      .select('DISTINCT event.email', 'email')
      .where('event.eventDate = :date', { date })
      .andWhere('event.email IS NOT NULL');

    if (metric) {
      query.andWhere('event.eventName = :metric', { metric });
    }

    const result = await query.getRawMany();
    return result
      .map((row: { email: string }) => row.email)
      .filter((email) => email);
  }

  async getProfileAttributes(email: string): Promise<Profile | null> {
    try {
      this.logger.log(`Fetching profile from Klaviyo: ${email}`);
      const klaviyoProfile: KlaviyoProfileResponse | null =
        await this.klaviyoService.getProfile(email);

      if (klaviyoProfile) {
        this.logger.log(
          `Profile found in Klaviyo: ${klaviyoProfile.id || 'N/A'}`,
        );
        let localProfile = await this.profileRepository.findOne({
          where: { email },
        });

        if (localProfile) {
          localProfile.attributes = {
            ...localProfile.attributes,
            ...klaviyoProfile.attributes,
          };
          await this.profileRepository.save(localProfile);
          this.logger.log(`Updated local profile with Klaviyo data: ${email}`);
        } else {
          localProfile = this.profileRepository.create({
            email,
            attributes: klaviyoProfile.attributes || {},
            isActive: true,
          });
          await this.profileRepository.save(localProfile);
          this.logger.log(`Created local profile from Klaviyo data: ${email}`);
        }

        return localProfile;
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(
        `Failed to fetch profile from Klaviyo, using local: ${errorMessage}`,
      );
    }
    this.logger.log(`Fetching profile from local database: ${email}`);
    return await this.profileRepository.findOne({ where: { email } });
  }

  async getProfileMetrics(email: string): Promise<string[]> {
    const result = await this.eventRepository
      .createQueryBuilder('event')
      .select('DISTINCT event.eventName', 'eventName')
      .where('event.email = :email', { email })
      .getRawMany();

    return result.map((row: { eventName: string }) => row.eventName);
  }
}
