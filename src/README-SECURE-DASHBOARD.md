# 🔐 Secure Complete Ticketing Dashboard

A secure, remotely accessible version of the Complete Ticketing Dashboard with authentication, agent broadcasting, and real-time task management.

## 🚀 Quick Start

### Option 1: Use Startup Script (Recommended)

```bash
# Development mode (with auto-restart)
./start-secure-dashboard.sh

# Production mode
./start-secure-dashboard.sh production
```

### Option 2: Direct Node.js

```bash
# Install dependencies
npm install

# Start server
npm start

# Development with auto-restart
npm run dev
```

## 🌐 Access the Dashboard

Once running, the dashboard will be available at:

- **Local**: http://localhost:8080
- **Network**: http://your-ip-address:8080
- **Login Page**: http://your-ip-address:8080/login

### Default Credentials

- **Username**: `admin`
- **Password**: `dashboard123`

⚠️ **Change these in production!**

## 🔧 Configuration

### Environment Variables

Set these via environment variables or `.env` file:

```bash
# Authentication
DASHBOARD_USERNAME=your-username
DASHBOARD_PASSWORD=your-secure-password

# Server Settings
PORT=8080
HOST=0.0.0.0

# Security
SESSION_SECRET=your-long-random-secret-key

# Production Mode
NODE_ENV=production
```

### Create .env file

```bash
cp .env.example .env
# Edit .env with your settings
```

## 🔐 Security Features

### Authentication

- ✅ Password-based login with bcrypt hashing
- ✅ Session management with secure cookies
- ✅ Rate limiting (5 login attempts per 15 minutes)
- ✅ Account lockout protection
- ✅ Automatic logout functionality

### API Protection

- ✅ All API endpoints require authentication
- ✅ Session-based access control
- ✅ Protected task data and broadcasts
- ✅ Input validation and error handling

### Security Headers

- ✅ HTTP-only session cookies
- ✅ CSRF protection via sessions
- ✅ Error message sanitization
- ✅ IP-based rate limiting

## 📢 Agent Broadcasting System

### From Dashboard

1. Login to dashboard
2. Click "📢 Agent Broadcast" tab
3. Type message and select priority
4. Send to all agents instantly

### From CLI (Agents)

```bash
# Check for broadcasts
node src/broadcast-to-agents.js check

# Send broadcast
node src/broadcast-to-agents.js "Your message here"

# Clear old messages
node src/broadcast-to-agents.js clear
```

### Quick Templates

- 🔍 Request QA Pipeline
- 🎯 Epic 8 Priority Shift
- ⚠️ Maintenance Warning
- 🔄 Dashboard Updates
- 📋 Coordination Check
- 🚨 Emergency Stop

## 🌍 Remote Access Setup

### Local Network Access

1. Find your IP address:

   ```bash
   # Mac/Linux
   hostname -I

   # Windows
   ipconfig
   ```

2. Access from other devices:
   ```
   http://YOUR_IP_ADDRESS:8080
   ```

### Internet Access (Advanced)

For internet access, you'll need:

1. **Port Forwarding**: Configure router to forward port 8080
2. **Dynamic DNS**: Use services like DuckDNS for stable URLs
3. **HTTPS**: Add SSL certificates for secure connections
4. **Firewall**: Configure firewall rules appropriately

### Cloud Deployment

Deploy to cloud platforms:

```bash
# Heroku
git push heroku main

# DigitalOcean App Platform
doctl apps create --spec app.yaml

# AWS/Azure/GCP
# Use their respective deployment methods
```

## 📊 Dashboard Features

### Epic Status

- ✅ Real-time epic progress tracking
- ✅ Dynamic completion percentages
- ✅ Clickable epic cards with task details
- ✅ Business value indicators

### Approval History

- ✅ Daily approval charts
- ✅ Weekly velocity trends
- ✅ Properly sized chart containers
- ✅ Historical data visualization

### Task Management

- ✅ Task filtering and search
- ✅ Epic assignment controls
- ✅ Real-time task updates
- ✅ Clickable task details

### Agent Broadcasting

- ✅ Priority-based messaging
- ✅ Real-time message display
- ✅ Acknowledgment tracking
- ✅ Quick action templates

## 🛠️ Development

### File Structure

```
src/
├── secure-dashboard-server.js  # Main server file
├── complete-dashboard.html     # Dashboard UI
├── broadcast-to-agents.js      # CLI broadcast tool
├── data/
│   ├── agent-broadcast.json    # Broadcast messages
│   └── state.json             # Task data
├── package.json               # Dependencies
├── .env.example              # Configuration template
└── start-secure-dashboard.sh # Startup script
```

### Adding Features

1. **New API Endpoints**: Add to `secure-dashboard-server.js`
2. **UI Changes**: Modify `complete-dashboard.html`
3. **Authentication**: Update login/session handling
4. **Security**: Review and test security measures

### Testing

```bash
# Test login
curl -X POST http://localhost:8080/login \
  -d "username=admin&password=dashboard123" \
  -c cookies.txt

# Test API (with session)
curl http://localhost:8080/api/tasks -b cookies.txt

# Test broadcast
curl -X POST http://localhost:8080/api/broadcasts \
  -H "Content-Type: application/json" \
  -d '{"message":"Test message","priority":"normal"}' \
  -b cookies.txt
```

## 🚨 Production Checklist

Before deploying to production:

- [ ] Change default username/password
- [ ] Set strong SESSION_SECRET
- [ ] Enable HTTPS/SSL
- [ ] Configure proper firewall rules
- [ ] Set up monitoring and logging
- [ ] Regular security updates
- [ ] Backup data directory
- [ ] Test all authentication flows
- [ ] Review rate limiting settings
- [ ] Configure reverse proxy (nginx/apache)

## 🔍 Troubleshooting

### Common Issues

**Dashboard not loading**

- Check if server is running on correct port
- Verify firewall allows connections
- Check browser console for errors

**Login not working**

- Verify credentials are correct
- Check for rate limiting (wait 15 minutes)
- Clear browser cookies and try again

**Remote access fails**

- Confirm HOST=0.0.0.0 (not localhost)
- Check network firewall rules
- Verify IP address is correct

**Broadcasts not saving**

- Ensure data/ directory exists
- Check file permissions
- Verify disk space available

### Logs

Server logs show:

- Login attempts and results
- Broadcast messages sent
- API endpoint access
- Error conditions

## 📞 Support

Need help? Check:

1. Server console output for errors
2. Browser developer tools
3. Network connectivity
4. Configuration settings

Remember: This is a development-focused dashboard. For production use, consider additional security hardening and monitoring.
