# Liebert IT - AI Bot Studio Deployment Guide

## Übersicht
Diese Anleitung beschreibt, wie Sie die Liebert IT AI Bot Studio Plattform auf einem Server bereitstellen.

## Server-Anforderungen

### Mindestanforderungen
- **CPU**: 2 Kerne
- **RAM**: 4 GB
- **Speicher**: 20 GB freier Speicherplatz
- **Betriebssystem**: Ubuntu 20.04+ / CentOS 7+ / Debian 10+
- **Node.js**: Version 18 oder höher
- **PostgreSQL**: Version 12 oder höher

### Empfohlene Anforderungen (Produktionsumgebung)
- **CPU**: 4+ Kerne
- **RAM**: 8+ GB
- **Speicher**: 50+ GB SSD
- **Betriebssystem**: Ubuntu 22.04 LTS
- **Node.js**: Version 20 LTS
- **PostgreSQL**: Version 15+

## Schritt 1: Server-Vorbereitung

### Ubuntu/Debian Installation
```bash
# System aktualisieren
sudo apt update && sudo apt upgrade -y

# Node.js 20 installieren
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# PostgreSQL installieren
sudo apt install postgresql postgresql-contrib -y

# PM2 für Prozessmanagement installieren
sudo npm install -g pm2

# Git installieren
sudo apt install git -y

# Nginx für Reverse Proxy installieren
sudo apt install nginx -y

# SSL-Zertifikat Tools
sudo apt install certbot python3-certbot-nginx -y
```

### CentOS/RHEL Installation
```bash
# System aktualisieren
sudo yum update -y

# Node.js Repository hinzufügen
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# PostgreSQL installieren
sudo yum install postgresql-server postgresql-contrib -y
sudo postgresql-setup initdb
sudo systemctl enable postgresql
sudo systemctl start postgresql

# PM2 installieren
sudo npm install -g pm2

# Git installieren
sudo yum install git -y

# Nginx installieren
sudo yum install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

## Schritt 2: PostgreSQL Konfiguration

```bash
# Als postgres Benutzer anmelden
sudo -u postgres psql

# Datenbank und Benutzer erstellen
CREATE DATABASE liebert_ai_bot_studio;
CREATE USER botuser WITH ENCRYPTED PASSWORD 'ihr_sicheres_passwort';
GRANT ALL PRIVILEGES ON DATABASE liebert_ai_bot_studio TO botuser;
\q

# PostgreSQL für externe Verbindungen konfigurieren
sudo nano /etc/postgresql/15/main/postgresql.conf
# Zeile ändern: listen_addresses = 'localhost'

sudo nano /etc/postgresql/15/main/pg_hba.conf
# Zeile hinzufügen: local   all   botuser   md5

# PostgreSQL neu starten
sudo systemctl restart postgresql
```

## Schritt 3: Anwendung bereitstellen

### Code vom Repository klonen
```bash
# Verzeichnis erstellen
sudo mkdir -p /var/www/liebert-ai-bot-studio
sudo chown $USER:$USER /var/www/liebert-ai-bot-studio

# Code klonen (oder hochladen)
cd /var/www/liebert-ai-bot-studio
git clone <ihr-repository-url> .

# Abhängigkeiten installieren
npm install

# Build erstellen
npm run build
```

### Umgebungsvariablen konfigurieren
```bash
# .env Datei erstellen
nano .env
```

Inhalt der .env Datei:
```env
# Datenbank Konfiguration
DATABASE_URL="postgresql://botuser:ihr_sicheres_passwort@localhost:5432/liebert_ai_bot_studio"
PGHOST=localhost
PGPORT=5432
PGUSER=botuser
PGPASSWORD=ihr_sicheres_passwort
PGDATABASE=liebert_ai_bot_studio

# Session Secret (generieren Sie einen sicheren Schlüssel)
SESSION_SECRET="ein_sehr_langer_zufälliger_schlüssel_hier"

# Produktionsumgebung
NODE_ENV=production
PORT=5000

# Optional: OpenAI API (falls gewünscht)
# OPENAI_API_KEY=sk-...

# Optional: SendGrid für E-Mails
# SENDGRID_API_KEY=SG....
```

### Datenbank initialisieren
```bash
# Datenbank-Schema erstellen
npm run db:push
```

## Schritt 4: PM2 Konfiguration

### PM2 Ecosystem Datei erstellen
```bash
nano ecosystem.config.js
```

Inhalt:
```javascript
module.exports = {
  apps: [{
    name: 'liebert-ai-bot-studio',
    script: 'server/index.ts',
    interpreter: 'node',
    interpreter_args: '--loader tsx',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/var/log/liebert-ai-bot-studio/error.log',
    out_file: '/var/log/liebert-ai-bot-studio/out.log',
    log_file: '/var/log/liebert-ai-bot-studio/combined.log',
    time: true
  }]
};
```

### Anwendung starten
```bash
# Log-Verzeichnis erstellen
sudo mkdir -p /var/log/liebert-ai-bot-studio
sudo chown $USER:$USER /var/log/liebert-ai-bot-studio

# Anwendung mit PM2 starten
pm2 start ecosystem.config.js

# PM2 beim Systemstart automatisch starten
pm2 startup
pm2 save
```

## Schritt 5: Nginx Reverse Proxy

### Nginx Konfiguration erstellen
```bash
sudo nano /etc/nginx/sites-available/liebert-ai-bot-studio
```

Inhalt:
```nginx
server {
    listen 80;
    server_name ihr-domain.de www.ihr-domain.de;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Gzip Kompression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

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
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static Files Caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        proxy_pass http://localhost:5000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://localhost:5000;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Nginx Konfiguration aktivieren
```bash
# Konfiguration aktivieren
sudo ln -s /etc/nginx/sites-available/liebert-ai-bot-studio /etc/nginx/sites-enabled/

# Standard-Konfiguration deaktivieren
sudo rm /etc/nginx/sites-enabled/default

# Konfiguration testen
sudo nginx -t

# Nginx neu starten
sudo systemctl restart nginx
```

## Schritt 6: SSL-Zertifikat (Let's Encrypt)

```bash
# SSL-Zertifikat erstellen
sudo certbot --nginx -d ihr-domain.de -d www.ihr-domain.de

# Automatische Erneuerung testen
sudo certbot renew --dry-run
```

## Schritt 7: Firewall Konfiguration

### UFW (Ubuntu Firewall)
```bash
# UFW aktivieren
sudo ufw enable

# HTTP und HTTPS erlauben
sudo ufw allow 'Nginx Full'

# SSH erlauben
sudo ufw allow ssh

# Status prüfen
sudo ufw status
```

### Firewalld (CentOS/RHEL)
```bash
# HTTP und HTTPS erlauben
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https

# Firewall neu laden
sudo firewall-cmd --reload
```

## Schritt 8: Überwachung und Wartung

### Log-Überwachung
```bash
# PM2 Logs anzeigen
pm2 logs

# Nginx Logs anzeigen
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# PostgreSQL Logs anzeigen
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

### Systemüberwachung einrichten
```bash
# PM2 Monitoring aktivieren
pm2 install pm2-server-monit
```

### Backup-Strategie
```bash
# Datenbank-Backup Script erstellen
nano /home/$USER/backup-db.sh
```

Backup Script:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/liebert-ai-bot-studio"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Datenbank Backup
pg_dump -h localhost -U botuser liebert_ai_bot_studio > $BACKUP_DIR/db_backup_$DATE.sql

# Alte Backups löschen (älter als 30 Tage)
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete

echo "Backup completed: $BACKUP_DIR/db_backup_$DATE.sql"
```

```bash
# Script ausführbar machen
chmod +x /home/$USER/backup-db.sh

# Cron Job für tägliche Backups
crontab -e
# Zeile hinzufügen: 0 2 * * * /home/$USER/backup-db.sh
```

## Schritt 9: Updates und Wartung

### Anwendung aktualisieren
```bash
cd /var/www/liebert-ai-bot-studio

# Code aktualisieren
git pull origin main

# Abhängigkeiten aktualisieren
npm install

# Build neu erstellen
npm run build

# Datenbank migrieren (falls nötig)
npm run db:push

# Anwendung neu starten
pm2 restart liebert-ai-bot-studio
```

### System-Updates
```bash
# Regelmäßige System-Updates
sudo apt update && sudo apt upgrade -y

# PM2 aktualisieren
sudo npm update -g pm2
pm2 update
```

## Schritt 10: Troubleshooting

### Häufige Probleme

#### Anwendung startet nicht
```bash
# Logs prüfen
pm2 logs liebert-ai-bot-studio

# Prozess-Status prüfen
pm2 status

# Umgebungsvariablen prüfen
pm2 env 0
```

#### Datenbankverbindungsfehler
```bash
# PostgreSQL Status prüfen
sudo systemctl status postgresql

# Datenbankverbindung testen
psql -h localhost -U botuser -d liebert_ai_bot_studio
```

#### Nginx Fehler
```bash
# Nginx Konfiguration testen
sudo nginx -t

# Nginx Status prüfen
sudo systemctl status nginx

# Error Logs prüfen
sudo tail -f /var/log/nginx/error.log
```

## Schritt 11: Performance-Optimierung

### PostgreSQL Tuning
```bash
sudo nano /etc/postgresql/15/main/postgresql.conf
```

Empfohlene Einstellungen:
```
# Memory
shared_buffers = 256MB
work_mem = 4MB
maintenance_work_mem = 64MB

# Checkpoints
checkpoint_completion_target = 0.9
wal_buffers = 16MB

# Query Planner
random_page_cost = 1.1
effective_cache_size = 1GB
```

### Node.js Performance
```bash
# PM2 Cluster Mode nutzen
pm2 start ecosystem.config.js --instances max
```

## Sicherheit

### Zusätzliche Sicherheitsmaßnahmen
1. Regelmäßige Updates installieren
2. Fail2ban für Brute-Force Schutz installieren
3. SSH Key-basierte Authentifizierung verwenden
4. Unnötige Services deaktivieren
5. Regelmäßige Sicherheits-Audits durchführen

### Fail2ban Installation
```bash
sudo apt install fail2ban -y

# Konfiguration
sudo nano /etc/fail2ban/jail.local
```

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[nginx-http-auth]
enabled = true

[nginx-limit-req]
enabled = true
```

## Support und Wartung

### Monitoring Dashboard
Die Anwendung läuft unter: https://ihr-domain.de
Admin-Panel: https://ihr-domain.de/admin

### Kontakt
Bei Problemen oder Fragen: lucas.liebert20@gmail.com

## Checkliste für Go-Live

- [ ] Server-Anforderungen erfüllt
- [ ] PostgreSQL installiert und konfiguriert
- [ ] Node.js 20+ installiert
- [ ] Anwendung bereitgestellt und getestet
- [ ] PM2 konfiguriert und läuft
- [ ] Nginx konfiguriert mit SSL
- [ ] Firewall konfiguriert
- [ ] Backup-Strategie implementiert
- [ ] Monitoring eingerichtet
- [ ] DNS konfiguriert
- [ ] SSL-Zertifikat aktiv
- [ ] Performance getestet
- [ ] Sicherheitsmaßnahmen implementiert

---

**Hinweis**: Ersetzen Sie alle Platzhalter (ihr-domain.de, Passwörter, etc.) durch Ihre tatsächlichen Werte vor der Bereitstellung.