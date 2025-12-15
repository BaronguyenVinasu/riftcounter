# RiftCounter

A Wild Rift counter-pick and strategy assistant that helps players choose optimal champions, builds, and tactics based on enemy team composition.

![RiftCounter](https://img.shields.io/badge/Wild%20Rift-Counter%20Tool-000?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-000?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-000?style=for-the-badge)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Champion   │  │    Lane     │  │       Results           │  │
│  │   Select    │──│   Picker    │──│   (Counters/Builds)     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │ REST API
┌────────────────────────────┴────────────────────────────────────┐
│                      Backend (Express/Node)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Champion   │  │   Matchup   │  │       Build             │  │
│  │   Service   │  │   Engine    │  │    Aggregator           │  │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘  │
│         │                │                      │                │
│  ┌──────┴────────────────┴──────────────────────┴─────────────┐ │
│  │                    Data Layer                               │ │
│  │   PostgreSQL (Champions, Items, Matchups, Sources)          │ │
│  │   Redis (Cache, Rate Limiting)                              │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Features

- **Champion Counter Suggestions**: Get prioritized counter picks for your lane
- **Lane-Specific Tactics**: Actionable strategies for laning phase
- **Build Recommendations**: Aggregated builds with confidence scores from multiple sources
- **Skill Combo Tips**: Ability sequences and power spike timelines
- **Fuzzy Search**: Find champions by partial names or aliases
- **Source Attribution**: All suggestions cite data sources with timestamps

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- Docker & Docker Compose (optional)

### Using Docker (Recommended)

```bash
# Clone and start all services
docker-compose up -d

# Access the app at http://localhost:3000
```

### Manual Setup

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
npm run db:migrate

# Seed initial data
npm run db:seed

# Start development servers
npm run dev
```

## Project Structure

```
riftcounter/
├── frontend/                 # Next.js frontend application
│   ├── app/                  # App router pages
│   ├── components/           # React components
│   │   ├── ChampionSelect/   # Champion multi-select with fuzzy search
│   │   ├── LaneSelector/     # Lane picker component
│   │   ├── ResultsPanel/     # Analysis results display
│   │   ├── BuildCard/        # Build recommendation cards
│   │   └── TacticsList/      # Tactics display component
│   ├── lib/                  # Utilities and API client
│   └── styles/               # Global styles and Tailwind config
│
├── backend/                  # Express.js API server
│   ├── src/
│   │   ├── routes/           # API route handlers
│   │   ├── services/         # Business logic
│   │   │   ├── champion/     # Champion data service
│   │   │   ├── matchup/      # Matchup analysis engine
│   │   │   └── build/        # Build aggregation service
│   │   ├── data/             # Data ingestion and caching
│   │   ├── db/               # Database models and migrations
│   │   └── utils/            # Shared utilities
│   └── tests/                # Backend tests
│
├── shared/                   # Shared types and constants
│   └── types/                # TypeScript type definitions
│
├── data/                     # Seed data and static assets
│   ├── champions.json        # Champion roster
│   ├── items.json            # Item database
│   └── matchups.json         # Initial matchup matrix
│
├── docker/                   # Docker configuration
├── scripts/                  # Build and deployment scripts
└── docs/                     # Additional documentation
    └── api.yaml              # OpenAPI specification
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/champions` | GET | Get all champions with metadata |
| `/api/champion/:id` | GET | Get single champion details |
| `/api/champion/:id/builds` | GET | Get aggregated builds for champion |
| `/api/analyze` | POST | Analyze enemy lineup and get recommendations |
| `/api/items` | GET | Get all items |
| `/api/sources` | GET | Get data source status and freshness |

### Example: Analyze Request

```bash
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "enemies": ["Jinx", "Lee Sin", "Lux", "Nautilus", "Seraphine"],
    "lane": "bot",
    "options": { "preferCounters": true }
  }'
```

### Example Response

```json
{
  "laneEnemy": "Jinx",
  "counters": [
    {
      "champion": "Draven",
      "reason": "Strong early all-in pressure; can snowball before Jinx scales",
      "confidence": 85,
      "winrateEst": 54.2
    }
  ],
  "tactics": [
    {
      "title": "Early Lane (Levels 1-3)",
      "steps": [
        "Trade aggressively before level 3",
        "Punish when Jinx E is on cooldown"
      ],
      "reasoning": "Jinx lacks escape; early pressure denies her scaling"
    }
  ],
  "builds": [
    {
      "type": "default",
      "items": ["Bloodthirster", "Infinity Edge", "Rapid Firecannon"],
      "confidence": 88,
      "sources": [{"name": "WildRiftFire", "url": "...", "fetched": "2025-12-14"}]
    }
  ],
  "confidence": 82,
  "lastRefreshed": "2025-12-14T12:00:00Z"
}
```

## Adding a New Data Source

1. Create a new ingester in `backend/src/data/ingesters/`

```typescript
// backend/src/data/ingesters/mySource.ts
import { DataIngester, ChampionData } from '../types';

export class MySourceIngester implements DataIngester {
  name = 'MySource';
  priority = 3; // 1-5, higher = more trusted
  
  async fetchChampions(): Promise<ChampionData[]> {
    // Implementation
  }
  
  async fetchBuilds(championId: string): Promise<BuildData[]> {
    // Implementation
  }
}
```

2. Register in `backend/src/data/registry.ts`:

```typescript
import { MySourceIngester } from './ingesters/mySource';

registry.register(new MySourceIngester());
```

3. Run ingestion:

```bash
npm run ingest -- --source=MySource
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `REFRESH_INTERVAL_HOURS` | Data refresh interval | `24` |
| `SOURCE_WEIGHTS` | JSON object of source priorities | `{}` |
| `RATE_LIMIT_REQUESTS` | Max requests per window | `100` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in ms | `60000` |

### Source Priority Weights

Adjust how much each data source contributes to build recommendations:

```json
{
  "WildRiftFire": 1.0,
  "WR-META": 0.8,
  "WildRiftGuides": 0.7
}
```

## Testing

```bash
# Run all tests
npm test

# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# With coverage
npm run test:coverage
```

## Deployment

### Using GitHub Actions

The included workflow handles:
1. Running tests
2. Building Docker images
3. Deploying to your infrastructure

Configure secrets in your repository:
- `DOCKER_REGISTRY`
- `DATABASE_URL`
- `REDIS_URL`

### Manual Deployment

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

## Data Freshness & Patch Handling

RiftCounter tracks data freshness and patch cycles:

- All responses include `lastRefreshed` timestamp
- After a new patch is detected, all suggestions show "High Uncertainty" badge
- Data is automatically re-ingested when patch is detected
- Manual refresh: `npm run ingest:all`

## Ethics & Attribution

- All community sources are properly attributed
- Respects `robots.txt` and rate limits
- No scraping of disallowed endpoints
- Data cached locally to minimize external requests

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE)

## Acknowledgments

- Wild Rift community guides and resources
- Champion data aggregated from public sources
- Built with love for the Wild Rift community
