# 🏨 Hotel Search Platform

A high-performance, production-ready hotel search interface built with **Next.js 16**, featuring **SSR**, **ISR**, and advanced **Lighthouse optimizations**.

---

### 🚀 Key Highlights

| Feature | Tech Stack | Status |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) | ✅ Implemented |
| **State** | Zustand (with hydration) | ✅ Implemented |
| **I18n** | next-intl (EN/AR + RTL) | ✅ Implemented |
| **UX** | Google Maps API + Infinite Scroll | ✅ Implemented |
| **Performance** | SSR + ISR + Image Opt | ⚡ 100/100 Target |

---

### ✅ How to Use

#### 1) Search hotels
- In Open `http://localhost:3000/hotels`.
- Or production Open `https://hotelsearch1.vercel.app/hotels`.
- Use the search input to change the destination (ex: city name).
- Use the filters (guests/rooms, etc.) to refine results.
- Scroll to load more hotels (infinite scroll).

#### 2) View hotel details
- Click any hotel card from the results.
- You will be redirected to the hotel details page at `/hotels/[token]`.

#### 3) View hotels on the map
- The map renders alongside the results.
- Zoom in/out using the map controls.
- Hover over a price marker to preview the hotel (image/name/rating/price).
- Drag/zoom the map to explore a different area; results update based on the visible bounds.

---

### 🔑 Important: Google Maps API Key

The map will only load if you provide a valid Google Maps API key.

- Set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in your local `.env.local` and `.env` in production(recommended).
- This project also supports `NEXT_PUBLIC_GOOGLE_MAPS_MAP_KEY` as a fallback but maybe not allowing the current app production domain `https://hotelsearch1.vercel.app`.

If the key is missing or invalid, the UI will show a map error (ex: "Failed to load Google Maps").

####  SSR: Hotels Search (`/hotels`)
- **Server-Side Fetching**: Parses `searchParams` and fetches data on the server.
- **Instant Paint**: Real results are included in the initial HTML, no client fetch delay.
- **Hydration**: Reuses server data to hydrate Zustand store without double-fetching.

#### ⏳ ISR: Hotel Details (`/hotels/[token]`)
- **Static Generation**: Pre-built pages for key hotels using `generateStaticParams`.
- **Incremental Revalidation**: Updates stale cache every 5 minutes (`revalidate: 300`).

---

###  Performance & Accessibility

- **LCP & CLS Optimization**: Precise `next/image` sizing and aspect-ratio preservation.
- **Forced Reflow Fixes**: Sticky headers use GPU-accelerated transforms instead of padding shifts.
- **Wait-free UX**: Lazy-loading for heavy components (e.g., Maps) via `dynamic` imports.
- **WCAG AA Compliance**: Darkened typography and UI tokens for perfect contrast.

<img width="100%" alt="Lighthouse Performance Score" src="https://github.com/user-attachments/assets/2d7401e2-1f47-4e10-a651-e960e50d7fc0" />

---

###  Platform Preview

<div align="center">
  <table>
    <tr>
      <td width="50%">
        <img src="https://github.com/user-attachments/assets/c16cc034-e215-4255-8e06-d1aff8fef0c8" alt="Search Results" />
      </td>
      <td width="50%">
        <img src="https://github.com/user-attachments/assets/6504634f-5faa-4ecc-86ad-cc57ba125bc4" alt="Hotel Details" />
      </td>
    </tr>
  </table>
</div>

---

###  Architecture & Commands

<details>
<summary><b>View Folder Structure</b></summary>

- `src/app`: Next.js App Router (SSR/ISR routes)
- `src/components`: UI components (Atomic design)
- `src/hooks`: Business logic & shared behavior
- `src/services`: API abstraction layer
- `src/store`: Zustand state management
- `src/messages`: Translation dictionaries (i18n)

</details>

#### Commands
```bash
npm run dev     # Development mode
npm run build   # Production build (ISR/SSR generation)
npm run start   # Run production server
npm run test    # Execute Jest/RTL tests
```

---
