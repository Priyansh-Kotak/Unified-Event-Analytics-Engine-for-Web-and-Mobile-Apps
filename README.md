## Testing

### Running Tests
```bash
# Run all tests with coverage
npm test

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run tests in watch mode
npm run test:watch
```

### Test Coverage

We maintain high test coverage standards:
- Branches: 70%+
- Functions: 70%+
- Lines: 70%+
- Statements: 70%+

View detailed coverage report:
```bash
npm test
open coverage/lcov-report/index.html
```

### API Documentation

Interactive API documentation is available at:
```
http://localhost:3000/api-docs
```

Features:
- Try out endpoints directly from the browser
- View request/response schemas
- Authentication examples
- Complete endpoint descriptions

### Postman Collection

Import `postman_collection.json` into Postman for:
- Pre-configured requests
- Environment variables
- Automated test scripts
- Easy API exploration