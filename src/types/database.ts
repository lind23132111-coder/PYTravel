export type Profile = {
    id: string; // UUID from Auth
    email: string;
    display_name: string;
    avatar_url: string | null;
    created_at: string;
};

export type Trip = {
    id: string;
    creator_id: string; // References Profile
    title: string;
    description: string | null;
    start_date: string | null;
    end_date: string | null;
    cover_image_url: string | null;
    is_archived: boolean;
    created_at: string;
    updated_at: string;
};

export type Participant = {
    id: string;
    trip_id: string; // References Trip
    profile_id: string | null; // Null if it's a "ghost" participant (e.g., someone without an account yet)
    name: string; // Fallback if no profile
    role: 'owner' | 'editor' | 'viewer';
    joined_at: string;
};

export type ItineraryItem = {
    id: string;
    trip_id: string;
    parent_id: string | null; // For sub-items or branching
    group_tag: string | null; // To group items in a branch (e.g., "Team A", "Team B")
    title: string;
    description: string | null;
    location_name: string | null;
    google_place_id: string | null;
    latitude: number | null;
    longitude: number | null;
    start_time: string | null; // ISO string
    end_time: string | null;   // ISO string
    cost_estimate: number | null;
    currency: string | null;
    is_completed: boolean;
    created_at: string;
    updated_at: string;
};

export type Expense = {
    id: string;
    trip_id: string;
    payer_id: string; // References Participant
    amount: number;
    currency: string;
    exchange_rate: number; // Against trip base currency
    description: string;
    date: string;
    category: string | null;
    split_type: 'equal' | 'percentage' | 'fixed';
    created_at: string;
};

export type ExpenseSplit = {
    id: string;
    expense_id: string;
    participant_id: string;
    share: number; // value based on split_type
    amount_calculated: number; // Denormalized for easy querying
};
