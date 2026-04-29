# Firestore Security

EduNize stores user data under `users/{userId}/{collectionName}` through `FirestoreService`.

The bundled `firestore.rules` file allows authenticated users to read and write only their own user document and nested collections. It covers the current app collections:

- `tasks`
- `subjects`
- `timetable`
- `grades`
- `dailyStats`
- `achievements`
- `notifications`
- `settings`
- `pomodoro`

Deploy with:

```bash
firebase deploy --only firestore:rules
```

Before deploying to production, add stricter schema validation for each collection so malformed client data cannot be written even by the owning user.
