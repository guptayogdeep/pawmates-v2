# PawMates Documentation

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Architecture](#architecture)
6. [Firebase Setup](#firebase-setup)
7. [Firestore Data Model](#firestore-data-model)
8. [Authentication](#authentication)
9. [State Management](#state-management)
10. [Routing](#routing)
11. [Pages](#pages)
12. [Components](#components)
13. [Service Layer](#service-layer)
14. [Design System](#design-system)
15. [User Flows](#user-flows)
16. [Firestore Security Rules](#firestore-security-rules)
17. [Firestore Indexes](#firestore-indexes)
18. [Environment Variables](#environment-variables)
19. [Scripts](#scripts)
20. [Future Roadmap](#future-roadmap)

---

## Overview

PawMates is a mobile-first web application that connects pet owners to arrange playdates for their pets. It uses a Tinder-style swipe interface where users browse pet profiles, like or pass, and when two pets mutually like each other, a match is created and the owners can chat in real time.

Key features:
- Email/password authentication
- Pet profile creation with photo upload
- Swipe-based pet discovery with drag animations
- Mutual matching system (both pets must like each other)
- Real-time messaging between matched pet owners
- Multi-pet support (up to 3 pets per account)
- Pet profile switching, editing, and photo management
- Persistent data via Firebase (survives page refresh)

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Firebase project (free tier works)

### Installation

```bash
git clone <repo-url>
cd pawmates
npm install
```

### Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com) and create a new project
2. Enable **Authentication** > Sign-in method > **Email/Password**
3. Create a **Cloud Firestore** database (start in test mode for development)
4. Enable **Storage** (start in test mode for development)
5. Go to Project Settings > General > Your apps > Add a **Web app**
6. Copy the config values into a `.env` file at the project root:

```
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### Run the App

```bash
npm run dev
```

The app runs at `http://localhost:5173` by default.

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| React | 19.2.5 | UI framework |
| Vite | 8.0.10 | Build tool and dev server |
| React Router DOM | 7.14.2 | Client-side routing |
| Firebase | 12.12.1 | Auth, database (Firestore), file storage |
| Framer Motion | 12.38.0 | Swipe gestures and animations |
| Lucide React | 1.14.0 | Icon library |
| ESLint | 10.2.1 | Code linting |

---

## Project Structure

```
pawmates/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── components/
│   │   ├── AuthNavbar.jsx        # Conditionally renders Navbar when authenticated
│   │   ├── MatchModal.jsx        # Match celebration overlay
│   │   ├── Navbar.jsx            # Bottom tab navigation
│   │   ├── PetSwitcher.jsx       # Horizontal pet selector (Profile page)
│   │   ├── ProtectedRoute.jsx    # Auth gate for protected routes
│   │   └── SwipeCard.jsx         # Draggable discovery card
│   ├── context/
│   │   ├── AppContext.jsx        # App-level state (discovery, matches, swipes)
│   │   └── AuthContext.jsx       # Auth state (user, pets, active pet)
│   ├── data/
│   │   └── dogs.js               # Legacy mock data (no longer imported)
│   ├── lib/
│   │   ├── authErrors.js         # Firebase auth error code → friendly message map
│   │   ├── firebase.js           # Firebase app initialization
│   │   ├── firestore.js          # All Firestore read/write operations
│   │   └── storage.js            # Firebase Storage image upload
│   ├── pages/
│   │   ├── Chat.jsx              # 1:1 real-time messaging
│   │   ├── Discover.jsx          # Swipe-based pet browsing
│   │   ├── Login.jsx             # Email/password login
│   │   ├── Matches.jsx           # Grid of matched pets
│   │   ├── Messages.jsx          # Conversation list
│   │   ├── Onboarding.jsx        # Pet profile creation
│   │   ├── Profile.jsx           # View/edit pet profile
│   │   └── Signup.jsx            # Account registration
│   ├── App.css                   # All component styles
│   ├── App.jsx                   # Root component with routing
│   ├── index.css                 # Design tokens and global reset
│   └── main.jsx                  # Entry point
├── .env.example                  # Environment variable template
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── roadmap.md
└── vite.config.js
```

---

## Architecture

The app follows a layered architecture:

```
┌─────────────────────────────────────────────┐
│                   Pages                      │
│  Login, Signup, Onboarding, Discover,        │
│  Matches, Messages, Chat, Profile            │
├─────────────────────────────────────────────┤
│                Components                    │
│  SwipeCard, MatchModal, Navbar,              │
│  PetSwitcher, ProtectedRoute, AuthNavbar     │
├─────────────────────────────────────────────┤
│             State (React Context)            │
│  AuthContext          │   AppContext          │
│  - user, pets         │   - discovery feed    │
│  - auth actions       │   - matches, swipes   │
├─────────────────────────────────────────────┤
│              Service Layer                   │
│  firestore.js    │  storage.js  │ firebase.js│
├─────────────────────────────────────────────┤
│                Firebase SDK                  │
│  Auth    │    Firestore    │    Storage       │
└─────────────────────────────────────────────┘
```

### Context Hierarchy

```
<BrowserRouter>
  <AuthProvider>         ← Auth state: user, pets, activePet
    <AppProvider>        ← App state: discovery, matches (consumes AuthContext)
      <Routes />
      <AuthNavbar />     ← Only renders when authenticated
    </AppProvider>
  </AuthProvider>
</BrowserRouter>
```

`AuthContext` wraps `AppContext` because the app-level data (discovery feed, matches) depends on knowing the current user and their active pet.

---

## Firebase Setup

### `src/lib/firebase.js`

Initializes the Firebase app using environment variables and exports three service instances:

| Export | Type | Purpose |
|---|---|---|
| `auth` | `Auth` | Firebase Authentication |
| `db` | `Firestore` | Cloud Firestore database |
| `storage` | `Storage` | Firebase Cloud Storage |

All other modules import from this file rather than calling `getAuth()`/`getFirestore()` directly.

---

## Firestore Data Model

### Collections

#### `users/{uid}`

The user document, created on signup.

| Field | Type | Description |
|---|---|---|
| `email` | string | User's email address |
| `activePetId` | string | ID of the currently active pet |
| `createdAt` | Timestamp | Account creation time |

#### `users/{uid}/pets/{petId}`

Private pet profiles owned by a user. Subcollection of the user document.

| Field | Type | Description |
|---|---|---|
| `name` | string | Pet's name |
| `breed` | string | Breed (e.g., "Golden Retriever") |
| `age` | number | Age in years |
| `gender` | string | "Male" or "Female" |
| `size` | string | "Small", "Medium", or "Large" |
| `bio` | string | Free-text description |
| `personality` | string[] | 1-5 trait tags (e.g., ["Playful", "Loyal"]) |
| `location` | string | City/area (e.g., "Brooklyn, NY") |
| `vaccinated` | boolean | Vaccination status |
| `neutered` | boolean | Neutered/spayed status |
| `imageUrls` | string[] | Firebase Storage download URLs |
| `createdAt` | Timestamp | Profile creation time |

#### `pets/{petId}`

Denormalized public copy of each pet, used for the discovery feed. Contains all the same fields as the user subcollection document plus:

| Field | Type | Description |
|---|---|---|
| `ownerId` | string | The `uid` of the pet's owner |

Both copies are always written/updated together using Firestore `writeBatch` to maintain consistency.

#### `swipes/{autoId}`

Records every swipe action (like or pass).

| Field | Type | Description |
|---|---|---|
| `fromPetId` | string | The pet that performed the swipe |
| `toPetId` | string | The pet being swiped on |
| `direction` | string | "like" or "pass" |
| `fromUserId` | string | Owner of the swiping pet |
| `toUserId` | string | Owner of the target pet |
| `createdAt` | Timestamp | When the swipe occurred |

#### `matches/{autoId}`

Created when two pets mutually like each other.

| Field | Type | Description |
|---|---|---|
| `petIds` | string[] | Array of exactly 2 pet IDs |
| `userIds` | string[] | Array of exactly 2 user IDs |
| `createdAt` | Timestamp | When the match occurred |

#### `matches/{matchId}/messages/{autoId}`

Messages within a match conversation. Subcollection of a match document.

| Field | Type | Description |
|---|---|---|
| `from` | string | Pet ID of the sender |
| `text` | string | Message content |
| `createdAt` | Timestamp | When the message was sent |

### Data Flow Diagram

```
User signs up
  └─> creates users/{uid}

User creates pet via Onboarding
  ├─> creates users/{uid}/pets/{petId}   (private copy)
  ├─> creates pets/{petId}                (public copy for discovery)
  └─> updates users/{uid}.activePetId

User swipes right on another pet
  ├─> creates swipes/{id} with direction: "like"
  └─> queries swipes to check if other pet already liked back
       └─> if yes: creates matches/{id} with both petIds and userIds

User sends a message
  └─> creates matches/{matchId}/messages/{id}
       └─> real-time listener (onSnapshot) delivers it to the other user
```

---

## Authentication

### `src/context/AuthContext.jsx`

Manages all authentication state and pet ownership data.

#### State

| State | Type | Description |
|---|---|---|
| `user` | `User \| null` | Firebase Auth user object |
| `loading` | boolean | True until `onAuthStateChanged` resolves |
| `pets` | object[] | Array of the user's pet profiles |
| `activePetId` | string \| null | ID of the currently selected pet |
| `activePet` | object \| null | Derived: the full pet object for `activePetId` |

#### Actions

| Action | Signature | Description |
|---|---|---|
| `signup` | `(email, password) => Promise<User>` | Creates Firebase Auth user + Firestore user document |
| `login` | `(email, password) => Promise<User>` | Signs in with email/password |
| `logout` | `() => Promise<void>` | Signs out |
| `setActivePet` | `(petId) => Promise<void>` | Switches the active pet (updates Firestore) |
| `refreshPets` | `() => Promise<void>` | Re-fetches the user's pets from Firestore |

#### Lifecycle

On app load, `onAuthStateChanged` fires:
- If user is authenticated: fetches their `users/{uid}` document (for `activePetId`) and their pets subcollection
- If user is not authenticated: clears all state

### `src/lib/authErrors.js`

Maps Firebase auth error codes to user-friendly messages:

| Error Code | Friendly Message |
|---|---|
| `auth/email-already-in-use` | "An account with this email already exists" |
| `auth/invalid-email` | "Please enter a valid email address" |
| `auth/weak-password` | "Password must be at least 6 characters" |
| `auth/user-not-found` | "No account found with this email" |
| `auth/wrong-password` | "Incorrect password" |
| `auth/invalid-credential` | "Invalid email or password" |
| `auth/too-many-requests` | "Too many attempts. Please try again later" |

### `src/components/ProtectedRoute.jsx`

A wrapper component that guards protected routes:

1. If `loading` is true: shows a loading spinner
2. If `user` is null: redirects to `/login`
3. If `pets` is empty: redirects to `/onboarding`
4. Otherwise: renders children

---

## State Management

The app uses two React Context providers, each with a distinct responsibility.

### AuthContext (who is logged in)

Owns: `user`, `pets`, `activePetId`, `activePet`

Consumed by: every page and most components (via `useAuth()`)

### AppContext (what the user sees)

Owns: `discoveryPets`, `currentDog`, `matches`, `showMatch`, `loading`

Consumed by: Discover, Matches, Messages, Chat, Navbar (via `useApp()`)

#### AppContext Data Loading

When `user` or `activePetId` changes, AppContext runs a parallel fetch:

```
Promise.all([
  fetchDiscoveryPets(uid),        // all public pets, filtered to exclude own
  fetchSwipedPetIds(activePetId), // already-swiped pet IDs
  fetchUserMatches(uid),          // all matches involving this user
])
```

Discovery pets are then filtered to remove already-swiped pets. Matches are enriched by fetching the other pet's full profile via `fetchPetById`.

#### Swipe Flow

**Swipe Right (Like):**
1. Optimistically advance `currentIndex` to show next card
2. Record swipe in Firestore (`direction: "like"`)
3. Check if the other pet already liked this pet (`checkForMatch`)
4. If mutual: create a match document, add to local state, show match modal

**Swipe Left (Pass):**
1. Advance `currentIndex`
2. Record swipe in Firestore (`direction: "pass"`)

---

## Routing

| Path | Page | Auth | Description |
|---|---|---|---|
| `/login` | Login | Public | Email/password login form |
| `/signup` | Signup | Public | Account registration form |
| `/onboarding` | Onboarding | Semi-protected | Pet profile creation (requires auth, no pets needed) |
| `/` | Discover | Protected | Swipe-based pet browsing |
| `/matches` | Matches | Protected | 2-column grid of matched pets |
| `/messages` | Messages | Protected | List of active conversations |
| `/chat/:id` | Chat | Protected | 1:1 messaging (`:id` is a Firestore match ID) |
| `/profile` | Profile | Protected | View/edit pet profile with pet switcher |

The bottom Navbar is only visible on protected routes (handled by `AuthNavbar`).

---

## Pages

### Login (`/login`)

Centered card with PawMates logo, email and password inputs, "Log In" button, and link to signup. Shows inline error messages for auth failures. Redirects to `/` if already authenticated.

### Signup (`/signup`)

Same layout as Login with an additional "Confirm Password" field. Creates both a Firebase Auth account and a Firestore user document. Redirects to `/onboarding` after success (via ProtectedRoute, since user has no pets).

### Onboarding (`/onboarding`)

Full pet creation form with:
- **Photo upload**: Tap-to-select with live preview. Uploads to Firebase Storage on form submission.
- **Fields**: Name, breed, age, gender, size, bio, location
- **Personality selector**: Grid of 12 toggleable tags (max 5). Options: Playful, Friendly, Energetic, Chill, Cuddly, Vocal, Independent, Loyal, Smart, Adventurous, Gentle, Bold
- **Toggles**: Vaccinated, Neutered/Spayed

Behavior:
- First pet: header says "Create Your Pet's Profile", redirects to `/` after creation
- Additional pet: header says "Add Another Pet", shows Cancel button, redirects to `/profile`
- Blocked at 3 pets: redirects to `/profile`

### Discover (`/`)

The main swipe screen. Shows one pet card at a time with the PawMates logo header. Cards are draggable horizontally via Framer Motion.

- Drag right > 100px: triggers like
- Drag left > 100px: triggers pass
- Below threshold: snaps back
- "WOOF!" and "NOPE" stamps appear with opacity linked to drag distance
- Two action buttons below the card: Pass (X icon) and Like (Heart icon)
- Match modal appears on mutual likes

Empty state: "No more pups nearby!" with a dog emoji.

### Matches (`/matches`)

2-column grid of matched pets. Each card shows the pet's photo with a gradient overlay displaying name and breed. Tapping a card navigates to `/chat/{matchId}`.

Empty state: "No matches yet" with a broken heart emoji.

### Messages (`/messages`)

Vertical list of conversations. Each item shows avatar, pet name, last message preview (truncated), and timestamp. Sorted by most recent message. Tapping navigates to `/chat/{matchId}`.

Conversations are loaded by querying the last message from each match's messages subcollection.

Empty state: "No conversations yet" with a chat emoji.

### Chat (`/chat/:id`)

Real-time messaging screen. Features:
- **Header**: Back arrow, pet avatar, name, breed
- **Messages**: Scrollable list with auto-scroll to latest. Sent messages (coral, right-aligned) vs received messages (white, left-aligned) determined by comparing `msg.from` with `activePetId`
- **Input**: Text field + circular send button. Send button disabled when input is empty
- **Real-time**: Uses Firestore `onSnapshot` for live message updates

### Profile (`/profile`)

Two-mode profile viewer with pet management:

**View Mode:**
- Pet Switcher (horizontal avatar row with active pet highlighted, "+" button for adding pets)
- Profile card: photo with camera button overlay, name, age, breed, location, bio, personality tags, vaccination/neutered badges
- "Edit Profile" button
- "Log Out" button at bottom

**Edit Mode:**
- Form fields: name, breed, age, size, bio, location
- Save/Cancel buttons
- Saves to both Firestore locations (user subcollection + public collection)

**Photo Upload:** Camera button triggers a hidden file input. The uploaded image replaces the first image in `imageUrls`.

---

## Components

### SwipeCard

**Props:** `dog`, `onSwipeLeft`, `onSwipeRight`

Draggable pet card using Framer Motion. Features:
- Horizontal drag with elastic constraint and rotation
- Image carousel: tap image to cycle through photos (dots indicator)
- Expandable card info: tap header to toggle bio, personality tags, badges
- Swipe stamps: "WOOF!" (right) and "NOPE" (left) with opacity tied to drag distance
- Drag threshold: 100px to trigger swipe action

### MatchModal

**Props:** `match` (object with `matchId` and `pet`), `onDismiss`

Full-screen overlay with spring animation. Shows:
- "It's a Match!" gradient title
- Side-by-side circular avatars (your pet + matched pet) with paw emoji between
- "Send a Woof!" button (navigates to chat)
- "Keep Sniffing" button (dismisses)

Uses `useAuth()` to get the active pet's avatar for the left circle.

### Navbar

Fixed bottom navigation with 4 tabs:
- Discover (Dog icon) — `/`
- Matches (Heart icon) — `/matches` — badge showing match count
- Chat (MessageCircle icon) — `/messages`
- Profile (User icon) — `/profile`

Active tab highlighted in primary color. Uses React Router's `NavLink` with `isActive`.

### AuthNavbar

Wrapper that only renders `<Navbar />` when the user is authenticated and has at least one pet.

### PetSwitcher

Horizontal scrollable row of pet avatars. Used on the Profile page.
- Active pet has a coral border ring
- Tapping a pet calls `setActivePet(petId)` which updates Firestore and triggers AppContext to reload data
- "+" button navigates to `/onboarding` (disabled at 3 pets)

### ProtectedRoute

Auth gate component. Checks auth state and redirects accordingly. Shows a loading spinner while auth state is resolving.

---

## Service Layer

### `src/lib/firestore.js`

All Firestore operations are centralized here. No component talks to Firestore directly — they go through this module or the context providers.

#### Pet Operations

| Function | Signature | Description |
|---|---|---|
| `createPet` | `(userId, petData) => petId` | Creates pet in both locations (batch write), sets as active |
| `fetchUserPets` | `(userId) => pet[]` | Gets all pets from user subcollection |
| `fetchPetById` | `(petId) => pet \| null` | Gets a single pet from the public collection |
| `updatePet` | `(userId, petId, data) => void` | Updates both copies (batch write) |

#### Discovery Operations

| Function | Signature | Description |
|---|---|---|
| `fetchDiscoveryPets` | `(excludeOwnerId) => pet[]` | Gets all public pets except the user's own |
| `fetchSwipedPetIds` | `(fromPetId) => Set<string>` | Gets IDs of all pets already swiped on |
| `recordSwipe` | `(fromPetId, toPetId, direction, fromUserId, toUserId) => ref` | Creates a swipe document |
| `checkForMatch` | `(fromPetId, toPetId) => boolean` | Checks if the other pet already liked this one |
| `createMatch` | `(petId1, petId2, userId1, userId2) => ref` | Creates a match document |

#### Match Operations

| Function | Signature | Description |
|---|---|---|
| `fetchUserMatches` | `(userId) => match[]` | Gets all matches where user is a participant |

#### Message Operations

| Function | Signature | Description |
|---|---|---|
| `sendMessageToMatch` | `(matchId, fromPetId, text) => ref` | Creates a message in the match subcollection |
| `subscribeToMessages` | `(matchId, callback) => unsubscribe` | Real-time listener on messages, ordered by time |

#### Data Normalization

The internal `normalizePet` function maps Firestore documents to the app's expected shape, aliasing `imageUrls` to `images` for backward compatibility with components that use `dog.images[0]`.

### `src/lib/storage.js`

| Function | Signature | Description |
|---|---|---|
| `uploadPetImage` | `(petId, file) => downloadUrl` | Uploads a file to `pets/{petId}/{timestamp}_{filename}` and returns the download URL |

---

## Design System

### Design Tokens (`src/index.css`)

| Token | Value | Usage |
|---|---|---|
| `--primary` | `#ff6b6b` | Coral red — primary actions, buttons, links |
| `--primary-dark` | `#e55a5a` | Hover state for primary |
| `--primary-light` | `#ff8a8a` | Focus rings, gradients |
| `--secondary` | `#feca57` | Yellow — accent highlights |
| `--accent` | `#48dbfb` | Light blue — unused currently |
| `--success` | `#00d2d3` | Teal — "like" stamp, verified badges |
| `--bg` | `#faf9f7` | Off-white page background |
| `--card-bg` | `#ffffff` | White card surfaces |
| `--text` | `#2d3436` | Primary text |
| `--text-light` | `#636e72` | Secondary text |
| `--text-muted` | `#b2bec3` | Tertiary text, placeholders |
| `--border` | `#eee` | Dividers, input borders |
| `--shadow` | `0 4px 20px rgba(0,0,0,0.08)` | Cards |
| `--shadow-lg` | `0 10px 40px rgba(0,0,0,0.12)` | Elevated elements |
| `--radius` | `16px` | Card border radius |
| `--radius-sm` | `10px` | Button border radius |

### Typography

**Font:** Nunito (Google Fonts) — weights 400, 600, 700, 800

### Layout

- **Viewport:** 430px max-width, centered. Mobile-first design.
- **App shell:** Flex column, 100dvh. Content area scrolls, Navbar fixed at bottom.
- **Navbar height:** 72px (content has `padding-bottom: 72px` to avoid overlap)
- **Safe area:** Navbar uses `env(safe-area-inset-bottom)` for devices with home indicators

### Button Variants

| Class | Style |
|---|---|
| `.btn-primary` | Coral gradient, white text, full-width |
| `.btn-secondary` | Transparent, gray border, full-width |
| `.btn-danger` | Transparent, coral border, coral text (hover fills) |
| `.action-btn.like` | Coral circle, white heart icon |
| `.action-btn.pass` | White circle, coral X icon |

### Common Patterns

- **Empty states:** Centered column with 64px emoji icon, bold heading, muted subtitle
- **Loading states:** Centered spinner (40px, coral top border, rotating)
- **Page headers:** Sticky with blur backdrop (`backdrop-filter: blur(20px)`)
- **Form groups:** Label + input stack with 4px gap
- **Tags:** Pill-shaped with gradient background, bold text

---

## User Flows

### New User Registration

```
1. User visits app
2. ProtectedRoute redirects to /login
3. User clicks "Sign up" link → /signup
4. User enters email, password, confirm password
5. On submit:
   a. Firebase Auth creates user
   b. Firestore creates users/{uid} document
   c. onAuthStateChanged fires → AuthContext updates
   d. ProtectedRoute detects no pets → redirects to /onboarding
6. User fills pet profile form, optionally uploads photo
7. On submit:
   a. Photo uploaded to Firebase Storage
   b. Pet created in users/{uid}/pets/{petId} and pets/{petId}
   c. users/{uid}.activePetId set
   d. Redirects to / (Discover)
```

### Discovery and Matching

```
1. AppContext loads:
   a. Fetches all public pets (excluding own)
   b. Fetches already-swiped pet IDs
   c. Filters to show only unswiped pets
2. User sees first pet card
3. User drags card right (or taps Like button)
4. Swipe recorded in Firestore
5. System checks: did the other pet already like us?
   a. No → advance to next card
   b. Yes → match created, match modal shown
6. User taps "Send a Woof!" → navigates to /chat/{matchId}
```

### Messaging

```
1. User navigates to /chat/{matchId}
2. onSnapshot listener subscribes to matches/{matchId}/messages
3. Existing messages render immediately
4. User types and sends a message
5. Message written to Firestore
6. onSnapshot fires on both users' devices → message appears in real-time
7. Auto-scroll to latest message
```

### Pet Switching

```
1. User goes to /profile
2. PetSwitcher shows all pets with active pet highlighted
3. User taps a different pet avatar
4. AuthContext updates activePetId in state and Firestore
5. AppContext detects activePetId change → re-fetches:
   a. New discovery feed (different swiped history)
   b. New matches (for the new pet)
6. UI updates across all pages
```

---

## Firestore Security Rules

Recommended rules for production (configure in Firebase Console > Firestore > Rules):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users can only read/write their own user doc
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;

      match /pets/{petId} {
        allow read, write: if request.auth.uid == userId;
      }
    }

    // Anyone authenticated can read pets for discovery
    // Only the owner can write
    match /pets/{petId} {
      allow read: if request.auth != null;
      allow create: if request.auth.uid == request.resource.data.ownerId;
      allow update: if request.auth.uid == resource.data.ownerId;
    }

    // Swipes: authenticated users can create, only read own
    match /swipes/{swipeId} {
      allow create: if request.auth != null;
      allow read: if request.auth.uid == resource.data.fromUserId;
    }

    // Matches: participants can read and create
    match /matches/{matchId} {
      allow read: if request.auth.uid in resource.data.userIds;
      allow create: if request.auth != null;

      match /messages/{messageId} {
        allow read, create: if request.auth.uid in
          get(/databases/$(database)/documents/matches/$(matchId)).data.userIds;
      }
    }
  }
}
```

---

## Firestore Indexes

Firestore will auto-prompt you to create these indexes when queries first execute (a link appears in the browser console error):

| Collection | Fields | Purpose |
|---|---|---|
| `swipes` | `fromPetId` ASC | Fetch swiped pet IDs |
| `swipes` | `fromPetId` ASC, `toPetId` ASC, `direction` ASC | Match checking |
| `matches` | `userIds` (array-contains) | Fetch user's matches |
| `matches/{id}/messages` | `createdAt` ASC | Ordered message history |

---

## Environment Variables

All environment variables are prefixed with `VITE_` (required by Vite for client-side access via `import.meta.env`).

| Variable | Description |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase Web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage bucket URL |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Cloud Messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |

The `.env` file is gitignored. Use `.env.example` as a template.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint on all source files |

---

## Future Roadmap

See `roadmap.md` for the full 5-phase product roadmap. Upcoming phases include:

- **Phase 2 — Core Experience:** Smart matching algorithm, filters, real geolocation, push notifications, playdate scheduling
- **Phase 3 — Trust & Safety:** Profile verification, report/block, verified vaccination badges, owner ratings
- **Phase 4 — Engagement:** Playdate history, park finder, photo sharing, breed groups, activity feed
- **Phase 5 — Growth:** PWA/native app, freemium monetization, partner integrations, multi-city expansion, multi-pet-type support (cats, rabbits, etc.)
