# Online Bookstore Management System

A full-stack e-commerce web application for online book sales, built with modern web technologies and following best practices in database design and software architecture.

## 📖 Project Overview

This project is a comprehensive online bookstore management system that simulates real-world e-commerce operations. It features a dual-interface design separating customer-facing store functionality from administrative management tools, all backed by a robust PostgreSQL database.

### Key Features

**Customer Interface:**
- Browse and search books by title, author, ISBN, or category
- View detailed book information with real-time inventory
- Persistent shopping cart across sessions
- Complete order checkout and tracking
- User account management

**Admin Interface:**
- Book catalog management (CRUD operations)
- Inventory tracking with full audit trail
- Order processing and fulfillment
- User management and access control
- Sales analytics and low-stock alerts

### Tech Stack

- **Frontend**: Vue.js 3 + Vike (SSR) + Tailwind CSS + DaisyUI
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Deployment**: Vercel
- **Authentication**: Auth.js

## 🚀 Get Started

### Prerequisites

- Node.js 20.x or higher
- pnpm (recommended) or npm
- PostgreSQL database (local or cloud)

### Installation

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@host:port/database"
   AUTH_SECRET="your-auth-secret-here"
   ```

3. **Initialize the database**
   ```bash
   # Generate Prisma client
   pnpm prisma:generate
   
   # Push schema to database
   pnpm prisma:push
   
   # Seed initial data (books, categories, test users)
   pnpm prisma:seed
   ```

   Or run all steps at once:
   ```bash
   pnpm db:setup
   ```

4. **Start the development server**
   ```bash
   pnpm dev
   ```

   The application will be available at `http://localhost:3000`

### Test Accounts

After seeding the database, you can use these test accounts:

- **Regular User**: `testuser` / `123456`
- **Administrator**: `admin` / `admin123`

### Database Management

- **View/Edit data**: `pnpm prisma:studio`
- **Update schema**: Modify `prisma/schema.prisma`, then run `pnpm prisma:push`
- **Reset database**: Delete and re-run `pnpm db:setup`

## 📦 Build & Deploy

### Production Build

```bash
pnpm build
```

### Preview Production Build

```bash
pnpm preview
```

### Deploy to Vercel

The project is configured for Vercel deployment. Simply connect your GitHub repository to Vercel and it will automatically deploy on push.

Make sure to set the following environment variables in Vercel:
- `DATABASE_URL` - Your production PostgreSQL connection string
- `AUTH_SECRET` - Your authentication secret

## 📁 Project Structure

```
├── pages/              # Vike pages (routes)
├── server/             # Express server and API routes
├── prisma/             # Database schema and migrations
│   ├── schema.prisma   # Database schema definition
│   └── seed.ts         # Initial data seeding
├── components/         # Vue components
├── layouts/            # Page layouts
└── docs/               # Project documentation
```

## 🛠️ Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint
- `pnpm prisma:studio` - Open Prisma Studio
- `pnpm prisma:generate` - Generate Prisma Client
- `pnpm prisma:push` - Push schema to database
- `pnpm prisma:seed` - Seed database with initial data

## 👥 Team

- **伍浩** (71123141) - Database design, Backend development
- **吴榜** (71123323) - Frontend development, Deployment
- **马芝兰** (71123143) - Requirements analysis, Testing
- **陈昱衡** (71123144) - Architecture design, Optimization

## 📄 License

This project is developed as part of a database systems course at Southeast University.

