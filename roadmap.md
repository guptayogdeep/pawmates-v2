# PawMates Product Roadmap

## Current State (What's Built)
- React + Vite frontend (mobile-first, 430px max-width)
- Swipe-based discovery with Framer Motion animations
- Match system (random 60% match rate)
- Basic messaging with auto-replies
- Pet profile page (view/edit)
- Bottom tab navigation (Discover, Matches, Messages, Profile)
- 10 hardcoded dog profiles, no backend, all state in-memory

---

## Phase 1 — Foundation (Weeks 1-3)
**Goal: Make it a real, usable product**

| Feature | Why it matters |
|---|---|
| **Auth & onboarding** | Users need accounts. Email/Google sign-up, onboarding flow to create their pet's profile with photo upload |
| **Backend + database** | Replace hardcoded dogs.js and in-memory state. Supabase or Firebase for auth, profiles, messages, matches |
| **Image upload** | Profile photo upload to cloud storage (S3/Cloudinary) instead of Unsplash URLs |
| **Persistent state** | Matches, messages, and profile survive page refresh |
| **Multi-pet support** | Users may own more than one pet — let them create and switch between profiles |

---

## Phase 2 — Core Experience (Weeks 4-6)
**Goal: Make matching meaningful, not random**

| Feature | Why it matters |
|---|---|
| **Smart matching algorithm** | Replace `Math.random()`. Match based on size compatibility, energy level, distance, temperament |
| **Filters & preferences** | Filter by breed, size, distance radius, age range, energy level |
| **Location services** | Real geolocation for distance calculation, not hardcoded values |
| **Real-time messaging** | WebSocket-based chat (or Supabase Realtime) instead of fake auto-replies |
| **Push notifications** | New match, new message, someone liked your pet |
| **Playdate scheduling** | In-chat date/time picker to propose a meetup at a park or location |

---

## Phase 3 — Trust & Safety (Weeks 7-9)
**Goal: Build trust between pet owners**

| Feature | Why it matters |
|---|---|
| **Profile verification** | Vet record upload, photo verification to confirm real pets (not fake profiles) |
| **Report & block** | Report inappropriate profiles, block users |
| **Vaccination badges** | Verified vaccination status (not just self-reported checkboxes) |
| **Owner ratings** | After a playdate, owners rate each other. Builds community trust |
| **Content moderation** | Flag inappropriate photos/bios |

---

## Phase 4 — Engagement & Retention (Weeks 10-13)
**Goal: Keep users coming back**

| Feature | Why it matters |
|---|---|
| **Playdate history** | Log past meetups, favorite playmates, recurring buddies |
| **Park finder / map view** | Show nearby dog-friendly parks as suggested meetup spots |
| **Photo sharing** | Share playdate photos in chat or on a pet's public profile |
| **"Super Woof"** | Premium like that notifies the other owner immediately (monetization hook) |
| **Breed-specific groups** | Community spaces for breed groups (e.g., "NYC Corgi Club") |
| **Activity feed** | See what your matches are up to — new photos, playdate check-ins |

---

## Phase 5 — Growth & Monetization (Weeks 14-18)
**Goal: Scale and sustain**

| Feature | Why it matters |
|---|---|
| **PWA / native app** | Install on home screen, or build with React Native/Expo for App Store |
| **Freemium model** | Free: limited swipes/day. Premium: unlimited swipes, see who liked you, Super Woof, ad-free |
| **Partner integrations** | Local pet stores, groomers, vets as sponsored profiles/ads |
| **Multi-city expansion** | Launch beyond NYC — city-based discovery and recommendations |
| **Analytics dashboard** | Track user engagement, match rates, message response times, retention |
| **Expand beyond dogs** | Cats, rabbits, other pets — configurable pet type on profile |

---

## Key Metrics to Track
- **Activation rate** — % of sign-ups that complete a profile + first swipe
- **Match-to-message rate** — % of matches that lead to a conversation
- **Message-to-meetup rate** — % of conversations that result in a scheduled playdate
- **D7/D30 retention** — are owners coming back?
- **Swipes per session** — engagement depth

## Biggest Risk
The product is only as good as its local density of users. A user who opens the app and sees 3 dogs in their area will churn. Phase 1 should include a waitlist/launch strategy focused on one neighborhood (e.g., Brooklyn) before expanding.
