-- ==============================================================================
-- AL-BASEET CAR RENTAL - COMPLETE SQL PRODUCTION DDL & SEED DATA SCRIPT
-- Compatible with PostgreSQL 12+ & MySQL 8.0+
-- Database Schema for Al-Baseet United Rent a Car Co.
-- ==============================================================================

-- 1. DROP EXISTING TABLES (IF CLEAN RE-INSTALLATION NEEDED)
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS cars CASCADE;
DROP TABLE IF EXISTS branches CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS hero_banners CASCADE;
DROP TABLE IF EXISTS promo_codes CASCADE;
DROP TABLE IF EXISTS insurance_policies CASCADE;

-- ==============================================================================
-- 2. CREATE TABLE DEFINITIONS
-- ==============================================================================

-- 2.1 CUSTOMERS TABLE (المستأجرين والعملاء)
CREATE TABLE customers (
    id BIGSERIAL PRIMARY KEY,
    national_id VARCHAR(20) NOT NULL UNIQUE,
    id_type VARCHAR(30) DEFAULT 'هوية وطنية',
    title VARCHAR(15) DEFAULT 'السيد',
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    license_number VARCHAR(30) NOT NULL,
    loyalty_points INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.2 CARS INVENTORY TABLE (أسطول السيارات)
CREATE TABLE cars (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    or_similar VARCHAR(50) DEFAULT 'أو ما شابه ذلك',
    model_year INT NOT NULL,
    category_id VARCHAR(30) NOT NULL,
    daily_rate DECIMAL(10, 2) NOT NULL,
    weekly_discount_rate DECIMAL(4, 2) DEFAULT 0.10,
    monthly_discount_rate DECIMAL(4, 2) DEFAULT 0.25,
    passengers INT DEFAULT 5,
    doors INT DEFAULT 4,
    transmission VARCHAR(20) DEFAULT 'أوتوماتيك',
    luggage_capacity INT DEFAULT 2,
    available_stock INT DEFAULT 1,
    image_url TEXT NOT NULL,
    badge VARCHAR(50),
    features JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.3 BRANCHES & LOCATIONS TABLE (الفروع والمواقع)
CREATE TABLE branches (
    id BIGSERIAL PRIMARY KEY,
    city_id VARCHAR(30) NOT NULL,
    city_name VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20) DEFAULT '8002440204',
    is_airport BOOLEAN DEFAULT FALSE,
    operating_hours TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.4 INSURANCE POLICIES TABLE (سياسات التغطية التأمينية)
CREATE TABLE insurance_policies (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(30) NOT NULL UNIQUE,
    name_ar VARCHAR(100) NOT NULL,
    description TEXT,
    price_per_day DECIMAL(10, 2) DEFAULT 0.00,
    deductible_amount DECIMAL(10, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE
);

-- 2.5 PROMO CODES TABLE (أكواد الخصم والعروض)
CREATE TABLE promo_codes (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(30) NOT NULL UNIQUE,
    discount_percentage DECIMAL(4, 2) NOT NULL,
    max_discount_amount DECIMAL(10, 2),
    start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '1 year'),
    usage_limit INT DEFAULT 1000,
    used_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

-- 2.6 HERO BANNERS CMS TABLE (سلايدر الإعلانات الرئيسية)
CREATE TABLE hero_banners (
    id BIGSERIAL PRIMARY KEY,
    badge_text VARCHAR(50),
    title VARCHAR(150) NOT NULL,
    subtitle TEXT,
    promo_code VARCHAR(30),
    bg_gradient TEXT DEFAULT 'linear-gradient(135deg, #071C18 0%, #004D40 100%)',
    cta_text VARCHAR(50) DEFAULT 'احجز الآن',
    display_order INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.7 BOOKINGS TABLE (عقود وإدارة الحجوزات)
CREATE TABLE bookings (
    id BIGSERIAL PRIMARY KEY,
    booking_ref VARCHAR(20) NOT NULL UNIQUE,
    customer_id BIGINT REFERENCES customers(id),
    car_id BIGINT REFERENCES cars(id),
    rental_mode VARCHAR(20) NOT NULL, -- daily, weekly, monthly
    service_type VARCHAR(20) NOT NULL, -- pickup, delivery
    pickup_branch_id BIGINT REFERENCES branches(id),
    dropoff_branch_id BIGINT REFERENCES branches(id),
    delivery_address TEXT,
    delivery_lat DECIMAL(10, 8),
    delivery_lng DECIMAL(11, 8),
    pickup_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    dropoff_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    rental_days INT NOT NULL,
    car_base_total DECIMAL(10, 2) NOT NULL,
    insurance_code VARCHAR(30) DEFAULT 'basic',
    insurance_total DECIMAL(10, 2) DEFAULT 0.00,
    add_ons JSONB DEFAULT '{}'::jsonb,
    add_ons_total DECIMAL(10, 2) DEFAULT 0.00,
    promo_code VARCHAR(30),
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    subtotal DECIMAL(10, 2) NOT NULL,
    vat_amount DECIMAL(10, 2) NOT NULL, -- 15% VAT
    grand_total DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL, -- mada, visa, tabby, tamara
    payment_status VARCHAR(20) DEFAULT 'paid', -- pending, paid, refunded
    booking_status VARCHAR(20) DEFAULT 'active', -- active, completed, cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 3. CREATE PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX idx_customers_national_id ON customers(national_id);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_cars_category ON cars(category_id);
CREATE INDEX idx_cars_daily_rate ON cars(daily_rate);
CREATE INDEX idx_branches_city ON branches(city_id);
CREATE INDEX idx_bookings_ref ON bookings(booking_ref);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_status ON bookings(booking_status);

-- ==============================================================================
-- 4. INSERT INITIAL SEED DATA
-- ==============================================================================

-- 4.1 HERO BANNERS SEED DATA
INSERT INTO hero_banners (id, badge_text, title, subtitle, promo_code, bg_gradient, cta_text, display_order, is_active) VALUES
(1, 'خصومات خاصة', 'وفر حتى 20% عند استئجار منتجات سامسونج والبسيط', 'عرض حصري لفترة محدودة على فئة السدان الكبيرة والاقتصادية', 'BASEET15', 'linear-gradient(135deg, #071C18 0%, #004D40 100%)', 'احجز عرضك الآن', 1, TRUE),
(2, 'برنامج الولاء', 'سواها المفتاح والبسيط! تكسب نقاط مزدوجة مع كل رحلة', 'استبدل نقاطك بأيام إيجار مجانية أو ترقية فئة السيارة تلقائياً', 'KEY2026', 'linear-gradient(135deg, #1A1805 0%, #7A5B00 100%)', 'استكشف برنامج الولاء', 2, TRUE),
(3, 'العرض الشهري', 'تأجير فليكس الشهري بأفضل سعر بالمملكة', 'سيارة تحت تصرفك شهراً كاملاً شاملة التأمين والتوصيل المباشر', 'MONTHLY25', 'linear-gradient(135deg, #1B003A 0%, #004D40 100%)', 'اشترك شهرياً', 3, TRUE);

-- 4.2 CARS FLEET SEED DATA
INSERT INTO cars (id, name, or_similar, model_year, category_id, daily_rate, weekly_discount_rate, monthly_discount_rate, passengers, doors, transmission, luggage_capacity, available_stock, image_url, badge, features, is_active) VALUES
(1, 'هيونداي أي 10 (Hyundai i10)', 'أو ما شابه ذلك', 2026, 'economy', 142.94, 0.10, 0.25, 4, 4, 'أوتوماتيك', 1, 21, 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80', 'الأكثر طلباً', '["تكييف ممتاز", "بلوتوث", "حساسات خلفية", "اقتصادية جداً في الوقود"]'::jsonb, TRUE),
(2, 'سوزوكي ديزاير (Suzuki Dzire)', 'أو ما شابه ذلك', 2025, 'economy', 135.70, 0.12, 0.28, 5, 4, 'أوتوماتيك', 2, 18, 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&auto=format&fit=crop&q=80', 'وفر أكثر', '["مقاعد مريحة", "استهلاك وقود ضئيل", "نظام صوتي مميز"]'::jsonb, TRUE),
(3, 'إم جي 3 (MG 3)', 'أو ما شابه ذلك', 2026, 'compact', 135.66, 0.10, 0.25, 4, 4, 'أوتوماتيك', 1, 15, 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=600&auto=format&fit=crop&q=80', 'موديل السنة', '["شاشة لمس", "كاميرا خلفية", "تصميم عصري شبابي"]'::jsonb, TRUE),
(4, 'تويوتا كامري (Toyota Camry)', 'أو ما شابه ذلك', 2026, 'midsize', 245.00, 0.15, 0.30, 5, 4, 'أوتوماتيك', 3, 12, 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=600&auto=format&fit=crop&q=80', 'الأفضل للعائلات', '["مثبت سرعة ذكي", "جلد فاخر", "فتحة سقف", "مساعد حارة"]'::jsonb, TRUE),
(5, 'تويوتا فورتشنر (Toyota Fortuner)', 'أو ما شابه ذلك', 2025, 'suv', 420.00, 0.15, 0.32, 7, 5, 'أوتوماتيك', 4, 8, 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop&q=80', 'دفع رباعي 4x4', '["7 مقاعد واسعة", "دفع رباعي قوي", "شاشات خلفية", "تبريد للمقاعد"]'::jsonb, TRUE),
(6, 'مرسيدس E-Class (Mercedes E-Class)', 'أو ما شابه ذلك', 2026, 'luxury', 850.00, 0.18, 0.35, 5, 4, 'أوتوماتيك', 3, 5, 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&auto=format&fit=crop&q=80', 'VIP فخامة مطلق', '["نظام قيادة ذاتية جزئي", "صوت Burmester المحيطي", "إضاءة محيطية 64 لون", "مقاعد مساج"]'::jsonb, TRUE),
(7, 'تويوتا هايس باص (Toyota HiAce)', 'أو ما شابه ذلك', 2025, 'commercial', 380.00, 0.15, 0.30, 12, 4, 'أوتوماتيك', 6, 6, 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600&auto=format&fit=crop&q=80', 'لنقل المجموعات', '["تكييف شامل لكل الصفوف", "مساحة تخزين ضخمة", "مقاعد مريحة"]'::jsonb, TRUE),
(8, 'لكزس ES 350 (Lexus ES 350)', 'أو ما شابه ذلك', 2026, 'premium', 620.00, 0.15, 0.30, 5, 4, 'أوتوماتيك', 3, 9, 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=600&auto=format&fit=crop&q=80', 'راحة ورقي', '["محرك V6 هادئ", "جلد طبيعي", "شاشة 12.3 بوصة", "عزل صوتي فائق"]'::jsonb, TRUE);

-- 4.3 BRANCHES SEED DATA
INSERT INTO branches (id, city_id, city_name, name, address, phone, is_airport, operating_hours, latitude, longitude, is_active) VALUES
(1, 'jeddah', 'جدة', 'محطة قطار السليمانية', 'محطة قطار السليمانية بجدة', '8002440204', FALSE, 'السبت - الخميس 10:00 صباحاً - 10:00 مساءً | الجمعة 05:00 مساءً - 10:00 مساءً', 21.5432, 39.1728, TRUE),
(2, 'jeddah', 'جدة', 'فندق الإنتركونتيننتال', 'فندق الإنتركونتيننتال الحمراء، جدة', '8002440204', FALSE, 'السبت - الخميس 10:00 صباحاً - 10:00 مساءً | الجمعة 05:00 مساءً - 10:00 مساءً', 21.5184, 39.1622, TRUE),
(3, 'jeddah', 'جدة', 'فندق ريتز كارلتون', 'فندق الريتز كارلتون بالحمراء، جدة', '8002440204', FALSE, 'السبت - الخميس 10:00 صباحاً - 10:00 مساءً | الجمعة 05:00 مساءً - 10:00 مساءً', 21.5211, 39.1589, TRUE),
(4, 'jeddah', 'جدة', 'فندق أصيلة', 'شارع الأمير محمد بن عبدالعزيز، الأندلس، جدة 23326', '8002440204', FALSE, 'السبت - الخميس 10:00 صباحاً - 10:00 مساءً | الجمعة 05:00 مساءً - 10:00 مساءً', 21.5540, 39.1650, TRUE),
(5, 'riyadh', 'الرياض', 'مطار الملك خالد الدولي T5', 'مطار الملك خالد الدولي، صالة 5، الرياض', '8002440204', TRUE, 'مفتوح 24 ساعة طوال أيام الأسبوع', 24.9576, 46.6988, TRUE),
(6, 'riyadh', 'الرياض', 'فرع طريق الملك عبد العزيز', 'طريق الملك عبدالعزيز، حي الياسمين، الرياض', '8002440204', FALSE, 'السبت - الخميس 08:00 صباحاً - 11:00 مساءً', 24.7743, 46.6380, TRUE),
(7, 'abha', 'أبها', 'مطار أبها الدولي', 'صالة الوصول، مطار أبها الدولي', '8002440204', TRUE, 'مفتوح 24 ساعة طوال أيام الأسبوع', 18.2403, 42.6567, TRUE),
(8, 'dammam', 'الدمام', 'مطار الملك فهد الدولي', 'صالة الوصول، مطار الملك فهد الدولي بالدمام', '8002440204', TRUE, 'مفتوح 24 ساعة طوال أيام الأسبوع', 26.4712, 49.7979, TRUE);

-- 4.4 INSURANCE POLICIES SEED DATA
INSERT INTO insurance_policies (id, code, name_ar, description, price_per_day, deductible_amount, is_active) VALUES
(1, 'basic', 'التأمين الأساسي (إجباري)', 'تأمين ضد الغير مع نسبة تحمل في حال الأخطاء المسجلة بحادث مروري', 0.00, 1500.00, TRUE),
(2, 'comprehensive', 'التأمين الشامل (توصية)', 'تأمين شامل بدون أي نسبة تحمل، يعفيك من الخدوش والحوادث الميدانية', 35.00, 0.00, TRUE),
(3, 'shield', 'درع البسيط الفائق', 'تأمين فائق شامل الإطارات والزجاج ورسوم التجميع والمساعدة على الطريق 24 ساعة', 60.00, 0.00, TRUE);

-- 4.5 PROMO CODES SEED DATA
INSERT INTO promo_codes (id, code, discount_percentage, max_discount_amount, is_active) VALUES
(1, 'BASEET15', 0.15, 200.00, TRUE),
(2, 'KEY2026', 0.20, 250.00, TRUE),
(3, 'MONTHLY25', 0.25, 500.00, TRUE);

-- 4.6 SAMPLE CUSTOMER SEED DATA
INSERT INTO customers (id, national_id, id_type, title, first_name, last_name, phone, email, license_number, loyalty_points) VALUES
(1, '1098765432', 'بطاقة هوية وطنية', 'السيد', 'سعد', 'العتيبي', '0501234567', 'saad@albaseetco.com', 'LIC-998877', 450);

-- ==============================================================================
-- END OF SQL DDL & SEED DATA SCRIPT
-- ==============================================================================
