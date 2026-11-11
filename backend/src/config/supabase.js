// import { createClient } from '@supabase/supabase-js'

// const supabase = createClient(
//     process.env.SUPABASE_URL,
//     process.env.SUPABASE_ANON_KEY
// )

// export default supabase

import { createClient } from '@supabase/supabase-js'

// Service-role key: server only, set on Render, never in the frontend
export default createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)