import type { WorkerConfig } from '../types/config'
import { monitors } from './monitors'

export const workerConfig: WorkerConfig = {
  monitors,
  notification: {
    timeZone: 'Etc/GMT',
    // Alert after 2 consecutive failed checks (~1-2 min) to avoid single-flake spam.
    gracePeriod: 1,
  },
}
