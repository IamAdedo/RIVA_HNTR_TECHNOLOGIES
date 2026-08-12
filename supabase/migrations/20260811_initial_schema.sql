-- ENUMS
CREATE TYPE user_role AS ENUM ('super_admin', 'sales_manager', 'repair_tech', 'solar_manager', 'customer');
CREATE TYPE product_condition AS ENUM ('NEW', 'UK_USED_GRADE_A', 'UK_USED_GRADE_B', 'SECOND_HAND');
CREATE TYPE order_status AS ENUM ('pending_payment', 'payment_verified', 'processing', 'out_for_delivery', 'ready_for_pickup', 'completed', 'cancelled');
CREATE TYPE repair_status AS ENUM ('submitted', 'received', 'diagnosing', 'awaiting_approval', 'repairing', 'ready_for_pickup', 'completed');
CREATE TYPE solar_status AS ENUM ('lead_received', 'site_survey_scheduled', 'quote_sent', 'deposit_paid', 'installation_in_progress', 'commissioned');

-- PROFILES (Syncs with Auth)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    role user_role DEFAULT 'customer',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCTS
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL, -- 'Laptops', 'Accessories', 'Solar Inverters', 'Batteries'
    condition product_condition NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    stock_quantity INT DEFAULT 0,
    specs JSONB, -- {"ram": "16GB", "storage": "512GB SSD", "processor": "Intel i7 11th Gen", "battery_health": "92%"}
    testing_checklist JSONB, -- {"screen": "Pass", "keyboard": "Pass", "thermals": "Pass", "ports": "Pass"}
    images TEXT[] NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ORDERS
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_number VARCHAR(16) UNIQUE NOT NULL, -- e.g. ORD-2026-9812
    customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    guest_info JSONB, -- {"name": "...", "email": "...", "phone": "...", "delivery_address": "..."}
    total_amount NUMERIC(12, 2) NOT NULL,
    payment_gateway TEXT NOT NULL, -- 'paystack' | 'monnify'
    payment_reference TEXT UNIQUE,
    fulfillment_type TEXT NOT NULL, -- 'delivery' | 'in_store_pickup'
    current_status order_status DEFAULT 'pending_payment',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- REPAIR TICKETS
CREATE TABLE repair_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number VARCHAR(16) UNIQUE NOT NULL, -- e.g. REP-2026-1042
    customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    guest_info JSONB,
    device_model TEXT NOT NULL,
    fault_description TEXT NOT NULL,
    estimated_cost NUMERIC(12, 2),
    assigned_tech_id UUID REFERENCES profiles(id),
    current_status repair_status DEFAULT 'submitted',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SOLAR PROJECTS
CREATE TABLE solar_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_number VARCHAR(16) UNIQUE NOT NULL, -- e.g. SOL-2026-0591
    customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    guest_info JSONB,
    property_type TEXT NOT NULL, -- 'Residential' | 'Commercial'
    power_load_appliances JSONB NOT NULL,
    recommended_kva TEXT,
    current_status solar_status DEFAULT 'lead_received',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STATUS AUDIT LOG (Universal History)
CREATE TABLE status_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL, -- Links to orders, repair_tickets, or solar_projects
    entity_type TEXT NOT NULL, -- 'order' | 'repair' | 'solar'
    status TEXT NOT NULL,
    notes TEXT,
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category_condition ON products(category, condition);
CREATE INDEX idx_orders_tracking_number ON orders(tracking_number);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_repair_tickets_ticket_number ON repair_tickets(ticket_number);
CREATE INDEX idx_repair_tickets_customer_id ON repair_tickets(customer_id);
CREATE INDEX idx_repair_tickets_assigned_tech ON repair_tickets(assigned_tech_id);
CREATE INDEX idx_solar_projects_project_number ON solar_projects(project_number);
CREATE INDEX idx_solar_projects_customer_id ON solar_projects(customer_id);
CREATE INDEX idx_status_audit_logs_entity ON status_audit_logs(entity_id, entity_type);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE solar_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper to check user's role without recursion (Security Definer)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS user_role AS $$
DECLARE
  r user_role;
BEGIN
  SELECT role INTO r FROM public.profiles WHERE id = auth.uid();
  RETURN COALESCE(r, 'customer'::user_role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Allow public read profile details" ON profiles
    FOR SELECT USING (TRUE); -- Needed to fetch info about tech assignments, etc.

CREATE POLICY "Allow insert profile details" ON profiles
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Allow update self profile" ON profiles
    FOR UPDATE USING (auth.uid() = id OR public.get_my_role() = 'super_admin');

-- Products Policies
CREATE POLICY "Allow public select active products" ON products
    FOR SELECT USING (is_active = TRUE OR public.get_my_role() IN ('super_admin', 'sales_manager'));

CREATE POLICY "Allow write access for admin/sales manager" ON products
    FOR ALL USING (public.get_my_role() IN ('super_admin', 'sales_manager'));

-- Orders Policies
CREATE POLICY "Allow customers/guests to insert orders" ON orders
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Allow customers to view own orders" ON orders
    FOR SELECT USING (customer_id = auth.uid() OR public.get_my_role() IN ('super_admin', 'sales_manager'));

CREATE POLICY "Allow update orders for admins/sales managers" ON orders
    FOR UPDATE USING (public.get_my_role() IN ('super_admin', 'sales_manager'));

-- Repair Tickets Policies
CREATE POLICY "Allow insert repair tickets" ON repair_tickets
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Allow select repair tickets" ON repair_tickets
    FOR SELECT USING (
        customer_id = auth.uid() 
        OR assigned_tech_id = auth.uid() 
        OR public.get_my_role() IN ('super_admin', 'repair_tech')
    );

CREATE POLICY "Allow update repair tickets for staff" ON repair_tickets
    FOR UPDATE USING (public.get_my_role() IN ('super_admin', 'repair_tech'));

-- Solar Projects Policies
CREATE POLICY "Allow insert solar projects" ON solar_projects
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Allow select solar projects" ON solar_projects
    FOR SELECT USING (customer_id = auth.uid() OR public.get_my_role() IN ('super_admin', 'solar_manager'));

CREATE POLICY "Allow update solar projects for staff" ON solar_projects
    FOR UPDATE USING (public.get_my_role() IN ('super_admin', 'solar_manager'));

-- Status Audit Logs Policies
CREATE POLICY "Allow public insert/select status audit logs" ON status_audit_logs
    FOR ALL USING (TRUE); -- Verified through backend API checking the tracking credentials

-- Trigger: Sync Auth Users to Profiles Table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone_number, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Customer'),
    COALESCE(new.raw_user_meta_data->>'phone_number', ''),
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'customer'::user_role)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
