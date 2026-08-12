-- ADDRESSES (Customer address book)
-- Added in Phase 2 (Customer Authentication). Scoped strictly to the owning
-- customer via RLS — unlike profiles, address details are never public.
CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    label TEXT, -- optional, e.g. 'Home', 'Office'
    recipient_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    street TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_addresses_customer_id ON addresses(customer_id);

-- ROW LEVEL SECURITY: an address is only ever visible/editable by its owner.
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select own addresses" ON addresses
    FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Allow insert own addresses" ON addresses
    FOR INSERT WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Allow update own addresses" ON addresses
    FOR UPDATE USING (customer_id = auth.uid()) WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Allow delete own addresses" ON addresses
    FOR DELETE USING (customer_id = auth.uid());
