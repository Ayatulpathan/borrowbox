# BorrowBox — Rent Instead of Buy 📦✨

> **A Production-Oriented, Full-Stack Peer-to-Peer Rental Marketplace Powered by an Autonomous AI Agent**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)](https://expressjs.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB_Atlas-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)

---

## 📖 Table of Contents

1. [Executive Summary & Vision](#-executive-summary--vision)
2. [Key Value Proposition](#-key-value-proposition)
3. [Core Feature Breakdown](#-core-feature-breakdown)
   - [Product Discovery & Exploration](#1-product-discovery--exploration)
   - [Listing Creation & Management](#2-listing-creation--management)
   - [Booking Engine & Reservation Lifecycle](#3-booking-engine--reservation-lifecycle)
   - [Integrated User Authentication & Security](#4-integrated-user-authentication--security)
   - [Reviews, Ratings & Social Proof](#5-reviews-ratings--social-proof)
   - [In-App Notifications & Alerting](#6-in-app-notifications--alerting)
   - [Extensible Payment Boundary](#7-extensible-payment-boundary)
4. [🤖 AI Rental Assistant (Autonomous Agent System)](#-ai-rental-assistant-autonomous-agent-system)
   - [Agent Philosophy: Execution Over Chat](#agent-philosophy-execution-over-chat)
   - [Human-in-the-Loop Confirmation Gates](#human-in-the-loop-confirmation-gates)
   - [Supported Backend Tool Suite](#supported-backend-tool-suite)
5. [System Architecture](#-system-architecture)
6. [Database Schema & Data Model](#-database-schema--data-model)
7. [RESTful API Specification (`/api/v1`)](#-restful-api-specification-apiv1)
8. [Getting Started & Local Setup](#-getting-started--local-setup)
9. [Environment Configuration (`.env`)](#-environment-configuration-env)
10. [Cloud Deployment Strategy](#-cloud-deployment-strategy)
11. [Testing & Quality Assurance](#-testing--quality-assurance)

---

## 💡 Executive Summary & Vision

**BorrowBox** is a modern peer-to-peer (P2P) rental marketplace designed to fundamentally shift consumer behavior from *buying temporary assets* to *renting high-utility items on demand*. From high-end photography gear, camping equipment, and power tools to projectors, gaming consoles, and specialty electronics, BorrowBox enables asset owners to monetize idle belongings while giving renters affordable, immediate access to quality equipment without the financial burden of ownership.

At the core of BorrowBox is an **autonomous AI Rental Assistant** powered by Google Gemini. Unlike traditional passive chatbots, the BorrowBox AI Agent is deeply integrated into backend microservices through a secure, validated tool-calling framework. It plans workflows, searches real database records, checks live calendar availability, calculates exact pricing formulas, drafts listings, manages booking lifecycles, and executes user-authorized marketplace operations with strict human-in-the-loop safeguards.

---

## 🎯 Key Value Proposition

* **For Renters**: Access premium equipment without large upfront capital expenditures. Search by location, dates, price tiers, and categories with real-time availability guarantees.
* **For Item Owners (Lenders)**: Turn underutilized equipment into reliable passive income streams with configurable deposits, cancellation policies, rental rules, and automated booking requests.
* **For the Marketplace**: Safe, verifiable peer-to-peer interactions backed by role-based access control, cryptographic password hashing, audit logs, anti-collision reservation locks, and automated AI assistance.

---

## 🚀 Core Feature Breakdown

### 1. Product Discovery & Exploration
* **Full-Text & Keyword Search**: High-performance search indexing across listing titles, descriptions, brands, tags, and specifications.
* **Multi-Faceted Filtering**: Filter listings by category (Cameras, Electronics, Tools, Outdoor, Audio, Party/Events, Vehicles, etc.), price range (hourly/daily/weekly), location, verification status, and calendar date ranges.
* **Sorting Capabilities**: Sort by Best Match (Relevance), Price (Low to High / High to Low), Newest Arrivals, and Owner Rating.
* **Rich Listing Details**: High-resolution image galleries, detailed condition reports, included accessories, owner bio & trust badge, security deposit requirements, pickup/delivery options, and transparent rental rules.
* **User Favorites**: Save and bookmark preferred listings for quick future access.

### 2. Listing Creation & Management
* **Intuitive Creation Flow**: Multi-step wizard to upload photos, define item specs, set dynamic pricing structures (hourly, daily, weekly), specify security deposit amounts, and set pickup/delivery policies.
* **AI-Assisted Listing Drafts**: Owners can ask the AI agent to draft professional, high-converting product descriptions and suggested price points based on item specs. AI drafts remain editable and require owner approval before publishing.
* **Listing Lifecycle States**: `draft`, `published`, `paused`, `archived`, and `under_review`.
* **Owner Controls**: Easily toggle availability, edit rental conditions, update pricing, or temporarily pause listings.

### 3. Booking Engine & Reservation Lifecycle
* **Date Range Picker & Live Availability**: Interactive calendar ensuring items cannot be double-booked for overlapping timeframes.
* **Server-Side Price Calculation**: Deterministic calculation of rental duration, base rate, multi-day discounts, security deposit, service fee, and grand total.
* **Status Machine**:
  - `pending` $\rightarrow$ Owner receives request to accept or reject.
  - `approved` $\rightarrow$ Confirmed reservation with dates locked in the database.
  - `active` $\rightarrow$ Rental period is currently underway.
  - `completed` $\rightarrow$ Item returned safely, deposit refunded, review unlocked.
  - `cancelled` $\rightarrow$ Cancelled by renter or owner according to cancellation policy.
  - `rejected` $\rightarrow$ Declined by owner with optional feedback.
* **Concurrency-Safe Locks**: Double-validation on submission and approval to guarantee no conflicting bookings occur in race conditions.

### 4. Integrated User Authentication & Security
* **User Registration & Login**: Full name, email, strong password validation, and bcrypt/Argon2id cryptographic hashing.
* **Secure Token / Session Management**: HTTP-only secure cookie sessions or signed JWTs with automatic expiration and refresh capabilities.
* **Password Reset Workflow**: Cryptographically signed temporary tokens for forgot-password and reset-password flows.
* **Role-Based Access Control (RBAC)**:
  - `User`: Standard renter and lender capabilities.
  - `Admin`: Global listing moderation, user management, audit log review, and platform metric oversight.
* **Ownership Verification**: Strict backend authorization gates ensuring users can only mutate their own listings, bookings, profile data, and AI tasks.

### 5. Reviews, Ratings & Social Proof
* **Verified Rental Reviews**: Only users with a `completed` booking can submit a star rating (1–5) and written review for an item and its owner.
* **Aggregated Rating Calculation**: Real-time recalculation of item average ratings and owner credibility scores.

### 6. In-App Notifications & Alerting
* **Live In-App Notification Center**: Instant alerts for booking requests, status updates (approved, rejected, cancelled), rental reminders, and review requests.
* **Read/Unread Status**: Mark individual notifications or all as read.

### 7. Extensible Payment Boundary
* **Pluggable Payment Gateway Architecture**: Clean abstraction layer supporting Stripe, SSLCommerz, or bKash integrations.
* **Simulated & Safe Fallbacks**: Transparent development simulation clearly labeled when payment gateways are in test mode or unconfigured, preventing false transaction claims.

---

## 🤖 AI Rental Assistant (Autonomous Agent System)

BorrowBox features a dedicated, deeply integrated **AI Rental Assistant** accessible from any page.

```
+-------------------------------------------------------------+
|                      User Prompt                            |
|    "Find a Sony A7 IV camera for 3 days next weekend"       |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|             BorrowBox AI Agent Controller                   |
|  - Validates user identity & authorization context          |
|  - Generates reasoning plan & tool execution sequence       |
+------------------------------+------------------------------+
                               |
            +------------------+------------------+
            |                                     |
            v                                     v
+-----------------------+             +-----------------------+
|   Read-Only Tools     |             |  Consequential Tools  |
| - searchListings      |             | - createBookingRequest|
| - checkAvailability   |             | - cancelBooking       |
| - calculateRentalCost |             | - publishListingDraft |
+-----------+-----------+             +-----------+-----------+
            |                                     |
            | Immediate Execution                 | Requires Explicit
            |                                     | User Confirmation
            v                                     v
+-------------------------------------------------------------+
|               Verified Database Operations                  |
|    Mongoose Models / Concurrency Validated Queries          |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|            Structured Outcome & Visual Artifact             |
|   Renders interactive cards, cost summaries & action links  |
+-------------------------------------------------------------+
```

### Agent Philosophy: Execution Over Chat
The AI Agent is not a generic chatbot. It is a specialized marketplace operator with access to approved backend tool functions:
1. **Understands Intent**: Extracts structured search queries, date ranges, budget parameters, and action intents.
2. **Plans & Solicits Missing Info**: If dates or details are missing, it asks clarifying questions.
3. **Calls Validated Backend Tools**: Executes queries against MongoDB Atlas collections with user session context.
4. **Enforces Human-in-the-Loop Confirmation**: For destructive or financial actions (e.g., submitting a booking request, cancelling a reservation, publishing a listing), it drafts the action, displays a clear confirmation card with total costs/penalties, and waits for user approval before mutating database records.
5. **Truthful Outcome Reporting**: Never hallucinates database state. Every completed step is verified by backend response objects.

### Supported Backend Tool Suite

| Category | Tool Name | Description | Requires Confirmation? |
| :--- | :--- | :--- | :---: |
| **Search & Discovery** | `searchListings` | Searches available listings by query, category, price, and location | No |
| | `getListingDetails` | Retrieves full listing metadata, rules, and owner details | No |
| | `getCategories` | Returns active marketplace categories and metadata | No |
| | `checkAvailability` | Verifies calendar availability for specific date ranges | No |
| **Rental Calculations** | `calculateRentalPrice`| Computes duration, daily rate, deposits, service fees, and total | No |
| | `getDepositRequirements` | Fetches security deposit rules and refund conditions | No |
| | `getRentalRules` | Retrieves owner rules (cancellation, usage, pickup guidelines) | No |
| **Listing Management** | `createListingDraft` | Creates an unpublished listing draft for the user | No |
| | `generateListingDescription`| Generates SEO-optimized listing copy from specs | No |
| | `updateListingDraft` | Modifies properties of a user's listing draft | No |
| | `submitListingForApproval` | Validates and publishes a listing draft | **Yes** |
| **Booking Management** | `createBookingRequest` | Submits a new booking request for an available item | **Yes** |
| | `getMyBookings` | Fetches active, pending, and past bookings for current user | No |
| | `getBookingDetails` | Fetches detailed booking status and pricing breakdown | No |
| | `cancelEligibleBooking`| Cancels a pending or eligible confirmed booking | **Yes** |
| | `respondToBookingRequest`| Owner accepts or rejects an incoming booking request | **Yes** |
| **Account & Summary** | `getMyProfile` | Retrieves authenticated user profile and verification status | No |
| | `getMyListings` | Lists all items owned and published by the user | No |
| | `generateRentalSummary`| Summarizes active rentals, pending earnings, and upcoming returns| No |

---

## 🏛️ System Architecture

```
                       +-------------------+
                       |    Client Web     |
                       |  (React 18 + Vite)|
                       |   Tailwind CSS    |
                       +---------+---------+
                                 |
                                 | HTTPS / REST API (/api/v1)
                                 v
                       +-------------------+
                       |   Node / Express  |
                       |  TypeScript Server|
                       +----+----+----+----+
                            |    |    |
           +----------------+    |    +----------------+
           |                     |                     |
           v                     v                     v
  +-----------------+  +-----------------+  +-----------------+
  | Auth & Security |  |  AI Tool Engine |  | Business Logic  |
  | - Argon2/Bcrypt |  | - Gemini 2.5/3  |  | - Listings      |
  | - JWT / Cookies |  | - Plan & Exec   |  | - Bookings      |
  | - RBAC Guard    |  | - Confirmations |  | - Pricing Rules |
  +--------+--------+  +--------+--------+  +--------+--------+
           |                    |                    |
           +--------------------+--------------------+
                                |
                                v
                       +-------------------+
                       |   MongoDB Atlas   |
                       | (Mongoose Schemas)|
                       +-------------------+
```

---

## 🗄️ Database Schema & Data Model

The database contains well-indexed Mongoose collections:

1. **`User`**: `name`, `email`, `passwordHash`, `role` (`user` \| `admin`), `avatar`, `phone`, `isVerified`, `bio`, `createdAt`, `updatedAt`.
2. **`Listing`**: `title`, `description`, `category`, `owner` (ref: User), `pricing` (`hourly`, `daily`, `weekly`), `securityDeposit`, `currency`, `images`, `location` (`address`, `city`, `coordinates`), `rules`, `status` (`draft` \| `published` \| `paused` \| `archived`), `ratingSummary` (`avgRating`, `reviewCount`).
3. **`Booking`**: `listing` (ref: Listing), `renter` (ref: User), `owner` (ref: User), `startDate`, `endDate`, `totalHours`/`totalDays`, `pricingBreakdown` (`basePrice`, `deposit`, `serviceFee`, `total`), `status` (`pending` \| `approved` \| `active` \| `completed` \| `cancelled` \| `rejected`), `cancellationReason`.
4. **`Review`**: `booking` (ref: Booking), `listing` (ref: Listing), `reviewer` (ref: User), `targetUser` (ref: User), `rating` (1–5), `comment`, `createdAt`.
5. **`Notification`**: `user` (ref: User), `title`, `message`, `type` (`booking_request`, `booking_approved`, `booking_cancelled`, `review_received`, `system`), `link`, `isRead`, `createdAt`.
6. **`Favorite`**: `user` (ref: User), `listing` (ref: Listing), `createdAt`.
7. **`AgentTask` & `AgentStep`**: `user` (ref: User), `conversationId`, `prompt`, `status` (`planning`, `awaiting_confirmation`, `executing`, `completed`, `failed`), `plan`, `pendingAction` (`toolName`, `args`, `description`), `toolCalls`, `resultSummary`.
8. **`AuditLog`**: `action`, `actor` (ref: User), `targetResource`, `resourceId`, `metadata`, `ipAddress`, `timestamp`.

---

## 🌐 RESTful API Specification (`/api/v1`)

### Authentication & User Management
* `POST /api/v1/auth/register` — Register a new user
* `POST /api/v1/auth/login` — Authenticate and receive session token / cookie
* `POST /api/v1/auth/logout` — Invalidate current user session
* `GET  /api/v1/auth/me` — Fetch currently authenticated user profile
* `PATCH /api/v1/auth/profile` — Update user profile details
* `POST /api/v1/auth/forgot-password` — Request password reset email / token
* `POST /api/v1/auth/reset-password` — Reset password using token

### Listings
* `GET    /api/v1/listings` — Search and filter listings (pagination, categories, price range)
* `GET    /api/v1/listings/featured` — Get featured / top-rated listings
* `GET    /api/v1/listings/categories` — Get listing categories and item counts
* `GET    /api/v1/listings/:id` — Get single listing details with owner info & reviews
* `POST   /api/v1/listings` — Create a new listing (Draft or Published)
* `PATCH  /api/v1/listings/:id` — Update an existing listing (Owner only)
* `DELETE /api/v1/listings/:id` — Delete or archive a listing (Owner / Admin)
* `POST   /api/v1/listings/:id/favorite` — Toggle favorite status

### Bookings & Availability
* `POST  /api/v1/bookings` — Submit a new booking request with validation
* `GET   /api/v1/bookings` — Get bookings for the authenticated user (Renter or Owner)
* `GET   /api/v1/bookings/:id` — Get detailed booking summary & status
* `PATCH /api/v1/bookings/:id/status` — Owner approves or rejects a booking request
* `POST  /api/v1/bookings/:id/cancel` — Cancel an eligible booking request
* `POST  /api/v1/bookings/calculate` — Preview rental price breakdown without creating booking
* `GET   /api/v1/listings/:id/availability` — Check booked calendar slots for a listing

### Reviews & Notifications
* `POST /api/v1/reviews` — Create a review for a completed booking
* `GET  /api/v1/reviews/listing/:listingId` — Fetch reviews for a specific listing
* `GET  /api/v1/notifications` — Fetch user's in-app notifications
* `PATCH /api/v1/notifications/:id/read` — Mark notification as read
* `POST  /api/v1/notifications/read-all` — Mark all notifications as read

### AI Rental Assistant
* `POST /api/v1/agent/chat` — Send prompt to AI Agent, receive plan / response / tool results
* `GET  /api/v1/agent/tasks` — List user's historical AI agent tasks and outcomes
* `GET  /api/v1/agent/tasks/:id` — Get specific agent task execution trace and pending approvals
* `POST /api/v1/agent/tasks/:id/confirm` — User confirms a consequential action; agent executes tool
* `POST /api/v1/agent/tasks/:id/cancel` — User rejects a pending consequential action

---

## 💻 Getting Started & Local Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **yarn** / **pnpm**
- **MongoDB**: Local MongoDB instance or free MongoDB Atlas URI
- **Gemini API Key**: Free Google AI Studio API key ([Get one here](https://aistudio.google.com/))

### Installation Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Ayatulpathan/borrowbox.git
   cd borrowbox
   ```

2. **Install dependencies for Backend & Frontend**:
   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. **Configure Environment Variables**:
   Copy the example environment files and provide your secrets:
   ```bash
   # In /server
   cp .env.example .env

   # In /client
   cp .env.example .env
   ```

4. **Seed Database (Optional for development)**:
   ```bash
   cd server
   npm run seed
   ```

5. **Run in Development Mode**:
   ```bash
   # Start backend API (runs on port 5000)
   cd server
   npm run dev

   # Start frontend client (runs on port 5173)
   cd client
   npm run dev
   ```

---

## ⚙️ Environment Configuration (`.env`)

### Backend (`server/.env.example`):
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/borrowbox?retryWrites=true&w=majority

# Authentication Secrets
JWT_SECRET=your_super_secret_jwt_key_at_least_32_chars
JWT_EXPIRES_IN=7d
COOKIE_SECRET=your_cookie_secret_key

# AI Agent Configuration (Google Gemini)
GEMINI_API_KEY=your_google_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash

# CORS & Client URLs
CLIENT_URL=http://localhost:5173

# Optional Integrations
EMAIL_SERVICE_ENABLED=false
PAYMENT_SERVICE_MODE=simulated
```

### Frontend (`client/.env.example`):
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_APP_NAME="BorrowBox — Rent Instead of Buy"
```

---

## ☁️ Cloud Deployment Strategy

BorrowBox is architected to run seamlessly on production cloud infrastructure:

1. **Frontend**: Deployable to **Vercel**, **Netlify**, or **Cloudflare Pages** (Static React/Vite SPA).
2. **Backend**: Deployable to **Render**, **Railway**, **Fly.io**, or **AWS ECS/App Runner** (Node.js/Express Container).
3. **Database**: Hosted on **MongoDB Atlas** (M0 Free Tier or Dedicated Cluster).
4. **AI Capabilities**: Powered by Google Gemini API hosted endpoints with rate limiting and retry backoff.

---

## 🛡️ License

This project is licensed under the **MIT License**.
