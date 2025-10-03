# OceanFin Backend API

---
## 1. What is this project?
OceanFin Backend is a web service (an API) built with Node.js using the NestJS framework. Right now it has features for Users. Later it will have finance (DeFi) features.

Other apps (Mobile / Web) can call addresses like:
```
GET http://localhost:3000/users
```
to read or create user data.

---
## 2. Folder structure (plain view)
```
src/
  main.ts          -> Starts the app
  app.module.ts    -> Wires parts together
  shared/          -> Shared things (Supabase connection)
  users/           -> Everything about Users
    interfaces/    -> API layer (Controller) + data shapes (DTOs)
    application/   -> Logic layer (Service, Mapper)
    domain/        -> Core model (User) + repository contract
    infrastructure/-> Real database code (Supabase)
```
Remember:
- Change an API? Edit `users/interfaces/user.controller.ts`
- Change logic? Edit `users/application/user.service.ts`

---
## 3. Run the project
Need: Node.js version 18 or newer. In a terminal run:

Step 1: Install packages
```bash
npm install
```
Step 2: Create a file named `.env.development`
```
NODE_ENV=development
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key
PORT=3000
```
If you do not have Supabase: go to https://supabase.com, create a project, copy Project URL and a key (service_role for full or anon for testing).

Step 3: Start in watch mode (reloads on save)
```bash
npm run start:dev
```
Open the docs in your browser:
```
http://localhost:3000/api/docs
```
This page lets you test the API directly.

---
## 4. Current User APIs
| Action | Method | Path | Send Body? | Returns |
|--------|--------|------|-----------|---------|
| Create user | POST | /users | `{ walletAddress, chainId, username? }` | New user info |
| Get one user | GET | /users/:id | No | User info |
| List users | GET | /users | No | List of users |
| Change username | PUT | /users/:id | `{ username }` | Updated user |

Example create user (POST /users):
```json
{
  "walletAddress": "0x1234567890...",
  "chainId": 1,
  "username": "Alice"
}
```

---
## 5. How to add a new API (example: DELETE /users/:id)
1. Open: `src/users/interfaces/user.controller.ts`
2. Add a function with `@Delete(':id')`
3. Call a service method (add one in `user.service.ts` if missing)
4. If service needs DB actions: add method in `user.repository.ts` and implement in `user.repository.impl.ts`
5. Need new response shape? Add or change a DTO in `users/interfaces/dtos`

Tip: Copy an existing method and adjust.

---
## 6. Main building blocks (simple words)
| Thing | What it does | File example |
|-------|--------------|--------------|
| Controller | Receives HTTP request and returns result | `user.controller.ts` |
| DTO | Defines shape of data in/out + validates it | `create-user.dto.ts` |
| Service | Business logic | `user.service.ts` |
| Entity | Core object in the system | `user.entity.ts` |
| Repository | Interface (contract) for data store | `user.repository.ts` |
| Repository Impl | Real DB code | `user.repository.impl.ts` |
| Supabase Service | Creates Supabase client | `supabase.service.ts` |
| Mapper | Converts between Entity and DTO | `user.mapper.ts` |

---
## 7. Add a new field to User (example: email)
1. Add `email` in `user.entity.ts`
2. Add field in needed DTOs: `create-user.dto.ts` (if input) + `user-response.dto.ts`
3. Update mapper `user.mapper.ts` (if needed)
4. Update repository implementation `user.repository.impl.ts`
5. Update database table in Supabase:
```sql
alter table users add column email text;
```
6. Test in Swagger again.

---
## 8. About user IDs
Now the ID is made with time + random text. For real use, change to a UUID.
Edit `user.service.ts`:
```ts
import { randomUUID } from 'crypto';
private generateId(): string { return randomUUID(); }
```

---
## 9. Run tests
Run all tests:
```bash
npm run test
```
Watch mode:
```bash
npm run test:watch
```
(Currently few tests. You can add for `user.service.ts`.)

---
## 10. Common errors
| Error | Reason | Fix |
|-------|--------|-----|
| SUPABASE_URL or SUPABASE_KEY is not defined | Missing env vars | Check `.env.development` |
| 404 Not Found | Wrong path or server not running | Check terminal output |
| 500 Internal Server Error | Logic or DB error | Read terminal stack trace |
| Swagger not loading | Wrong URL | Use `http://localhost:3000/api/docs` |

---
## 11. Simple roadmap
- Save `username` and timestamps in DB (if not yet)
- Add auth (wallet signature or JWT)
- Add logging + health check endpoint
- Switch to UUID
- Add tests for UserService

---
## 12. Quick glossary
| Word | Simple meaning |
|------|----------------|
| API | A door to get or send data |
| Endpoint | One API address (like /users) |
| DTO | Data shape with rules |
| Entity | Real model object (User) |
| Repository | Middle layer to talk to database |
| Module | Group of related code in NestJS |
| Swagger | Web page to try and see APIs |

---
## 13. First steps for a new person
1. Run the project
2. Create a user in Swagger
3. Change ID method to UUID
4. Add email field
5. Write a simple test for create user

---
## 14. Where to ask
- Team chat (Slack / Zalo / Discord)
- Open an issue in the repo (if the team allows)

---
## 15. Technical details (for developers)
> Skip if you are non-technical.

- Stack: NestJS 11, Supabase, class-validator, class-transformer, Swagger, Jest
- Mapping: `UserMapper` + `class-transformer`
- Config pattern: loads `.env.<NODE_ENV>` via `@nestjs/config`
- Swagger: `/api/docs`
- Clean layering: domain / application / infrastructure / interfaces / shared

---
Update this README when you add new modules
