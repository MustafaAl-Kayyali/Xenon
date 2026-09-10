# Xenon Mobile App (Flutter)

The official mobile application for the **Xenon** tourism platform, built with **Flutter**. It provides an intuitive, cross-platform experience for travelers to explore destinations, manage bookings, and interact with an intelligent AI travel advisor.

## 🌟 Key Features
- **Smart AI Advisor:** A dedicated conversational interface (`ai_advisor_page.dart`) to get personalized travel recommendations based on weather, budget, and preferences.
- **Authentication & Security:** Secure Login, Signup, OTP Verification, and Password Recovery (`forgot_password_page.dart`, `otp_page.dart`).
- **Discover & Explore:** Browse tourism packages, view rich destination details, and explore new places (`home_page.dart`, `explore_page.dart`, `destination_details_page.dart`).
- **Seamless Booking & Checkout:** End-to-end booking flow including conflict resolution and checkout (`bookings_page.dart`, `checkout_page.dart`, `booking_conflict_page.dart`).
- **User Profiles & Settings:** Manage personal details, app settings, and view booking history (`profile_page.dart`, `settings_page.dart`).
- **Reviews & Feedback:** Users can add and view reviews for destinations (`add_review_dialog.dart`).
- **Push Notifications:** Integrated Firebase Cloud Messaging for real-time updates and alerts (`notifications_page.dart`).
- **Robust Error Handling:** Custom UI for various states including loading, 404, server errors, and invalid details.

## 🛠️ Tech Stack
- **Framework:** Flutter (Dart)
- **State Management:** Provider
- **Networking:** HTTP Package
- **Local Storage:** Shared Preferences & Flutter Secure Storage
- **Notifications:** Firebase Core & Firebase Messaging
- **UI/UX:** Google Fonts, Font Awesome, Flutter Animate

## 🚀 Getting Started
1. Install dependencies:
   ```bash
   flutter pub get
   ```
2. Make sure you have the Firebase configuration files (`google-services.json` for Android / `GoogleService-Info.plist` for iOS) placed in their respective directories if you intend to test Push Notifications.
3. Run the application:
   ```bash
   flutter run
   ```
