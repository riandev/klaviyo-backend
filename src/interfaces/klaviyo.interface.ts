export interface KlaviyoEventPayload {
  data: {
    type: 'event';
    attributes: {
      properties: Record<string, any>;
      metric: {
        data: {
          type: 'metric';
          attributes: {
            name: string;
          };
        };
      };
      profile: {
        data: {
          type: 'profile';
          attributes: {
            email?: string;
            [key: string]: any;
          };
        };
      };
      time?: string;
      value?: number;
    };
  };
}

export interface KlaviyoProfilePayload {
  data: {
    type: 'profile';
    attributes: {
      email: string;
      [key: string]: any;
    };
  };
}

export interface KlaviyoProfileResponse {
  id: string;
  type: 'profile';
  attributes: {
    email: string;
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    external_id?: string;
    anonymous_id?: string;
    organization?: string;
    locale?: string;
    title?: string;
    image?: string;
    created?: string;
    updated?: string;
    last_event_date?: string;
    location?: {
      address1?: string;
      address2?: string;
      city?: string;
      country?: string;
      latitude?: number;
      longitude?: number;
      region?: string;
      zip?: string;
      timezone?: string;
      ip?: string;
    };
    properties?: Record<string, any>;
    [key: string]: any;
  };
  relationships?: Record<string, any>;
  links?: Record<string, any>;
}
