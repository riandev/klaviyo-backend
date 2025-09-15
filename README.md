# Klaviyo Backend Integration

A professional NestJS backend service for Klaviyo integration with comprehensive event tracking, profile management, and data retention capabilities.

## 🚀 Features

### Core Functionality

- **Event Management**: Create single and bulk events with immediate Klaviyo synchronization
- **Profile Management**: Automatic profile creation and updates with bidirectional sync
- **Data Retrieval**: Comprehensive querying capabilities for events, metrics, and profiles
- **Data Retention**: Automated 7-day cleanup system with configurable retention periods
- **Klaviyo Integration**: Full bidirectional data flow with graceful fallback mechanisms

### Technical Excellence

- **TypeScript**: Full type safety with professional error handling
- **NestJS Framework**: Modular architecture with dependency injection
- **TypeORM**: Database abstraction with MySQL support
- **OpenAPI/Swagger**: Auto-generated interactive API documentation
- **Field Transformation**: Automatic camelCase to snake_case conversion for Klaviyo compatibility
- **Error Resilience**: Graceful handling of external API failures

## 📋 API Endpoints

### Events Module

- `POST /events` - Create single event with Klaviyo sync
- `POST /events/bulk` - Create multiple events in batch
- `GET /events/metrics` - Retrieve all available metrics
- `GET /events/count` - Get event count by metric and date
- `GET /events/emails` - Get email list by date and metric
- `GET /events/profiles/:email/attributes` - Get profile attributes
- `GET /events/profiles/:email/metrics` - Get profile metrics

### Klaviyo Module

- `GET /klaviyo/test-connection` - Test Klaviyo API connectivity
- `GET /klaviyo/metrics` - Get metrics directly from Klaviyo
- `GET /klaviyo/profiles/:email` - Get profile from Klaviyo
- `GET /klaviyo/events` - Get events from Klaviyo
- `POST /klaviyo/sync-test` - Test event synchronization

### Cleanup Module

- `GET /cleanup/stats` - Get data retention statistics
- `POST /cleanup/manual` - Trigger manual cleanup

## 🛠️ Installation

### Prerequisites

- Node.js 18+
- MySQL 8.0+
- npm or yarn

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd klaviyo-backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations (if applicable)
npm run migration:run

# Start development server
npm run start:dev
```

## ⚙️ Configuration

### Environment Variables

```bash
# Database Configuration
DATABASE_URL=mysql://username:password@localhost:3306/database_name

# Klaviyo API Configuration
KLAVIYO_API_KEY=your_klaviyo_private_api_key
KLAVIYO_BASE_URL=https://a.klaviyo.com/api

# Application Configuration
PORT=3000
NODE_ENV=development

# Data Retention Configuration
DATA_RETENTION_DAYS=7
```

### Klaviyo API Key Setup

1. Log into your Klaviyo account
2. Navigate to Settings → API Keys
3. Create a new Private API Key with the following scopes:
   - Events: Read, Write
   - Profiles: Read, Write
   - Metrics: Read
4. Copy the key to your `.env` file

## 🏗️ Architecture

### Project Structure

```
src/
├── config/           # Configuration management
├── controllers/      # Additional controllers
├── database/         # Database configuration
├── dto/             # Data Transfer Objects with validation
├── entities/        # TypeORM entities
├── interfaces/      # TypeScript interfaces
├── modules/
│   ├── events/      # Event management module
│   ├── klaviyo/     # Klaviyo integration module
└── services/
    └── cleanup/     # Data retention service
```

### Key Components

- **EventsService**: Core business logic for event management
- **KlaviyoService**: Klaviyo API integration with error handling
- **CleanupService**: Automated data retention with cron scheduling
- **DTOs**: Comprehensive validation with class-validator decorators

## 🧪 Testing

### API Documentation

Access interactive Swagger documentation at: `http://localhost:3000/api`

### Manual Testing

```bash
# Test event creation
curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -d '{
    "eventName": "Purchase",
    "eventAttributes": {"amount": 99.99, "currency": "USD"},
    "profileAttributes": {"firstName": "John", "lastName": "Doe"},
    "email": "john.doe@example.com"
  }'

# Test bulk events
curl -X POST http://localhost:3000/events/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "events": [
      {"eventName": "Page View", "email": "user1@test.com"},
      {"eventName": "Add to Cart", "email": "user2@test.com"}
    ]
  }'

# Test Klaviyo connection
curl http://localhost:3000/klaviyo/test-connection
```

## 🔄 Data Flow

### Event Creation Flow

1. **Validation**: DTO validation with class-validator
2. **Local Storage**: Event saved to MySQL database
3. **Profile Management**: Profile created/updated automatically
4. **Klaviyo Sync**: Immediate synchronization with Klaviyo API
5. **Status Tracking**: Sync status recorded in database
6. **Error Handling**: Graceful fallback on API failures

### Data Retrieval Flow

1. **Klaviyo First**: Attempt to fetch from Klaviyo API
2. **Local Fallback**: Use local database if Klaviyo unavailable
3. **Data Sync**: Update local data with Klaviyo responses
4. **Response**: Return unified data to client

## 🛡️ Error Handling

### Klaviyo API Resilience

- **Connection Failures**: Graceful fallback to local data
- **Rate Limiting**: Proper error handling and logging
- **Field Validation**: Automatic filtering of unsupported fields
- **Retry Logic**: Built-in error recovery mechanisms

### Data Integrity

- **Transaction Safety**: Database operations wrapped in transactions
- **Validation**: Comprehensive input validation at all levels
- **Type Safety**: Full TypeScript coverage with strict mode
- **Logging**: Comprehensive audit trail for debugging

## 📊 Monitoring & Maintenance

### Data Retention

- **Automated Cleanup**: Daily cron job at 2 AM
- **Configurable Retention**: Set via `DATA_RETENTION_DAYS` environment variable
- **Orphaned Data**: Automatic cleanup of profiles without events
- **Manual Triggers**: On-demand cleanup via API endpoint

### Health Monitoring

- **Connection Testing**: Klaviyo API connectivity checks
- **Database Health**: Connection and query monitoring
- **Performance Metrics**: Response time and error rate tracking
- **Cleanup Statistics**: Data retention and cleanup reporting

### Docker Support

```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

## 📝 API Response Examples

### Successful Event Creation

```json
{
  "id": "uuid-here",
  "eventName": "Purchase",
  "eventAttributes": { "amount": 99.99 },
  "profileAttributes": { "firstName": "John" },
  "email": "john.doe@example.com",
  "sentToKlaviyo": true,
  "klaviyoResponse": "Successfully sent to Klaviyo",
  "createdAt": "2025-09-15T10:00:00.000Z"
}
```

### Error Response

```json
{
  "statusCode": 400,
  "message": ["email must be a valid email"],
  "error": "Bad Request"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Check the API documentation at `/api`
- Review the error logs for debugging
- Ensure Klaviyo API keys are valid
- Verify database connectivity

---
