# Comptes enseignant de démonstration

## Identifiants de connexion
- Email : enseignant@emit.mg
- Mot de passe : Enseignant2026!

## Ce qui a été ajouté
- Login enseignant basé sur l’interface existante
- Redirection automatique vers l’espace enseignant après connexion
- Affichage de l’emploi du temps de l’enseignant
- Action d’annulation d’un cours avec motif
- Historique automatique des cours annulés
- Création automatique d’un compte enseignant de démonstration au démarrage du backend si la base est accessible

## Notes importantes
- Le backend crée cet utilisateur automatiquement au démarrage si la base PostgreSQL est disponible.
- Si vous voulez changer les identifiants, modifiez les variables d’environnement suivantes dans le fichier [back/.env](back/.env) :
  - DEFAULT_TEACHER_EMAIL
  - DEFAULT_TEACHER_PASSWORD
  - DEFAULT_TEACHER_NAME
  - DEFAULT_TEACHER_IM
