# 🚀 Deployment Guide - Facial Recognition Todo App

This guide covers multiple deployment options for the Facial Recognition Todo application.

## 📋 Pre-deployment Checklist

- [ ] MongoDB database setup (Atlas or local)
- [ ] Environment variables configured
- [ ] Dependencies installed and updated
- [ ] Application tested locally
- [ ] Security vulnerabilities addressed

## 🌐 Deployment Options

### 1. Heroku Deployment (Recommended for beginners)

#### Prerequisites
- Heroku CLI installed
- Git repository initialized
- Heroku account created

#### Steps

1. **Login to Heroku**
```bash
heroku login
```

2. **Create Heroku App**
```bash
heroku create your-app-name
```

3. **Set Environment Variables**
```bash
heroku config:set MONGO_URI="your_mongodb_connection_string"
heroku config:set NODE_ENV="production"
heroku config:set UPSTASH_REDIS_REST_URL="your_redis_url"
heroku config:set UPSTASH_REDIS_REST_TOKEN="your_redis_token"
```

4. **Deploy**
```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

5. **Open App**
```bash
heroku open
```

### 2. Vercel Deployment (Frontend) + Railway (Backend)

#### Frontend on Vercel

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Deploy Frontend**
```bash
cd frontend/to_do_app
vercel --prod
```

3. **Set Environment Variables in Vercel Dashboard**
- `VITE_API_URL`: Your backend URL
- `VITE_APP_NAME`: Facial Recognition Todo
- `VITE_NODE_ENV`: production

#### Backend on Railway

1. **Connect GitHub Repository**
   - Go to Railway.app
   - Connect your GitHub repository
   - Select the backend folder

2. **Set Environment Variables**
   - Add all backend environment variables
   - Set `PORT` to `$PORT` (Railway provides this)

3. **Deploy**
   - Railway automatically deploys on push

### 3. DigitalOcean App Platform

1. **Create App**
   - Go to DigitalOcean App Platform
   - Connect your GitHub repository

2. **Configure Build Settings**
   - Build Command: `npm run build`
   - Run Command: `npm start`

3. **Set Environment Variables**
   - Add all required environment variables

4. **Deploy**
   - Click "Create App"

### 4. AWS Deployment

#### Using AWS Elastic Beanstalk

1. **Install EB CLI**
```bash
pip install awsebcli
```

2. **Initialize EB**
```bash
eb init
```

3. **Create Environment**
```bash
eb create production
```

4. **Set Environment Variables**
```bash
eb setenv MONGO_URI="your_connection_string" NODE_ENV="production"
```

5. **Deploy**
```bash
eb deploy
```

### 5. Docker Deployment

#### Local Docker

1. **Build Image**
```bash
docker build -t facial-recognition-todo .
```

2. **Run Container**
```bash
docker run -p 5000:5000 \
  -e MONGO_URI="your_connection_string" \
  -e NODE_ENV="production" \
  facial-recognition-todo
```

#### Docker Compose

1. **Set Environment Variables**
Create `.env` file:
```env
MONGO_URI=your_connection_string
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=password
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

2. **Start Services**
```bash
docker-compose up -d
```

### 6. VPS Deployment (Ubuntu/CentOS)

#### Prerequisites
- VPS with Ubuntu 20.04+ or CentOS 8+
- Domain name (optional)
- SSL certificate (recommended)

#### Steps

1. **Update System**
```bash
sudo apt update && sudo apt upgrade -y
```

2. **Install Node.js**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. **Install PM2**
```bash
sudo npm install -g pm2
```

4. **Clone Repository**
```bash
git clone https://github.com/dark-sriram/facial-reco-to-do.git
cd facial-reco-to-do
```

5. **Install Dependencies**
```bash
npm run install-all
```

6. **Build Application**
```bash
npm run build
```

7. **Set Environment Variables**
```bash
export MONGO_URI="your_connection_string"
export NODE_ENV="production"
```

8. **Start with PM2**
```bash
pm2 start backend/src/server.js --name "facial-recognition-todo"
pm2 startup
pm2 save
```

9. **Setup Nginx (Optional)**
```bash
sudo apt install nginx
sudo nano /etc/nginx/sites-available/facial-recognition-todo
```

Nginx configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
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

10. **Enable Site**
```bash
sudo ln -s /etc/nginx/sites-available/facial-recognition-todo /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🔒 Security Considerations

### Environment Variables
Never commit sensitive data to version control:
- Use `.env` files locally
- Use platform-specific environment variable settings in production
- Rotate credentials regularly

### HTTPS
Always use HTTPS in production:
- Use Let's Encrypt for free SSL certificates
- Configure proper CORS settings
- Enable HSTS headers

### Database Security
- Use MongoDB Atlas with IP whitelisting
- Enable authentication
- Use connection string with credentials
- Regular backups

## 🔧 Post-Deployment

### Monitoring
- Set up application monitoring (New Relic, DataDog)
- Configure error tracking (Sentry)
- Monitor performance metrics

### Scaling
- Use load balancers for high traffic
- Implement database sharding if needed
- Use CDN for static assets

### Maintenance
- Regular security updates
- Database maintenance
- Log rotation
- Performance optimization

## 🐛 Troubleshooting

### Common Issues

1. **Camera not working in production**
   - Ensure HTTPS is enabled
   - Check browser permissions
   - Verify WebRTC support

2. **Face recognition models not loading**
   - Check if models are included in build
   - Verify CDN fallback is working
   - Check network connectivity

3. **Database connection issues**
   - Verify connection string
   - Check IP whitelisting
   - Ensure database is running

4. **High memory usage**
   - Monitor face-api.js memory usage
   - Implement proper cleanup
   - Consider model optimization

### Performance Optimization

1. **Frontend**
   - Enable gzip compression
   - Optimize images and assets
   - Use code splitting
   - Implement lazy loading

2. **Backend**
   - Use connection pooling
   - Implement caching
   - Optimize database queries
   - Use compression middleware

## 📊 Monitoring Commands

```bash
# Check application status
pm2 status

# View logs
pm2 logs facial-recognition-todo

# Monitor resources
pm2 monit

# Restart application
pm2 restart facial-recognition-todo

# Check system resources
htop
df -h
free -h
```

## 🆘 Support

If you encounter issues during deployment:

1. Check the logs for error messages
2. Verify all environment variables are set
3. Ensure all dependencies are installed
4. Check network connectivity
5. Review the troubleshooting section

For additional help, create an issue in the GitHub repository with:
- Deployment platform used
- Error messages
- Steps to reproduce
- System information

---

Happy Deploying! 🚀