# NomadWise (React + Firebase)

Мультивалютные кошельки и обмен валют в стиле Wise.
**Стек:** React 19 + TypeScript + Vite + Tailwind · Firebase Authentication · Cloud Firestore.
Java и MySQL убраны: «бэкенд» и база данных теперь Firebase.

## 1. Настройка Firebase (один раз)

1. [console.firebase.google.com](https://console.firebase.google.com) → **Add project**.
2. **Build → Authentication → Get started → Sign-in method → Email/Password → Enable**.
3. **Build → Firestore Database → Create database** (режим *production*).
4. Вкладка **Rules** в Firestore → вставь содержимое файла `firestore.rules` → **Publish**.
5. **Project settings (⚙) → General → Your apps → Web (`</>`)** → зарегистрируй приложение и скопируй значения `firebaseConfig`.
6. Скопируй `.env.example` в `.env` и вставь значения:
   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```
   Если сайт открывается с надписью «Firebase не настроен», значит ключи не подхватились.
   Ключи подставляются при **сборке**, после изменения `.env` пересобери сайт.

## 2. Запуск

### Вариант A: обычная разработка
```bash
npm install
npm run dev          # http://localhost:3000
```

### Вариант B: Live Server (VS Code)
Live Server раздаёт готовые файлы, а проект на React/TS нужно сначала собрать:
```bash
npm install
npm run build:watch  # собирает в dist/ и пересобирает при каждом изменении кода
```
Затем в VS Code: правый клик по `dist/index.html` → **Open with Live Server**
(в `.vscode/settings.json` корнем Live Server уже указана папка `dist`).
Если делаешь без `build:watch`, запусти `npm run build` один раз.

### Вариант C: Docker
```bash
docker compose up --build    # http://localhost:3000
```
`docker-compose.yml` берёт ключи из `.env` и вшивает их в сборку. Без compose:
```bash
docker build -t nomadwise \
  --build-arg VITE_FIREBASE_API_KEY=... \
  --build-arg VITE_FIREBASE_AUTH_DOMAIN=... \
  --build-arg VITE_FIREBASE_PROJECT_ID=... \
  --build-arg VITE_FIREBASE_STORAGE_BUCKET=... \
  --build-arg VITE_FIREBASE_MESSAGING_SENDER_ID=... \
  --build-arg VITE_FIREBASE_APP_ID=... .
docker run -p 3000:80 nomadwise
```

### Деплой (Vercel и т.п.)
Build command: `npm run build`, output: `dist`. Те же шесть переменных `VITE_FIREBASE_*`
добавь в Environment Variables хостинга. В Firebase → Authentication → Settings → **Authorized domains**
добавь домен сайта.

## 3. Как данные лежат в Firestore

| Коллекция | Что хранит |
|---|---|
| `users/{uid}` | профиль (имя, телефон, страна, основная валюта) |
| `wallets/{id}` | кошельки/карты (`userId`, валюта, баланс, номер карты, заморозка) |
| `transactions/{id}` | история операций (обмен, пополнение), только создаётся |

Обмен валюты выполняется в `runTransaction` (`src/context/AppContext.tsx`): списание, зачисление
и запись в историю происходят атомарно, как `@Transactional` раньше.

## 4. Важно про безопасность

Это учебный/демо-проект: суммы пересчитываются в браузере, а правила Firestore проверяют только
владельца данных. Пользователь с открытой консолью теоретически может подправить свой баланс.
Для реальных денег логику обмена нужно перенести в Cloud Functions и запретить клиенту писать `balance`.
