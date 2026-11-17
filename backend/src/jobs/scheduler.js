import cron from 'node-cron'
import { runTreasurerReminder } from './treasurerReminder.js'
import { runExcuseReminder } from './excuseReminder.js'
import { purgeLeftoverPhotos } from '../modules/election/election.service.js'


const TZ = 'Africa/Lagos'

// A failing job logs and moves on; it never crashes the server
const safely = (name, fn) => async () => {
    try { await fn() }
    catch (err) { console.error(`[job:${name}] failed:`, err.message) }
}

export const startScheduler = () => {
    // Always on in production; on a dev machine only with JOBS_ENABLED=true
    const enabled = process.env.NODE_ENV === 'production' || process.env.JOBS_ENABLED === 'true'
    if (!enabled) {
        console.log('Scheduled jobs are off (set JOBS_ENABLED=true to enable)')
        return
    }
    
    cron.schedule('0 6,18 * * *', safely('treasurer', runTreasurerReminder), { timezone: TZ })
    cron.schedule('0 8 * * *', safely('excuses', runExcuseReminder), { timezone: TZ })
    console.log('Scheduled jobs started (Africa/Lagos)')
}

cron.schedule('0 3 * * *', safely('election-photos', purgeLeftoverPhotos), { timezone: TZ })