# 🚀 Deployment Guide

This guide covers deploying the Mr. baba platform to production.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Production Setup                          │
└─────────────────────────────────────────────────────────────────┘

                     ┌─────────────────┐
                     │   DNS Provider  │
                     │    (Domain)     │
                     └────────┬────────┘
                              │
              ┌───────────────┴───────────────┐
              │                               │
              ▼                               ▼
   ┌──────────────────┐            ┌──────────────────┐
   │ mraymanbaba   │            │ api.mraymanabo   │
   │    .online       │            │  aish.online     │
   └────────┬─────────┘            └────────┬─────────┘
            │                               │
            ▼                               ▼
   ┌──────────────────┐            ┌──────────────────┐
   │   Frontend       │            │   Backend        │
   │   (Static)       │            │   (Node.js)      │
   │                  │            │                  │
   │  - Nginx/CDN     │◀──────────▶│  - Express       │
   │  - React Build   │   API      │  - MongoDB       │
   └──────────────────┘   Calls    └──────────────────┘
```

## Deployment Options

### Option 1: VPS (Virtual Private Server)

Recommended for full control and cost-effectiveness.

**Providers:**
- DigitalOcean
- AWS EC2
- Linode
- Vultr

**Steps:**

1. **Set up the server**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Install MongoDB
   # (or use MongoDB Atlas for managed database)
   
   # Install Nginx
   sudo apt install -y nginx
   
   # Install PM2
   sudo npm install -g pm2
   ```

2. **Clone and setup the project**
   ```bash
   git clone <repository-url>
   cd baba
   
   # Backend
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with production values
   
   # Frontend
   cd ../client
   npm install
   npm run build
   ```

3. **Start backend with PM2**
   ```bash
   cd backend
   pm2 start server.js --name "baba-api"
   pm2 save
   pm2 startup
   ```

4. **Configure Nginx**
   
   Create `/etc/nginx/sites-available/baba`:
   
   ```nginx
   # Frontend
   server {
       listen 80;
       server_name mena-el-eryan.com www.mena-el-eryan.com;
       
       root /var/www/baba/client/dist;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
       
       location /uploads {
           alias /var/www/baba/backend/uploads;
       }
   }
   
   # Backend API
   server {
       listen 80;
       server_name api.mena-el-eryan.com;
       
       location / {
           proxy_pass http://localhost:8045;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

5. **Enable site and restart Nginx**
   ```bash
   sudo ln -s /etc/nginx/sites-available/baba /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

6. **Setup SSL with Certbot**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d mena-el-eryan.com -d www.mena-el-eryan.com -d api.mena-el-eryan.com
   ```

---

### Option 2: Platform as a Service (PaaS)

Easier deployment with managed infrastructure.

#### Vercel (Frontend)

1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy

#### Railway/Render (Backend)

1. Connect your GitHub repository
2. Set environment variables
3. Deploy

---

## Environment Variables (Production)

### Backend `.env`

```env
# Server
PORT=8045
NODE_ENV=production

# MongoDB
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/baba

# JWT
JWT_SECRET=your-very-long-and-secure-secret-key
JWT_EXPIRY=7d

# Client URLs
CLIENT_URL=https://mena-el-eryan.com
FRONTEND_URL=https://mena-el-eryan.com

# Production URLs
PRODUCTION_BACKEND_URL=https://api.mena-el-eryan.com
PRODUCTION_CLIENT_URL=https://mena-el-eryan.com
```

---

## Database (MongoDB Atlas)

For production, use MongoDB Atlas:

1. Create a cluster at [mongodb.com](https://www.mongodb.com/atlas)
2. Create a database user
3. Whitelist your server's IP (or 0.0.0.0/0 for any IP)
4. Get connection string
5. Update `MONGODB_URL` in `.env`

---

## SSL/TLS Configuration

Always use HTTPS in production. Let's Encrypt provides free certificates:

```bash
sudo certbot --nginx -d yourdomain.com
sudo certbot renew --dry-run  # Test auto-renewal
```

---

## Monitoring & Logs

### PM2 Monitoring

```bash
# View logs
pm2 logs baba-api

# Monitor in real-time
pm2 monit

# View status
pm2 status
```

### Nginx Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

---

## Backup Strategy

### Database Backups

```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y-%m-%d)
mongodump --uri="$MONGODB_URL" --out=/backups/db-$DATE
```

### File Uploads Backup

```bash
# Sync uploads to backup location
rsync -av /var/www/baba/backend/uploads /backups/
```

---

## Performance Optimization

### Enable Gzip Compression (Nginx)

```nginx
gzip on;
gzip_types text/plain application/json application/javascript text/css;
gzip_min_length 1000;
```

### Enable Browser Caching

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Node.js Cluster Mode

```bash
pm2 start server.js -i max --name "baba-api"
```

---

## Continuous Deployment

### GitHub Actions Example

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/baba
            git pull origin main
            cd backend && npm install
            pm2 restart baba-api
            cd ../client && npm install && npm run build
```

---

## Security Checklist

- [ ] HTTPS enabled (SSL certificate)
- [ ] Environment variables secured (not in git)
- [ ] MongoDB access restricted (IP whitelist)
- [ ] Strong JWT secret
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Regular security updates
- [ ] Firewall configured (UFW)
- [ ] SSH key authentication only
- [ ] Regular backups

---

## Troubleshooting

### Common Issues

1. **502 Bad Gateway**
   - Check if Node.js is running: `pm2 status`
   - Check logs: `pm2 logs`

2. **CORS errors**
   - Verify `CLIENT_URL` in `.env`
   - Check Nginx proxy headers

3. **Database connection failed**
   - Check MongoDB Atlas IP whitelist
   - Verify connection string

4. **SSL certificate issues**
   - Renew with: `sudo certbot renew`
