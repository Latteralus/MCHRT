# Mountain Care HR Management Platform

An employee management system for healthcare organizations with features for HR administration, compliance tracking, and document management.

## Features

- Employee Management
- Attendance Tracking
- Leave Management
- Onboarding/Offboarding Automation
- HIPAA Compliance Tracking
- Document Management
- Role-Based Access Control

## Technology Stack

- **Frontend**: Next.js, React
- **Backend**: Next.js API Routes, TypeORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **UI Components**: Custom CSS with responsive design

## Prerequisites

- Node.js 16+ and npm
- PostgreSQL 12+

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/mountain-care.git
cd mountain-care
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set up Environment Variables

Create a `.env.local` file in the root of the project and add the following:

```
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/mountain_care

# Authentication
NEXTAUTH_SECRET=your-super-secure-random-string
NEXTAUTH_URL=http://localhost:3000

# Deployment Environment
NODE_ENV=development
```

Replace `username`, `password`, and `your-super-secure-random-string` with your actual values.

### 4. Set up the Database

Create a PostgreSQL database named `mountain_care`.

The application will automatically create tables when it first runs in development mode due to the `synchronize: true` setting. For production, you should set this to `false` and use migrations.

### 5. Seed the Database

To create initial data for testing:

```bash
npm run db:seed
```

This will create:
- A system administrator (email: admin@mountaincare.com, password: admin123)
- An HR manager (email: faith@mountaincare.com, password: hr123)
- Department heads for each department
- Test employees

### 6. Run the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to access the application.

## Project Structure

- `/components` - Reusable React components
- `/entities` - TypeORM entity definitions
- `/pages` - Next.js pages and API routes
- `/public` - Static assets
- `/styles` - Global CSS
- `/utils` - Utility functions

## Deployment

### Vercel

This project is configured for easy deployment to Vercel. Connect your GitHub repository to Vercel and it will automatically detect the Next.js configuration.

Set the required environment variables in the Vercel dashboard:

- `DATABASE_URL` - Your PostgreSQL connection string
- `NEXTAUTH_SECRET` - A secure random string for NextAuth
- `NEXTAUTH_URL` - The URL of your deployed application
- `NODE_ENV` - Set to "production"

### Other Hosting Providers

For other providers:

1. Build the project: `npm run build`
2. Start the server: `npm start`

## License

This project is licensed under the MIT License.