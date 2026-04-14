# Exoplanet Explorer

## What we're building
A full-stack exoplanet discovery app. Users search and browse NASA's
Exoplanet Archive (6,000+ confirmed planets), view detailed planetary
data, and save favorites to their personal collection. Built for the
MPCS 51238 "Design, Build, Ship" course.

## Tech stack
- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4 (dark space theme)
- Clerk for authentication (sign up, sign in, sign out)
- Supabase for data storage (favorites, scoped per user via RLS)
- NASA Exoplanet Archive TAP API (no key needed)
- Deployed on Vercel

## Pages
- `/` — Landing page with hero, stats, CTA to explore
- `/explore` — Search/browse exoplanets with filters
- `/favorites` — User's saved planets collection
- `/sign-in`, `/sign-up` — Clerk auth pages

## Data model (Supabase)
- `saved_planets` table with user_id from Clerk JWT, planet data
  columns, RLS policy: users only see/modify their own rows

## External API
- NASA Exoplanet Archive TAP API
- Base: https://exoplanetarchive.ipac.caltech.edu/TAP/sync
- Table: pscomppars
- Format: ADQL queries, JSON response
- No API key, no rate limits

## Design
- Dark space theme with deep blue/purple undertones
- Background: near-black (#050510) with subtle star field
- Accent: electric blue (#3B82F6) + warm amber (#F59E0B)
- Cards with glassmorphism (semi-transparent, blur backdrop)
- Geist font family
- Temperature color coding: blue (cold) -> green (habitable) -> amber (warm) -> red (hot)
- Mobile-responsive

@AGENTS.md
