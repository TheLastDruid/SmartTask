# SmartTask Deployment Guide

## Quick Deployment Options

### Option 1: Docker Compose (Recommended)
```bash
# Production deployment
docker-compose -f docker-compose.prod.yml up -d
```

### Option 2: Cloud Deployment
- [AWS ECS](#aws-ecs)
- [Google Cloud Run](#google-cloud-run)
- [Azure Container Instances](#azure-container-instances)
- [DigitalOcean App Platform](#digitalocean-app-platform)

### Option 3: Kubernetes
```bash
kubectl apply -f k8s/
```

## Pre-deployment Checklist

- [ ] Update environment variables
- [ ] Configure production database
- [ ] Set secure JWT secret (256+ bits)
- [ ] Update CORS origins
- [ ] Configure SSL/TLS certificates
- [ ] Set up monitoring and logging
- [ ] Configure backups
- [ ] Test in staging environment

## Environment Configuration

### Production Environment Variables

**Backend (.env or application-prod.properties):**
```properties
# Database
SPRING_DATA_MONGODB_URI=mongodb://username:password@mongodb-host:27017/todoapp_prod

# JWT Security
APP_JWT_SECRET=your-super-secure-256-bit-secret-key-here
APP_JWT_EXPIRATION_MS=86400000

# Server
SERVER_PORT=8080
SPRING_PROFILES_ACTIVE=prod

# Security
SERVER_ERROR_INCLUDE_MESSAGE=never
SERVER_ERROR_INCLUDE_BINDING_ERRORS=never
```

**Frontend (.env.production):**
```env
REACT_APP_API_URL=https://api.yourdomain.com
GENERATE_SOURCEMAP=false
```

## AWS ECS Deployment

### 1. Create Task Definition
```json
{
  "family": "smarttask",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [
    {
      "name": "smarttask-backend",
      "image": "your-account.dkr.ecr.region.amazonaws.com/smarttask-backend:latest",
      "portMappings": [
        {
          "containerPort": 8080,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "SPRING_PROFILES_ACTIVE",
          "value": "prod"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/smarttask",
          "awslogs-region": "us-west-2",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### 2. Deploy Commands
```bash
# Build and push to ECR
aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin your-account.dkr.ecr.us-west-2.amazonaws.com

docker build -t smarttask-backend ./backend
docker tag smarttask-backend:latest your-account.dkr.ecr.us-west-2.amazonaws.com/smarttask-backend:latest
docker push your-account.dkr.ecr.us-west-2.amazonaws.com/smarttask-backend:latest

# Create ECS service
aws ecs create-service \
  --cluster smarttask-cluster \
  --service-name smarttask-service \
  --task-definition smarttask:1 \
  --desired-count 2 \
  --launch-type FARGATE
```

## Google Cloud Run

### 1. Build and Deploy
```bash
# Set project
gcloud config set project YOUR_PROJECT_ID

# Build and push backend
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/smarttask-backend ./backend

# Deploy backend
gcloud run deploy smarttask-backend \
  --image gcr.io/YOUR_PROJECT_ID/smarttask-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars SPRING_PROFILES_ACTIVE=prod

# Build and push frontend
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/smarttask-frontend ./frontend

# Deploy frontend
gcloud run deploy smarttask-frontend \
  --image gcr.io/YOUR_PROJECT_ID/smarttask-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### 2. Cloud Run Configuration
```yaml
# cloudbuild.yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/smarttask-backend', './backend']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/smarttask-backend']
  - name: 'gcr.io/cloud-builders/gcloud'
    args: ['run', 'deploy', 'smarttask-backend', '--image', 'gcr.io/$PROJECT_ID/smarttask-backend', '--region', 'us-central1', '--platform', 'managed', '--allow-unauthenticated']
```

## Azure Container Instances

### 1. Create Resource Group
```bash
az group create --name smarttask-rg --location eastus
```

### 2. Deploy Container Group
```bash
az container create \
  --resource-group smarttask-rg \
  --name smarttask-backend \
  --image your-registry.azurecr.io/smarttask-backend:latest \
  --dns-name-label smarttask-backend \
  --ports 8080 \
  --environment-variables SPRING_PROFILES_ACTIVE=prod
```

## DigitalOcean App Platform

### 1. App Spec File
```yaml
# .do/app.yaml
name: smarttask
services:
  - name: backend
    source_dir: backend
    build_command: ./mvnw clean package -DskipTests
    run_command: java -jar target/smart-task-backend-0.0.1-SNAPSHOT.jar
    environment_slug: java
    instance_count: 1
    instance_size_slug: basic-xxs
    envs:
      - key: SPRING_PROFILES_ACTIVE
        value: prod
  - name: frontend
    source_dir: frontend
    build_command: npm run build
    run_command: npx serve -s build -l 3000
    environment_slug: node-js
    instance_count: 1
    instance_size_slug: basic-xxs
    envs:
      - key: REACT_APP_API_URL
        value: ${backend.PUBLIC_URL}
databases:
  - name: mongodb
    engine: MONGODB
    version: "5"
```

### 2. Deploy
```bash
doctl apps create --spec .do/app.yaml
```

## Kubernetes Deployment

### 1. Namespace and Secrets
```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: smarttask

---
# k8s/secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: smarttask-secrets
  namespace: smarttask
type: Opaque
data:
  mongodb-uri: bW9uZ29kYjovL3VzZXI6cGFzc0Btb25nb2RiOjI3MDE3L3RvZG9hcHA=  # base64 encoded
  jwt-secret: eW91ci1zdXBlci1zZWN1cmUtand0LXNlY3JldA==  # base64 encoded
```

### 2. Deployments
```yaml
# k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: smarttask
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: smarttask-backend:latest
        ports:
        - containerPort: 8080
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "prod"
        - name: SPRING_DATA_MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: smarttask-secrets
              key: mongodb-uri
        - name: APP_JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: smarttask-secrets
              key: jwt-secret
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"

---
# k8s/backend-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: backend-service
  namespace: smarttask
spec:
  selector:
    app: backend
  ports:
    - protocol: TCP
      port: 8080
      targetPort: 8080
  type: ClusterIP
```

### 3. Ingress Configuration
```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: smarttask-ingress
  namespace: smarttask
  annotations:
    kubernetes.io/ingress.class: "nginx"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - api.yourdomain.com
    - yourdomain.com
    secretName: smarttask-tls
  rules:
  - host: api.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: backend-service
            port:
              number: 8080
  - host: yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80
```

## SSL/TLS Configuration

### Let's Encrypt with Certbot
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Generate certificates
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Cloudflare SSL
1. Add your domain to Cloudflare
2. Set DNS records to point to your server
3. Enable "Full (strict)" SSL mode
4. Configure Origin Certificates

## Database Setup

### MongoDB Atlas (Recommended)
1. Create cluster at https://cloud.mongodb.com
2. Create database user
3. Whitelist application IP addresses
4. Get connection string
5. Update application configuration

### Self-hosted MongoDB
```bash
# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt update
sudo apt install -y mongodb-org

# Configure authentication
mongo
> use admin
> db.createUser({user: "admin", pwd: "secure_password", roles: ["root"]})
> use todoapp
> db.createUser({user: "todoapp_user", pwd: "secure_password", roles: ["readWrite"]})
```

## Monitoring and Logging

### Application Monitoring
```yaml
# docker-compose.monitoring.yml
version: '3.8'
services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-storage:/var/lib/grafana

volumes:
  grafana-storage:
```

### Log Aggregation
```yaml
# ELK Stack for logging
elasticsearch:
  image: docker.elastic.co/elasticsearch/elasticsearch:7.15.0
  environment:
    - discovery.type=single-node
    - "ES_JAVA_OPTS=-Xms512m -Xmx512m"

logstash:
  image: docker.elastic.co/logstash/logstash:7.15.0
  volumes:
    - ./logstash/pipeline:/usr/share/logstash/pipeline

kibana:
  image: docker.elastic.co/kibana/kibana:7.15.0
  ports:
    - "5601:5601"
  environment:
    ELASTICSEARCH_HOSTS: http://elasticsearch:9200
```

## Backup Strategy

### Automated Backup Script
```bash
#!/bin/bash
# Production backup script

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/smarttask"
S3_BUCKET="your-backup-bucket"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup MongoDB
mongodump --uri="mongodb://user:pass@host:27017/todoapp" --out $BACKUP_DIR/mongodb_$DATE

# Backup application files
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /path/to/app

# Upload to S3
aws s3 sync $BACKUP_DIR s3://$S3_BUCKET/smarttask/

# Cleanup old local backups (keep last 7 days)
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
```

### Restore Procedure
```bash
#!/bin/bash
# Restore from backup

BACKUP_DATE=$1
BACKUP_DIR="/backups/smarttask"

if [ -z "$BACKUP_DATE" ]; then
  echo "Usage: ./restore.sh YYYYMMDD_HHMMSS"
  exit 1
fi

# Download from S3
aws s3 sync s3://your-backup-bucket/smarttask/ $BACKUP_DIR

# Restore MongoDB
mongorestore --uri="mongodb://user:pass@host:27017/todoapp" --drop $BACKUP_DIR/mongodb_$BACKUP_DATE/todoapp

echo "Restore completed from backup: $BACKUP_DATE"
```

## Performance Optimization

### Database Optimization
```javascript
// Create optimal indexes
db.tasks.createIndex({ "userId": 1, "status": 1 })
db.tasks.createIndex({ "userId": 1, "createdAt": -1 })
db.tasks.createIndex({ "userId": 1, "title": "text", "description": "text" })
db.users.createIndex({ "email": 1 }, { unique: true })
```

### Caching Strategy
```properties
# Redis caching configuration
spring.cache.type=redis
spring.redis.host=redis-host
spring.redis.port=6379
spring.redis.password=redis-password
spring.cache.redis.time-to-live=3600000
```

### CDN Configuration
```javascript
// CloudFront distribution for static assets
{
  "Origins": [{
    "DomainName": "yourdomain.com",
    "Id": "smarttask-origin",
    "CustomOriginConfig": {
      "HTTPPort": 80,
      "HTTPSPort": 443,
      "OriginProtocolPolicy": "https-only"
    }
  }],
  "DefaultCacheBehavior": {
    "TargetOriginId": "smarttask-origin",
    "ViewerProtocolPolicy": "redirect-to-https",
    "Compress": true,
    "CachePolicyId": "managed-caching-optimized"
  }
}
```

## Health Checks and Monitoring

### Kubernetes Health Checks
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 5
```

### Custom Health Check Script
```bash
#!/bin/bash
# health-check.sh

check_service() {
  local service_url=$1
  local service_name=$2
  
  if curl -f -s $service_url > /dev/null; then
    echo "✅ $service_name is healthy"
    return 0
  else
    echo "❌ $service_name is unhealthy"
    return 1
  fi
}

check_service "http://localhost:8080/health" "Backend"
check_service "http://localhost:3000" "Frontend"

# Check database connection
if docker exec mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
  echo "✅ Database is healthy"
else
  echo "❌ Database is unhealthy"
fi
```

## Troubleshooting

### Common Deployment Issues

**Issue: Container won't start**
```bash
# Check logs
docker logs container-name

# Check resource usage
docker stats

# Verify environment variables
docker exec container-name env
```

**Issue: Database connection failed**
```bash
# Test connection
docker exec backend-container nc -zv mongodb-host 27017

# Check MongoDB logs
docker logs mongodb-container
```

**Issue: SSL certificate problems**
```bash
# Check certificate validity
openssl x509 -in /path/to/cert.pem -text -noout

# Test SSL connection
openssl s_client -connect yourdomain.com:443
```

## Rollback Strategy

### Blue-Green Deployment
```bash
#!/bin/bash
# Deploy new version to green environment
docker-compose -f docker-compose.green.yml up -d

# Health check
sleep 30
if curl -f http://green.yourdomain.com/health; then
  # Switch traffic to green
  # Update load balancer configuration
  echo "Deployment successful"
else
  # Rollback
  docker-compose -f docker-compose.green.yml down
  echo "Deployment failed, rolled back"
fi
```

## Security Considerations

### Production Security Checklist
- [ ] Use HTTPS everywhere
- [ ] Implement rate limiting
- [ ] Configure firewall rules
- [ ] Use secrets management
- [ ] Enable audit logging
- [ ] Regular security updates
- [ ] Penetration testing
- [ ] Backup encryption

### Environment Secrets Management
```bash
# Using AWS Secrets Manager
aws secretsmanager create-secret \
  --name "smarttask/prod/jwt-secret" \
  --description "JWT secret for SmartTask production" \
  --secret-string "your-super-secure-jwt-secret"

# Using Azure Key Vault
az keyvault secret set \
  --vault-name SmartTaskVault \
  --name jwt-secret \
  --value "your-super-secure-jwt-secret"
```

---

**Happy Deploying! 🚀**

For more detailed deployment assistance, check our [support channels](README.md#support--contact).
