import { createClient } from '@supabase/supabase-js'

type Table<Row> = {
	Row: Row
	Insert: Partial<Row>
	Update: Partial<Row>
	Relationships: []
}

export type Database = {
	public: {
		Tables: {
			profiles: Table<{
				id: string
				full_name: string
				email: string | null
				role: string
				department: string
				position: string
				avatar: string
				is_active: boolean
				manager_approved: boolean
				created_at: string
				updated_at: string
			}>
			course_categories: Table<{ id: string; name: string; description: string | null; created_at: string }>
			courses: Table<{
				id: string | number
				title: string | null
				description: string | null
				category: string | null
				duration_weeks: number | null
				level: string | null
				source: string | null
				source_url: string | null
				is_official: boolean | null
				is_published: boolean | null
				content_status: 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'Published'
				sequential_unlock: boolean | null
				created_by: string | null
				created_at: string | null
				updated_at: string | null
			}>
			course_weeks: Table<{ id: string; course_id: string; week_number: number; title: string; description: string; created_at: string }>
			course_videos: Table<{ id: string; week_id: string; title: string; description: string; video_url: string | null; transcript: string | null; transcript_language: string; duration_minutes: number | null; order_index: number; created_at: string }>
			enrollments: Table<{ id: string; user_id: string; course_id: string; enrolled_at: string; completed_at: string | null }>
			video_progress: Table<{ id: string; user_id: string; video_id: string; completed: boolean; completed_at: string | null }>
			quizzes: Table<{ id: string; week_id: string; title: string; passing_score: number; allow_retake: boolean; created_at: string }>
			quiz_questions: Table<{ id: string; quiz_id: string; question: string; option_a: string; option_b: string; option_c: string; option_d: string; correct_answer: number; explanation: string; order_index: number }>
			quiz_attempts: Table<{ id: string; quiz_id: string; user_id: string; score: number; passed: boolean; answers: Record<string, number>; attempted_at: string }>
			assignments: Table<{ id: string; week_id: string; title: string; description: string; instructions: string; deadline: string | null; created_at: string }>
			assignment_submissions: Table<{ id: string; assignment_id: string; user_id: string; response: string; score: number | null; feedback: string | null; submitted_at: string; reviewed_at: string | null }>
			competencies: Table<{ id: string; name: string; category: string; description: string; default_required: number; created_at: string }>
			user_competencies: Table<{ user_id: string; competency_id: string; current_score: number; required_score: number; updated_at: string }>
			certificates: Table<{ id: string; user_id: string; course_id: string; title: string; issued_date: string; expiry_date: string | null; verification_status: 'valid' | 'revoked'; created_at: string }>
			course_competencies: Table<{ course_id: string; competency_id: string }>
		}
		Views: Record<string, never>
		Functions: {
			verify_certificate: {
				Args: { lookup_certificate_id: string }
				Returns: { certificate_id: string; status: 'Valid'; learner_name: string; course_name: string | null; issued_date: string; completion_date: string | null }[]
			}
		}
		Enums: Record<string, never>
		CompositeTypes: Record<string, never>
	}
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey)
export const supabase = isSupabaseConfigured
	? createClient<Database>(supabaseUrl, supabaseKey)
	: null