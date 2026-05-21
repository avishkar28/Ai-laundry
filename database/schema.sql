-- ============================================================
-- FreshFold — PostgreSQL Schema (Phase 1–4 Complete)
-- ============================================================

-- Create UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgvector";

-- ============================================================
-- CORE TABLES (Phase 1: Order Lifecycle)
-- ============================================================

-- Customers
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL UNIQUE,
  email VARCHAR(255),
  address TEXT,
  city VARCHAR(100) DEFAULT 'Bangalore',
  pincode VARCHAR(10),
  preferred_delivery_time VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_phone (phone),
  INDEX idx_created_at (created_at)
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id VARCHAR(20) UNIQUE NOT NULL, -- ORD-XXXXX format
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  status VARCHAR(50) DEFAULT 'Created' CHECK (status IN (
    'Created', 'Pending Pickup', 'Pickup Assigned', 'Picked Up', 
    'Received At Laundry', 'Sorting', 'Washing', 'Drying', 'Ironing', 
    'Folding', 'Packing', 'Quality Check', 'Out For Delivery', 
    'Delivered', 'Completed'
  )),
  total_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  pickup_date DATE NOT NULL,
  delivery_date DATE NOT NULL,
  delivery_address TEXT,
  special_instructions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_customer_id (customer_id),
  INDEX idx_created_at (created_at),
  INDEX idx_order_id (order_id)
);

-- Order Items (what's being washed)
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  item_type VARCHAR(100) NOT NULL, -- shirt, pants, blanket, etc.
  quantity INT NOT NULL DEFAULT 1,
  weight_kg DECIMAL(8,2),
  service_type VARCHAR(100) NOT NULL, -- Wash & Fold, Dry Cleaning, Stain Removal, etc.
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_order_id (order_id)
);

-- Staff
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL UNIQUE,
  email VARCHAR(255),
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'driver', 'washer', 'ironing_staff', 'qc_specialist', 'delivery_staff', 'pickup_staff')),
  performance_score DECIMAL(5,2) DEFAULT 0, -- 0-100
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
  assigned_area VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_role (role),
  INDEX idx_status (status)
);

-- Staff Assignments (who's assigned to which task)
CREATE TABLE staff_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE RESTRICT,
  task_type VARCHAR(50) NOT NULL CHECK (task_type IN (
    'pickup', 'sorting', 'washing', 'drying', 'ironing', 'folding', 
    'packing', 'quality_check', 'delivery'
  )),
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  status VARCHAR(50) DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'failed')),
  notes TEXT,
  INDEX idx_order_id (order_id),
  INDEX idx_staff_id (staff_id),
  INDEX idx_task_type (task_type)
);

-- Workflow History (immutable audit log)
CREATE TABLE workflow_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL, -- status_changed, staff_assigned, notes_added, etc.
  status_from VARCHAR(50),
  status_to VARCHAR(50) NOT NULL,
  staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
  notes TEXT,
  ai_action BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_order_id (order_id),
  INDEX idx_timestamp (timestamp),
  INDEX idx_event_type (event_type)
);

-- ============================================================
-- PAYMENT & INVOICING TABLES (Phase 2)
-- ============================================================

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) CHECK (payment_method IN ('cash', 'upi', 'card', 'online')),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'partial', 'refunded')),
  due_date DATE,
  paid_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_order_id (order_id),
  INDEX idx_status (status)
);

CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sent_at TIMESTAMP,
  pdf_url VARCHAR(255),
  INDEX idx_order_id (order_id),
  INDEX idx_invoice_number (invoice_number)
);

-- ============================================================
-- QUALITY CHECK TABLES (Phase 2)
-- ============================================================

CREATE TABLE quality_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  qc_staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE RESTRICT,
  stain_removal_pass BOOLEAN,
  item_count_verified BOOLEAN,
  damage_detected BOOLEAN,
  damage_notes TEXT,
  ironing_quality_pass BOOLEAN,
  packaging_quality_pass BOOLEAN,
  overall_status VARCHAR(50) CHECK (overall_status IN ('passed', 'failed', 'rejected')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_order_id (order_id),
  INDEX idx_overall_status (overall_status)
);

-- ============================================================
-- INVENTORY TABLES (Phase 3)
-- ============================================================

CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_name VARCHAR(255) NOT NULL UNIQUE,
  item_type VARCHAR(50) NOT NULL, -- chemical, packaging, consumable
  current_stock DECIMAL(12,2) NOT NULL,
  reorder_level DECIMAL(12,2) NOT NULL,
  unit_cost DECIMAL(10,2) NOT NULL,
  daily_usage DECIMAL(10,2),
  supplier_id UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_item_type (item_type),
  INDEX idx_current_stock (current_stock)
);

CREATE TABLE inventory_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  transaction_type VARCHAR(50) CHECK (transaction_type IN ('in', 'out', 'adjustment')),
  quantity DECIMAL(12,2) NOT NULL,
  reason VARCHAR(255),
  staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_item_id (item_id),
  INDEX idx_timestamp (timestamp)
);

-- ============================================================
-- CUSTOMER LOYALTY TABLES (Phase 4)
-- ============================================================

CREATE TABLE customer_loyalty (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL UNIQUE REFERENCES customers(id) ON DELETE CASCADE,
  loyalty_points INT DEFAULT 0,
  tier VARCHAR(50) DEFAULT 'bronze', -- bronze, silver, gold, platinum
  referrals_count INT DEFAULT 0,
  last_order_date DATE,
  total_spent DECIMAL(10,2) DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tier (tier)
);

CREATE TABLE order_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  staff_feedback JSON, -- { staff_id: rating }
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_order_id (order_id),
  INDEX idx_rating (rating)
);

-- ============================================================
-- AI & TELEMETRY TABLES (All Phases)
-- ============================================================

CREATE TABLE ai_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  workflow_name VARCHAR(100),
  ai_decision VARCHAR(255),
  confidence_score DECIMAL(5,2),
  user_action VARCHAR(255),
  outcome VARCHAR(50), -- accepted, rejected, ignored, auto_executed
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_order_id (order_id),
  INDEX idx_timestamp (timestamp)
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name VARCHAR(100) NOT NULL,
  action VARCHAR(50) NOT NULL, -- INSERT, UPDATE, DELETE
  record_id UUID NOT NULL,
  changes JSONB,
  user_id UUID,
  ip_address VARCHAR(45),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_table_name (table_name),
  INDEX idx_timestamp (timestamp)
);

CREATE TABLE notification_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  notification_type VARCHAR(50), -- order_status, payment_reminder, delivery_alert, promo
  channel VARCHAR(50), -- sms, email, push, toast, voice
  content TEXT,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP,
  INDEX idx_customer_id (customer_id),
  INDEX idx_sent_at (sent_at)
);

-- ============================================================
-- ANALYTICS TABLES (Phase 4)
-- ============================================================

CREATE TABLE order_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  time_to_pickup INT, -- minutes
  time_in_laundry INT, -- minutes
  time_to_delivery INT, -- minutes
  total_processing_time INT, -- minutes
  quality_passed BOOLEAN,
  customer_satisfaction INT, -- 1-5
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_order_id (order_id)
);

CREATE TABLE daily_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_date DATE UNIQUE NOT NULL,
  total_orders INT,
  completed_orders INT,
  revenue DECIMAL(12,2),
  average_rating DECIMAL(3,2),
  peak_hour INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_metric_date (metric_date)
);

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================

CREATE INDEX idx_orders_status_date ON orders(status, created_at DESC);
CREATE INDEX idx_orders_customer_date ON orders(customer_id, created_at DESC);
CREATE INDEX idx_workflow_history_order_date ON workflow_history(order_id, timestamp DESC);
CREATE INDEX idx_payments_order_status ON payments(order_id, status);

-- ============================================================
-- SAMPLE DATA (Phase 1)
-- ============================================================

-- Insert sample customers
INSERT INTO customers (name, phone, email, address, city) VALUES
('Rahul Sharma', '9876543210', 'rahul@example.com', '123 MG Road, Apt 501', 'Bangalore'),
('Priya Singh', '8765432109', 'priya@example.com', '456 Brigade Road', 'Bangalore'),
('Amit Kumar', '7654321098', 'amit@example.com', '789 Koramangala Street', 'Bangalore'),
('Anita Reddy', '6543210987', 'anita@example.com', '321 Whitefield Area', 'Bangalore'),
('Sneha Patel', '5432109876', 'sneha@example.com', '654 JP Nagar Road', 'Bangalore');

-- Insert sample staff
INSERT INTO staff (name, phone, email, role, performance_score, assigned_area) VALUES
('Ramesh Kumar', '9001234567', 'ramesh@freshfold.com', 'driver', 95.5, 'Indiranagar'),
('Suresh Patel', '9001234568', 'suresh@freshfold.com', 'driver', 92.0, 'Koramangala'),
('Anil Sharma', '9001234569', 'anil@freshfold.com', 'driver', 88.5, 'HSR Layout'),
('Priya Menon', '9001234570', 'priya@freshfold.com', 'qc_specialist', 97.0, 'Main Facility'),
('Deepa Bose', '9001234571', 'deepa@freshfold.com', 'washer', 91.5, 'Main Facility'),
('Vikram Singh', '9001234572', 'vikram@freshfold.com', 'washer', 87.0, 'Main Facility');

-- Insert sample orders (Phase 1 MVP)
INSERT INTO orders (order_id, customer_id, status, total_price, pickup_date, delivery_date, special_instructions)
SELECT 
  'ORD-' || LPAD((ROW_NUMBER() OVER (ORDER BY id) + 50000)::TEXT, 5, '0'),
  (ARRAY(SELECT id FROM customers ORDER BY RANDOM() LIMIT 1))[1],
  (ARRAY['Created', 'Pending Pickup', 'Pickup Assigned', 'Picked Up', 'Received At Laundry'])[FLOOR(RANDOM() * 5) + 1],
  ROUND((RANDOM() * 500 + 100)::NUMERIC, 2),
  CURRENT_DATE + (RANDOM() * 3)::INT,
  CURRENT_DATE + (RANDOM() * 7 + 3)::INT,
  CASE WHEN RANDOM() > 0.7 THEN 'Delicate items - handle with care' ELSE NULL END
FROM generate_series(1, 10);

-- ============================================================
-- VIEWS FOR COMMON QUERIES (Phase 1+)
-- ============================================================

CREATE VIEW v_order_summary AS
SELECT 
  o.id,
  o.order_id,
  o.status,
  c.name AS customer_name,
  c.phone AS customer_phone,
  COUNT(oi.id) AS item_count,
  COALESCE(SUM(oi.weight_kg), 0) AS total_weight,
  o.total_price,
  o.created_at,
  o.pickup_date,
  o.delivery_date
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.order_id, o.status, c.name, c.phone, o.total_price, o.created_at, o.pickup_date, o.delivery_date;

CREATE VIEW v_staff_workload AS
SELECT 
  s.id,
  s.name,
  s.role,
  COUNT(CASE WHEN sa.status = 'assigned' THEN 1 END) AS pending_tasks,
  COUNT(CASE WHEN sa.status = 'in_progress' THEN 1 END) AS in_progress_tasks,
  COUNT(CASE WHEN sa.status = 'completed' THEN 1 END) AS completed_tasks,
  s.performance_score
FROM staff s
LEFT JOIN staff_assignments sa ON s.id = sa.staff_id
GROUP BY s.id, s.name, s.role, s.performance_score;

CREATE VIEW v_workflow_timeline AS
SELECT 
  order_id,
  STRING_AGG(status_to || ' (' || TO_CHAR(timestamp, 'YYYY-MM-DD HH24:MI') || ')', ' → ' ORDER BY timestamp) AS timeline,
  MAX(timestamp) AS last_updated
FROM workflow_history
GROUP BY order_id;
