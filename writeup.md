# Project Write-up: MSME Lending Decision System

## Architecture Decisions

### 1. Tech Stack Choice: MERN (Lite)
I chose Node.js/Express for the backend and React for the frontend to ensure a fast, non-blocking I/O environment suitable for real-time decisioning. MongoDB was selected for its schema flexibility, allowing for rapid iteration on MSME business profile fields without rigid migration overhead.

### 2. Decision Engine Decoupling
The credit scoring logic is encapsulated in a standalone service (`decisionEngine.js`). This separation ensures that the scoring logic can be unit-tested independently of API routes and potentially swapped for a more complex ML-based engine in the future without refactoring the application structure.

### 3. State Management
For this single-day exercise, I utilized React's built-in `useState` and `useEffect` hooks rather than introducing Redux or Zustand. The application is a single-flow process, making complex state management unnecessary and avoiding over-engineering.

## Trade-offs & Decisions

### 1. Synchronous vs. Asynchronous Decisioning
**Trade-off**: Real-time feedback vs. Background job processing.
**Decision**: I implemented a synchronous flow for the API. While real-world high-volume systems use background workers (e.g., BullMQ or RabbitMQ) for scoring, the current requirements favored immediate feedback for the MSME applicant. I added a "Processing" UI state to simulate the wait.

### 2. Vanilla CSS vs. Component Libraries
**Trade-off**: Speed of development vs. Custom design control.
**Decision**: I used Vanilla CSS with a predefined design system. This allowed for a "premium" bespoke look (Glassmorphism, linear gradients) that feels more high-end than a generic Bootstrap or Material UI setup, aligning with the "Wow the user" requirement.

### 3. PAN Formatting
**Decision**: I restricted PAN validation to a standard regex format. In a production environment, this would involve a 3rd party API (like NSDL) to verify the PAN's authenticity. For this exercise, format consistency was prioritized.

## Future Improvements (Given more time)

1. **Webhook Integration**: Implement webhooks for async decision results to notify 3rd party systems when a loan is sanctioned.
2. **Document Upload**: Add AWS S3 integration for MSMEs to upload bank statements or GST returns for actual data-driven scoring.
3. **Audit Trail UI**: Create a dashboard view for loan officers to review all submitted applications and override decisions.
4. **Enhanced Fraud Check**: Integrate with external credit bureaus (CIBIL/Equifax) and check for duplicate PAN submissions within short timeframes.
5. **Rate Limiting**: Implement Redis-based rate limiting on the `/submit` endpoint to prevent brute-force scoring attempts.
