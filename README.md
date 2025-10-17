# Iris Classification Challenge - Backend API

A robust Node.js backend API for the Iris Classification Challenge built with Hono, TypeScript, and SQLite.

## Features

- 🌸 **File Upload & Scoring**: Upload CSV files and get AI-powered scoring
- 🤖 **AI Feedback**: Intelligent feedback using Google Gemini API
- 🏆 **Leaderboard**: Real-time leaderboard with top performers
- 📊 **Data Validation**: Comprehensive CSV validation and error handling
- ⚡ **Fast Performance**: Built with Hono for maximum speed
- 🔒 **Type Safety**: Full TypeScript support

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Hono (Fast, lightweight web framework)
- **Language**: TypeScript
- **Database**: SQLite (with in-memory fallback)
- **AI**: Google Gemini API
- **Validation**: Zod
- **Testing**: Vitest

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm 8.0.0 or higher
- Google Gemini API key (optional, falls back to mock responses)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd iris-classifier-backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3001`

### Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL=sqlite:./database.sqlite

# AI Configuration
AI_MODE=live
GEMINI_API_KEY=your_gemini_api_key_here

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Submissions
- `POST /api/submissions` - Upload and score CSV file
- `GET /api/submissions` - Get all submissions
- `GET /api/submissions/:id` - Get specific submission

### Leaderboard
- `GET /api/leaderboard` - Get top 10 leaderboard entries

## CSV Format

Upload CSV files with the following columns:
- `sepal_length` (numeric)
- `sepal_width` (numeric) 
- `petal_length` (numeric)
- `petal_width` (numeric)

## Deployment

### Railway (Recommended)

1. Connect your GitHub repository to Railway
2. Railway will automatically detect Node.js and configure the build
3. Set environment variables in Railway dashboard
4. Deploy with zero configuration

### Other Platforms

- **Render**: Connect GitHub repo and deploy
- **Heroku**: Use Heroku CLI or GitHub integration
- **DigitalOcean App Platform**: Connect repository and deploy

## Development

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run linter

### Testing

```bash
npm test
```

## License

MIT License - see LICENSE file for details.
