import { Configuration } from 'src/interfaces/config.interface';

export default (): Configuration => ({
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    url: process.env.DATABASE_URL,
  },
  klaviyo: {
    apiKey: process.env.KLAVIYO_API_KEY,
    baseUrl: process.env.KLAVIYO_BASE_URL || 'https://a.klaviyo.com/api',
  },
  dataRetentionDays: parseInt(process.env.DATA_RETENTION_DAYS || '7', 10),
});
