# Property Manage

MVP mobile app for a single owner managing guesthouses and apartments. Built with Expo, Firebase (Firestore + Anonymous Auth), and Zustand.

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Firebase**

   - Create a project at [Firebase Console](https://console.firebase.google.com).
   - Enable **Anonymous** sign-in: Authentication → Sign-in method → Anonymous → Enable.
   - Register a web app and copy the config into `.env` (see `.env.example`).

3. **Environment**

   ```bash
   cp .env.example .env
   ```

   Fill `.env` with your Firebase config (all `EXPO_PUBLIC_*` vars).

4. **Firestore**

   - Create Firestore database (test or production).
   - Optional: add seed data for **properties** and **units** so you can add guests (or add documents manually in the console).

   Example seed:

   - Collection `properties`: document with fields `name`, `city`.
   - Collection `units`: documents with `propertyId`, `name` (where `propertyId` is a property document ID).

5. **Run**

   ```bash
   npx expo start
   ```

   Then scan with Expo Go (iOS/Android) or press `i`/`a` for simulator.

## App structure

- **Home (Today)** – Today’s check-ins/check-outs, occupied count, links to Guests/Properties, FAB to Add Guest.
- **Guests** – List (by check-in), tap for detail.
- **Properties** – List, tap for property detail (units and current guest per unit).
- **Add Guest** – Form: name, phone, property/unit, dates, source, notes, payment; save to Firestore and navigate back to Home.

## Tech stack

- Expo (SDK 52), Expo Router, TypeScript
- Firebase: Firestore, Auth (anonymous)
- Zustand (real-time subscriptions via `onSnapshot`)
- No UI library; minimal, mobile-first UI with dark mode support

## TODO (future)

- Edit guest / update payment status
- Add and edit properties and units from the app
- Native date pickers for check-in/check-out
- Offline persistence (e.g. enable Firestore offline)
# property-manage
