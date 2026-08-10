-- ==============================================================================
-- AL-BASEET CAR RENTAL - MICROSOFT SQL SERVER (T-SQL) PRODUCTION SCRIPT
-- Compatible with Microsoft SQL Server 2016 / 2019 / 2022 & Azure SQL Database
-- Database Name: albaseet_car_rental
-- ==============================================================================

-- 1. CREATE DATABASE (IF NOT EXISTS)
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = N'albaseet_car_rental')
BEGIN
    CREATE DATABASE [albaseet_car_rental];
END
GO

USE [albaseet_car_rental];
GO

-- ==============================================================================
-- 2. DROP EXISTING TABLES (IN CORRECT FOREIGN KEY ORDER)
-- ==============================================================================
IF OBJECT_ID(N'dbo.bookings', N'U') IS NOT NULL DROP TABLE dbo.bookings;
IF OBJECT_ID(N'dbo.cars', N'U') IS NOT NULL DROP TABLE dbo.cars;
IF OBJECT_ID(N'dbo.branches', N'U') IS NOT NULL DROP TABLE dbo.branches;
IF OBJECT_ID(N'dbo.customers', N'U') IS NOT NULL DROP TABLE dbo.customers;
IF OBJECT_ID(N'dbo.hero_banners', N'U') IS NOT NULL DROP TABLE dbo.hero_banners;
IF OBJECT_ID(N'dbo.promo_codes', N'U') IS NOT NULL DROP TABLE dbo.promo_codes;
IF OBJECT_ID(N'dbo.insurance_policies', N'U') IS NOT NULL DROP TABLE dbo.insurance_policies;
GO

-- ==============================================================================
-- 3. CREATE TABLE DEFINITIONS (T-SQL SYNTAX)
-- ==============================================================================

-- 3.1 CUSTOMERS TABLE (المستأجرين والعملاء)
CREATE TABLE dbo.customers (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    national_id NVARCHAR(20) NOT NULL UNIQUE,
    id_type NVARCHAR(30) DEFAULT N'هوية وطنية',
    title NVARCHAR(15) DEFAULT N'السيد',
    first_name NVARCHAR(50) NOT NULL,
    last_name NVARCHAR(50) NOT NULL,
    phone NVARCHAR(20) NOT NULL,
    email NVARCHAR(100) NOT NULL,
    license_number NVARCHAR(30) NOT NULL,
    loyalty_points INT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- 3.2 CARS INVENTORY TABLE (أسطول السيارات)
CREATE TABLE dbo.cars (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    or_similar NVARCHAR(50) DEFAULT N'أو ما شابه ذلك',
    model_year INT NOT NULL,
    category_id NVARCHAR(30) NOT NULL,
    daily_rate DECIMAL(10, 2) NOT NULL,
    weekly_discount_rate DECIMAL(4, 2) DEFAULT 0.10,
    monthly_discount_rate DECIMAL(4, 2) DEFAULT 0.25,
    passengers INT DEFAULT 5,
    doors INT DEFAULT 4,
    transmission NVARCHAR(20) DEFAULT N'أوتوماتيك',
    luggage_capacity INT DEFAULT 2,
    available_stock INT DEFAULT 1,
    image_url NVARCHAR(MAX) NOT NULL,
    badge NVARCHAR(50),
    features NVARCHAR(MAX) DEFAULT N'[]', -- JSON String in SQL Server
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE()
);

-- 3.3 BRANCHES & LOCATIONS TABLE (الفروع والمواقع)
CREATE TABLE dbo.branches (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    city_id NVARCHAR(30) NOT NULL,
    city_name NVARCHAR(50) NOT NULL,
    name NVARCHAR(100) NOT NULL,
    address NVARCHAR(MAX) NOT NULL,
    phone NVARCHAR(20) DEFAULT N'8002440204',
    is_airport BIT DEFAULT 0,
    operating_hours NVARCHAR(MAX) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE()
);

-- 3.4 INSURANCE POLICIES TABLE (سياسات التغطية التأمينية)
CREATE TABLE dbo.insurance_policies (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    code NVARCHAR(30) NOT NULL UNIQUE,
    name_ar NVARCHAR(100) NOT NULL,
    description NVARCHAR(MAX),
    price_per_day DECIMAL(10, 2) DEFAULT 0.00,
    deductible_amount DECIMAL(10, 2) DEFAULT 0.00,
    is_active BIT DEFAULT 1
);

-- 3.5 PROMO CODES TABLE (أكواد الخصم والعروض)
CREATE TABLE dbo.promo_codes (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    code NVARCHAR(30) NOT NULL UNIQUE,
    discount_percentage DECIMAL(4, 2) NOT NULL,
    max_discount_amount DECIMAL(10, 2),
    start_date DATETIME2 DEFAULT GETDATE(),
    end_date DATETIME2 DEFAULT DATEADD(YEAR, 1, GETDATE()),
    usage_limit INT DEFAULT 1000,
    used_count INT DEFAULT 0,
    is_active BIT DEFAULT 1
);

-- 3.6 HERO BANNERS CMS TABLE (سلايدر الإعلانات الرئيسية)
CREATE TABLE dbo.hero_banners (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    badge_text NVARCHAR(50),
    title NVARCHAR(150) NOT NULL,
    subtitle NVARCHAR(MAX),
    promo_code NVARCHAR(30),
    bg_gradient NVARCHAR(MAX) DEFAULT N'linear-gradient(135deg, #071C18 0%, #004D40 100%)',
    cta_text NVARCHAR(50) DEFAULT N'احجز الآن',
    display_order INT DEFAULT 1,
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE()
);

-- 3.7 BOOKINGS TABLE (عقود وإدارة الحجوزات)
CREATE TABLE dbo.bookings (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    booking_ref NVARCHAR(20) NOT NULL UNIQUE,
    customer_id BIGINT FOREIGN KEY REFERENCES dbo.customers(id),
    car_id BIGINT FOREIGN KEY REFERENCES dbo.cars(id),
    rental_mode NVARCHAR(20) NOT NULL, -- daily, weekly, monthly
    service_type NVARCHAR(20) NOT NULL, -- pickup, delivery
    pickup_branch_id BIGINT FOREIGN KEY REFERENCES dbo.branches(id),
    dropoff_branch_id BIGINT FOREIGN KEY REFERENCES dbo.branches(id),
    delivery_address NVARCHAR(MAX),
    delivery_lat DECIMAL(10, 8),
    delivery_lng DECIMAL(11, 8),
    pickup_datetime DATETIME2 NOT NULL,
    dropoff_datetime DATETIME2 NOT NULL,
    rental_days INT NOT NULL,
    car_base_total DECIMAL(10, 2) NOT NULL,
    insurance_code NVARCHAR(30) DEFAULT N'basic',
    insurance_total DECIMAL(10, 2) DEFAULT 0.00,
    add_ons NVARCHAR(MAX) DEFAULT N'{}',
    add_ons_total DECIMAL(10, 2) DEFAULT 0.00,
    promo_code NVARCHAR(30),
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    subtotal DECIMAL(10, 2) NOT NULL,
    vat_amount DECIMAL(10, 2) NOT NULL, -- 15% VAT
    grand_total DECIMAL(10, 2) NOT NULL,
    payment_method NVARCHAR(20) NOT NULL, -- mada, visa, tabby, tamara
    payment_status NVARCHAR(20) DEFAULT N'paid', -- pending, paid, refunded
    booking_status NVARCHAR(20) DEFAULT N'active', -- active, completed, cancelled
    created_at DATETIME2 DEFAULT GETDATE()
);
GO

-- ==============================================================================
-- 4. CREATE PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX idx_customers_national_id ON dbo.customers(national_id);
CREATE INDEX idx_customers_phone ON dbo.customers(phone);
CREATE INDEX idx_cars_category ON dbo.cars(category_id);
CREATE INDEX idx_cars_daily_rate ON dbo.cars(daily_rate);
CREATE INDEX idx_branches_city ON dbo.branches(city_id);
CREATE INDEX idx_bookings_ref ON dbo.bookings(booking_ref);
CREATE INDEX idx_bookings_customer ON dbo.bookings(customer_id);
CREATE INDEX idx_bookings_status ON dbo.bookings(booking_status);
GO

-- ==============================================================================
-- 5. INSERT INITIAL SEED DATA FOR SQL SERVER
-- ==============================================================================
SET IDENTITY_INSERT dbo.hero_banners ON;
INSERT INTO dbo.hero_banners (id, badge_text, title, subtitle, promo_code, bg_gradient, cta_text, display_order, is_active) VALUES
(1, N'خصومات خاصة', N'وفر حتى 20% عند استئجار منتجات سامسونج والبسيط', N'عرض حصري لفترة محدودة على فئة السدان الكبيرة والاقتصادية', N'BASEET15', N'linear-gradient(135deg, #071C18 0%, #004D40 100%)', N'احجز عرضك الآن', 1, 1),
(2, N'برنامج الولاء', N'سواها المفتاح والبسيط! تكسب نقاط مزدوجة مع كل رحلة', N'استبدل نقاطك بأيام إيجار مجانية أو ترقية فئة السيارة تلقائياً', N'KEY2026', N'linear-gradient(135deg, #1A1805 0%, #7A5B00 100%)', N'استكشف برنامج الولاء', 2, 1),
(3, N'العرض الشهري', N'تأجير فليكس الشهري بأفضل سعر بالمملكة', N'سيارة تحت تصرفك شهراً كاملاً شاملة التأمين والتوصيل المباشر', N'MONTHLY25', N'linear-gradient(135deg, #1B003A 0%, #004D40 100%)', N'اشترك شهرياً', 3, 1);
SET IDENTITY_INSERT dbo.hero_banners OFF;

SET IDENTITY_INSERT dbo.cars ON;
INSERT INTO dbo.cars (id, name, or_similar, model_year, category_id, daily_rate, weekly_discount_rate, monthly_discount_rate, passengers, doors, transmission, luggage_capacity, available_stock, image_url, badge, features, is_active) VALUES
(1, N'هيونداي أي 10 (Hyundai i10)', N'أو ما شابه ذلك', 2026, N'economy', 142.94, 0.10, 0.25, 4, 4, N'أوتوماتيك', 1, 21, N'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80', N'الأكثر طلباً', N'["تكييف ممتاز", "بلوتوث", "حساسات خلفية", "اقتصادية جداً في الوقود"]', 1),
(2, N'سوزوكي ديزاير (Suzuki Dzire)', N'أو ما شابه ذلك', 2025, N'economy', 135.70, 0.12, 0.28, 5, 4, N'أوتوماتيك', 2, 18, N'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&auto=format&fit=crop&q=80', N'وفر أكثر', N'["مقاعد مريحة", "استهلاك وقود ضئيل", "نظام صوتي مميز"]', 1),
(3, N'إم جي 3 (MG 3)', N'أو ما شابه ذلك', 2026, N'compact', 135.66, 0.10, 0.25, 4, 4, N'أوتوماتيك', 1, 15, N'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=600&auto=format&fit=crop&q=80', N'موديل السنة', N'["شاشة لمس", "كاميرا خلفية", "تصميم عصري شبابي"]', 1),
(4, N'تويوتا كامري (Toyota Camry)', N'أو ما شابه ذلك', 2026, N'midsize', 245.00, 0.15, 0.30, 5, 4, N'أوتوماتيك', 3, 12, N'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=600&auto=format&fit=crop&q=80', N'الأفضل للعائلات', N'["مثبت سرعة ذكي", "جلد فاخر", "فتحة سقف", "مساعد حارة"]', 1),
(5, N'تويوتا فورتشنر (Toyota Fortuner)', N'أو ما شابه ذلك', 2025, N'suv', 420.00, 0.15, 0.32, 7, 5, N'أوتوماتيك', 4, 8, N'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop&q=80', N'دفع رباعي 4x4', N'["7 مقاعد واسعة", "دفع رباعي قوي", "شاشات خلفية", "تبريد للمقاعد"]', 1),
(6, N'مرسيدس E-Class (Mercedes E-Class)', N'أو ما شابه ذلك', 2026, N'luxury', 850.00, 0.18, 0.35, 5, 4, N'أوتوماتيك', 3, 5, N'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&auto=format&fit=crop&q=80', N'VIP فخامة مطلق', N'["نظام قيادة ذاتية جزئي", "صوت Burmester المحيطي", "إضاءة محيطية 64 لون", "مقاعد مساج"]', 1),
(7, N'تويوتا هايس باص (Toyota HiAce)', N'أو ما شابه ذلك', 2025, N'commercial', 380.00, 0.15, 0.30, 12, 4, N'أوتوماتيك', 6, 6, N'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600&auto=format&fit=crop&q=80', N'لنقل المجموعات', N'["تكييف شامل لكل الصفوف", "مساحة تخزين ضخمة", "مقاعد مريحة"]', 1),
(8, N'لكزس ES 350 (Lexus ES 350)', N'أو ما شابه ذلك', 2026, N'premium', 620.00, 0.15, 0.30, 5, 4, N'أوتوماتيك', 3, 9, N'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=600&auto=format&fit=crop&q=80', N'راحة ورقي', N'["محرك V6 هادئ", "جلد طبيعي", "شاشة 12.3 بوصة", "عزل صوتي فائق"]', 1);
SET IDENTITY_INSERT dbo.cars OFF;

SET IDENTITY_INSERT dbo.branches ON;
INSERT INTO dbo.branches (id, city_id, city_name, name, address, phone, is_airport, operating_hours, latitude, longitude, is_active) VALUES
(1, N'jeddah', N'جدة', N'محطة قطار السليمانية', N'محطة قطار السليمانية بجدة', N'8002440204', 0, N'السبت - الخميس 10:00 صباحاً - 10:00 مساءً | الجمعة 05:00 مساءً - 10:00 مساءً', 21.5432, 39.1728, 1),
(2, N'jeddah', N'جدة', N'فندق الإنتركونتيننتال', N'فندق الإنتركونتيننتال الحمراء، جدة', N'8002440204', 0, N'السبت - الخميس 10:00 صباحاً - 10:00 مساءً | الجمعة 05:00 مساءً - 10:00 مساءً', 21.5184, 39.1622, 1),
(3, N'jeddah', N'جدة', N'فندق ريتز كارلتون', N'فندق الريتز كارلتون بالحمراء، جدة', N'8002440204', 0, N'السبت - الخميس 10:00 صباحاً - 10:00 مساءً | الجمعة 05:00 مساءً - 10:00 مساءً', 21.5211, 39.1589, 1),
(4, N'jeddah', N'جدة', N'فندق أصيلة', N'شارع الأمير محمد بن عبدالعزيز، الأندلس، جدة 23326', N'8002440204', 0, N'السبت - الخميس 10:00 صباحاً - 10:00 مساءً | الجمعة 05:00 مساءً - 10:00 مساءً', 21.5540, 39.1650, 1),
(5, N'riyadh', N'الرياض', N'مطار الملك خالد الدولي T5', N'مطار الملك خالد الدولي، صالة 5، الرياض', N'8002440204', 1, N'مفتوح 24 ساعة طوال أيام الأسبوع', 24.9576, 46.6988, 1),
(6, N'riyadh', N'الرياض', N'فرع طريق الملك عبد العزيز', N'طريق الملك عبدالعزيز، حي الياسمين، الرياض', N'8002440204', 0, N'السبت - الخميس 08:00 صباحاً - 11:00 مساءً', 24.7743, 46.6380, 1),
(7, N'abha', N'أبها', N'مطار أبها الدولي', N'صالة الوصول، مطار أبها الدولي', N'8002440204', 1, N'مفتوح 24 ساعة طوال أيام الأسبوع', 18.2403, 42.6567, 1),
(8, N'dammam', N'الدمام', N'مطار الملك فهد الدولي', N'صالة الوصول، مطار الملك فهد الدولي بالدمام', N'8002440204', 1, N'مفتوح 24 ساعة طوال أيام الأسبوع', 26.4712, 49.7979, 1);
SET IDENTITY_INSERT dbo.branches OFF;

SET IDENTITY_INSERT dbo.insurance_policies ON;
INSERT INTO dbo.insurance_policies (id, code, name_ar, description, price_per_day, deductible_amount, is_active) VALUES
(1, N'basic', N'التأمين الأساسي (إجباري)', N'تأمين ضد الغير مع نسبة تحمل في حال الأخطاء المسجلة بحادث مروري', 0.00, 1500.00, 1),
(2, N'comprehensive', N'التأمين الشامل (توصية)', N'تأمين شامل بدون أي نسبة تحمل، يعفيك من الخدوش والحوادث الميدانية', 35.00, 0.00, 1),
(3, N'shield', N'درع البسيط الفائق', N'تأمين فائق شامل الإطارات والزجاج ورسوم التجميع والمساعدة على الطريق 24 ساعة', 60.00, 0.00, 1);
SET IDENTITY_INSERT dbo.insurance_policies OFF;

SET IDENTITY_INSERT dbo.promo_codes ON;
INSERT INTO dbo.promo_codes (id, code, discount_percentage, max_discount_amount, is_active) VALUES
(1, N'BASEET15', 0.15, 200.00, 1),
(2, N'KEY2026', 0.20, 250.00, 1),
(3, N'MONTHLY25', 0.25, 500.00, 1);
SET IDENTITY_INSERT dbo.promo_codes OFF;

SET IDENTITY_INSERT dbo.customers ON;
INSERT INTO dbo.customers (id, national_id, id_type, title, first_name, last_name, phone, email, license_number, loyalty_points) VALUES
(1, N'1098765432', N'بطاقة هوية وطنية', N'السيد', N'سعد', N'العتيبي', N'0501234567', N'saad@albaseetco.com', N'LIC-998877', 450);
SET IDENTITY_INSERT dbo.customers OFF;

GO
-- ==============================================================================
-- END OF MICROSOFT SQL SERVER PRODUCTION SCRIPT
-- ==============================================================================
