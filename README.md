# GitHub User Explorer — React Hooks

A React app that searches GitHub users through the public GitHub REST API and shows each user's repositories with live statistics. It also includes a set of small demos of React hooks, each one showing a single technique.

Built with **React 19** and **Vite**.

## GitHub User Explorer

- Search GitHub users as you type, with a **500 ms debounce** so the app doesn't call the API on every keystroke
- Select a user to load their profile and repositories
- See summary stats (total repos, average stars, most-forked repo) and filter repositories by language
- Loading and error states for every request

### How it works

- `useEffect` with an **AbortController** cancels outdated requests. When the user types quickly, results from an older search can't arrive late and overwrite newer ones, and no extra network calls are left running.
- `useMemo` caches the sorting, filtering and stats calculations so they only rerun when the repository data or the filter changes, not on every render.
- `useCallback` keeps the user-select handler stable between renders, so the `React.memo`-wrapped `UserCard` components don't rerender when nothing about them changed.

## Hook examples

Switch to the **Hook Examples** tab to see:

| Demo | What it shows |
|---|---|
| Document Title Updater | `useEffect` with a dependency and a cleanup function |
| Interval Timer | Starting and clearing a `setInterval` safely |
| Expensive List Filter | `useMemo` to filter 10,000 items without rerunning on unrelated state changes |
| Prevent Child Re-renders | `React.memo` together with `useCallback` |
| Fixing Dependency Bugs | Stable object dependencies and functional state updates |

## Running it locally

You need [Node.js](https://nodejs.org/) 20 or later.

```bash
npm install
npm run dev
```

Then open the local address Vite prints, usually http://localhost:5173.

The GitHub API allows about 60 unauthenticated requests per hour per IP address. If searches stop returning results, wait a little and try again.
