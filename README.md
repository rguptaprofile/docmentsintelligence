# Document Intelligence System

A comprehensive LLM-powered document analysis platform with natural language query processing, semantic search, and intelligent decision making.

## Features

- **Document Processing**: Upload and analyze PDFs, Word documents, and text files
- **Natural Language Queries**: Process complex queries in plain English
- **LLM-Powered Analysis**: Semantic understanding and intelligent decision making
- **User Authentication**: Secure login/signup with session management
- **Real-time Processing**: Live query processing with status updates
- **Document Management**: Upload, view, and organize documents
- **Query History**: Track and export query history
- **Responsive Design**: Optimized for desktop and mobile devices

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Lucide React for icons
- Vite for build tooling

### Backend
- Node.js with Express
- JWT authentication
- Multer for file uploads
- CORS enabled

### Database
- SQLite for development
- PostgreSQL for production
- Prisma ORM

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd document-intelligence-system
```

2. Install dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

3. Set up environment variables
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
```

4. Initialize the database
```bash
cd backend
npx prisma migrate dev
npx prisma generate
cd ..
```

5. Start the development servers
```bash
# Start backend (in one terminal)
cd backend
npm run dev

# Start frontend (in another terminal)
npm run dev
```

6. Open your browser to `http://localhost:5173`

## Environment Variables

Create a `.env` file in the root directory:

```env
# Frontend
VITE_API_URL=http://localhost:3001

# Backend (create backend/.env)
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key-here"
PORT=3001
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Documents
- `GET /api/documents` - List user documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents/:id` - Get document details
- `DELETE /api/documents/:id` - Delete document

### Queries
- `POST /api/queries` - Process new query
- `GET /api/queries` - Get query history
- `GET /api/queries/:id` - Get query details

## Deployment

### Frontend (Netlify)
1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Set environment variables in Netlify dashboard

### Backend (Railway/Heroku)
1. Push to Git repository
2. Connect to Railway or Heroku
3. Set environment variables
4. Deploy

### Database (Production)
1. Set up PostgreSQL database
2. Update `DATABASE_URL` in environment variables
3. Run migrations: `npx prisma migrate deploy`

## Project Structure

```
document-intelligence-system/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── contexts/          # React contexts
│   ├── services/          # API services
│   ├── types/             # TypeScript types
│   └── App.tsx            # Main app component
├── backend/               # Backend source code
│   ├── src/               # Backend source files
│   ├── prisma/            # Database schema and migrations
│   └── uploads/           # File upload directory
├── public/                # Static assets
└── dist/                  # Build output
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support, email support@docintel.com or create an issue in the repository.