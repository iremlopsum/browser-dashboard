# Dashboard

A single-page, animated productivity dashboard built with React, TypeScript, and Vite. It combines several self-contained widgets (clock, weather, markdown notepad, Kanban board, search, GitLab feed) into one configurable "command center" UI.

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- Yarn (this project is configured and locked with `yarn.lock`)

### Installation

From the project root:

- Install dependencies:
  - `yarn install`

### Local Development

- Start the Vite dev server on the default port (with HMR):
  - `yarn dev`
- Lint TypeScript/JavaScript using the flat ESLint config:
  - `yarn lint`

### Build & Preview

- Type-check and build the production bundle:
  - `yarn build`
- Preview the built app locally with Vite’s preview server:
  - `yarn preview`

### Testing

There is currently **no test runner configured**:

- `package.json` does not define a `test` script.
- The repo contains no `*.test.ts(x)` or `*.spec.ts(x)` files.

To add tests, introduce a runner such as Vitest or Jest, wire it into Vite if needed, and add a `test` script (for example `"test": "vitest"`). After that, you can run individual tests using that runner’s CLI (e.g. `vitest path/to/file.test.tsx`).

## Architecture Overview

### Entry Points and Layout

- `index.html`:
  - HTML shell that mounts the React app at the `#root` element.
- `src/main.tsx`:
  - Creates the React root and renders `App` within `StrictMode`.
  - Imports global styles from `src/index.css`.
- `src/App.tsx`:
  - Top-level layout component for the dashboard.
  - Composes the main widgets: `ClockWidget`, `SearchWidget`, `WeatherWidget`, `MarkdownNotepad`, `GitLabFeed`, and `KanbanBoard`.
  - Uses `motion` from `framer-motion`/`motion` for entrance and layout animations.
  - Imports `@core/time-core` for its side effect (bootstraps the global time service).

Styling is provided by Tailwind CSS via the `@tailwindcss/vite` plugin, with icons from `lucide-react`.

### Module Resolution

Module aliases are defined in `vite.config.ts` and `tsconfig.app.json`:

- `@core/*` → `src/core/*`
- `@libs/*` → `src/libs/*`

Prefer these aliases instead of long relative paths when working with shared services or libraries.

## Core Concepts and Technical Decisions

### 1. Event Bus (`emittify`)

**Files:**
- `src/libs/emittify/index.ts`
- `src/libs/emittify/react/index.ts`
- `src/core/events.ts`

The dashboard uses a custom typed event-bus library (`emittify`) rather than global React context or third-party state managers for cross-widget communication.

Key behavior:

- Strongly typed events: the emitter is generic over an `EventsType` map (event key → payload type).
- Per-event listener registry: each event key maintains a set of listener IDs.
- Optional caching: events listed in `cachedEvents` keep the last payload; new listeners receive an initial value immediately.
- Optional deduplication: events listed in `deduplicatedEvents` use shallow or deep comparison to avoid emitting unchanged payloads (reduces unnecessary React renders).
- React integration: `src/libs/emittify/react/index.ts` adds `useEventListener(eventKey, fallbackValue?)` to subscribe from components in a hook-friendly way.

**Why this approach?**

- The dashboard has a few cross-cutting data streams (notably time) that many widgets may care about.
- An event bus keeps these decoupled: producers (like the time service) don’t need to know which widgets are subscribed.
- Caching + deduplication are built-in, so widgets can subscribe without implementing their own memoization.

### 2. Time Service (`TimeCore`)

**Files:**
- `src/core/events.ts`
- `src/core/time-core.ts`
- `src/components/ClockWidget.tsx`

`TimeCore` centralizes all time-related logic instead of having each component use its own `setInterval`.

Behavior:

- On startup, `TimeCore` attempts to detect the user’s timezone:
  - Tries browser geolocation (`navigator.geolocation`).
  - Calls the BigDataCloud API via `timezoneAPI('getTimezoneByLocation', ...)` to resolve the IANA timezone.
  - Falls back to the system timezone (`Intl.DateTimeFormat().resolvedOptions().timeZone`) or `Europe/Tallinn` if resolution fails.
- Starts a **single** `setInterval` that ticks once per second.
- Uses `Intl.DateTimeFormat` with the resolved timezone to compute:
  - Hours, minutes, seconds.
  - A formatted date string (weekday, month, day).
  - A timezone abbreviation.
- Emits `TimeData` on the `'time.update'` event via the shared emitter.
- `src/core/events.ts` marks `'time.update'` as cached, so `ClockWidget` and any future widgets immediately receive the latest time on subscription.
- `ClockWidget` consumes the time via `emitter.useEventListener('time.update', fallback)` and renders animated digits using the `Counter` component.

**Why this approach?**

- Concentrating timekeeping in one service avoids multiple timers and drift between widgets.
- A single source of truth for timezone logic avoids duplicating the BigDataCloud integration and DST handling.
- Using the event bus makes it trivial to add future time-aware widgets (e.g., schedules, reminders) without threading props.

### 3. API Layer (`@colorfy-software/apify`)

**Files:**
- `src/api/requests.ts`
- `src/api/index.ts`
- `src/components/WeatherWidget.tsx`

The project wraps external HTTP APIs with `@colorfy-software/apify` instead of calling `fetch` directly from components.

Key pieces:

- `CreateRequestType` from `apify` is used to strongly type `{ params, response }` per endpoint.
- `GetRequestWithQueryParams<T>`:
  - Generic GET wrapper that builds query strings from `params` and validates URLs with the `URL` constructor.
  - Handles the way `APIConstructor` passes parameters (arrays) by normalizing down to a single `params` object.
- `GetRequestWithHeaders<T>`:
  - Specialized for GitLab:
    - Supports custom `RequestInit` options (notably headers).
    - Replaces `:id` in the endpoint path with `projectId` from `params`.
- Concrete requests:
  - BigDataCloud timezone: `/data/timezone-by-location`.
  - BigDataCloud reverse geocoding: `/data/reverse-geocode-client`.
  - Open-Meteo weather: `/v1/forecast`.
  - GitLab merge requests: `/api/v4/projects/:id/merge_requests`.
- `src/api/index.ts` uses `APIConstructor` to create three clients:
  - `timezoneAPI` (BigDataCloud base URL).
  - `weatherAPI` (Open-Meteo base URL).
  - `gitLabApi` (GitLab base URL).
  - All have logging hooks (`onRequestStart`, `onSuccess`, `onError`) for debugging.

**Why this approach?**

- Centralizing HTTP logic keeps components focused on presentation and basic data shaping.
- Using typed request definitions ensures consumers see the correct `params` and `response` shapes.
- The same API constructor pattern can be extended for future services without changing the widget layer.

### 4. Weather Integration

**Files:**
- `src/components/WeatherWidget.tsx`
- `src/api/index.ts`
- `src/api/requests.ts`

Behavior:

- Attempts to use browser geolocation:
  - If available, calls `weatherAPI('getWeatherForecast', ...)` with `current` and `daily` fields and `timezone: 'auto'`.
  - Then calls `timezoneAPI('getReverseGeocode', ...)` to resolve a human-readable location name.
- Derives a simplified `condition` string from Open-Meteo `weather_code` values and computes a 3-day forecast.
- If geolocation is denied/unavailable, falls back to a default location (Berlin) with `loadDefaultWeather()`.
- Exposes a refresh button that re-runs the fetch logic.

**Why this approach?**

- Uses public APIs that don’t require an API key, keeping the project easier to run locally.
- Encapsulates geolocation and weather response mapping in a single widget, minimizing global state.

### 5. Local Storage–Backed Widgets

Several widgets persist state to `localStorage` so the dashboard feels stateful across reloads:

- `MarkdownNotepad` (`src/components/MarkdownNotepad.tsx`):
  - Persists the current note under `markdown-notepad`.
  - Maintains a capped version history under `markdown-versions` with manual "Save Version" snapshots.
  - Implements debounced autosave while you type.
- `KanbanBoard` (`src/components/KanbanBoard.tsx`):
  - Persists tasks under `kanban-tasks`.
  - On first load, seeds the board with sample tasks.
- `SearchWidget` (`src/components/SearchWidget.tsx`):
  - Persists recent searches under `recent-searches` and displays them in a suggestions dropdown.

**Why this approach?**

- Local storage gives a lightweight, zero-backend persistence layer suitable for a personal dashboard.
- Each widget owns its own persistence key, keeping concerns isolated.

### 6. GitLab Feed (Mocked, API-Ready)

**File:**
- `src/components/GitLabFeed.tsx`

Behavior:

- Currently uses mocked merge request data and renders it with rich UI and animations.
- Inline comments document how to:
  - Create a GitLab API instance with `GetRequestWithHeaders` and `APIConstructor`.
  - Inject a private token via headers.
  - Call `getGitLabMergeRequests` with a `projectId` and `state`, then map the GitLab response into the component’s `MergeRequest` shape.

**Why this approach?**

- Allows developing and styling the MR feed without requiring real GitLab credentials.
- Provides a clear path to wire in real data later by reusing the existing API layer abstractions.

## Main Widgets

All widgets live under `src/components` and are composed in `src/App.tsx`:

- `ClockWidget` — animated clock driven by the global time service and `Counter`.
- `WeatherWidget` — local or default weather, plus a small forecast, via Open-Meteo and BigDataCloud.
- `MarkdownNotepad` — markdown editor/previewer with autosave and version history.
- `KanbanBoard` — three-column Kanban with drag-and-drop and persistence.
- `SearchWidget` — multi-engine search bar with recent and quick searches.
- `GitLabFeed` — animated list of (currently mocked) merge requests.

Each widget is designed to be mostly self-contained, with cross-cutting behavior extracted into `src/core` (services) and `src/libs` (shared utilities such as the event bus).
