# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Tooling and Commands

This is a Vite + React + TypeScript single-page app managed with Yarn.

- Install dependencies: `yarn install`
- Start dev server (Vite): `yarn dev`
- Build for production (TypeScript build + Vite bundle): `yarn build`
- Preview production build locally: `yarn preview`
- Lint TypeScript/JavaScript (ESLint flat config): `yarn lint`

Tests are not currently configured: there is no test runner or `test` script in `package.json`, and there are no `*.test.ts(x)` or `*.spec.ts(x)` files. To run a single test in the future, add a test runner (e.g. Vitest or Jest) and corresponding scripts first.

## High-Level Architecture

### Entry Points and Layout

- The HTML shell is `index.html`, which bootstraps the app via `/src/main.tsx`.
- `src/main.tsx` renders `App` inside the `#root` element and imports global styles from `src/index.css`.
- `src/App.tsx` is the top-level React component that:
  - Imports and composes the main widgets: `ClockWidget`, `SearchWidget`, `WeatherWidget`, `MarkdownNotepad`, `GitLabFeed`, and `KanbanBoard`.
  - Applies page-level layout, background gradients, and animations using `motion` from `framer-motion`/`motion`.
  - Imports `@core/time-core` for its side effect of starting the global time service.

Styling is done with Tailwind CSS (via `@tailwindcss/vite`) and icons from `lucide-react`.

### Module Resolution and Aliases

Module aliases are defined in both `vite.config.ts` and `tsconfig.app.json`:

- `@core/*` → `src/core/*`
- `@libs/*` → `src/libs/*`

When adding or moving core services or shared libraries, prefer these aliases instead of long relative paths so imports stay consistent across the app.

### Event System: `emittify`

A small typed event-bus library lives under `src/libs/emittify`:

- `src/libs/emittify/index.ts` defines a generic `Emitter` class that supports:
  - Registering listeners per event key.
  - Optional caching of the latest event payload (`cachedEvents`), so new subscribers receive an immediate initial value.
  - Optional deduplication (`deduplicatedEvents`) with shallow or deep equality, to avoid emitting unchanged values.
- `src/libs/emittify/react/index.ts` extends the base emitter with a React-friendly API:
  - `useEventListener(eventKey, fallbackValue?)` subscribes a component to an event, updating local state when events fire and returning the latest value (or cached value/fallback on first render).

This library is the main mechanism for cross-component state/events that do not fit in props.

### Core Services

Core services under `src/core` encapsulate cross-cutting functionality:

- `src/core/events.ts`
  - Instantiates a typed `EmittifyReact` emitter with a `TimeData` payload for the `'time.update'` event.
  - Marks `'time.update'` as a cached event so new listeners get an immediate time value.
- `src/core/time-core.ts`
  - Implements a singleton `TimeCore` class that:
    - Detects the user timezone: prefers browser geolocation with the BigDataCloud API via `timezoneAPI('getTimezoneByLocation', ...)`, falling back to the system timezone.
    - Starts a single `setInterval` ticking once per second (idempotent `start()` so multiple imports are safe).
    - Uses the `Intl.DateTimeFormat` API with the resolved timezone to compute `TimeData` (hours, minutes, seconds, formatted date string, timezone abbreviation).
    - Emits `TimeData` every second on the `'time.update'` event via the emitter from `events.ts`.
  - The module auto-starts the service on import (`timeCore.start()`), so any import of `@core/time-core` globally enables time updates.
- `src/core/index.ts`
  - Aggregates and exports `firebase`, `weather`, and `events` singletons for potential future core usages.
- `src/core/firebase.ts` and `src/core/weather.ts`
  - Currently minimal placeholders intended for future expansion (e.g., real Firebase integration, a dedicated weather service layer).

When introducing new app-wide services, follow the `time-core` pattern: encapsulate the logic in `src/core`, emit typed events via the shared emitter, and have widgets subscribe with `useEventListener` instead of duplicating timers or side effects in multiple components.

### API Layer

External HTTP APIs are wrapped under `src/api` using `@colorfy-software/apify`:

- `src/api/requests.ts`
  - Defines strongly typed request payload/response interfaces per endpoint.
  - Implements two helper classes compatible with `APIConstructor`:
    - `GetRequestWithQueryParams<T>` builds query-string-based GET requests given a `baseUrl` and endpoint path, handling params arrays, URL construction/validation, and JSON parsing.
    - `GetRequestWithHeaders<T>` is specialized for GitLab, additionally handling header injection and `:id` path substitution for project-specific endpoints.
  - Provides concrete request instances for:
    - BigDataCloud timezone lookup (`/data/timezone-by-location`).
    - Open-Meteo weather forecast (`/v1/forecast`).
    - BigDataCloud reverse geocoding (`/data/reverse-geocode-client`).
    - GitLab merge requests (`/api/v4/projects/:id/merge_requests`).
- `src/api/index.ts`
  - Uses `APIConstructor` to create three API clients with logging hooks:
    - `timezoneAPI` (BigDataCloud base URL).
    - `weatherAPI` (Open-Meteo base URL).
    - `gitLabApi` (GitLab base URL).
  - Each client exposes typed request functions keyed by name (e.g. `'getWeatherForecast'`).

`time-core` and `WeatherWidget` call into `timezoneAPI` and `weatherAPI` respectively. GitLab functionality is currently stubbed at the UI level but wired to support a real client if one is created.

### UI Widgets and State

Widgets in `src/components` are mostly self-contained but share several common patterns:

- **ClockWidget** (`src/components/ClockWidget.tsx`)
  - Subscribes to `'time.update'` via `emitter.useEventListener`, providing a `TimeData` fallback on first render.
  - Uses `Counter` (`src/components/Counter.tsx`) to animate hours/minutes/seconds digits with motion-based transitions.
  - Displays the formatted date and timezone string from `TimeData`.
- **Counter** (`src/components/Counter.tsx`)
  - Generic animated numeric counter built on `motion` hooks (`useSpring`, `useTransform`).
  - Composed of `Digit` and `Number` subcomponents that implement a rolling digit animation.
  - Designed to be reusable wherever animated numeric displays are needed.
- **WeatherWidget** (`src/components/WeatherWidget.tsx`)
  - On mount, attempts to obtain geolocation and queries `weatherAPI('getWeatherForecast', ...)`.
  - Optionally calls `timezoneAPI('getReverseGeocode', ...)` to resolve a human-readable location name.
  - Derives a simplified weather condition description from Open-Meteo `weather_code` values and builds a 3-day forecast.
  - Provides a manual refresh button that re-runs the fetch logic and geolocation.
  - Falls back to a default location (Berlin) if geolocation is unavailable/denied.
- **GitLabFeed** (`src/components/GitLabFeed.tsx`)
  - Currently renders mock merge request data with rich UI and animation.
  - Contains inline comments explaining how to wire a real GitLab API client using `GetRequestWithHeaders` and `APIConstructor`, including token and project ID handling.
- **MarkdownNotepad** (`src/components/MarkdownNotepad.tsx`)
  - Markdown editor/previewer with `react-markdown` and Tailwind-styled prose.
  - Persists the main note and a limited version history in `localStorage` (`markdown-notepad`, `markdown-versions`).
  - Provides manual snapshot saves, restore/delete of past versions, and autosave with debouncing.
- **KanbanBoard** (`src/components/KanbanBoard.tsx`)
  - Three-column Kanban (To Do / In Progress / Done) with drag-and-drop between columns.
  - Persists tasks in `localStorage` (`kanban-tasks`), initializing with sample tasks on first load.
- **SearchWidget** (`src/components/SearchWidget.tsx`)
  - Search bar with selectable engines (Google, GitHub, Stack Overflow, YouTube).
  - Persists recent searches in `localStorage` (`recent-searches`) and opens results in a new browser tab.

When extending the dashboard with new widgets, consider:

- Using the existing event bus (`@libs/emittify` + `@core/events`) for shared, push-based data instead of adding new global timers or polling in multiple components.
- Following the existing pattern of encapsulating external API access inside `src/api` (typed request definitions + `APIConstructor` instances) instead of calling `fetch` directly from components.
