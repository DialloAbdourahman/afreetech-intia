# README — Déploiement de l’application (MVP)

## 1. Vue d’ensemble

Cette application de gestion des clients et assurances sera déployée sur AWS avec une architecture conteneurisée.

Le système est composé de :

- Frontend : application React
- Backend : API Node.js
- Base de données : AWS DocumentDB (compatible MongoDB)

Le déploiement est automatisé via une pipeline CI/CD avec GitHub Actions.

---

## 2. Architecture de déploiement

```txt
GitHub
  ↓
GitHub Actions (CI/CD)
  ↓
Build des images Docker
  ↓
Push vers AWS ECR
  ↓
Déploiement sur AWS ECS
  ↓
Base de données AWS DocumentDB
```
