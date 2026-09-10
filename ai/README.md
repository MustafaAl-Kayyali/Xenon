# Xenon AI Service - Project Report

## 📖 Overview
The **Xenon AI Service** is a standalone, intelligent travel recommendation microservice developed for the Xenon tourism platform. Operating independently from the main backend, it acts as the centralized "brain" powering the smart features of the Xenon mobile application. 

This service bridges the gap between traditional travel booking and modern Generative AI, providing users with a highly personalized, context-aware travel advisor.

---

## 💎 Value Proposition
In the modern tourism industry, travelers often spend hours researching destinations, checking weather forecasts, and calculating budgets. Xenon AI solves this by offering a **24/7 personal travel advisor** that:
- **Increases Booking Conversions:** By instantly matching users with the perfect packages based on their exact needs.
- **Saves Time:** Combines package filtering, weather checking, and currency conversion into a single chat interface.
- **Enhances User Engagement:** Provides an interactive, human-like conversational experience rather than traditional search filters.

---

## 📱 Services Provided to the Mobile App

This AI API powers several core services directly inside the **Xenon Mobile App (Flutter)**:

1. **The Smart Travel Advisor (Chat Interface):** 
   Provides a conversational assistant (`ai_advisor_page.dart`) where users can ask for travel recommendations in natural language.
2. **Context-Aware Recommendations:**
   The service maintains conversation history, allowing users to refine their search easily (e.g., typing "make it cheaper" after an initial search).
3. **Live Weather Integration:**
   Fetches real-time weather forecasts via **Open-Meteo**. The app receives smart warnings if a destination is too hot, humid, or rainy on the requested dates.
4. **Real-time Currency Conversion:**
   Uses live exchange rates (**Frankfurter**) to accurately filter travel packages based on the user's local currency and budget.

---

## 🗣️ Real-World Use Cases & Examples

The AI is trained to understand complex, multi-variable requests. Here are examples of how users interact with the app:

- **Family & Budget Focus:** 
  > *"I want a cultural site in Jordan on September 5 for my family, around 3000 JOD."*
- **Weather-Aware Planning:** 
  > *"Find me a trip to Wadi Rum this weekend, but only if it's not going to rain."*
- **Contextual Follow-ups:** 
  > *(After a recommendation)* *"Are there any cheaper alternatives nearby?"*

---

## ⚙️ System Architecture & Workflow

The architecture is designed for speed, safety, and reliability. When a user sends a message from the app, the following workflow occurs:

1. **User Request:** The Flutter app sends the user's natural language query to the AI Microservice.
2. **Data Fetching:** The service asynchronously calls external APIs (Open-Meteo for weather, Frankfurter for currency).
3. **AI Processing:** The query and external data are fed into the **Ollama (qwen3:4b)** LLM model to understand the user's intent and constraints.
4. **Database Query:** The AI generates precise MongoDB filters to search the read-only Xenon package database.
5. **Response Generation:** The service returns a conversational reply, the top matching package, and alternative options back to the mobile app.

---

## 🌟 Key Technical Features

- **Powered by Local LLMs (Ollama):** Processes natural language efficiently while maintaining data privacy.
- **No Hallucinations:** The AI is strictly bounded. It will decline medical advice, visa rules, or any facts not explicitly present in the verified database.
- **Secure & Read-Only:** The service never creates, updates, or deletes packages. It relies entirely on the main Xenon database.
- **Graceful Fallbacks:** Incorporates a multilingual fallback parser if the AI engine is temporarily unavailable, ensuring the mobile app never crashes.

---

## 🔒 Security & Constraints
- **Authentication:** Protected by environment-level API keys matching the main backend.
- **CORS Policies:** Configured securely to only allow traffic from verified Flutter web and mobile clients.
- **Performance Restrictions:** Implements strict request rate-limiting and payload size constraints (16 KiB limit) to prevent abuse.

---

## 🚀 Future Roadmap

As the platform evolves, the AI service is designed to scale. Future planned enhancements include:
1. **Voice Integration:** Allowing users to speak directly to the AI advisor inside the mobile app.
2. **Flight & Hotel APIs:** Expanding the AI's reach to include real-time flight bookings and external hotel reservations.
3. **Multilingual Expansion:** Training the AI to provide native-level support in more regional dialects to attract international tourists.
