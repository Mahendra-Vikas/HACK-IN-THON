# 🗄️ MongoDB Setup Guide

## Quick Start - MongoDB Setup Options

### Option 1: MongoDB Atlas (Cloud - Recommended)

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas/database)
   - Sign up for a free account

2. **Create a Cluster**
   - Choose "Build a Database" → "Free Shared Cluster"
   - Select a region close to you
   - Create cluster (takes 1-3 minutes)

3. **Setup Database Access**
   - Go to "Database Access" → "Add New Database User"
   - Create username/password (save these!)
   - Grant "Read and write to any database" permission

4. **Setup Network Access**
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Or add your specific IP address

5. **Get Connection String**
   - Go to "Database" → Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your user password

6. **Update .env file**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/volunteer-hub
   ```

### Option 2: Local MongoDB Installation

#### Windows Installation

1. **Download MongoDB Community Server**
   ```
   https://www.mongodb.com/try/download/community
   ```

2. **Install MongoDB**
   - Run the `.msi` installer
   - Choose "Complete" installation
   - Install MongoDB as a service (recommended)

3. **Add MongoDB to PATH** (if not automatic)
   - Add `C:\Program Files\MongoDB\Server\7.0\bin` to your PATH

4. **Start MongoDB**
   ```cmd
   net start MongoDB
   ```

5. **Verify Installation**
   ```cmd
   mongosh
   ```

#### macOS Installation

```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb/brew/mongodb-community
```

#### Linux (Ubuntu/Debian) Installation

```bash
# Import the public key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Create sources list file
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Option 3: Docker MongoDB (Development)

```bash
# Run MongoDB in Docker
docker run -d \
  --name volunteer-hub-mongo \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  -v mongo-data:/data/db \
  mongo:7.0

# Update .env file
MONGODB_URI=mongodb://admin:password@localhost:27017/volunteer-hub?authSource=admin
```

## Testing the Database Connection

After setting up MongoDB, test the connection:

```bash
# Install backend dependencies first
cd backend
npm install

# Start the backend server
npm run dev
```

Check the console output for:
- `📊 MongoDB Connected: [host]:[port]/[database]`

If you see an error, verify:
1. MongoDB is running
2. Connection string is correct in `.env`
3. Network access is allowed (for Atlas)

## Troubleshooting

### Common Issues

1. **Connection Timeout**
   - Check your internet connection
   - Verify MongoDB Atlas network access settings
   - Ensure MongoDB service is running (local)

2. **Authentication Failed**
   - Double-check username/password in connection string
   - Verify user permissions in MongoDB Atlas

3. **Port Already in Use**
   - MongoDB default port is 27017
   - Change port in connection string if needed

4. **Firewall Issues**
   - Ensure port 27017 is open for local MongoDB
   - Check Windows Defender/firewall settings

### Fallback Mode

If MongoDB connection fails, the application will automatically fall back to in-memory storage:
- Chat history will be stored in memory (lost on restart)
- Registration data will be stored in memory
- All functionality will still work, just without persistence

## MongoDB Tools (Optional)

### MongoDB Compass (GUI)
Download from: https://www.mongodb.com/try/download/compass
- Visual interface for MongoDB
- Useful for viewing data and debugging

### Command Line Tools
```bash
# Connect to MongoDB shell
mongosh

# Show databases
show dbs

# Use your database
use volunteer-hub

# Show collections
show collections

# View chat sessions
db.chatsessions.find().pretty()

# View registrations
db.eventregistrations.find().pretty()
```

## Environment Variables Summary

Update your `backend/.env` file with one of these:

```bash
# For MongoDB Atlas (recommended)
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/volunteer-hub

# For Local MongoDB
MONGODB_URI=mongodb://localhost:27017/volunteer-hub

# For Docker MongoDB
MONGODB_URI=mongodb://admin:password@localhost:27017/volunteer-hub?authSource=admin

# Other required variables
GEMINI_API_KEY=AIzaSyDm0TqiDui3FB9xZ_0ftfbgMSTeEOGS1rw
PORT=3001
NODE_ENV=development
```

Once MongoDB is set up, restart your backend server and you'll have persistent chat history and registration data! 🎉