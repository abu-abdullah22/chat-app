# NexusChat 

**Live Demo:** [https://nexus-chat-blush.vercel.app/](https://nexus-chat-blush.vercel.app/)

A modern, real-time chat application.

## Part 3: The Thought Process

Building this application required navigating architectural trade-offs, designing a premium user experience, and gracefully handling a few unexpected quirks from the backend API.

### 1. Architecture & State Management
- **Framework:** The application is built using **Next.js (App Router)** and **React**.
- **State Management:** I chose to use the React Context API (`AuthContext`) for global authentication state, as it perfectly isolates token management without the heavy boilerplate of Redux. For the chat interface, I used localized React state in the parent `ChatPage` component. The parent acts as the "smart" controller—managing the `currentConversation` and fetching messages—while `ConversationList` and `MessageHistory` act as "dumb" presentational components, making the codebase highly predictable and easy to test.
- **Real-Time Architecture (REST vs WebSockets):** The provided backend is a strict REST API and does not expose a WebSocket or Server-Sent Events (SSE) endpoint. To achieve a seamless real-time chat experience under these constraints, I implemented a highly optimized **Short-Polling mechanism**. The app polls for new messages every 3 seconds and checks for conversation list updates every 5 seconds, striking the perfect balance between data freshness and server load.
- **Styling & UI:** I utilized **Tailwind CSS** alongside **shadcn/ui** components to build a modern, glassmorphic dark-mode aesthetic with vibrant glowing gradients to give it a premium SaaS feel. Leveraging shadcn allowed me to maintain accessible, highly customizable UI primitives without reinventing the wheel. 

### 2. Going the Extra Mile (Bonus Features)
To ensure the application felt truly robust and a step ahead, I implemented three original features:
1. **Smart Auto-Scroll:** When real-time polling fetches a new message, force-scrolling the user to the bottom is a terrible UX if they are actively scrolling up to read chat history. I wrote custom `useRef` logic that calculates the user's scroll position and *pauses* auto-scrolling if they aren't near the bottom of the feed.
2. **Mobile Responsiveness:** A squished sidebar and chat window is a dealbreaker on mobile. I implemented dynamic layout switching (like iMessage), where the sidebar hides when a chat is opened on small screens, complete with a custom "Back" button in the header.
3. **Live System Telemetry:** On the landing page, instead of a static FAQ, I built an animated widget that dynamically pings the production `/health` endpoint to calculate and display the live server latency (ms), proving to the user that the system is blazing fast before they even log in.

### 3. Handling API Quirks & Bugs
No API is perfect, and part of frontend development is defensive programming. Here is how I handled inconsistencies I discovered:
- **The `/health` Route Bug:** The provided Swagger documentation listed all endpoints under `/api`. However, hitting `/api/health` returned a `404 Not Found`. I discovered the health check was actually mounted at the root (`/health`) and updated my fetches accordingly.
- **Undocumented Type Constants:** The Swagger documentation stated that conversation types would be either `"group"` or `"direct"`. However, the live API actually returns `"personal"` instead of `"direct"`. I updated the TypeScript interfaces to gracefully accept the real data.
- **Reverse-Engineering the API:** Because the Swagger documentation was incomplete, I wrote custom Node.js probe scripts during development to interact directly with the backend, parse the raw JSON responses, and document the true shape of the data. This allowed me to create the highly accurate `API_DOCS.md` file included in this repository.
- **Backwards Message Sorting:** The `GET /api/conversations/:id/messages` endpoint returns messages in descending order (newest at index 0). If rendered directly, the newest messages appeared at the top of the chat rather than the bottom. I intercepted the response and sorted the array by `createdAt` ascending before pushing it to React state.
- **ID Inconsistencies:** The `GET /api/conversations` endpoint returns participant objects using the key `userId`, while `GET /api/users` returns them using `_id`. I normalized this behavior in the frontend mapping logic.

### 4. Testing Strategy & CI/CD Pipeline
To ensure production-grade reliability, I implemented a comprehensive, automated quality assurance pipeline:
- **Unit Testing (Jest & React Testing Library):** Used to isolate and verify core logic (like the `AuthContext` reducer, date formatting utilities, and isolated UI component rendering). This ensures our state transitions and data parsing remain flawless.
- **End-to-End Testing (Playwright):** Used to simulate real user behavior across the critical paths (Login Flow -> Chat Dashboard -> Sending a Message -> Logout). Playwright is perfect for verifying the integration between the UI and the real API in a headless browser environment.
- **GitHub Actions (CI Pipeline):** I configured a `.github/workflows/ci.yml` pipeline that triggers on every push and pull request. It automatically installs dependencies, runs the ESLint linter, executes TypeScript type-checking, runs all Jest Unit Tests, and finally runs the Playwright E2E suite. This guarantees that no breaking changes are ever merged into `main`.

### 5. Secret Word
As requested in the assignment instructions: **Madagascar**.

### 6. AI Usage
Throughout the development of this project, I utilized AI tools to accelerate my workflow while maintaining rigorous manual oversight:
- **Google Antigravity IDE:** Used as my primary pair-programming assistant to scaffold out boilerplate Next.js components, format CSS/Tailwind layouts, and generate the initial Jest test suites.
- **Claude AI:** Used as a sounding board to validate high-level architectural decisions.
- **Manual Verification & Testing:** While AI accelerates typing, all business logic was manually reviewed. I followed a strict Test-Driven approach, ensuring the Jest tests passed locally and E2E flows worked flawlessly before finalizing any feature.

---

## Running the Application Locally

### Using Node.js
1. Clone the repository
2. Run `npm install`
3. Run `npm run dev`
4. Visit `http://localhost:3000`

### Using Docker
You can also run the application fully containerized:
1. Build the image: `docker build -t chat-app .`
2. Run the container: `docker run -p 3000:3000 chat-app`
3. Visit `http://localhost:3000`

## Testing & Quality
- `npm run test` runs the 22 Jest Unit Tests.
- `npm run test:e2e` runs the Playwright E2E suite.
- `npm run type-check` validates the TypeScript implementation.
- `npm run lint` ensures code style and checks for errors (like unescaped entities).
