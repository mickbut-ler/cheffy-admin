import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type RecipeProcessingRun = {
    id: number
    phone_number: string
    content_id: string | null
    platform: string
    url: string
    status: string
    recipe_id: number | null
    error_message: string | null
    created_at: string | null
    user_id: string | null
    run_id: string | null
    good_recipe: boolean | null
    feedback: string | null
    sender: {
        id: string
        name: string | null
    } | null
}
