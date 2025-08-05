# Documentation Fonctionnelle - ChatNova

## Table des Matières

1. [Vue d'ensemble du Système](#vue-densemble-du-système)
2. [Exigences Fonctionnelles](#exigences-fonctionnelles)
3. [Exigences Non Fonctionnelles](#exigences-non-fonctionnelles)
4. [Architecture et Technologies](#architecture-et-technologies)
5. [Guide d'Utilisation](#guide-dutilisation)
6. [Gestion des Données](#gestion-des-données)
7. [Sécurité et Authentification](#sécurité-et-authentification)

---

## Vue d'ensemble du Système

**ChatNova** est une application web intelligente de chat conversationnel avec analyse de documents PDF. L'application permet aux utilisateurs d'interagir avec différents modèles d'intelligence artificielle pour analyser, questionner et obtenir des insights à partir de documents PDF uploadés.

### Objectifs Principaux

- Faciliter l'analyse interactive de documents PDF
- Offrir une expérience conversationnelle intuitive avec l'IA
- Permettre la gestion organisée des conversations et documents
- Fournir une interface moderne et responsive

---

## Exigences Fonctionnelles

### 1. Authentification et Gestion des Utilisateurs

#### RF-01: Inscription Utilisateur

- **Description**: L'utilisateur peut créer un compte avec email et mot de passe
- **Critères d'acceptation**:
  - Validation de l'email (format valide, unicité)
  - Mot de passe sécurisé (minimum 8 caractères)
  - Confirmation par email
  - Création automatique du profil utilisateur

#### RF-02: Connexion Utilisateur

- **Description**: Authentification sécurisée des utilisateurs
- **Critères d'acceptation**:
  - Connexion via email/mot de passe
  - Gestion des sessions persistantes
  - Possibilité de déconnexion
  - Récupération de mot de passe oublié

#### RF-03: Gestion du Profil

- **Description**: Personnalisation du profil utilisateur
- **Critères d'acceptation**:
  - Modification des informations personnelles
  - Upload et gestion de l'avatar
  - Préférences de l'interface (thème, langue, densité)
  - Historique d'utilisation

### 2. Sélection et Gestion des Modèles IA

#### RF-04: Sélection de Modèle IA

- **Description**: Choix du modèle d'IA avant de commencer une conversation
- **Critères d'acceptation**:
  - Affichage des modèles disponibles avec descriptions
  - Sélection via dropdown dans l'en-tête
  - Verrouillage du modèle une fois la conversation initiée
  - Sauvegarde des préférences utilisateur

#### RF-05: Information sur les Modèles

- **Description**: Présentation détaillée des capacités de chaque modèle
- **Critères d'acceptation**:
  - Description des fonctionnalités de chaque modèle
  - Indication des tarifs (Gratuit/Premium)
  - Badges et indicateurs visuels
  - Recommandations d'usage

### 3. Gestion des Documents PDF

#### RF-06: Upload de Documents PDF

- **Description**: Importation de fichiers PDF pour analyse
- **Critères d'acceptation**:
  - Interface drag & drop intuitive
  - Validation du format PDF
  - Limitation de taille (configurable)
  - Prévisualisation avant upload
  - Barre de progression d'upload

#### RF-07: Prévisualisation PDF

- **Description**: Visualisation du document pendant la conversation
- **Critères d'acceptation**:
  - Prévisualisation en temps réel
  - Navigation dans le document (pages, zoom)
  - Redimensionnement de la fenêtre de prévisualisation
  - Possibilité de masquer/afficher
  - Téléchargement du document

#### RF-08: Analyse de Contenu PDF

- **Description**: Extraction et traitement du contenu du PDF
- **Critères d'acceptation**:
  - Extraction du texte des PDF
  - Conservation de la structure du document
  - Gestion des images et tableaux
  - Support des PDF multi-pages

### 4. Interface de Chat Conversationnel

#### RF-09: Interface de Messagerie

- **Description**: Chat en temps réel avec l'IA
- **Critères d'acceptation**:
  - Envoi de messages texte
  - Affichage chronologique des conversations
  - Indicateurs de statut (envoi, réception, erreur)
  - Support du markdown dans les réponses
  - Messages avec pièces jointes

#### RF-10: Fonctionnalités de Chat Avancées

- **Description**: Outils d'interaction avec les messages
- **Critères d'acceptation**:
  - Copie des messages
  - Système de like/dislike pour feedback
  - Régénération des réponses
  - Partage de conversations
  - Historique persistant

#### RF-11: Enregistrement Vocal (Désactivé)

- **Description**: Fonction d'enregistrement vocal
- **Critères d'acceptation**:
  - Bouton microphone visible mais désactivé
  - Message d'information sur la désactivation
  - Interface préparée pour activation future

### 5. Organisation et Gestion des Conversations

#### RF-12: Historique des Conversations

- **Description**: Sauvegarde et organisation des chats
- **Critères d'acceptation**:
  - Liste chronologique des conversations
  - Recherche dans l'historique
  - Titres automatiques ou personnalisés
  - Suppression de conversations
  - Archivage

#### RF-13: Catégorisation des Chats

- **Description**: Organisation des conversations par catégories
- **Critères d'acceptation**:
  - Création de catégories personnalisées
  - Attribution de chats aux catégories
  - Interface de gestion des catégories
  - Catégorie par défaut "General"
  - Affichage hiérarchique dans la sidebar

#### RF-14: Nouvelle Conversation

- **Description**: Initiation de nouvelles sessions de chat
- **Critères d'acceptation**:
  - Bouton "New Chat" accessible
  - Réinitialisation de l'interface
  - Conservation du modèle sélectionné
  - Possibilité d'upload de nouveau PDF

### 6. Bibliothèque et Gestion des Fichiers

#### RF-15: Bibliothèque de Documents

- **Description**: Centralisation des documents uploadés
- **Critères d'acceptation**:
  - Vue d'ensemble des fichiers
  - Informations détaillées (taille, date, type)
  - Possibilité de réutilisation
  - Suppression de fichiers
  - Statistiques d'utilisation

### 7. Paramètres et Personnalisation

#### RF-16: Paramètres d'Interface

- **Description**: Personnalisation de l'expérience utilisateur
- **Critères d'acceptation**:
  - Choix du thème (Clair/Sombre/Système)
  - Ajustement de la taille de police
  - Densité d'affichage (Compact/Confortable/Spacieux)
  - Sauvegarde des préférences

#### RF-17: Gestion des Données

- **Description**: Contrôle des données utilisateur
- **Critères d'acceptation**:
  - Visualisation de l'usage du stockage
  - Suppression de l'historique
  - Export des données
  - Réinitialisation complète

### 8. Partage et Collaboration

#### RF-18: Partage de Conversations

- **Description**: Partage externe des conversations
- **Critères d'acceptation**:
  - Génération de liens de partage
  - Contrôle d'accès (public/privé)
  - Vue en lecture seule pour les visiteurs
  - Expiration des liens configurables

---

## Exigences Non Fonctionnelles

### 1. Performance (RNF-01 à RNF-05)

#### RNF-01: Temps de Réponse

- **Chargement initial**: < 3 secondes
- **Navigation entre pages**: < 1 seconde
- **Upload de PDF**: < 5 secondes pour fichiers < 10MB
- **Génération de réponse IA**: < 30 secondes

#### RNF-02: Capacité de Charge

- **Utilisateurs simultanés**: Support pour 100+ utilisateurs
- **Taille des fichiers**: PDF jusqu'à 50MB
- **Conversations simultanées**: Illimitées par utilisateur
- **Stockage par utilisateur**: 1GB par défaut

#### RNF-03: Disponibilité

- **Uptime**: 99.5% minimum
- **Maintenance**: Fenêtres programmées avec notification
- **Récupération d'erreur**: < 5 minutes
- **Sauvegarde automatique**: Toutes les heures

### 2. Sécurité (RNF-06 à RNF-10)

#### RNF-06: Authentification

- **Chiffrement**: HTTPS/TLS obligatoire
- **Sessions**: Expiration automatique après inactivité
- **Mots de passe**: Hashage sécurisé (bcrypt)
- **Tokens**: JWT avec expiration

#### RNF-07: Protection des Données

- **Chiffrement**: Données sensibles chiffrées en base
- **Accès**: Contrôle d'accès basé sur les rôles
- **Audit**: Logs d'accès et d'actions
- **RGPD**: Conformité aux réglementations

#### RNF-08: Validation des Entrées

- **Sanitisation**: Toutes les entrées utilisateur
- **Validation**: Côté client et serveur
- **Protection**: Contre XSS, CSRF, injection SQL
- **Limites**: Taille et type de fichiers

### 3. Utilisabilité (RNF-11 à RNF-15)

#### RNF-11: Interface Utilisateur

- **Design**: Moderne, épuré, intuitif
- **Responsive**: Support mobile, tablette, desktop
- **Accessibilité**: Conformité WCAG 2.1 niveau AA
- **Cohérence**: Design system uniforme

#### RNF-12: Ergonomie

- **Navigation**: Intuitive et logique
- **Feedback**: Retours visuels pour toutes les actions
- **Erreurs**: Messages d'erreur clairs et utiles
- **Aide**: Documentation contextuelle

#### RNF-13: Internationalisation

- **Langues**: Support multilingue (French prioritaire)
- **Formats**: Dates, nombres selon la locale
- **RTL**: Support des langues droite-à-gauche
- **Traduction**: Interface dynamique

### 4. Compatibilité (RNF-16 à RNF-18)

#### RNF-16: Navigateurs

- **Support**: Chrome, Firefox, Safari, Edge (dernières versions)
- **Fallbacks**: Fonctionnalités dégradées pour anciens navigateurs
- **Mobile**: Safari iOS, Chrome Android
- **Tests**: Compatibilité croisée régulière

#### RNF-17: Standards Web

- **HTML5**: Sémantique et accessibilité
- **CSS3**: Animations et responsive design
- **JavaScript**: ES6+ avec transpilation
- **APIs**: Web modernes (File API, etc.)

### 5. Maintenabilité (RNF-19 à RNF-22)

#### RNF-19: Architecture

- **Modularité**: Composants réutilisables
- **Séparation**: Frontend/Backend découplés
- **Standards**: Conventions de code strictes
- **Documentation**: Code documenté et commenté

#### RNF-20: Monitoring

- **Logs**: Système de logging complet
- **Métriques**: Performance et usage
- **Alertes**: Notifications automatiques d'erreurs
- **Analytics**: Tracking des fonctionnalités

---

## Architecture et Technologies

### Stack Technologique

#### Frontend

- **Framework**: React 18 avec TypeScript
- **Routing**: React Router 6 (SPA)
- **Styling**: TailwindCSS 3 + Radix UI
- **Build**: Vite
- **State Management**: Context API + Custom hooks
- **Icons**: Lucide React

#### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **File Upload**: Multer
- **PDF Processing**: pdf-parse, pdfjs-dist

#### Base de Données

- **Storage**: Fichiers JSON (pour développement)
- **Files**: Système de fichiers local
- **Session**: En mémoire

#### DevOps et Déploiement

- **Development**: Vite dev server
- **Testing**: Vitest
- **Linting**: ESLint + Prettier
- **Deployment**: Support Netlify/Vercel

### Structure de l'Application

```
client/                 # Frontend React
├── components/         # Composants réutilisables
│   ├── ui/            # Composants UI de base
│   ├── ChatArea.tsx   # Zone de conversation
│   ├── ChatInput.tsx  # Saisie de message
│   ├── ChatSidebar.tsx # Barre latérale
│   └── ModelDropdown.tsx # Sélecteur de modèle
├── pages/             # Pages de l'application
├── contexts/          # Contextes React
├── services/          # Services API
└── hooks/             # Hooks personnalisés

server/                # Backend Express
├── routes/            # Endpoints API
├── data/              # Stockage JSON
├── uploads/           # Fichiers uploadés
└── utils/             # Utilitaires

shared/                # Types partagés
└── types.ts           # Interfaces TypeScript
```

---

## Guide d'Utilisation

### 1. Première Connexion

1. **Inscription/Connexion**

   - Accéder à la page de connexion
   - Créer un compte ou se connecter
   - Personnaliser le profil

2. **Configuration Initiale**
   - Choisir le thème préféré
   - Ajuster les paramètres d'affichage
   - Configurer les préférences

### 2. Démarrage d'une Conversation

1. **Sélection du Modèle IA**

   - Cliquer sur le dropdown de modèle dans l'en-tête
   - Choisir le modèle approprié selon les besoins
   - Noter que le modèle sera verrouillé une fois la conversation commencée

2. **Upload de Document PDF**

   - Cliquer sur "New Chat" dans la sidebar
   - Glisser-déposer un fichier PDF ou cliquer pour sélectionner
   - Attendre la confirmation d'upload
   - Cliquer sur "Start Chatting"

3. **Conversation**
   - Poser des questions sur le document
   - Utiliser la prévisualisation PDF pour référence
   - Interagir avec les réponses (copier, liker, régénérer)

### 3. Organisation des Conversations

1. **Catégorisation**

   - Cliquer sur "Manage Categories" dans la sidebar
   - Créer des catégories thématiques
   - Glisser-déposer les chats dans les catégories

2. **Gestion de l'Historique**
   - Accéder aux conversations via la sidebar
   - Renommer les conversations
   - Supprimer les conversations non nécessaires

### 4. Fonctionnalités Avancées

1. **Partage de Conversation**

   - Cliquer sur "Share" dans l'en-tête
   - Générer un lien de partage public
   - Configurer les permissions d'accès

2. **Bibliothèque de Documents**
   - Accéder à "Library" dans la sidebar
   - Gérer les documents uploadés
   - Réutiliser des documents existants

---

## Gestion des Données

### Types de Données Stockées

#### Données Utilisateur

```typescript
interface User {
  id: string;
  email: string;
  displayName: string;
  avatar?: string;
  settings: UserSettings;
  createdAt: string;
  lastLogin: string;
}
```

#### Conversations

```typescript
interface Chat {
  id: string;
  title: string;
  model: string;
  userId: string;
  pdfFile?: FileAttachment;
  categoryId?: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}
```

#### Messages

```typescript
interface Message {
  id: string;
  chatId: string;
  type: "user" | "assistant";
  content: string;
  timestamp: string;
  attachments?: FileAttachment[];
  liked?: boolean;
  disliked?: boolean;
}
```

#### Fichiers

```typescript
interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
}
```

### Politique de Rétention

- **Messages**: Conservation illimitée sauf suppression explicite
- **Fichiers**: Conservation liée aux conversations
- **Sessions**: Expiration après 30 jours d'inactivité
- **Logs**: Conservation 90 jours

---

## Sécurité et Authentification

### Mesures de Sécurité Implémentées

#### Authentification

- **Tokens JWT**: Pour la gestion des sessions
- **Hachage des mots de passe**: Utilisation de bcrypt
- **Validation d'email**: Vérification obligatoire
- **Expiration de session**: Déconnexion automatique

#### Protection des Données

- **Validation d'entrée**: Sanitisation de toutes les données
- **Upload sécurisé**: Validation des types de fichiers
- **Isolation des données**: Accès restreint par utilisateur
- **Chiffrement HTTPS**: Obligatoire en production

#### Monitoring et Audit

- **Logs d'accès**: Traçabilité des actions
- **Détection d'anomalies**: Monitoring automatique
- **Sauvegarde**: Backup régulier des données
- **Plan de récupération**: Procédures en cas d'incident

### Conformité RGPD

- **Consentement**: Opt-in explicite pour le traitement
- **Droit à l'oubli**: Suppression complète des données
- **Portabilité**: Export des données utilisateur
- **Transparence**: Information claire sur l'usage des données

---

## Conclusion

ChatNova représente une solution complète et moderne pour l'analyse interactive de documents PDF via l'intelligence artificielle. L'application combine une interface utilisateur intuitive avec des fonctionnalités avancées de traitement de documents et de conversation intelligente.

### Points Forts

- Interface moderne et responsive
- Sécurité robuste et conformité RGPD
- Fonctionnalités d'organisation avancées
- Support multi-modèles IA
- Expérience utilisateur optimisée

### Évolutions Futures

- Activation de l'enregistrement vocal
- Support de nouveaux formats de documents
- Fonctionnalités collaboratives étendues
- Intégrations avec services externes
- Analytics et reporting avancés

Cette documentation constitue le référentiel technique et fonctionnel de l'application ChatNova, servant de base pour le développement, la maintenance et l'évolution future du système.
