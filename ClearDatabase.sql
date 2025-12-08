/* ======================== VERİTABANI BOŞALTMA ======================== 
   Tüm tabloları sırayla temizler (Foreign key constraint'leri nedeniyle)
   ============================================================ */

-- Foreign key constraint'lerini geçici olarak devre dışı bırakmak yerine
-- Sıralı silme yapıyoruz (child tablolardan başlayarak)

-- 1. Ticket Items (en alt seviye)
DELETE FROM orderly.ticket_items;
GO

-- 2. Tickets
DELETE FROM orderly.tickets;
GO

-- 3. Menu Items
DELETE FROM orderly.menu_items;
GO

-- 4. Menu Categories
DELETE FROM orderly.menu_categories;
GO

-- 5. Dining Tables
DELETE FROM orderly.dining_tables;
GO

-- 6. Users (en son, çünkü tickets'ta referans var)
DELETE FROM orderly.users;
GO

PRINT N'Veritabanı başarıyla temizlendi!';
PRINT N'Tüm tablolar boşaltıldı.';
GO
