import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBulkEventsDto, CreateEventDto } from '../../dto';
import { Event } from '../../entities/event.entity';
import { Profile } from '../../entities/profile.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
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
      eventDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
      sentToKlaviyo: false,
    });

    return await this.eventRepository.save(event);
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
    const result = await this.eventRepository
      .createQueryBuilder('event')
      .select('DISTINCT event.eventName', 'eventName')
      .getRawMany();

    return result.map((row: { eventName: string }) => row.eventName);
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
