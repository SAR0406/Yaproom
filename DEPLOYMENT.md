# Production Deployment Guide

## Pre-Deployment Checklist

### Code Quality
- [ ] All TypeScript types are strict
- [ ] No `any` types in critical code
- [ ] Error handling on all async operations
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention verified
- [ ] XSS protection enabled
- [ ] CSRF tokens validated
- [ ] Rate limiting configured
- [ ] Audit logging for all actions

### Testing
- [ ] Unit tests pass (core logic)
- [ ] Integration tests pass (game flows)
- [ ] Load testing (100+ concurrent players)
- [ ] Socket.io reconnection tested
- [ ] Database failover tested
- [ ] Error scenarios tested

### Security
- [ ] SSL/TLS certificates installed
- [ ] API keys rotated
- [ ] Sensitive data encrypted
- [ ] Database backups automated
- [ ] Security headers configured
- [ ] CORS properly restricted
- [ ] Environment variables not in git
- [ ] Secrets managed via secrets manager

### Infrastructure
- [ ] Database backups scheduled
- [ ] Monitoring configured
- [ ] Alerting setup
- [ ] Log aggregation enabled
- [ ] CDN configured
- [ ] Load balancer configured
- [ ] Auto-scaling policies set
- [ ] Disaster recovery plan documented

## Deployment Steps

### 1. Database Setup

```bash
# Connect to PostgreSQL
psql -U postgres -h db.example.com

# Create database and user
CREATE DATABASE yaproom;
CREATE USER yaproom_user WITH PASSWORD 'strong_password';
GRANT ALL PRIVILEGES ON DATABASE yaproom TO yaproom_user;

# Run migrations
DATABASE_URL="postgresql://yaproom_user:strong_password@db.example.com/yaproom" \
pnpm db:migrate

# Verify
SELECT * FROM migrations;
```

### 2. Backend Deployment

```bash
# Build backend
cd packages/server
pnpm install
pnpm build

# Create .env file
cat > .env << EOF
DATABASE_URL=postgresql://user:pass@host:5432/yaproom
REDIS_URL=redis://cache.example.com:6379
NODE_ENV=production
PORT=3000
ALLOWED_ORIGINS=https://yaproom.com,https://www.yaproom.com
JWT_SECRET=$(openssl rand -base64 32)
EOF

# Start service
NODE_ENV=production node dist/index.js

# Or with PM2:
pm2 start dist/index.js --name "yaproom-backend"
```

### 3. Frontend Deployment

```bash
# Build frontend
cd packages/web
pnpm install
pnpm build

# Create .env.local
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=https://api.yaproom.com
NEXT_PUBLIC_WS_URL=wss://api.yaproom.com
EOF

# Start server
pnpm start

# Or with PM2:
pm2 start npm --name "yaproom-web" -- start
```

### 4. Nginx Configuration

```nginx
# Backend API
upstream yaproom_api {
    server 127.0.0.1:3000;
    keepalive 32;
}

# Frontend
upstream yaproom_web {
    server 127.0.0.1:3001;
    keepalive 32;
}

server {
    listen 443 ssl http2;
    server_name api.yaproom.com;

    ssl_certificate /etc/letsencrypt/live/yaproom.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yaproom.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer" always;

    # API proxy
    location / {
        proxy_pass http://yaproom_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Socket.io
    location /socket.io {
        proxy_pass http://yaproom_api/socket.io;
        proxy_http_version 1.1;
        proxy_buffering off;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

server {
    listen 443 ssl http2;
    server_name yaproom.com www.yaproom.com;

    ssl_certificate /etc/letsencrypt/live/yaproom.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yaproom.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;

    # Frontend proxy
    location / {
        proxy_pass http://yaproom_web;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yaproom.com www.yaproom.com api.yaproom.com;
    return 301 https://$server_name$request_uri;
}
```

### 5. Docker Deployment

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: yaproom
      POSTGRES_USER: yaproom_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build:
      context: .
      dockerfile: packages/server/Dockerfile
    environment:
      DATABASE_URL: postgresql://yaproom_user:${DB_PASSWORD}@postgres:5432/yaproom
      REDIS_URL: redis://redis:6379
      NODE_ENV: production
      PORT: 3000
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis

  frontend:
    build:
      context: .
      dockerfile: packages/web/Dockerfile
    environment:
      NEXT_PUBLIC_API_URL: https://api.yaproom.com
      NEXT_PUBLIC_WS_URL: wss://api.yaproom.com
    ports:
      - "3001:3001"
    depends_on:
      - backend

volumes:
  postgres_data:
```

## Monitoring & Alerting

### Prometheus Metrics

```typescript
// Add to backend
import prometheus from 'prom-client';

const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
});

const socketConnectionCount = new prometheus.Gauge({
  name: 'socket_connections',
  help: 'Number of active Socket.io connections',
});

const gameRoomCount = new prometheus.Gauge({
  name: 'game_rooms',
  help: 'Number of active game rooms',
});
```

### Health Checks

```typescript
// GET /health endpoint
app.get('/health', async () => {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    uptime: process.uptime(),
  };

  return {
    status: Object.values(checks).every(Boolean) ? 'healthy' : 'degraded',
    checks,
  };
});
```

### Logging

```bash
# Centralized logging (Elasticsearch + Logstash + Kibana)
# Or use: CloudWatch, Datadog, New Relic

# Example log rotation
cat > /etc/logrotate.d/yaproom << EOF
/var/log/yaproom/*.log {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        systemctl restart yaproom
    endscript
}
EOF
```

## Scaling Strategy

### Phase 1: Single Server (100 players)
- One backend instance
- One frontend instance
- Local PostgreSQL
- Local Redis

### Phase 2: High Availability (1000 players)
- 3 backend instances behind load balancer
- 2 frontend instances
- Managed PostgreSQL (AWS RDS)
- Redis Cluster
- CDN for static assets

### Phase 3: Global Scale (10,000+ players)
- Regional deployment (US, EU, APAC)
- Per-region databases
- Global load balancer
- Cross-region replication
- Edge caching

## Backup & Recovery

```bash
# Daily PostgreSQL backup
0 2 * * * pg_dump -U yaproom_user yaproom | gzip > /backups/yaproom_$(date +\%Y\%m\%d).sql.gz

# Weekly S3 upload
0 3 * * 0 aws s3 sync /backups s3://yaproom-backups/

# Recovery test monthly
0 4 1 * * /scripts/test_restore.sh
```

## Post-Deployment

### Smoke Tests
1. Create a room and join
2. Start game in each mode
3. Play through 1 full round
4. Check leaderboard
5. Verify database records

### Performance Baseline

```bash
# Load test with 100 concurrent players
artillery run load-test.yml

# Monitor:
- Response times (target: <100ms)
- Error rate (target: <0.1%)
- Database connections (target: <50)
- Memory usage (target: <500MB)
```

### Rollback Plan

```bash
# If deployment fails:
1. Keep previous version running
2. Redirect traffic to previous version
3. Investigate issue
4. Fix and re-deploy
5. Gradual traffic shift (canary)
```

## Incident Response

### Database Down
- Switch to read replica
- Restore from backup
- Notify users
- Post-mortem

### High Latency
- Check database connections
- Monitor Redis
- Scale horizontally
- Review slow queries

### Socket.io Disconnections
- Check network connectivity
- Review error logs
- Check SSL certificates
- Increase timeouts if needed

## Maintenance Windows

```
Scheduled maintenance: Sunday 2:00 AM UTC
Duration: 1 hour
Frequency: Monthly

Tasks:
- Database optimization
- Certificate renewal
- Log cleanup
- Performance analysis
```

## Support & Escalation

- **Tier 1**: Automated monitoring (alerts)
- **Tier 2**: On-call engineer (30 min response)
- **Tier 3**: Lead engineer (1 hour response)
- **Critical**: All hands (immediate)
