# Hotel Search Platform

Production-grade hotel search interface built following the user's requirements. 
Features Next.js App Router, strict TypeScript, Tailwind CSS, shadcn/ui, Zustand state management, and next-intl for localization.

## 🏛 Architecture & Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: TailwindCSS & shadcn/ui
- **State Management**: Zustand
- **Localization**: next-intl (EN/AR, LTR/RTL support)
- **Mapping**: Google Maps JavaScript API (AdvancedMarkerElement)
- **Authentication**: Bearer Token simulation on custom `/api/hotels` route

### Clean Architecture

The codebase enforces strict separation of concerns:
- **`src/components`**: Pure UI only. Contains reusable basic components (`ui`), complex structures (`search`, `hotels`, `maps`), and layout wrappers (`shared`).
- **`src/hooks`**: Encapsulates business logic. `useHotels` connects UI to Zustand, `useInfiniteScroll` manages IntersectionObserver logic, and `useMapBounds` safely handles Google Maps events without jank.
- **`src/services`**: Centralizes API communication. Isolated fetch requests ensuring tokens and error-handling exist outside React components.
- **`src/store`**: App-wide UI & Data State (Zustand). Uses `shallow` comparisons extensively to prevent useless re-rendering of large lists.
- **`src/types`**: DTOs and interfaces ensuring absolute safety (`no any`). Types map directly to the `response-example.json`.
- **`src/lib`**: Helpers and SEO generators (Metadata, JSON-LD Schema).

## 🚀 Performance Optimizations (Lighthouse 100/100 target)

1. **Images**: `next/image` is used heavily; sizes attribute is precise; lazy-loading is enforced below the fold; priority loading is used only on hero images.
2. **Re-Renders Guarded**: `HotelCard` is wrapped in `React.memo`. Zustand state is selected individually or using `shallow` to ensure components connected to the store (like `HotelMap`) do not re-render when a different slice (like filters) updates.
3. **Map Rendering**: Google Maps API is initialized asynchronously using modern `@googlemaps/js-api-loader` and `AdvancedMarkerElement` which performs significantly better than legacy markers. Pan/zoom API spam is prevented via `setTimeout` debouncing in `useMapBounds`.
4. **Infinite Scroll UX**: Custom `IntersectionObserver` hook appends to existing arrays efficiently, mimicking native scrolling without heavy generic libraries.
5. **SEO & Accessibility**: 
   - Uses `generateMetadata` for dynamic OpenGraph and Server-Side meta tags.
   - Dynamic injection of Schema.org `LodgingBusiness` definitions using JSON-LD for rich snippets.
   - Complete keyboard nav support provided by `shadcn/ui` primitives (Radix UI).

## 📝 Trade-offs

- **Static vs Live API**: The assignment dictates mocking an API route. As such, while the real JSON output is enormous (4000+ lines), the mock returns a subset (around ~10 items initially, then dynamically generates infinite scrolls). Total counts reflect a realistic UI state but data is statically mapped to components.
- **Form State vs URL**: State management for user queries is held in Zustand, which enables extremely fast cross-component syncing (e.g., Maps & Form & List at once), however, in an actual production app, persisting some state to the URL (`?q=Paris&adults=2`) is preferable for shareability. For the scope of this assignment, Zustand correctly holds the "truth" to decouple the UI from Next.js server routers.
- **Language Switcher**: Next-intl uses locale prefixes (`/en`, `/ar`). A simple switcher is in the nav. Routing fully respects RTL/LTR dynamically via `dir="rtl"` in `layout.tsx`.

## 🧪 Testing

A Jest framework was not specifically scaffolding during the CLI init due to OS compatibility checks in this VM environment, however, we can drop components like `HotelCard` directly into Testing-Library easily since it takes a pure `Hotel` DTO and has zero external hook dependencies.
