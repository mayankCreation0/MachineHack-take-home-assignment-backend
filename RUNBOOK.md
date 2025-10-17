# Runbook - MachineHack Backend Setup

This guide will help you set up and run the MachineHack Iris Classification Challenge backend in under 5 minutes.

## Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Python 3.8+** - [Download here](https://python.org/)
- **Git** - [Download here](https://git-scm.com/)

## Quick Setup (5 minutes)

### 1. Clone and Install (1 minute)

```bash
# Clone the repository
git clone https://github.com/mayankCreation0/MachineHack-take-home-assignment-backend.git
cd MachineHack-take-home-assignment-backend

# Install dependencies
npm install
```

### 2. Environment Setup (1 minute)

```bash
# Copy environment template
cp env.example .env

# Edit the .env file with your settings
nano .env  # or use your preferred editor
```

**Required Environment Variables:**
```env
# Database
DATABASE_URL=sqlite:./database.sqlite

# AI Configuration (Optional - works without API key)
AI_MODE=fake
GEMINI_API_KEY=your_gemini_api_key_here

# Backend Configuration
PORT=3001
NODE_ENV=development
```

### 3. Python Dependencies (1 minute)

```bash
# Install Python dependencies
cd scorer
pip install -r requirements.txt
cd ..
```

### 4. Start the Backend (2 minutes)

```bash
# Start the backend server
npm run dev
```

This will start:
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## Verification

### Test the API Endpoints

1. **Health Check**:
   ```bash
   curl http://localhost:3001/health
   # Should return: {"status":"ok","timestamp":"..."}
   ```

2. **Test Leaderboard**:
   ```bash
   curl http://localhost:3001/api/leaderboard
   # Should return: {"success":true,"data":[]}
   ```

3. **Test Submission**:
   ```bash
   curl -X POST http://localhost:3001/api/submissions \
     -F "username=test" \
     -F "file=@sample_iris.csv"
   ```

### Sample CSV Data

Create a file called `sample_iris.csv` with this content:

```csv
sepal_length,sepal_width,petal_length,petal_width
5.1,3.5,1.4,0.2
4.9,3.0,1.4,0.2
4.7,3.2,1.3,0.2
4.6,3.1,1.5,0.2
5.0,3.6,1.4,0.2
5.4,3.9,1.7,0.4
4.6,3.4,1.4,0.3
5.0,3.4,1.5,0.2
4.4,2.9,1.4,0.2
4.9,3.1,1.5,0.1
```

## Troubleshooting

### Common Issues

**1. Port Already in Use**
```bash
# Kill processes on port 3001
lsof -ti:3001 | xargs kill -9
```

**2. Python Not Found**
```bash
# Check Python version
python3 --version

# If not found, install Python 3.8+
# On macOS: brew install python3
# On Ubuntu: sudo apt install python3
```

**3. Database Issues**
```bash
# Remove existing database and restart
rm -f database.sqlite
npm run dev
```

**4. AI Service Errors**
- Check your `.env` file has correct `GEMINI_API_KEY`
- Set `AI_MODE=fake` to use fallback system
- Check `ai_usage_log.md` for detailed logs

### Health Checks

**Backend Health:**
```bash
curl http://localhost:3001/health
# Should return: {"status":"ok","timestamp":"..."}
```

**API Endpoints:**
```bash
# Test leaderboard
curl http://localhost:3001/api/leaderboard

# Test submission (requires file upload)
curl -X POST http://localhost:3001/api/submissions \
  -F "username=test" \
  -F "file=@sample_iris.csv"
```

## Development Commands

### Backend Development
```bash
npm run dev          # Start backend only
npm run test         # Run backend tests
npm run lint         # Lint backend code
npm run build        # Build for production
```

### Python Scorer
```bash
cd scorer
python score.py sample_iris.csv test-user
# Should return JSON with score and feedback
```

## Production Deployment

### Vercel Deployment

1. **Connect to Vercel**:
   - Push code to GitHub
   - Connect repository to Vercel
   - Set environment variables in Vercel dashboard

2. **Environment Variables**:
   ```
   DATABASE_URL=sqlite:./database.sqlite
   AI_MODE=live
   GEMINI_API_KEY=your_production_key
   ```

3. **Deploy**:
   - Automatic deployment on push to main
   - Manual deployment from Vercel dashboard

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm run start
```

## Testing

### Run All Tests
```bash
npm test
```

### Test Coverage
```bash
npm run test:coverage
```

## Monitoring

### Logs
- **Backend logs**: Console output
- **AI usage logs**: `ai_usage_log.md`
- **Error logs**: Console output

### Database
- **Location**: `./database.sqlite`
- **Backup**: Copy the SQLite file
- **Reset**: Delete the file and restart

### Performance
- **Backend**: Monitor console output
- **Database**: SQLite query performance

## Support

### Getting Help
1. Check this runbook first
2. Review the logs for error messages
3. Check the GitHub issues
4. Contact the development team

### Common Commands Reference

```bash
# Full reset
rm -rf node_modules package-lock.json
rm -f database.sqlite
npm install
npm run dev

# Check status
ps aux | grep node
ps aux | grep python

# View logs
tail -f ai_usage_log.md
```

## Next Steps

After successful setup:
1. Test the API endpoints
2. Upload a test file
3. Check the AI feedback
4. Review the logs
5. Run the test suite
6. Deploy to production
