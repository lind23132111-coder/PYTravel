export type TripRole = 'owner' | 'editor' | 'viewer';

export interface Trip {
    id: string;
    name: string;
    owner_id: string;
    start_date: string;
    end_date: string;
    theme_color: 'blue' | 'indigo' | 'violet' | 'slate';
    description?: string;
    created_at: string;
}

export interface TripCollaborator {
    id: string;
    trip_id: string;
    user_id: string;
    email: string;
    role: TripRole;
}

export interface ItineraryItem {
    id: string;
    trip_id: string;
    dayId: string; // e.g., "8/30", "8/31"
    time: string;
    title: string;
    location?: string;
    locationPlaceId?: string;
    description?: string;
    duration?: string;
    transport?: string;
    isBranch?: boolean;
    participants?: string[];
}
