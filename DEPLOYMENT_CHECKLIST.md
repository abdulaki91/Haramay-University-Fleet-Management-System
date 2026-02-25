# Deployment Checklist - Haramaya Fleet Management System

## Pre-Deployment Checklist

### ✅ Code Quality

- [x] All models implemented
- [x] All controllers implemented
- [x] All routes configured
- [x] Middleware properly set up
- [x] Error handling implemented
- [x] Input validation on all endpoints
- [x] MVC architecture followed
- [x] Code is modular and maintainable

### ✅ Database

- [x] Schema designed with relationships
- [x] Foreign keys configured
- [x] Indexes added for performance
- [x] Automatic table creation implemented
- [x] Migration script created
- [x] Seed script with default data

### ✅ Security

- [x] JWT authentication implemented
- [x] Password hashing with bcrypt
- [x] Role-based authorization
- [x] SQL injection prevention (parameterized queries)
- [x] Input validation and sanitization
- [x] Environment variables for sensitive data
- [x] CORS configured

### ✅ Features

- [x] User management (Admin)
- [x] Vehicle management (Vehicle Manager)
- [x] Fuel management (Vehicle Manager, Driver)
- [x] Maintenance workflow (Driver, Mechanic, Vehicle Manager)
- [x] Scheduling system (Scheduler)
- [x] Exit permission workflow (Driver, Vehicle Manager, Security Guard)
- [x] Reporting system (Admin, Vehicle Manager)
- [x] Role-based access control

### ✅ API

- [x] RESTful design
- [x] Consistent response format
- [x] Proper HTTP status codes
- [x] Pagination support
- [x] Error messages
- [x] 40+ endpoints implemented

### ✅ Documentation

- [x] README.md
- [x] SETUP_INSTRUCTIONS.md
- [x] API_ENDPOINTS.md
- [x] ROLE_PERMISSIONS.md
- [x] PROJECT_SUMMARY.md
- [x] TESTING_GUIDE.md
- [x] .env.example

---

## Deployment Steps

### 1. Server Preparation

#### Install Node.js

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

#### Install MySQL

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install mysql-server

# Secure installation
sudo mysql_secure_installation

# Verify installation
mysql --version
```

### 2. Application Setup

#### Clone Repository

```bash
cd /var/www
git clone <repository-url> haramaya-fleet
cd haramaya-fleet
```

#### Install Dependencies

```bash
npm install --production
```

#### Configure Environment

```bash
cp .env.example .env
nano .env
```

Update with production values:

```env
PORT=3000
NODE_ENV=production

DB_HOST=localhost
DB_USER=fleet_user
DB_PASSWORD=strong_password_here
DB_NAME=haramaya_fleet
DB_PORT=3306

JWT_SECRET=generate_a_very_strong_random_secret_here
JWT_EXPIRE=7d

DEFAULT_PAGE_SIZE=10
MAX_PAGE_SIZE=100
```

#### Create Database User

```sql
CREATE USER 'fleet_user'@'localhost' IDENTIFIED BY 'strong_password_here';
CREATE DATABASE haramaya_fleet;
GRANT ALL PRIVILEGES ON haramaya_fleet.* TO 'fleet_user'@'localhost';
FLUSH PRIVILEGES;
```

#### Run Migrations

```bash
npm run migrate
```

#### Seed Default Data

```bash
npm run seed
```

### 3. Process Manager (PM2)

#### Install PM2

```bash
sudo npm install -g pm2
```

#### Start Application

```bash
pm2 start src/server.js --name haramaya-fleet
```

#### Configure Auto-Start

```bash
pm2 startup
pm2 save
```

#### Monitor Application

```bash
pm2 status
pm2 logs haramaya-fleet
pm2 monit
```

### 4. Nginx Reverse Proxy (Optional)

#### Install Nginx

```bash
sudo apt-get install nginx
```

#### Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/haramaya-fleet
```

Add configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/haramaya-fleet /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. SSL Certificate (Let's Encrypt)

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 6. Firewall Configuration

```bash
# Allow SSH
sudo ufw allow ssh

# Allow HTTP and HTTPS
sudo ufw allow 'Nginx Full'

# Enable firewall
sudo ufw enable
```

---

## Post-Deployment Checklist

### ✅ Verification

- [ ] Server is running
- [ ] Database connection successful
- [ ] Health check endpoint responds
- [ ] Login works with default admin
- [ ] All API endpoints accessible
- [ ] HTTPS working (if configured)
- [ ] CORS configured correctly

### ✅ Security

- [ ] Default admin password changed
- [ ] Strong JWT_SECRET set
- [ ] Database user has minimal privileges
- [ ] Firewall configured
- [ ] SSL certificate installed
- [ ] Environment variables secured
- [ ] .env file not in git

### ✅ Monitoring

- [ ] PM2 monitoring active
- [ ] Logs being written
- [ ] Error tracking configured
- [ ] Database backups scheduled
- [ ] Disk space monitoring

### ✅ Testing

- [ ] Login tested for all roles
- [ ] Create operations tested
- [ ] Read operations tested
- [ ] Update operations tested
- [ ] Delete operations tested
- [ ] Permission denials working
- [ ] Validation working
- [ ] Reports generating

---

## Maintenance Tasks

### Daily

- Check PM2 status: `pm2 status`
- Review logs: `pm2 logs haramaya-fleet --lines 100`
- Monitor disk space: `df -h`

### Weekly

- Review error logs
- Check database size
- Verify backups
- Update dependencies (if needed)

### Monthly

- Security updates
- Performance review
- Database optimization
- Log rotation

---

## Backup Strategy

### Database Backup

```bash
# Create backup script
nano /home/backup/backup-db.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/backup/database"
mkdir -p $BACKUP_DIR

mysqldump -u fleet_user -p'password' haramaya_fleet > $BACKUP_DIR/haramaya_fleet_$DATE.sql

# Keep only last 30 days
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
```

```bash
chmod +x /home/backup/backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
0 2 * * * /home/backup/backup-db.sh
```

### Application Backup

```bash
# Backup application files
tar -czf /home/backup/app/haramaya-fleet-$(date +%Y%m%d).tar.gz /var/www/haramaya-fleet
```

---

## Rollback Plan

### If Deployment Fails

1. **Stop the application**

   ```bash
   pm2 stop haramaya-fleet
   ```

2. **Restore database backup**

   ```bash
   mysql -u fleet_user -p haramaya_fleet < /home/backup/database/haramaya_fleet_YYYYMMDD.sql
   ```

3. **Restore application files**

   ```bash
   cd /var/www
   tar -xzf /home/backup/app/haramaya-fleet-YYYYMMDD.tar.gz
   ```

4. **Restart application**
   ```bash
   pm2 restart haramaya-fleet
   ```

---

## Performance Optimization

### Database

- [ ] Indexes on frequently queried columns
- [ ] Connection pooling configured
- [ ] Query optimization
- [ ] Regular ANALYZE TABLE

### Application

- [ ] Pagination on all list endpoints
- [ ] Caching strategy (if needed)
- [ ] Compression enabled
- [ ] Static file serving optimized

### Server

- [ ] Adequate RAM (minimum 2GB)
- [ ] SSD storage recommended
- [ ] Regular updates
- [ ] Monitoring tools installed

---

## Troubleshooting

### Application Won't Start

```bash
# Check logs
pm2 logs haramaya-fleet

# Check environment variables
cat .env

# Test database connection
mysql -u fleet_user -p haramaya_fleet
```

### Database Connection Issues

```bash
# Check MySQL status
sudo systemctl status mysql

# Check user privileges
mysql -u root -p
SHOW GRANTS FOR 'fleet_user'@'localhost';
```

### High Memory Usage

```bash
# Check PM2 memory
pm2 monit

# Restart application
pm2 restart haramaya-fleet
```

---

## Support Contacts

- **System Administrator**: [admin@haramaya.edu.et]
- **Database Administrator**: [dba@haramaya.edu.et]
- **IT Support**: [support@haramaya.edu.et]

---

## Production URLs

- **API Base**: `https://your-domain.com/api`
- **Health Check**: `https://your-domain.com/health`
- **Documentation**: `https://your-domain.com/docs` (if added)

---

## Environment-Specific Notes

### Development

- Debug mode enabled
- Detailed error messages
- Hot reload with nodemon

### Staging

- Production-like environment
- Test data
- Full logging

### Production

- Error logging only
- Optimized performance
- Security hardened
- Backups automated

---

## Success Criteria

Deployment is successful when:

- ✅ Application starts without errors
- ✅ All API endpoints respond correctly
- ✅ Database connections stable
- ✅ Authentication working
- ✅ Role-based access enforced
- ✅ Reports generating
- ✅ Logs being written
- ✅ Backups running
- ✅ Monitoring active
- ✅ SSL certificate valid

---

**Deployment Date**: ******\_******

**Deployed By**: ******\_******

**Version**: 1.0.0

**Status**: ⬜ Pending | ⬜ In Progress | ⬜ Complete

---

_Haramaya University Fleet Management System_
_Production Deployment Checklist v1.0_
