# Xenon - Intelligent Tourism Platform

Welcome to **Xenon**, a comprehensive, intelligent tourism platform designed to revolutionize the way travelers discover, plan, and book their trips. The platform combines a powerful backend, a responsive web dashboard, a seamless mobile application, and a standalone generative AI travel advisor.

## 🌟 Why Use Xenon? 

In a crowded market of travel applications, Xenon stands out by bridging the gap between intelligent automation and accessible business tools. It is specifically designed to empower both individual travelers and Small to Medium-sized Businesses (SMBs) in the tourism sector.

### 🏢 For Tourism SMBs (Vendors & Agencies)
Small and medium-sized agencies often struggle with the high costs of digital transformation and managing fragmented tools. Xenon provides them with an enterprise-grade platform out-of-the-box:
- **Zero-Friction Digitization:** A comprehensive web dashboard to easily list packages, manage capacities, and track revenues without needing in-house technical teams.
- **Leveling the Playing Field:** The integrated AI advisor acts as a 24/7 sales agent for SMBs, intelligently recommending their packages to users based on live data, giving them the same technological edge as industry giants.
- **Centralized Operations:** Reduces administrative overhead by automating bookings, payments, and real-time availability updates all in one place.

### 🌍 For Travelers (Clients)
Modern travelers face information overload and unpredictable conditions. Xenon acts as a personal, smart travel companion:
- **Smart & Adaptive Planning:** Unlike traditional static apps, our AI travel advisor filters packages based on real-time weather constraints, budget limits, and personal preferences to guarantee the best experience.
- **Unified Experience:** From discovering a destination to managing the actual booking and receiving live push notifications, everything happens in one seamless mobile app.
- **Trust & Security:** Robust data validation and secure authentication ensure that payments, personal data, and booking histories are strictly protected.

## 🏗️ Project Architecture

Xenon is built using a modern microservices-inspired architecture, divided into four main components:

### 1. [Backend (Node.js & Express)](./backend)
The core infrastructure of Xenon. It handles data processing, secure authentication, media management (via Cloudinary), and scheduled tasks (Node-cron). It connects to a **MongoDB** database to manage packages, users, bookings, and vendors.

### 2. [Frontend (React & Vite)](./frontend)
A blazing-fast web portal designed for Administrators, Vendors, and Clients. It provides dedicated dashboards, staff management, payment tracking, and notification centers.
- **Stack:** React 19, Vite, React Router v7, Lucide React.

### 3. [Mobile App / GP (Flutter)](./GP)
The official cross-platform mobile application for travelers. It offers an intuitive interface to browse destinations, manage bookings, read reviews, and receive real-time push notifications.
- **Stack:** Flutter, Provider, Firebase Cloud Messaging.

### 4. [AI Service (Node.js & Ollama)](./ai)
A specialized, read-only AI microservice acting as a smart travel advisor. Powered by **Ollama (qwen3:4b)**, it understands natural language constraints, queries the main database, and augments recommendations using live weather data (**Open-Meteo**) and real-time currency conversion (**Frankfurter**).

## 💼 Core Business Logic

The Xenon platform operates on several key business workflows designed to connect travelers with vendors efficiently:
- **Vendor & Package Management:** Vendors can create and manage travel packages, setting prices, capacities, and schedules. The system automatically handles package availability based on real-time bookings.
- **Booking & Payment Flow:** Clients browse packages and make bookings. The system securely processes payments, updates package capacities, and issues digital tickets/confirmations.
- **Role-Based Access Control (RBAC):** Strict separation of concerns between `Admin`, `Vendor`, and `Client`. Admins oversee the entire platform, vendors manage their specific offerings, and clients manage their personal itineraries.
- **AI-Driven Personalization:** The AI service interacts with users to analyze preferences, current weather, and currency rates, ultimately suggesting optimal travel packages to maximize user satisfaction and conversion rates.

---

## 🚀 Getting Started

Each component has its own setup instructions. Please navigate to the respective directories for detailed `README.md` guides:
- [Backend Setup](./backend/README.md) *(Optional: Ensure you create one if not existing)*
- [Frontend Setup](./frontend/README.md)
- [Mobile Setup](./GP/README.md)
- [AI Service Setup](./ai/README.md)

## 🛡️ Security & Scalability
- **Secure Data:** Advanced XSS cleaning, rate limiting, and parameter pollution prevention (`hpp`) are integrated.
- **AI Safety:** The AI service is strictly scoped to prevent hallucination, declining any requests outside the bounds of verified travel package data.
