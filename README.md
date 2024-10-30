# Constituent Management System

A full-stack application for managing constituent information with secure authentication, user management, and constituent data handling capabilities. The system implements a constituent management service with comprehensive testing of service and data processing features.

## Technology Stack

### Frontend

- React.js
- TypeScript
- React Router v6
- Context API for state management
- Tailwind CSS
- Lucide React (for icons)
- Axios (for API calls)

### Backend

- Node.js & Express
- TypeScript
- Passport.js for authentication
- CSV processing with csv-parse and json2csv
- Zod for schema validation
- UUID for unique identifiers
- Jest for testing
- Express Session for session management

## Core Features

### Authentication & User Management

- Secure user registration and login
- Session-based authentication
- Protected routes and navigation guards
- Password encryption with bcrypt
- Input validation middleware

### Constituent Management

- In-memory constituent storage with Map data structure
- CRUD operations for constituent records
- Automatic ID generation with UUID
- Duplicate handling with email-based updates
- Paginated list views with customizable page size

### Data Operations

- CSV file upload with stream processing
- Schema validation for CSV data
- Flexible column name mapping
- Date range-based CSV export
- Batch processing with error handling
- Detailed processing statistics

### Error Handling & Validation

- Custom error classes for specific scenarios
- Detailed error reporting for batch operations
- Type-safe implementations with TypeScript
- Schema validation with Zod

## Implementation Details

### Constituent Service

The core constituent management is implemented using a singleton pattern:

### CSV Processing

CSV handling includes:

- Streaming file processing for memory efficiency
- Column name normalization
- Schema validation with Zod
- Error handling for invalid rows
- Support for various column name formats

## Setup Instructions

### Prerequisites

```bash
node.js >= 14.x
npm >= 6.x
```

### For Server-Side

## Environment Configuration

Create a `.env` file in the root directory:

```env
PORT=3000
SESSION_SECRET=your_session_secret
```

Assumption: Any secret key will work.

### Running the Application

```bash
npm install
# Development mode with hot reload
npm run dev

# Build and serve production
npm run build
npm run serve

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

### For Client-Side

### Running the Application

````bash
npm install
# Development mode with hot reload
npm run start

## API Endpoints

### Authentication

- `POST /auth/register` - User registration
- `POST /auth/login` - User authentication
- `POST /auth/logout` - User logout

### Constituents

- `GET /constituents` - Fetch paginated constituent list
  - Query params: page (default: 1), pageSize (default: 10)
- `POST /constituents` - Add new constituent
- `POST /constituents/batch-upload` - Upload CSV for batch processing
  - Accepts multipart/form-data with CSV file
- `GET /constituents/download` - Download constituent data as CSV
  - Query params: startDate, endDate

## Testing

The application includes comprehensive test coverage:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
````

Test suites cover:

- Singleton pattern implementation
- CRUD operations
- Pagination
- Date range filtering
- Batch processing
- Error handling
- CSV generation
- Input validation

## Error Handling

The system implements custom error handling:

```typescript
class ConstituentError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'ConstituentError';
  }
}
```

Common error codes:

- `INVALID_PAGE` - Invalid pagination parameters
- `MISSING_EMAIL` - Required email field missing
- `INVALID_DATE` - Invalid date format
- `INVALID_DATE_RANGE` - Invalid date range
- `CSV_GENERATION_ERROR` - CSV processing error
- `INVALID_INPUT` - Invalid input data
