import type { MaintenanceConfig, PageConfig } from '../types/config'

export const pageConfig: PageConfig = {
  title: 'MarketMaker Status',
  logo: '/marketmaker-logo.svg',
  favicon: '/marketmaker-logo.svg',
  links: [{ label: 'Incident history', link: '/incidents' }],
  // Public project names follow marketmaker.cc/en/projects. Internal services
  // stay in their own group rather than being misrepresented as public products.
  group: {
    'MarketMaker platform': ['marketmaker-cc', 'docs', 'auth'],
    'Profitmaker.cc': ['terminal', 'profitmaker-api'],
    'Trender Bot': ['trender', 'realtime', 'api-mm'],
    Backtester: ['backtests'],
    'Portfolio Optimizer': ['portfolio-optimizer'],
    Arena: ['arena'],
    'ListingAPIs.com': ['listingapis', 'listingapis-app', 'listingapis-api'],
    'Crypto Warehouse': ['warehouse', 'warehouse-api'],
    'Kimchi Premium Screener': ['kimchi-backend'],
    'MarketMaker Sandbox': ['sandbox-api'],
    'Trading Events Calendar': ['events'],
    'Researches archive': ['researcher'],
    'Internal research & operations': [
      'asdf',
      'asdf-api',
      'gpu',
      'gpu-api',
      'pocket',
      'pocket-api',
      'solver',
      'crm',
      'popularity',
      'metrics',
      'visual',
      'harness-analyzer-api',
      'content',
      'backups',
    ],
    'Platform infrastructure': ['gitlab', 'npm'],
    'External dependency': ['auth-a8e'],
  },
}

export const maintenances: MaintenanceConfig[] = []
