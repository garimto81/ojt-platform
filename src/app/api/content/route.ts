import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/content - List all content
export async function GET(request: NextRequest) {
  const supabase = createClient()

  const searchParams = request.nextUrl.searchParams
  const status = searchParams.get('status')
  const type = searchParams.get('type')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const offset = (page - 1) * limit

  try {
    // Fetch lessons from Supabase
    let query = supabase
      .from('lessons')
      .select('id, title, content, lesson_type, duration_minutes, created_at, day_id')
      .order('created_at', { ascending: false })

    // Apply filters
    if (type) {
      query = query.eq('lesson_type', type.toLowerCase())
    }

    const { data: lessons, error, count } = await query.range(offset, offset + limit - 1)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch content from database' },
        { status: 500 }
      )
    }

    // Transform lessons to content format
    const content = lessons?.map(lesson => ({
      id: lesson.id,
      title: lesson.title,
      slug: lesson.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
      description: lesson.content?.substring(0, 150) + '...' || '',
      type: lesson.lesson_type.toUpperCase(),
      status: 'PUBLISHED',
      author: { name: 'GG Production', email: 'admin@ggproduction.com' },
      difficulty: 'INTERMEDIATE',
      estimatedMinutes: lesson.duration_minutes || 30,
      viewCount: 0,
      avgRating: 0,
      createdAt: lesson.created_at,
    })) || []

    // Get total count
    const { count: totalCount } = await supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      content,
      total: totalCount || 0,
      page,
      limit,
      totalPages: Math.ceil((totalCount || 0) / limit),
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    )
  }
}

// POST /api/content - Create new content
export async function POST(request: NextRequest) {
  const supabase = createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, description, content, type, difficulty, dayId } = body

    // Validate required fields
    if (!title || !content || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Insert lesson into Supabase
    const { data: lesson, error } = await supabase
      .from('lessons')
      .insert({
        title,
        content,
        lesson_type: type.toLowerCase(),
        duration_minutes: 30,
        day_id: dayId || 1,
        points_reward: 100,
        is_required: true,
        order_index: 1
      })
      .select()
      .single()

    if (error) {
      console.error('Insert error:', error)
      return NextResponse.json(
        { error: 'Failed to create content' },
        { status: 500 }
      )
    }

    return NextResponse.json(lesson, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create content' },
      { status: 500 }
    )
  }
}
