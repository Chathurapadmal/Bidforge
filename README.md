# Bidforge

A simple auction marketplace built with **ASP.NET Core + EF Core (SQL Server)** and **Next.js (App Router)**.
Supports **JWT auth**, **image uploads**, **bidding**, **winner-only purchase**, **user profiles (name + avatar)**, **my auctions**, **my bids**, and **notifications** (bid placed, outbid, winner purchased).

---

## Features

- Public:

  - Browse auctions (grid, sorting).
  - Auction detail page with live status polling, leader name, and countdown.

- Authenticated:

  - Create auctions with image upload.
  - Bid on auctions (must beat current bid).
  - Winner can **Purchase** only after auction ends (stubbed action).
  - Profile page:

    - Edit display name.
    - Upload avatar.
    - **My Auctions** (created by you).
    - **My Bids** (auctions you’ve bid on).
    - **Notifications**:

      - `bid_placed` (you placed a bid)
      - `outbid` (someone beat your bid)
      - `winner_purchased` (you purchased after winning)

Images are stored under `wwwroot/uploads/auctions` & `wwwroot/uploads/avatars` and served statically.

---

## Tech Stack

- **Backend**: ASP.NET Core 8, EF Core (SQL Server), Identity (ApplicationUser), JWT (Bearer)
- **Frontend**: Next.js (App Router), TypeScript, SWR, Tailwind (classes)
- **Auth**: Persisted JWT in `localStorage`; sent via `Authorization: Bearer <token>` by a small fetch wrapper.
- **Storage**: Local disk (wwwroot) for images; DB for metadata.

---

## Monorepo Structure

```
/Bidforge               # Backend (ASP.NET Core)
  /Controllers
  /Data
  /Mapping (if used)
  /Models
  /Services
  Program.cs
  appsettings.json
  appsettings.Development.json

/frontend               # Frontend (Next.js)
  /src
    /app
      /buy
      /sell
      /productDetail/[id]
      /profile
      /auth (login/register if present)
      layout.tsx
    /lib
      api.ts
      config.ts (API_BASE + toImageSrc helper)
      session.ts (useSession)
  .env.local
  package.json
  next.config.js
  tailwind.config.js (if used)
```

> If your folder names differ, adjust paths accordingly.

---

## Quick Start

### 1) Backend (ASP.NET Core)

**Prereqs**: .NET 8 SDK, SQL Server (local instance is fine)

Set your connection string (optional) in `appsettings.Development.json` or rely on the default fallback used in `Program.cs`.

```bash
cd Bidforge
dotnet restore
dotnet ef database update   # Apply latest migrations
dotnet run                  # Runs on http://localhost:5014 by default
```

Swagger (dev only):
`http://localhost:5014/swagger`

Static files (images) are served from `wwwroot`. The app ensures these exist:

```
wwwroot/uploads/auctions
wwwroot/uploads/avatars
```

### 2) Frontend (Next.js)

**Prereqs**: Node 18+

Create `.env.local`:

```dotenv
# Frontend → Backend base URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:5014
```

Install & run:

```bash
cd frontend
npm install
npm run dev        # http://localhost:3000
```

---

## Authentication

- JWT created on login (custom auth controller not shown in this README; your project already includes it).
- Token is stored in `localStorage` by the frontend and attached to API calls by `apiFetch` / `apiFetchForm` (`src/lib/api.ts`).
- Backend validates JWT (symmetric key in `Program.cs` for dev; replace in production).

---

## Bidding Logic

- A new bid must be **strictly greater** than current highest amount (or auction’s `CurrentBid` if no prior bids).
- On placing a bid:

  - `bid_placed` notification to the bidder.
  - `outbid` notification to the previous leader (if any).

- After auction ends:

  - Only the **highest bidder** can call **Purchase** (`POST /api/auctions/{id}/purchase`), once.
  - On purchase: `winner_purchased` notification to the winner.

> Purchase is a stub—extend it to create an order or integrate payments.

---

## Key API Endpoints

Public:

- `GET /api/auctions?sort=newest|endingSoon|priceAsc|priceDesc&limit=&page=` — list
- `GET /api/auctions/{id}` — detail (+top bid info)
- `GET /api/auctions/{id}/status` — light polling (current bid, top bidder, ended, canPurchase)
- `GET /api/auctions/{id}/bids` — list of bids

Auth:

- `POST /api/auctions` (multipart/form-data) — create auction (requires JWT)
- `DELETE /api/auctions/{id}` — delete your own auction
- `GET /api/my/auctions` — your auctions
- `POST /api/auctions/{id}/bids` — place bid
- `POST /api/auctions/{id}/purchase` — winner-only purchase (after end)
- `GET /api/profile` — get profile (id, email, display name, avatar)
- `PUT /api/profile` — update display name
- `POST /api/profile/avatar` (multipart/form-data, field `file`) — upload avatar
- `GET /api/my/bids` — my bids (with auction info)
- `GET /api/notifications` — my notifications
- `POST /api/notifications/read-all` — mark all read
- `POST /api/notifications/read/{id}` — mark one read

Debug (dev):

- `GET /_endpoints` — dump all routes
- `GET /db/ping` — quick DB check

---

## Database & Migrations

We added:

- `Auction.WinnerId`, `Auction.PurchasedAtUtc`
- `ApplicationUser.DisplayName`, `ApplicationUser.AvatarUrl`
- `Notification` table

Create/update DB:

```bash
cd Bidforge
dotnet ef migrations add InitialCreate          # (first time)
dotnet ef database update

# later, after changes
dotnet ef migrations add ProfileAndNotifications
dotnet ef database update
```

---

## Frontend Notes

### Config

`src/lib/config.ts`:

```ts
export const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(
  /\/+$/,
  ""
);

const PLACEHOLDER = "/placeholder.png";

const BACKEND_ORIGIN = API_BASE; // same origin as API

export function toImageSrc(img?: string | null): string {
  if (!img) return PLACEHOLDER;
  let s = img.trim();
  try {
    s = decodeURIComponent(s);
  } catch {}
  if (/^https?:\/\//i.test(s)) return s;
  if (!BACKEND_ORIGIN) return s || PLACEHOLDER;
  if (s.startsWith("/")) return `${BACKEND_ORIGIN}${s}`;
  return `${BACKEND_ORIGIN}/${s.replace(/^\/+/, "")}`;
}
```

### Fetch Helpers

`src/lib/api.ts` injects the Bearer token automatically:

```ts
export function getToken() {
  return localStorage.getItem("token");
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {});
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!res.ok)
    throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
  return res.json();
}

export async function apiFetchForm(
  path: string,
  form: FormData,
  init: RequestInit = {}
) {
  const headers = new Headers(init.headers || {});
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    method: init.method ?? "POST",
    body: form,
    headers,
  });
  if (!res.ok)
    throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
  return res.json();
}
```

### Pages worth knowing

- `/buy` — list of auctions (has **More Details** button to `/productDetail/[id]`)
- `/productDetail/[id]` — bidding, leader name, countdown, purchase (winner-only)
- `/sell` — create auction (auth-required), **Your Auctions** with Delete
- `/profile` — dashboard (edit name, upload avatar, My Auctions, My Bids, Notifications)

---

## Common Gotchas & Fixes

- **405 on `/api/auctions`**
  Make sure your controller attribute is `[Route("api/auctions")]` and the `List` action has `[HttpGet]`.

- **404 on `/api/my/auctions`**
  Ensure the action is _routed_: in `AuctionsController` use `[HttpGet("~/api/my/auctions")]` **or** put it in `MyController` with `[Route("api/my")]` + `[HttpGet("auctions")]`.
  **Do not** register the same path multiple times (AmbiguousMatchException).

- **AmbiguousMatchException**
  Happens if `/api/my/auctions` is mapped in multiple places (controller + minimal API). Keep **one** mapping.

- **Images not loading / Next Image 400**
  If using `<Image>` component, you must configure external domains. Easiest fix: use plain `<img src={toImageSrc(a.image)} />`.

- **Self-signed / HTTPS dev issues**
  Run backend over **HTTP** (no `UseHttpsRedirection`) during dev; set `NEXT_PUBLIC_API_BASE_URL` to `http://localhost:5014`.

- **`String.repeat` RangeError**
  Replace `"0".repeat(n)` patterns with safe `padStart` or clamp the count:

  ```ts
  String(n).padStart(2, "0"); // instead of "0".repeat(2 - String(n).length)
  ```

- **PowerShell recursive search**

  ```
  Get-ChildItem -Path .\src -Recurse -File | Select-String -Pattern '\.repeat\('
  ```

---

## Environment

### Backend (`appsettings.Development.json`)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost,1433;Database=BidforgeDb;User Id=sa;Password=yourStrong(!)Password;Encrypt=True;TrustServerCertificate=True"
  },
  "Jwt": {
    "Issuer": "Bidforge",
    "Audience": "BidforgeClient",
    "CookieName": "auth"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

### Frontend (`.env.local`)

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://localhost:5014
```

---

## Scripts

Backend:

```bash
dotnet restore
dotnet build
dotnet ef migrations add <Name>
dotnet ef database update
dotnet run
```

Frontend:

```bash
npm install
npm run dev
npm run build
npm run start
```

---

## Roadmap (nice-to-haves)

- Real-time updates via SignalR (bids, notifications)
- Minimum bid increments & anti-sniping extension
- Stripe/PayPal integration on Purchase
- Email delivery for notifications
- Admin tools (moderation, close auctions)

---

## License

MIT (or your choice). Add a `LICENSE` file if publishing publicly.

---
