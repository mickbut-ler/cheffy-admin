import { type NextRequest, NextResponse } from "next/server"

// Mock data matching your schema
const mockRuns = [
    {
        id: 1,
        phone_number: "+1234567890",
        content_id: "content_123",
        platform: "Instagram",
        url: "https://instagram.com/recipe/123",
        status: "completed",
        recipe_id: 456,
        error_message: null,
        created_at: "2024-01-15T10:30:00Z",
        user_id: "user_789",
        run_id: "run_abc123",
        good_recipe: true,
        feedback: "Great recipe extraction!",
    },
    {
        id: 2,
        phone_number: "+1987654321",
        content_id: "content_456",
        platform: "TikTok",
        url: "https://tiktok.com/@chef/video/789",
        status: "failed",
        recipe_id: null,
        error_message: "Unable to parse recipe content",
        created_at: "2024-01-15T09:15:00Z",
        user_id: "user_456",
        run_id: "run_def456",
        good_recipe: false,
        feedback: null,
    },
    {
        id: 3,
        phone_number: "+1555123456",
        content_id: "content_789",
        platform: "YouTube",
        url: "https://youtube.com/watch?v=recipe123",
        status: "processing",
        recipe_id: null,
        error_message: null,
        created_at: "2024-01-15T11:45:00Z",
        user_id: "user_123",
        run_id: "run_ghi789",
        good_recipe: null,
        feedback: null,
    },
    {
        id: 4,
        phone_number: "+1444555666",
        content_id: "content_101",
        platform: "Instagram",
        url: "https://instagram.com/recipe/456",
        status: "completed",
        recipe_id: 789,
        error_message: null,
        created_at: "2024-01-14T15:20:00Z",
        user_id: "user_101",
        run_id: "run_xyz789",
        good_recipe: true,
        feedback: "Perfect extraction",
    },
    {
        id: 5,
        phone_number: "+1777888999",
        content_id: "content_202",
        platform: "TikTok",
        url: "https://tiktok.com/@foodie/video/101",
        status: "pending",
        recipe_id: null,
        error_message: null,
        created_at: "2024-01-14T12:10:00Z",
        user_id: "user_202",
        run_id: "run_pending1",
        good_recipe: null,
        feedback: null,
    },
]

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = 100
    const offset = (page - 1) * limit

    // Check if Supabase environment variables are available
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
        console.log("[v0] Supabase environment variables not found, using mock data")

        // Simulate pagination with mock data
        const total = mockRuns.length
        const paginatedData = mockRuns.slice(offset, offset + limit)

        return NextResponse.json({
            data: paginatedData,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        })
    }

    try {
        const { supabase } = await import("@/lib/supabase")

        // Get total count
        const { count } = await supabase.from("recipe_processing_run").select("*", { count: "exact", head: true })

        // Get paginated data with join to sender
        const { data, error } = await supabase
            .from("recipe_processing_run")
            .select(
                `
                    id,
                    content_id,
                    platform,
                    url,
                    status,
                    recipe_id,
                    error_message,
                    created_at,
                    run_id,
                    good_recipe,
                    feedback,
                    sender:user_id (
                    id,
                    name
                    )
                    `
            )
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1)

        console.log(JSON.stringify(data, null, 2))


        if (error) {
            console.error("Supabase error:", error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({
            data,
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit),
            },
        })
    } catch (error) {
        console.error("API error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
