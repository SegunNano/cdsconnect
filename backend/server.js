import app from './src/app.js'
import { PORT } from './src/config/env.js'

app.listen(PORT, () => {
    console.log(`CDS Connect server running on port ${PORT}`)
})