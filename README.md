# OG Deliveries iPA

This repository will hold the mobile apps for the OG Deliveries business, starting with Android and later porting to iOS.

## Product goals (from client request)

- Customer app for requesting delivery of food, flowers, Walmart, alcohol, and other items that fit in a car.
- Delivery fee calculated by distance from Oak Grove, LA (home city).
- Driver app that alerts customers of a pending delivery and provides an ETA based on driver distance.
- Simple local workflow: build, install, and test on a phone with minimal setup.

## Recommended stack (Android first, iOS later)

- **Flutter** (Dart) for a single shared codebase with Android-first focus and later iOS port.
- **Firebase** for authentication, realtime updates, and push notifications.
- **Google Maps Platform** for routing, distance, and ETA calculations.

## Core functional requirements

### Customer app

1. **Onboarding & authentication**
   - Phone number or email sign-in.
2. **Delivery request flow**
   - Pickup/drop-off address with item category.
   - Delivery fee calculated from Oak Grove, LA.
3. **Order status**
   - Real-time status updates.
   - Driver location tracking and ETA.

### Driver app

1. **Driver availability**
   - Toggle “online/offline.”
2. **Job dispatch**
   - Accept/decline delivery requests.
3. **Customer alerts**
   - Notifications for pending delivery.
   - ETA based on driver distance to destination.

## Rate calculation

- Rates are derived from distance from Oak Grove, LA.
- Needs a table of distance bands to rates (e.g., 0-5 miles, 6-10 miles, etc.).
- Implementation will require:
  - Oak Grove, LA as a fixed origin.
  - Distance computed by Google Maps Distance Matrix API or similar.

## Next steps

1. Confirm distance-to-rate table.
2. Choose the initial user flows and screens for Android MVP.
3. Create Flutter project skeleton and CI for Android builds.
4. Implement map routing, distance, and ETA calculation.
5. Add driver dispatch + customer notifications.

## Development approach

- Android-first release with feature parity in mind.
- Keep shared UI/business logic to ease iOS port.
- Design an API that supports both apps.

## Getting an APK without local setup

This repo includes a GitHub Actions workflow that builds a debug APK for you.

1. Push changes to GitHub.
2. Open the **Actions** tab → **Build Android APK**.
3. Download the `og-deliveries-debug-apk` artifact.
4. Transfer `app-debug.apk` to your Android phone and install it.
