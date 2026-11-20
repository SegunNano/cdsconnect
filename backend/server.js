import app from './src/app.js'
import { PORT } from './src/config/env.js'
import { startEmailWorker } from './src/jobs/emailWorker.js'
import { startScheduler } from './src/jobs/scheduler.js'


startScheduler()
startEmailWorker()

app.listen(PORT, () => {
    console.log(`CDS Connect server running on port ${PORT}`)
})