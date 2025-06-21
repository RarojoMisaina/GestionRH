# HR Leave Management System - Backend

## Description
Backend API pour le système de gestion des congés RH développé avec Spring Boot, MySQL et JWT pour l'authentification.

## Technologies Utilisées
- **Java 17**
- **Spring Boot 3.2.0**
- **Spring Security** avec JWT
- **Spring Data JPA**
- **MySQL 8.0**
- **Maven**
- **Swagger/OpenAPI 3**

## Prérequis
- Java 17 ou supérieur
- Maven 3.6+
- MySQL 8.0+
- IDE (IntelliJ IDEA, Eclipse, VS Code)

## Installation et Configuration

### 1. Cloner le Repository
```bash
git clone <https://github.com/RarojoMisaina/GestionRH>
cd hr-leave-management/backend
```

### 2. Configuration de la Base de Données
Créer une base de données MySQL :
```sql
CREATE DATABASE 
;
CREATE USER 'hruser'@'localhost' IDENTIFIED BY 'hrpassword';
GRANT ALL PRIVILEGES ON hr_leave_management.* TO 'hruser'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Configuration de l'Application
Modifier le fichier `src/main/resources/application.yml` :
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/hr_leave_management?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
    username: hruser
    password: hrpassword
```

### 4. Configuration Email (Optionnel)
Pour les notifications par email, configurer dans `application.yml` :
```yaml
spring:
  mail:
    username: your-email@gmail.com
    password: your-app-password
```

### 5. Installation des Dépendances
```bash
mvn clean install
```

### 6. Lancement de l'Application
```bash
mvn spring-boot:run
```

L'API sera accessible sur : `http://localhost:8080/api`

## Documentation API

### Swagger UI
Une fois l'application lancée, accéder à la documentation interactive :
- **Swagger UI** : http://localhost:8080/api/swagger-ui/index.html
- **OpenAPI JSON** : http://localhost:8080/api/v3/api-docs

### Endpoints Principaux

#### Authentification
- `POST /auth/signin` - Connexion utilisateur
- `POST /auth/signup` - Inscription utilisateur

#### Utilisateurs
- `GET /users` - Liste des utilisateurs (HR uniquement)
- `GET /users/me` - Profil utilisateur actuel
- `GET /users/team` - Équipe du manager
- `PUT /users/{id}` - Mise à jour utilisateur (HR uniquement)

#### Demandes de Congés
- `GET /leave-requests/my` - Mes demandes de congés
- `POST /leave-requests` - Créer une demande
- `PUT /leave-requests/{id}` - Modifier une demande
- `POST /leave-requests/{id}/approve` - Approuver une demande
- `POST /leave-requests/{id}/reject` - Rejeter une demande
- `POST /leave-requests/{id}/cancel` - Annuler une demande

#### Soldes de Congés
- `GET /leave-balance/my` - Mon solde de congés
- `GET /leave-balance/{userId}` - Solde d'un utilisateur
- `PUT /leave-balance/{userId}` - Mettre à jour le solde (HR uniquement)

## Structure du Projet

```
backend/
├── src/main/java/com/hrleave/
│   ├── entity/              # Entités JPA
│   │   ├── User.java
│   │   ├── LeaveRequest.java
│   │   ├── LeaveBalance.java
│   │   └── AuditLog.java
│   ├── repository/          # Repositories JPA
│   │   ├── UserRepository.java
│   │   ├── LeaveRequestRepository.java
│   │   ├── LeaveBalanceRepository.java
│   │   └── AuditLogRepository.java
│   ├── service/             # Services métier
│   │   ├── UserService.java
│   │   ├── LeaveRequestService.java
│   │   ├── LeaveBalanceService.java
│   │   ├── AuditService.java
│   │   └── NotificationService.java
│   ├── controller/          # Contrôleurs REST
│   │   ├── AuthController.java
│   │   ├── UserController.java
│   │   ├── LeaveRequestController.java
│   │   └── LeaveBalanceController.java
│   ├── dto/                 # Data Transfer Objects
│   │   ├── LoginRequest.java
│   │   ├── JwtResponse.java
│   │   ├── LeaveRequestDto.java
│   │   └── LeaveBalanceDto.java
│   ├── security/            # Configuration sécurité
│   │   ├── WebSecurityConfig.java
│   │   ├── JwtUtils.java
│   │   ├── AuthTokenFilter.java
│   │   └── AuthEntryPointJwt.java
│   └── HrLeaveManagementApplication.java
├── src/main/resources/
│   ├── application.yml      # Configuration application
│   └── data.sql            # Données de test
└── pom.xml                 # Configuration Maven
```

## Utilisateurs de Test

Le système inclut des utilisateurs de démonstration (mot de passe : `password123`) :

| Email | Rôle | Nom |
|-------|------|-----|
| john.doe@company.com | EMPLOYEE | John Doe |
| sarah.johnson@company.com | MANAGER | Sarah Johnson |
| hr.admin@company.com | HR | Lisa Chen |
| mike.wilson@company.com | EMPLOYEE | Mike Wilson |

## Sécurité

### Authentification JWT
- Token JWT avec expiration de 24 heures
- Refresh token automatique
- Chiffrement des mots de passe avec BCrypt

### Autorisation basée sur les Rôles
- **EMPLOYEE** : Gestion de ses propres congés
- **MANAGER** : Approbation des congés de son équipe
- **HR** : Accès complet au système

### Audit Trail
Toutes les actions importantes sont enregistrées dans la table `audit_logs` :
- Création/modification/suppression d'utilisateurs
- Soumission/approbation/rejet de demandes de congés
- Modifications des soldes de congés

## Tests

### Tests Unitaires
```bash
mvn test
```

### Tests d'Intégration
```bash
mvn verify
```

## Déploiement

### Profil de Production
Créer un fichier `application-prod.yml` :
```yaml
spring:
  datasource:
    url: jdbc:mysql://prod-server:3306/hr_leave_management
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false

jwt:
  secret: ${JWT_SECRET}
  expiration: 86400000

logging:
  level:
    com.hrleave: INFO
    org.springframework.security: WARN
```

### Lancement en Production
```bash
java -jar -Dspring.profiles.active=prod target/hr-leave-management-0.0.1-SNAPSHOT.jar
```

### Docker (Optionnel)
```dockerfile
FROM openjdk:17-jdk-slim
COPY target/hr-leave-management-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app.jar"]
```

## Monitoring et Logs

### Actuator Endpoints
- `/actuator/health` - État de l'application
- `/actuator/metrics` - Métriques de performance
- `/actuator/info` - Informations sur l'application

### Logs
Les logs sont configurés avec différents niveaux :
- **DEBUG** : Développement
- **INFO** : Production
- **ERROR** : Erreurs critiques

## Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## Support

Pour le support technique :
- Créer une issue dans le repository
- Contacter l'équipe de développement
- Consulter la documentation Swagger

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.