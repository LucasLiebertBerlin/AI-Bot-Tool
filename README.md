# Liebert IT - AI Bot Studio

## Funktionsübersicht

### ✅ Implementierte Features

**Kern-Funktionen:**
- Bot-Erstellung mit vollständiger Persönlichkeitskonfiguration
- Chat-Interface für direkte Bot-Kommunikation
- Eigene KI-Engine (keine externen APIs erforderlich)
- PostgreSQL-Datenbankintegration für dauerhafte Speicherung
- Benutzerauthentifizierung mit Session-Management

**Admin-System:**
- Vollständiges Admin-Dashboard
- Benutzerverwaltung (anzeigen/löschen)
- Bot-Übersicht aller Benutzer
- Automatische Admin-Rechte für ersten registrierten Benutzer

**Benutzer-Interface:**
- Deutsche Benutzeroberfläche
- Responsive Design für alle Geräte
- Verbessertes User-Profil mit Einstellungen-Button
- Tutorial-System für neue Benutzer (automatisch beim ersten Login)
- Footer mit rechtlichen Links

**Rechtliche Compliance:**
- Vollständige Datenschutzerklärung (DSGVO-konform)
- Impressum mit Haftungsausschluss
- Allgemeine Geschäftsbedingungen
- Kontaktformular (sendet an lucas.liebert20@gmail.com)

**Benutzereinstellungen:**
- Profil-Management (Name, E-Mail)
- Sprach- und Design-Einstellungen
- Benachrichtigungseinstellungen
- Account-Löschung mit Bestätigung
- Sicherheitsbereich für Passwort-Änderung

### 🏢 Branding
- Vollständig als "Liebert IT" gebrandet
- Professionelles Corporate Design
- Keine Replit-Referenzen

## Server-Deployment

Die vollständige Deployment-Anleitung finden Sie in `DEPLOYMENT.md`.

### Schnellstart für Produktionsserver:

1. **Server-Anforderungen:**
   - Ubuntu 20.04+ oder CentOS 7+
   - Node.js 18+
   - PostgreSQL 12+
   - 4 GB RAM, 2 CPU Kerne

2. **Installation:**
   ```bash
   # Node.js und PostgreSQL installieren
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs postgresql postgresql-contrib
   
   # PM2 für Prozessmanagement
   sudo npm install -g pm2
   
   # Nginx für Reverse Proxy
   sudo apt install nginx certbot python3-certbot-nginx
   ```

3. **Deployment:**
   ```bash
   # Code in /var/www/liebert-ai-bot-studio
   npm install
   npm run build
   npm run db:push
   pm2 start ecosystem.config.js
   ```

4. **SSL & Domain:**
   ```bash
   # Nginx konfigurieren und SSL-Zertifikat
   sudo certbot --nginx -d ihr-domain.de
   ```

## Technische Details

### Architektur:
- **Frontend:** React 18 + TypeScript + Tailwind CSS
- **Backend:** Express.js + TypeScript
- **Datenbank:** PostgreSQL mit Drizzle ORM
- **Build System:** Vite
- **Deployment:** PM2 + Nginx + Let's Encrypt

### Sicherheit:
- Session-basierte Authentifizierung
- CSRF-Schutz
- Rate Limiting
- SQL Injection Schutz durch ORM
- HTTPS-Verschlüsselung

### Performance:
- Server-Side Rendering
- Gzip-Kompression
- Static Asset Caching
- Database Query Optimization
- Cluster Mode für Multi-Core

## API-Endpunkte

### Authentifizierung:
- `POST /api/register` - Benutzerregistrierung
- `POST /api/login` - Benutzeranmeldung
- `POST /api/logout` - Benutzerabmeldung
- `GET /api/user` - Aktueller Benutzer

### Bots:
- `GET /api/bots` - Bots des Benutzers
- `POST /api/bots` - Bot erstellen
- `PUT /api/bots/:id` - Bot bearbeiten
- `DELETE /api/bots/:id` - Bot löschen

### Chat:
- `GET /api/bots/:id/sessions` - Chat-Sessions
- `POST /api/bots/:id/chat` - Chat-Nachricht senden

### Admin (nur für Admins):
- `GET /api/admin/users` - Alle Benutzer
- `DELETE /api/admin/users/:id` - Benutzer löschen
- `GET /api/admin/bots` - Alle Bots

### Benutzereinstellungen:
- `PUT /api/user/profile` - Profil aktualisieren
- `DELETE /api/user/account` - Account löschen

### Sonstiges:
- `POST /api/contact` - Kontaktformular
- `GET /api/dashboard/stats` - Dashboard-Statistiken

## Entwicklung

```bash
# Entwicklungsserver starten
npm run dev

# Datenbank-Schema aktualisieren
npm run db:push

# Build für Produktion
npm run build
```

## Support

Bei technischen Fragen oder Support-Anfragen:
- E-Mail: lucas.liebert20@gmail.com
- Kontaktformular: https://ihr-domain.de/contact

## Lizenz

© 2024 Liebert IT. Alle Rechte vorbehalten.