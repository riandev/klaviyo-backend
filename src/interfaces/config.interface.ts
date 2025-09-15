export interface Configuration {
  port: number;
  database: {
    url: string | undefined;
  };
  klaviyo: {
    apiKey: string | undefined;
    baseUrl: string;
  };
  dataRetentionDays: number;
}
