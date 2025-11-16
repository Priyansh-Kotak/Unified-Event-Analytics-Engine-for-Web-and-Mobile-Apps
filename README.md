# Analytics API

A scalable backend API for website and mobile app analytics with event tracking, user insights, and comprehensive reporting.

## 🚀 Features

- ✅ **Event Collection**: Track clicks, visits, and custom events
- ✅ **User Analytics**: User behavior tracking and statistics
- ✅ **API Key Management**: Secure authentication with Google OAuth
- ✅ **Real-time Insights**: Event aggregation and trending
- ✅ **Caching**: Redis-powered caching for high performance
- ✅ **Rate Limiting**: Protection against abuse
- ✅ **Interactive Documentation**: Swagger/OpenAPI docs
- ✅ **Comprehensive Testing**: Unit and integration tests
- ✅ **Production Ready**: Dockerized and cloud-deployable

## 📚 Documentation

- **API Documentation**: Visit `/api-docs` on your deployed instance
- **Health Check**: `GET /health`
- **Postman Collection**: Import `postman_collection.json`

## 🛠️ Tech Stack

- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Authentication**: Google OAuth 2.0, JWT
- **Testing**: Jest, Supertest
- **Documentation**: Swagger/OpenAPI 3.0
- **Deployment**: Docker, Railway/Render

## 📦 Installation

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/analytics-api.git
cd analytics-api
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.example .env
# Edit .env with your configurations
```

4. **Start Docker services**
```bash
docker-compose up -d
```

5. **Run migrations** (if applicable)
```bash
npm run migrate
```

6. **Start development server**
```bash
npm run dev
```

The API will be available at `https://analytics-api-production-babf.up.railway.app`

## 🧪 Testing
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suites
npm run test:unit
npm run test:integration

# Watch mode
npm run test:watch
```

## 🐳 Docker Deployment

### Development
```bash
docker-compose up -d
```

### Production
```bash
# Using production compose file
docker-compose -f docker-compose.prod.yml up -d

# Or use the deployment script
./scripts/deploy.sh
```

## ☁️ Cloud Deployment

### Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up
```

### Render

1. Connect your GitHub repository
2. Render will auto-detect `render.yaml`
3. Set environment variables
4. Deploy

## 📊 API Endpoints

### Authentication

- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/me` - Get current user
- `POST /api/auth/register` - Register new app
- `POST /api/auth/revoke` - Revoke API key
- `POST /api/auth/regenerate` - Regenerate API key

### Analytics

- `POST /api/analytics/collect` - Collect event (API Key auth)
- `GET /api/analytics/event-summary` - Get event summary
- `GET /api/analytics/user-stats` - Get user statistics
- `GET /api/analytics/event-trends` - Get event trends
- `GET /api/analytics/top-events/:appId` - Get top events
- `GET /api/analytics/dashboard` - Get dashboard overview

## 🔐 Environment Variables
```properties
NODE_ENV=production
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=analytics_db
DB_USER=postgres
DB_PASSWORD=your_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Security
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=https://analytics-api-production-babf.up.railway.app/api/auth/google/callback

# Frontend
FRONTEND_URL=https://analytics-api-production-babf.up.railway.app
```

## 📈 Performance

- **Caching**: Redis with 5-minute TTL
- **Rate Limiting**: 
  - Event collection: 100 req/min
  - Analytics: 30 req/min
  - API Keys: 10 req/15min
- **Connection Pooling**: PostgreSQL pool (10 max)
- **Response Time**: < 100ms (cached), < 500ms (uncached)

## 🛡️ Security

- Helmet.js for security headers
- CORS configuration
- JWT authentication
- API key management
- Rate limiting
- Input validation with Joi
- SQL injection protection (Sequelize ORM)

## 📝 Logging

Logs are stored in `logs/` directory:
- `combined.log` - All logs
- `error.log` - Error logs only

## 🔄 Backup
```bash
# Database backup
./scripts/backup-db.sh
```

Backups are stored in `backups/` directory.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

Your Name - [Priyansh Kotak](https://www.linkedin.com/in/priyanshkotak/)

## 📞 Support

For support, email priyanshkotak1@gmail.com or open an issue.

---

**Live Demo**: [https://your-app.up.railway.app](https://analytics-api-production-babf.up.railway.app)

**Documentation**: https://analytics-api-production-babf.up.railway.app/api-docs
