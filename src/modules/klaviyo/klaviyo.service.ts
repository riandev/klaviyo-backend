import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { CreateEventDto } from '../../dto';
import {
  KlaviyoEventPayload,
  KlaviyoProfilePayload,
  KlaviyoProfileResponse,
} from '../../interfaces/klaviyo.interface';

@Injectable()
export class KlaviyoService {
  private readonly logger = new Logger(KlaviyoService.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.apiKey = this.configService.get<string>('klaviyo.apiKey') || '';
    this.baseUrl = this.configService.get<string>('klaviyo.baseUrl') || '';

    if (!this.apiKey) {
      this.logger.warn('Klaviyo API key not configured');
    }
  }

  private getHeaders() {
    return {
      Authorization: `Klaviyo-API-Key ${this.apiKey}`,
      'Content-Type': 'application/json',
      revision: '2024-10-15',
    };
  }

  async createEvent(eventDto: CreateEventDto): Promise<any> {
    if (!this.apiKey) {
      throw new HttpException(
        'Klaviyo API key not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    try {
      const transformedProfileAttributes = this.transformProfileAttributes(
        eventDto.profileAttributes || {},
      );

      const payload: KlaviyoEventPayload = {
        data: {
          type: 'event',
          attributes: {
            properties: eventDto.eventAttributes || {},
            metric: {
              data: {
                type: 'metric',
                attributes: {
                  name: eventDto.eventName,
                },
              },
            },
            profile: {
              data: {
                type: 'profile',
                attributes: {
                  email: eventDto.email,
                  ...transformedProfileAttributes,
                },
              },
            },
            time: new Date().toISOString(),
          },
        },
      };

      this.logger.log(
        `Sending event to Klaviyo: ${eventDto.eventName} for ${eventDto.email}`,
      );

      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/events/`, payload, {
          headers: this.getHeaders(),
        }),
      );

      this.logger.log(
        `Event sent successfully to Klaviyo: ${response?.data?.data?.id || 'N/A'}`,
      );

      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Failed to send event to Klaviyo: ${errorMessage}`,
        errorStack,
      );

      if (error && typeof error === 'object' && 'response' in error) {
        const httpError = error as any;
        this.logger.error(
          `Klaviyo API Error: ${JSON.stringify(httpError.response?.data)}`,
        );
      }

      throw new HttpException(
        `Failed to send event to Klaviyo: ${errorMessage}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  private transformProfileAttributes(
    attributes: Record<string, any>,
  ): Record<string, any> {
    const transformed: Record<string, any> = {};
    const fieldMapping: Record<string, string> = {
      firstName: 'first_name',
      lastName: 'last_name',
      phoneNumber: 'phone_number',
    };
    const unsupportedFields = new Set(['age', 'gender', 'birthDate']);

    for (const [key, value] of Object.entries(attributes)) {
      if (unsupportedFields.has(key)) {
        this.logger.warn(`Skipping unsupported profile field: ${key}`);
        continue;
      }

      const klaviyoKey = fieldMapping[key] || key;
      transformed[klaviyoKey] = value;
    }

    return transformed;
  }

  async createProfile(
    email: string,
    attributes: Record<string, any> = {},
  ): Promise<any> {
    if (!this.apiKey) {
      throw new HttpException(
        'Klaviyo API key not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    try {
      const payload: KlaviyoProfilePayload = {
        data: {
          type: 'profile',
          attributes: {
            email,
            ...attributes,
          },
        },
      };

      this.logger.log(`Creating/updating profile in Klaviyo: ${email}`);

      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/profiles/`, payload, {
          headers: this.getHeaders(),
        }),
      );

      this.logger.log(
        `Profile created/updated successfully in Klaviyo: ${response.data?.data?.id || 'N/A'}`,
      );
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Failed to create/update profile in Klaviyo: ${errorMessage}`,
        errorStack,
      );

      if (error && typeof error === 'object' && 'response' in error) {
        const httpError = error as any;
        this.logger.error(
          `Klaviyo API Error: ${JSON.stringify(httpError.response?.data)}`,
        );
      }

      throw new HttpException(
        `Failed to create/update profile in Klaviyo: ${errorMessage}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async getMetrics(): Promise<string[]> {
    if (!this.apiKey) {
      throw new HttpException(
        'Klaviyo API key not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    try {
      this.logger.log('Fetching metrics from Klaviyo');

      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/metrics/`, {
          headers: this.getHeaders(),
        }),
      );

      const metricsData = response.data?.data || [];
      const metrics = Array.isArray(metricsData)
        ? metricsData
            .map((metric: any) => metric.attributes?.name)
            .filter(Boolean)
        : [];

      this.logger.log(`Retrieved ${metrics.length} metrics from Klaviyo`);
      return metrics;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Failed to fetch metrics from Klaviyo: ${errorMessage}`,
        errorStack,
      );

      if (error && typeof error === 'object' && 'response' in error) {
        const httpError = error as any;
        this.logger.error(
          `Klaviyo API Error: ${JSON.stringify(httpError.response?.data)}`,
        );
      }

      throw new HttpException(
        `Failed to fetch metrics from Klaviyo: ${errorMessage}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async getProfile(email: string): Promise<KlaviyoProfileResponse | null> {
    if (!this.apiKey) {
      throw new HttpException(
        'Klaviyo API key not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    try {
      this.logger.log(`Fetching profile from Klaviyo: ${email}`);

      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/profiles/`, {
          headers: this.getHeaders(),
          params: {
            filter: `equals(email,"${email}")`,
          },
        }),
      );

      const profiles = response.data?.data || [];
      const profile =
        Array.isArray(profiles) && profiles.length > 0 ? profiles[0] : null;

      if (profile) {
        this.logger.log(`Profile found in Klaviyo: ${profile.id}`);
      } else {
        this.logger.log(`Profile not found in Klaviyo: ${email}`);
      }

      return profile as KlaviyoProfileResponse | null;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Failed to fetch profile from Klaviyo: ${errorMessage}`,
        errorStack,
      );

      if (error && typeof error === 'object' && 'response' in error) {
        const httpError = error as any;
        this.logger.error(
          `Klaviyo API Error: ${JSON.stringify(httpError.response?.data)}`,
        );
      }

      throw new HttpException(
        `Failed to fetch profile from Klaviyo: ${errorMessage}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async getEvents(profileId?: string, metricId?: string): Promise<any[]> {
    if (!this.apiKey) {
      throw new HttpException(
        'Klaviyo API key not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    try {
      this.logger.log('Fetching events from Klaviyo');

      const params: Record<string, string> = {};
      if (profileId) {
        params.filter = `equals(profile.id,"${profileId}")`;
      }
      if (metricId) {
        params.filter = params.filter
          ? `${params.filter} and equals(metric.id,"${metricId}")`
          : `equals(metric.id,"${metricId}")`;
      }

      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/events/`, {
          headers: this.getHeaders(),
          params,
        }),
      );

      const events = response.data?.data || [];
      this.logger.log(
        `Retrieved ${Array.isArray(events) ? events.length : 0} events from Klaviyo`,
      );

      return Array.isArray(events) ? events : [];
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Failed to fetch events from Klaviyo: ${errorMessage}`,
        errorStack,
      );

      if (error && typeof error === 'object' && 'response' in error) {
        const httpError = error as any;
        this.logger.error(
          `Klaviyo API Error: ${JSON.stringify(httpError.response?.data)}`,
        );
      }

      throw new HttpException(
        `Failed to fetch events from Klaviyo: ${errorMessage}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.apiKey) {
      this.logger.warn('Klaviyo API key not configured for connection test');
      return false;
    }

    try {
      this.logger.log('Testing Klaviyo API connection...');

      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/metrics/`, {
          headers: this.getHeaders(),
        }),
      );

      if (response.status === 200) {
        this.logger.log('Klaviyo connection test successful');
        return true;
      } else {
        this.logger.error(
          `Klaviyo connection test failed with status: ${response.status}`,
        );
        return false;
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      this.logger.error(`Klaviyo connection test failed: ${errorMessage}`);

      if (error && typeof error === 'object' && 'response' in error) {
        const httpError = error as any;
        this.logger.error(
          `Klaviyo API Error Details: Status ${httpError.response?.status}, Data: ${JSON.stringify(httpError.response?.data)}`,
        );
      }

      return false;
    }
  }
}
