# Testing Setup

Current verification commands:

```bash
npm run lint
npm run build
```

Recommended test coverage to add next:

- Auth state transitions: logged out, logged in, account deletion error handling.
- Task CRUD: add, complete, uncomplete, delete, overdue state.
- Grade calculations: college CGPA and school percentage modes.
- Pomodoro state: start, pause, reset, session completion.
- Subject resources: links, videos, file upload validation.

For component tests, add Vitest with React Testing Library. For Firebase-heavy flows, mock `FirestoreService` instead of hitting live Firebase in unit tests.
