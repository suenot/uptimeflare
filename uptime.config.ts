// MarketMaker status page config.
// The Telegram bot token lives in uptime.secret.ts (generated in CI from the
// TELEGRAM_BOT_TOKEN GitHub secret, never committed).

// Don't edit this line
import { MaintenanceConfig, PageConfig, WorkerConfig } from './types/config'

// Don't edit this line
import { TELEGRAM_BOT_TOKEN } from './uptime.secret'

const pageConfig: PageConfig = {
  title: 'MarketMaker Status',
  group: {
    Website: [
      'marketmaker-cc',
      'terminal',
      'trender',
      'warehouse',
      'docs',
      'researcher',
      'backtests',
      'portfolio-optimizer',
      'asdf',
      'gpu',
      'pocket',
      'listingapis',
      'listingapis-app',
    ],
    API: [
      'profitmaker-api',
      'auth',
      'listingapis-api',
      'kimchi-backend',
      'warehouse-api',
      'backups',
      'solver',
      'crm',
      'popularity',
      'asdf-api',
      'metrics',
      'visual',
      'gpu-api',
      'harness-analyzer-api',
      'sandbox-api',
      'arena',
    ],
    Infra: ['gitlab', 'npm', 'cmdop'],
    External: ['auth-a8e'],
  },
}

const workerConfig: WorkerConfig = {
  // Define all your monitors here
  monitors: [
    // ===== Website =====
    { id: 'marketmaker-cc', name: 'marketmaker.cc', method: 'GET', target: 'https://marketmaker.cc' },
    { id: 'terminal', name: 'terminal.marketmaker.cc', method: 'GET', target: 'https://terminal.marketmaker.cc' },
    { id: 'trender', name: 'trender.marketmaker.cc', method: 'GET', target: 'https://trender.marketmaker.cc' },
    { id: 'warehouse', name: 'warehouse.marketmaker.cc', method: 'GET', target: 'https://warehouse.marketmaker.cc' },
    { id: 'docs', name: 'docs.marketmaker.cc', method: 'GET', target: 'https://docs.marketmaker.cc' },
    { id: 'researcher', name: 'researcher.marketmaker.cc', method: 'GET', target: 'https://researcher.marketmaker.cc/login' },
    { id: 'backtests', name: 'backtests.marketmaker.cc', method: 'GET', target: 'https://backtests.marketmaker.cc' },
    { id: 'portfolio-optimizer', name: 'portfolio-optimizer.marketmaker.cc', method: 'GET', target: 'https://portfolio-optimizer.marketmaker.cc' },
    { id: 'asdf', name: 'asdf.marketmaker.cc', method: 'GET', target: 'https://asdf.marketmaker.cc' },
    { id: 'gpu', name: 'gpu.marketmaker.cc', method: 'GET', target: 'https://gpu.marketmaker.cc' },
    { id: 'pocket', name: 'pocket.marketmaker.cc', method: 'GET', target: 'https://pocket.marketmaker.cc' },
    { id: 'listingapis', name: 'listingapis.com', method: 'GET', target: 'https://listingapis.com' },
    { id: 'listingapis-app', name: 'app.listingapis.com', method: 'GET', target: 'https://app.listingapis.com' },

    // ===== API =====
    { id: 'profitmaker-api', name: 'profitmaker-api.marketmaker.cc', method: 'GET', target: 'https://profitmaker-api.marketmaker.cc/health' },
    { id: 'auth', name: 'auth.marketmaker.cc', method: 'GET', target: 'https://auth.marketmaker.cc/health' },
    { id: 'listingapis-api', name: 'api.listingapis.com', method: 'GET', target: 'https://api.listingapis.com/api/health' },
    { id: 'kimchi-backend', name: 'kimchi (backend)', method: 'GET', target: 'https://kimchi.marketmaker.cc/healthz' },
    { id: 'warehouse-api', name: 'warehouse (backend API)', method: 'GET', target: 'https://warehouse.marketmaker.cc/api/v1/health' },
    { id: 'backups', name: 'backups.marketmaker.cc', method: 'GET', target: 'https://backups.marketmaker.cc/health' },
    { id: 'solver', name: 'solver.marketmaker.cc', method: 'GET', target: 'https://solver.marketmaker.cc/health' },
    { id: 'crm', name: 'crm.marketmaker.cc', method: 'GET', target: 'https://crm.marketmaker.cc/api/health' },
    { id: 'popularity', name: 'popularity.marketmaker.cc', method: 'GET', target: 'https://popularity.marketmaker.cc/healthz' },
    { id: 'asdf-api', name: 'asdf-api.marketmaker.cc', method: 'GET', target: 'https://asdf-api.marketmaker.cc/health' },
    { id: 'metrics', name: 'metrics.marketmaker.cc', method: 'GET', target: 'https://metrics.marketmaker.cc/api/health' },
    { id: 'visual', name: 'visual.marketmaker.cc', method: 'GET', target: 'https://visual.marketmaker.cc/api/health' },
    { id: 'gpu-api', name: 'gpu-api.marketmaker.cc', method: 'GET', target: 'https://gpu-api.marketmaker.cc/health' },
    { id: 'harness-analyzer-api', name: 'harness-analyzer-api.marketmaker.cc', method: 'GET', target: 'https://harness-analyzer-api.marketmaker.cc/api/status' },
    { id: 'sandbox-api', name: 'sandbox-api.marketmaker.cc', method: 'GET', target: 'https://sandbox-api.marketmaker.cc/readyz' },
    { id: 'arena', name: 'arena.marketmaker.cc', method: 'GET', target: 'https://arena.marketmaker.cc/api/v1/health' },

    // ===== Infra =====
    { id: 'gitlab', name: 'gitlab.marketmaker.cc', method: 'GET', target: 'https://gitlab.marketmaker.cc' },
    { id: 'npm', name: 'npm.marketmaker.cc', method: 'GET', target: 'https://npm.marketmaker.cc/-/ping' },
    { id: 'cmdop', name: 'cmdop.marketmaker.cc', method: 'GET', target: 'https://cmdop.marketmaker.cc/healthz/ready' },

    // ===== External =====
    { id: 'auth-a8e', name: 'auth.a8e.io', method: 'GET', target: 'https://auth.a8e.io/health' },

    // ===== temp: alert test =====
    { id: 'alert-test', name: 'alert-test (remove me)', method: 'GET', target: 'https://alert-test-invalid.marketmaker.cc' },
  ],
  notification: {
    webhook: {
      url: `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      method: 'POST',
      payloadType: 'json',
      payload: {
        chat_id: '-5509203256',
        text: '$MSG',
      },
    },
    timeZone: 'Etc/GMT',
    // Alert after 2 consecutive failed checks (~1-2 min) to avoid single-flake spam
    gracePeriod: 1,
  },
}

const maintenances: MaintenanceConfig[] = []

// Don't edit this line
export { maintenances, pageConfig, workerConfig }
