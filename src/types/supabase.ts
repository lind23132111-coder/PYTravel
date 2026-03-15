export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    email: string
                    display_name: string
                    avatar_url: string | null
                    created_at: string
                }
                Insert: {
                    id: string
                    email: string
                    display_name: string
                    avatar_url?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    display_name?: string
                    avatar_url?: string | null
                    created_at?: string
                }
            }
            trips: {
                Row: {
                    id: string
                    creator_id: string
                    title: string
                    description: string | null
                    start_date: string | null
                    end_date: string | null
                    cover_image_url: string | null
                    is_archived: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    creator_id: string
                    title: string
                    description?: string | null
                    start_date?: string | null
                    end_date?: string | null
                    cover_image_url?: string | null
                    is_archived?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    creator_id?: string
                    title?: string
                    description?: string | null
                    start_date?: string | null
                    end_date?: string | null
                    cover_image_url?: string | null
                    is_archived?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            participants: {
                Row: {
                    id: string
                    trip_id: string
                    profile_id: string | null
                    name: string
                    role: 'owner' | 'editor' | 'viewer'
                    joined_at: string
                }
                Insert: {
                    id?: string
                    trip_id: string
                    profile_id?: string | null
                    name: string
                    role?: 'owner' | 'editor' | 'viewer'
                    joined_at?: string
                }
                Update: {
                    id?: string
                    trip_id?: string
                    profile_id?: string | null
                    name?: string
                    role?: 'owner' | 'editor' | 'viewer'
                    joined_at?: string
                }
            }
            itinerary_items: {
                Row: {
                    id: string
                    trip_id: string
                    parent_id: string | null
                    group_tag: string | null
                    title: string
                    description: string | null
                    location_name: string | null
                    google_place_id: string | null
                    latitude: number | null
                    longitude: number | null
                    start_time: string | null
                    end_time: string | null
                    cost_estimate: number | null
                    currency: string | null
                    is_completed: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    trip_id: string
                    parent_id?: string | null
                    group_tag?: string | null
                    title: string
                    description?: string | null
                    location_name?: string | null
                    google_place_id?: string | null
                    latitude?: number | null
                    longitude?: number | null
                    start_time?: string | null
                    end_time?: string | null
                    cost_estimate?: number | null
                    currency?: string | null
                    is_completed?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    trip_id?: string
                    parent_id?: string | null
                    group_tag?: string | null
                    title?: string
                    description?: string | null
                    location_name?: string | null
                    google_place_id?: string | null
                    latitude?: number | null
                    longitude?: number | null
                    start_time?: string | null
                    end_time?: string | null
                    cost_estimate?: number | null
                    currency?: string | null
                    is_completed?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            expenses: {
                Row: {
                    id: string
                    trip_id: string
                    payer_id: string
                    amount: number
                    currency: string
                    exchange_rate: number
                    description: string
                    date: string
                    category: string | null
                    split_type: 'equal' | 'percentage' | 'fixed'
                    created_at: string
                }
                Insert: {
                    id?: string
                    trip_id: string
                    payer_id: string
                    amount: number
                    currency: string
                    exchange_rate?: number
                    description: string
                    date: string
                    category?: string | null
                    split_type: 'equal' | 'percentage' | 'fixed'
                    created_at?: string
                }
                Update: {
                    id?: string
                    trip_id?: string
                    payer_id?: string
                    amount?: number
                    currency?: string
                    exchange_rate?: number
                    description?: string
                    date?: string
                    category?: string | null
                    split_type?: 'equal' | 'percentage' | 'fixed'
                    created_at?: string
                }
            }
            expense_splits: {
                Row: {
                    id: string
                    expense_id: string
                    participant_id: string
                    share: number
                    amount_calculated: number
                }
                Insert: {
                    id?: string
                    expense_id: string
                    participant_id: string
                    share: number
                    amount_calculated: number
                }
                Update: {
                    id?: string
                    expense_id?: string
                    participant_id?: string
                    share?: number
                    amount_calculated?: number
                }
            }
        }
    }
}
