# Xenon - Intelligent Tourism Platform

Welcome to **Xenon**, a comprehensive, intelligent tourism platform designed to revolutionize the way travelers discover, plan, and book their trips. The platform combines a powerful backend, a responsive web dashboard, a seamless mobile application, and a standalone generative AI travel advisor.

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

---

## 🚀 Getting Started

Each component has its own setup instructions. Please navigate to the respective directories for detailed `README.md` guides:
- [Backend Setup](./backend/README.md) *(Optional: Ensure you create one if not existing)*
- [Frontend Setup](./frontend/README.md)
- [Mobile Setup](./GP/README.md)
- [AI Service Setup](./ai/README.md)

## 🛡️ Security & Scalability
- **Docker Ready:** The backend utilizes `dockerode` indicating containerization capabilities.
- **Secure Data:** Advanced XSS cleaning, rate limiting, and parameter pollution prevention (`hpp`) are integrated.
- **AI Safety:** The AI service is strictly scoped to prevent hallucination, declining any requests outside the bounds of verified travel package data.
