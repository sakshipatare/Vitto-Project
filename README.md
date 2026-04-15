# MSME Lending Decision System

A comprehensive, end-to-end full-stack lending decision platform designed to process Micro, Small, and Medium Enterprises (MSME) business profiles. The system features an automated proprietary credit scoring engine, robust API design, and an administrative dashboard for monitoring applications and providing manual overrides.


## 🏗️ Tech Stack Used

- **Frontend**: React (Vite) for a fast, responsive user interface. Structured with functional components and hooks.

- **Styling**: Vanilla CSS utilizing a premium dark theme design system with glassmorphism and subtle animations. No heavy component libraries were used to ensure a custom, high-end feel.

- **Backend**: Node.js & Express.js, providing a lightweight, non-blocking I/O environment suitable for real-time risk decisioning.

- **Database**: MongoDB paired with Mongoose ODM for flexible, schema-driven data persistence that accommodates mutating business profile requirements.

- **State Management**: React's built-in Context/Hooks (`useState`, `useEffect`) avoiding over-engineering for a straightforward single-flow application.


## 🚀 Setup Guide

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (Running locally or an accessible Atlas URI)
- Git

### Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the necessary dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` directory with the following variables:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/lending_system
   JWT_SECRET=your_jwt_secret_key_here
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Open a new terminal instance and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The application will typically be accessible at `http://localhost:5173`.

### 🐳 Run with Docker (Easiest Method)
If you have Docker Desktop installed, you can spin up the entire application (Frontend, Backend, and MongoDB) with a single command. 

1. Ensure Docker Desktop is running.
2. Open a terminal in the root project directory (`Vitto Project/`).
3. Run the following command to build and start the containers in detached mode:
   ```bash
   docker-compose up --build -d
   ```
4. **Access the application**:
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000`
   - MongoDB: Runs internally on port `27017`.
5. To stop the application, run:
   ```bash
   docker-compose down
   ```

---


## 📝 API Documentation

### 1. Submit Application (Public)
Submit a loan application to be evaluated by the decision engine.
- **Endpoint**: `POST /api/applications/submit`
- **Rate Limit**: 10 requests per minute per IP.
- **Payload Request**:
  ```json
  {
    "businessName": "Acme Corp",
    "pan": "ABCDE1234F",
    "businessType": "Manufacturing",
    "monthlyRevenue": 500000,
    "loanAmount": 1500000,
    "loanTenure": 24,
    "loanPurpose": "Expansion"
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "applicationId": "60d21b4667d0d8992e610c85",
      "decision": {
        "status": "Approved",
        "score": 850,
        "reasonCodes": ["CLEAN_PROFILE"],
        "estimatedEMI": 74883,
        "processingTimeMs": 1505
      }
    }
  }
  ```

### 2. Manual Override (Admin Only)
Manually override the system's decision for a specific loan application.
- **Endpoint**: `PATCH /api/applications/:id/override`
- **Headers**: `Authorization: Bearer <token>`
- **Payload Request**:
  ```json
  {
    "status": "Approved",
    "notes": "Manual approval after verifying physical warehouse assets."
  }
  ```

### 3. Get Applications Audit Trail (Admin Only)
Retrieve all applications.
- **Endpoint**: `GET /api/applications?status=Approved` (Status filter is optional)
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Array of application objects detailing business info, decision logic, and historical overrides.

### 4. Recalculate Decision
Run the decision engine again for an existing application.
- **Endpoint**: `POST /api/applications/decision/:id`

---

## 🧠 Decision Logic Explanation

The core credit scoring algorithm operates synchronously upon application submission.

- **Base Score**: Every application begins with a base score of `400`.
- **Maximum/Minimum Score**: Scores are capped between `0` and `1000`.
- **Approval Threshold**: To be "Approved", an application must achieve a final score of **>= 650** and possess NO critical reason codes.

### Scoring Factors:

1. **Revenue Multiple (Loan Amount / Monthly Revenue)**:
   - `< 2x`: +200 points
   - `< 4x`: +100 points
   - `> 6x`: -100 points and flagged as `HIGH_LOAN_RATIO`

2. **EMI-to-Revenue Ratio** (Assuming 18% annual interest):
   - `< 20%`: +200 points
   - `< 30%`: +100 points
   - `> 40%`: -100 points and flagged as `LOW_REVENUE_FOR_EMI`

3. **Data Consistency & Fraud Check**:
   - If requested loan > 10x the monthly revenue: -200 points and tagged with a **critical** `DATA_INCONSISTENCY` code.
   - Otherwise: +100 points.

4. **Loan Tenure Adjustments**:
   - `12 to 36 months`: +100 points (Sweet spot).
   - `< 6 or > 60 months`: -50 points and flagged as `RISKY_TENURE`.

### Risk Assessment (Risk Level Output):
- **LOW**: Score >= 800 and no critical red flags.
- **MEDIUM**: Score >= 650.
- **HIGH**: Score < 650 or triggering a critical red flag.

---

## 🛡️ Edge Case Strategy

Our application mitigates errors and incorrect behavior using multi-layered safeguards:

1. **Synchronous Async Simulation**: The exact requirement prioritized immediate feedback rather than complex background queuing (RabbitMQ, BullMQ). To fulfill real-world user expectations of "loading" states, the API simulates processing (`setTimeout(1500ms)`) explicitly keeping the UI engaged without hanging indefinitely.

2. **Rate Limiting**: `express-rate-limit` is implemented on the `/submit` endpoint (10 requests/min). This prevents abusive programmatic attacks or brute force API polling aimed at gaming the credit scoring model.

3. **Data Integrity & Validation**: 
   - All monetary input is constrained to prevent negative values.
   - The system utilizes strict standard Regex constraints for Indian PAN formats (`^[A-Z]{5}[0-9]{4}[A-Z]{1}$`).
   - Mongoose schemas enforce data structures natively at the model level before saving.
   
4. **Decoupled Engine**: The core credit analysis logic `decisionEngine.js` has zero dependencies on HTTP `req/res` contexts. This edge-case strategy guarantees that if API validations fail or formatting drops data, the engine does not inherently crash due to missing bindings but returns fallback defaults.

5. **Robust RBAC Route Protection**: Actions that modify existing records, such as administrative overrides, are locked behind JSON Web Token (JWT) verification strategies targeting "Admin" roles explicitly, completely walling off public tampering.

---

## 💡 Assumptions Made

1. **Interest Rates**: We assume a fixed annual interest rate of **18%** across all loans uniformly to calculate EMI for the decision ratio.

2. **Revenue Stability**: We accept the input `monthlyRevenue` implicitly at face value. In standard production scopes, this sits downstream of a verifiable flow (like AWS S3 bank statement OCR extraction or GST APIs).

3. **Authentication Scope**: We assume only an overarching structural "Admin" exists for verifying audit trails. Full-fledged multi-tiered organization users (Loan Officer, Underwriter, SuperAdmin) are simplified to a single protected admin tier.

4. **Service Architecture**: A synchronous API methodology fits the current throughput. Real high-volume scenarios (thousands of concurrent apps) assume we would refactor this routing off of the Express thread into a Message Broker.
