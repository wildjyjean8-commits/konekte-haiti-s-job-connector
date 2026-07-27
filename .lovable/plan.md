## TRAVAY — plateforme d'emploi pour Haïti

Application full-stack (TanStack Start + Lovable Cloud) connectant institutions et chercheurs d'emploi, mobile-first, bilingue Créole/Français.

### Phase 1 — Fondations
- Activation de Lovable Cloud (base de données, authentification, stockage de fichiers, emails).
- Design system TRAVAY : palette chaleureuse haïtienne (bleu cobalt, rouge corail, ocre/or, sable), typographie moderne, composants mobile-first.
- Données de référence : 10 départements d'Haïti + leurs communes, liste extensible de secteurs d'activité.
- Sélecteur de langue Créole/Français (traductions dans toute l'interface).

### Phase 2 — Comptes et profils
- Inscription/connexion par email et par téléphone (SMS), choix du rôle : chercheur d'emploi ou institution.
- Profil chercheur : nom, photo, compétences, expériences, formations, secteur, département/commune, disponibilité, langues.
- Profil institution : nom, logo, secteur, description, département/commune, site web, contacts (téléphone/WhatsApp avec option « rendre public »).
- CV : upload PDF/Word (limite de taille, message d'erreur clair), remplacement à tout moment, génération d'un CV simple en PDF à partir du profil.

### Phase 3 — Offres et candidatures
- Publication, modification, fermeture d'offres par les institutions.
- Recherche et filtres : secteur, département, commune, type de contrat, niveau d'expérience.
- Candidature en un clic avec message d'accompagnement ; le CV est joint automatiquement.
- Statuts de candidature (reçue, en examen, entretien, acceptée, refusée) visibles par le candidat.
- Offres sauvegardées, historique des interactions, compteur de vues.

### Phase 4 — Connexion sans blocage
- Messagerie interne en temps réel avec historique de conversation.
- Notifications in-app en temps réel + notifications email (nouvelle candidature, nouveau message, offre correspondante).
- Alertes automatiques par secteur/département/commune.
- Annuaire des chercheurs d'emploi consultable par les institutions, avec contact direct.
- Bouton « Contacter directement » (téléphone/WhatsApp si public).
- Recommandations professionnelles par un tiers.

### Phase 5 — Tableaux de bord
- Institution : offres publiées, candidatures reçues avec filtres, statistiques de vues, messages.
- Chercheur : candidatures envoyées et leurs statuts, offres sauvegardées, alertes actives, messages.

### Détails techniques
- Base de données : tables `profiles`, `job_seeker_profiles`, `institutions`, `jobs`, `applications`, `conversations`, `messages`, `notifications`, `job_alerts`, `saved_jobs`, `recommendations`, `user_roles` (rôles dans une table séparée, jamais sur le profil).
- RLS activée partout avec GRANTs explicites ; le CV et les logos dans des buckets de stockage (CV en bucket privé avec URLs signées, logos en public).
- Temps réel via les abonnements Realtime pour messages et notifications.
- Emails transactionnels via l'infrastructure email de Lovable (nécessite un domaine que vous possédez ; l'app fonctionne sans, les emails s'activent après vérification DNS).
- Logique serveur via server functions TanStack, pas d'edge functions.

### Livraison
Je construis les phases dans l'ordre, en commençant par un socle utilisable rapidement (voir/publier des offres), puis j'ajoute messagerie, notifications et tableaux de bord.
