# Testing Documentation

## Overview

This document describes the testing strategy and how to run tests for the Analytics API.

## Test Structure
```
tests/
├── setup.js              # Test configuration and setup
├── helpers/              # Test helper functions
│   └── testHelpers.js
├── utils/                # Unit tests for utilities
│   ├── apiKey.utils.test.js
│   └── jwt.utils.test.js
├── middleware/           # Unit tests for middleware
│   └── auth.middleware.test.js
└── integration/          # Integration tests
    ├── auth.test.js
    └── analytics.test.js
```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Unit Tests Only
```bash
npm run test:unit
```

### Run Integration Tests Only
```bash
npm run test:integration
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Verbose Output
```bash
npm run test:verbose
```

## Test Coverage

Our coverage goals:
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

View coverage report:
```bash
npm test
# Coverage report will be in ./coverage/lcov-report/index.html
```

## Writing Tests

### Unit Tests

Unit tests focus on testing individual functions in isolation.

Example:
```javascript
describe('generateApiKey', () => {
  it('should generate a valid API key', () => {
    const apiKey = generateApiKey();
    expect(apiKey).toBeDefined();
    expect(apiKey.startsWith('ak_')).toBe(true);
  });
});
```

### Integration Tests

Integration tests test entire API endpoints.

Example:
```javascript
describe('POST /api/analytics/collect', () => {
  it('should collect an event with valid API key', async () => {
    const response = await request(app)
      .post('/api/analytics/collect')
      .set('x-api-key', apiKey)
      .send(eventData)
      .expect(201);

    expect(response.body.success).toBe(true);
  });
});
```

## Test Database

Tests use a separate test database (`analytics_test_db`) to avoid affecting development data.

Configuration is in `tests/setup.js`:
```javascript
beforeAll(async () => {
  process.env.DB_NAME = 'analytics_test_db';
  await syncDatabase();
});
```

## Continuous Integration

Tests run automatically on:
- Every push to `main` or `develop` branches
- Every pull request

See `.github/workflows/test.yml` for CI configuration.

## Troubleshooting

### Tests fail with "Connection refused"
Ensure Docker containers are running:
```bash
docker-compose up -d
```

### Tests timeout
Increase timeout in `jest.config.js`:
```javascript
testTimeout: 30000 // 30 seconds
```

### Coverage below threshold
Run tests with coverage to see which areas need more tests:
```bash
npm test
# Open coverage/lcov-report/index.html to see details
```