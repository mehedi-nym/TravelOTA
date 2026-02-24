import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupDatabase() {
  try {
    console.log('[v0] Starting database setup...')

    // Create profiles table
    console.log('[v0] Creating profiles table...')
    await supabase.from('profiles').select('id').limit(1)

    // Create countries table
    console.log('[v0] Creating countries table...')
    const { error: countriesError } = await supabase.rpc('create_countries_table')
    if (countriesError && !countriesError.message.includes('already exists')) {
      console.error('[v0] Error creating countries table:', countriesError)
    }

    console.log('[v0] Database setup completed!')
  } catch (error) {
    console.error('[v0] Database setup error:', error)
    process.exit(1)
  }
}

setupDatabase()
