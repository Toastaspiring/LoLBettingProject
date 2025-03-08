# **Documentation Technique - Plateforme de Paris sur LoL Esports**

## **1. Introduction**
### **1.1 Présentation du Projet**
La plateforme de paris sur LoL Esports est un projet visant à offrir aux utilisateurs une expérience immersive et compétitive en utilisant une monnaie fictive. Les utilisateurs pourront parier sur les résultats des matchs, participer à des duels entre joueurs, gagner des récompenses quotidiennes et voir leurs performances reflétées dans des classements dynamiques.

### **1.2 Objectifs du Projet**
- Développer une **API sur mesure** pour récupérer les données des utilisateurs Riot et les informations des matchs de LoL Esports.
- Assurer une **expérience fluide et rapide** grâce à un système de cache optimisé.
- Offrir une **interface moderne et intuitive** inspirée de l’univers des compétitions esports.
- Garantir **une sécurité maximale** avec une authentification via Riot ID et des logs d’activité détaillés.
- Permettre un **hébergement autonome** via Docker et un serveur NGINX.

### **1.3 Public Cible**
- Les amateurs de compétitions **LoL Esports** souhaitant suivre les matchs et parier de manière ludique.
- Les joueurs intéressés par **une expérience compétitive** avec classements et badges.
- Les développeurs cherchant un projet open-source bien structuré en **Node.js et Vue.js/React**.

---

## **2. Architecture Technique**
### **2.1 Technologies Utilisées**
| Composant | Technologie |
|-----------|------------|
| **Backend** | Node.js (Express) |
| **Frontend** | Vue.js ou React |
| **Base de données** | MongoDB (stockage des paris et logs utilisateur) |
| **Authentification** | Riot ID |
| **Cache** | Redis (optimisation des appels API) |
| **Proxy inverse** | NGINX |
| **Déploiement** | Docker & Docker Compose |

### **2.2 Diagramme de l'Architecture**
L’application suit une architecture **client-serveur** avec une séparation claire entre l’API backend et l’interface utilisateur.

1. L'utilisateur s'authentifie via Riot ID.
2. L'API récupère les données de Riot et LoL Esports.
3. Les paris et les actions des utilisateurs sont enregistrés dans MongoDB.
4. Les informations sont mises en cache pour minimiser les appels aux API externes.
5. NGINX sert de proxy inverse pour sécuriser et gérer le trafic.

### **2.3 Sécurité et Conformité**
- **Protection des données** : Aucune donnée sensible de l'utilisateur n'est stockée.
- **Expiration des logs** : Les logs API expirent après 1 jour et les logs utilisateur après 1 mois.
- **Utilisation de certificats SSL** : Sécurisation des connexions avec **Certbot SSL**.

---

## **3. Plan de Développement**
### **3.1 Estimation du Temps de Développement**
| Phase | Tâche | Estimation |
|-------|------|------------|
| **Phase 1** | Développement de l’API | **2-3 semaines** |
| | Récupération des données Riot | 3 jours |
| | Récupération des matchs LoL Esports | 3 jours |
| | Mise en place du cache Redis | 2 jours |
| | Authentification Riot ID | 5 jours |
| **Phase 2** | Système de Paris & Base de Données | **3 semaines** |
| | Implémentation du système de paris | 5 jours |
| | Paris en duel | 5 jours |
| | Stockage des décisions dans MongoDB | 3 jours |
| | Classements et remise à zéro saisonnière | 4 jours |
| **Phase 3** | Développement du Frontend | **4 semaines** |
| | UI/UX en Vue.js ou React | 10 jours |
| | Intégration avec l’API | 5 jours |
| | Profils utilisateur & historique des paris | 5 jours |
| **Phase 4** | Déploiement & Optimisation | **2 semaines** |
| | Configuration de Docker & NGINX | 3 jours |
| | Sécurisation SSL avec Certbot | 2 jours |
| | Sécurisation des accès | 5 jours |

Durée totale estimée : **10-12 semaines**

---

## **4. UX/UI Design**
### **4.1 Expérience Utilisateur**
- **Thème sombre et design esports**.
- **Affichage des paris en direct et des résultats passés**.
- **Tableaux de bord interactifs** avec statistiques et classements.
- **Badges et tokens pour récompenser les succès**.

### **4.2 Code Snippet UI Vue.js**
```vue
<template>
  <div class="betting-container">
    <h2>Pariez sur votre équipe préférée</h2>
    <button @click="placeBet(teamA)">Parier sur {{ teamA.name }}</button>
    <button @click="placeBet(teamB)">Parier sur {{ teamB.name }}</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      teamA: { name: "G2 Esports" },
      teamB: { name: "T1" }
    };
  },
  methods: {
    placeBet(team) {
      console.log(`Pari placé sur ${team.name}`);
    }
  }
};
</script>
```

---

## **5. Déploiement & Hébergement**
### **5.1 Docker & Proxy NGINX**
L'API et le frontend seront déployés via **Docker** et un proxy **NGINX** assurera la gestion des requêtes.
Le projet est conçu pour être **scalable**, sécurisé et facilement administrable, tout en offrant une expérience immersive aux fans de LoL Esports.

---

## **7. Ressources Supplémentaires**
- **Documentation Riot API** : [developer.riotgames.com](https://developer.riotgames.com)
- **Guide NGINX et Docker** : [nginx.com](https://www.nginx.com/resources/)
- **MongoDB Atlas pour l'hébergement de bases de données** : [mongodb.com](https://www.mongodb.com/cloud/atlas)

