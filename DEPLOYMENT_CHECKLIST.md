# Deployment Checklist

## Pre-Deployment

- [ ] All tests passing locally
- [ ] Environment variables configured
- [ ] Google OAuth callback URLs updated
- [ ] Database migrations ready
- [ ] Security secrets generated (JWT, Session)
- [ ] CORS origins configured
- [ ] Rate limits appropriate for production
- [ ] Logging configured

## Deployment

- [ ] Docker images built successfully
- [ ] Services started without errors
- [ ] Database connected
- [ ] Redis connected
- [ ] Health check endpoint responding
- [ ] API documentation accessible

## Post-Deployment

- [ ] Test authentication flow
- [ ] Test event collection
- [ ] Test analytics endpoints
- [ ] Monitor logs for errors
- [ ] Setup monitoring/alerting
- [ ] Document deployment URL
- [ ] Update README with live URLs

## Security

- [ ] API keys rotated
- [ ] Secrets not in version control
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Rate limiting active
- [ ] Database backups configured

## Monitoring

- [ ] Health checks configured
- [ ] Error tracking setup
- [ ] Performance monitoring
- [ ] Database monitoring
- [ ] Redis monitoring