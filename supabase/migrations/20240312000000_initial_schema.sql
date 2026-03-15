-- Core Tables for PYTravel

-- 1. Profiles (linked to auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Trips
CREATE TABLE trips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES profiles(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  cover_image_url TEXT,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Participants
CREATE TABLE participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('owner', 'editor', 'viewer')) DEFAULT 'editor',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trip_id, profile_id)
);

-- 4. Itinerary Items (Branching Support)
CREATE TABLE itinerary_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES itinerary_items(id) ON DELETE SET NULL,
  group_tag TEXT, -- e.g., 'Branch A', 'Branch B'
  title TEXT NOT NULL,
  description TEXT,
  location_name TEXT,
  google_place_id TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  cost_estimate DECIMAL,
  currency TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Expenses
CREATE TABLE expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  payer_id UUID REFERENCES participants(id) NOT NULL,
  amount DECIMAL NOT NULL,
  currency TEXT NOT NULL,
  exchange_rate DECIMAL DEFAULT 1.0,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  category TEXT,
  split_type TEXT CHECK (split_type IN ('equal', 'percentage', 'fixed')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Expense Splits
CREATE TABLE expense_splits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_id UUID REFERENCES expenses(id) ON DELETE CASCADE NOT NULL,
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE NOT NULL,
  share DECIMAL NOT NULL, -- percentage or fixed value
  amount_calculated DECIMAL NOT NULL -- denormalized
);

-- RLS Policies (Basic)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_splits ENABLE ROW LEVEL SECURITY;
