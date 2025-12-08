/* ======================== DUMMY DATA SEED ======================== 
   Her varlık için kapsamlı dummy data
   Kapalı ticketlar için farklı tarihler kullanılmıştır
   ============================================================ */

-- ---------- Users ----------
IF NOT EXISTS (SELECT 1 FROM orderly.users WHERE username = N'admin')
    INSERT INTO orderly.users (username, [password], role, created_at) VALUES
    (N'admin', N'admin123', N'admin', DATEADD(day, -30, GETUTCDATE()));

IF NOT EXISTS (SELECT 1 FROM orderly.users WHERE username = N'waiter1')
    INSERT INTO orderly.users (username, [password], role, created_at) VALUES
    (N'waiter1', N'waiter123', N'waiter', DATEADD(day, -25, GETUTCDATE()));

IF NOT EXISTS (SELECT 1 FROM orderly.users WHERE username = N'waiter2')
    INSERT INTO orderly.users (username, [password], role, created_at) VALUES
    (N'waiter2', N'waiter123', N'waiter', DATEADD(day, -20, GETUTCDATE()));

IF NOT EXISTS (SELECT 1 FROM orderly.users WHERE username = N'waiter3')
    INSERT INTO orderly.users (username, [password], role, created_at) VALUES
    (N'waiter3', N'waiter123', N'waiter', DATEADD(day, -15, GETUTCDATE()));

IF NOT EXISTS (SELECT 1 FROM orderly.users WHERE username = N'kitchen1')
    INSERT INTO orderly.users (username, [password], role, created_at) VALUES
    (N'kitchen1', N'kitchen123', N'kitchen', DATEADD(day, -25, GETUTCDATE()));

IF NOT EXISTS (SELECT 1 FROM orderly.users WHERE username = N'kitchen2')
    INSERT INTO orderly.users (username, [password], role, created_at) VALUES
    (N'kitchen2', N'kitchen123', N'kitchen', DATEADD(day, -20, GETUTCDATE()));

-- ---------- Dining Tables ----------
IF NOT EXISTS (SELECT 1 FROM orderly.dining_tables WHERE table_code = N'A1')
    INSERT INTO orderly.dining_tables (table_code, [status]) VALUES (N'A1', N'closed');
IF NOT EXISTS (SELECT 1 FROM orderly.dining_tables WHERE table_code = N'A2')
    INSERT INTO orderly.dining_tables (table_code, [status]) VALUES (N'A2', N'closed');
IF NOT EXISTS (SELECT 1 FROM orderly.dining_tables WHERE table_code = N'A3')
    INSERT INTO orderly.dining_tables (table_code, [status]) VALUES (N'A3', N'closed');
IF NOT EXISTS (SELECT 1 FROM orderly.dining_tables WHERE table_code = N'A4')
    INSERT INTO orderly.dining_tables (table_code, [status]) VALUES (N'A4', N'closed');
IF NOT EXISTS (SELECT 1 FROM orderly.dining_tables WHERE table_code = N'B1')
    INSERT INTO orderly.dining_tables (table_code, [status]) VALUES (N'B1', N'closed');
IF NOT EXISTS (SELECT 1 FROM orderly.dining_tables WHERE table_code = N'B2')
    INSERT INTO orderly.dining_tables (table_code, [status]) VALUES (N'B2', N'closed');
IF NOT EXISTS (SELECT 1 FROM orderly.dining_tables WHERE table_code = N'B3')
    INSERT INTO orderly.dining_tables (table_code, [status]) VALUES (N'B3', N'closed');
IF NOT EXISTS (SELECT 1 FROM orderly.dining_tables WHERE table_code = N'C1')
    INSERT INTO orderly.dining_tables (table_code, [status]) VALUES (N'C1', N'closed');
IF NOT EXISTS (SELECT 1 FROM orderly.dining_tables WHERE table_code = N'C2')
    INSERT INTO orderly.dining_tables (table_code, [status]) VALUES (N'C2', N'closed');
IF NOT EXISTS (SELECT 1 FROM orderly.dining_tables WHERE table_code = N'C3')
    INSERT INTO orderly.dining_tables (table_code, [status]) VALUES (N'C3', N'closed');
IF NOT EXISTS (SELECT 1 FROM orderly.dining_tables WHERE table_code = N'D1')
    INSERT INTO orderly.dining_tables (table_code, [status]) VALUES (N'D1', N'closed');
IF NOT EXISTS (SELECT 1 FROM orderly.dining_tables WHERE table_code = N'D2')
    INSERT INTO orderly.dining_tables (table_code, [status]) VALUES (N'D2', N'closed');

-- ---------- Menu Categories ----------
IF NOT EXISTS (SELECT 1 FROM orderly.menu_categories WHERE category_name = N'Çorbalar')
    INSERT INTO orderly.menu_categories (category_name, sort_order) VALUES (N'Çorbalar', 10);
IF NOT EXISTS (SELECT 1 FROM orderly.menu_categories WHERE category_name = N'Ana Yemekler')
    INSERT INTO orderly.menu_categories (category_name, sort_order) VALUES (N'Ana Yemekler', 20);
IF NOT EXISTS (SELECT 1 FROM orderly.menu_categories WHERE category_name = N'Salatalar')
    INSERT INTO orderly.menu_categories (category_name, sort_order) VALUES (N'Salatalar', 25);
IF NOT EXISTS (SELECT 1 FROM orderly.menu_categories WHERE category_name = N'Tatlılar')
    INSERT INTO orderly.menu_categories (category_name, sort_order) VALUES (N'Tatlılar', 30);
IF NOT EXISTS (SELECT 1 FROM orderly.menu_categories WHERE category_name = N'İçecekler')
    INSERT INTO orderly.menu_categories (category_name, sort_order) VALUES (N'İçecekler', 40);
IF NOT EXISTS (SELECT 1 FROM orderly.menu_categories WHERE category_name = N'Kahvaltılık')
    INSERT INTO orderly.menu_categories (category_name, sort_order) VALUES (N'Kahvaltılık', 5);

-- ---------- Menu Items ----------
-- Çorbalar
IF NOT EXISTS (SELECT 1 FROM orderly.menu_items mi 
               INNER JOIN orderly.menu_categories mc ON mi.category_id = mc.category_id 
               WHERE mc.category_name = N'Çorbalar' AND mi.item_name = N'Mercimek Çorbası')
    INSERT INTO orderly.menu_items (category_id, item_name, price)
    SELECT category_id, N'Mercimek Çorbası', 80 FROM orderly.menu_categories WHERE category_name=N'Çorbalar';

IF NOT EXISTS (SELECT 1 FROM orderly.menu_items mi 
               INNER JOIN orderly.menu_categories mc ON mi.category_id = mc.category_id 
               WHERE mc.category_name = N'Çorbalar' AND mi.item_name = N'Ezogelin Çorbası')
    INSERT INTO orderly.menu_items (category_id, item_name, price)
    SELECT category_id, N'Ezogelin Çorbası', 85 FROM orderly.menu_categories WHERE category_name=N'Çorbalar';

IF NOT EXISTS (SELECT 1 FROM orderly.menu_items mi 
               INNER JOIN orderly.menu_categories mc ON mi.category_id = mc.category_id 
               WHERE mc.category_name = N'Çorbalar' AND mi.item_name = N'Yayla Çorbası')
    INSERT INTO orderly.menu_items (category_id, item_name, price)
    SELECT category_id, N'Yayla Çorbası', 75 FROM orderly.menu_categories WHERE category_name=N'Çorbalar';

IF NOT EXISTS (SELECT 1 FROM orderly.menu_items mi 
               INNER JOIN orderly.menu_categories mc ON mi.category_id = mc.category_id 
               WHERE mc.category_name = N'Çorbalar' AND mi.item_name = N'Domates Çorbası')
    INSERT INTO orderly.menu_items (category_id, item_name, price)
    SELECT category_id, N'Domates Çorbası', 70 FROM orderly.menu_categories WHERE category_name=N'Çorbalar';

-- Ana Yemekler
IF NOT EXISTS (SELECT 1 FROM orderly.menu_items mi 
               INNER JOIN orderly.menu_categories mc ON mi.category_id = mc.category_id 
               WHERE mc.category_name = N'Ana Yemekler' AND mi.item_name = N'Izgara Tavuk')
    INSERT INTO orderly.menu_items (category_id, item_name, price)
    SELECT category_id, N'Izgara Tavuk', 220 FROM orderly.menu_categories WHERE category_name=N'Ana Yemekler';

IF NOT EXISTS (SELECT 1 FROM orderly.menu_items mi 
               INNER JOIN orderly.menu_categories mc ON mi.category_id = mc.category_id 
               WHERE mc.category_name = N'Ana Yemekler' AND mi.item_name = N'Köfte')
    INSERT INTO orderly.menu_items (category_id, item_name, price)
    SELECT category_id, N'Köfte', 200 FROM orderly.menu_categories WHERE category_name=N'Ana Yemekler';

IF NOT EXISTS (SELECT 1 FROM orderly.menu_items mi 
               INNER JOIN orderly.menu_categories mc ON mi.category_id = mc.category_id 
               WHERE mc.category_name = N'Ana Yemekler' AND mi.item_name = N'Kebap')
    INSERT INTO orderly.menu_items (category_id, item_name, price)
    SELECT category_id, N'Kebap', 250 FROM orderly.menu_categories WHERE category_name=N'Ana Yemekler';

IF NOT EXISTS (SELECT 1 FROM orderly.menu_items mi 
               INNER JOIN orderly.menu_categories mc ON mi.category_id = mc.category_id 
               WHERE mc.category_name = N'Ana Yemekler' AND mi.item_name = N'Balık Tava')
    INSERT INTO orderly.menu_items (category_id, item_name, price)
    SELECT category_id, N'Balık Tava', 280 FROM orderly.menu_categories WHERE category_name=N'Ana Yemekler';

IF NOT EXISTS (SELECT 1 FROM orderly.menu_items mi 
               INNER JOIN orderly.menu_categories mc ON mi.category_id = mc.category_id 
               WHERE mc.category_name = N'Ana Yemekler' AND mi.item_name = N'Lahmacun')
    INSERT INTO orderly.menu_items (category_id, item_name, price)
    SELECT category_id, N'Lahmacun', 60 FROM orderly.menu_categories WHERE category_name=N'Ana Yemekler';

IF NOT EXISTS (SELECT 1 FROM orderly.menu_items mi 
               INNER JOIN orderly.menu_categories mc ON mi.category_id = mc.category_id 
               WHERE mc.category_name = N'Ana Yemekler' AND mi.item_name = N'Pide')
    INSERT INTO orderly.menu_items (category_id, item_name, price)
    SELECT category_id, N'Pide', 80 FROM orderly.menu_categories WHERE category_name=N'Ana Yemekler';

-- Salatalar
IF NOT EXISTS (SELECT 1 FROM orderly.menu_items mi 
               INNER JOIN orderly.menu_categories mc ON mi.category_id = mc.category_id 
               WHERE mc.category_name = N'Salatalar' AND mi.item_name = N'Çoban Salata')
    INSERT INTO orderly.menu_items (category_id, item_name, price)
    SELECT category_id, N'Çoban Salata', 50 FROM orderly.menu_categories WHERE category_name=N'Salatalar';

IF NOT EXISTS (SELECT 1 FROM orderly.menu_items mi 
               INNER JOIN orderly.menu_categories mc ON mi.category_id = mc.category_id 
               WHERE mc.category_name = N'Salatalar' AND mi.item_name = N'Mevsim Salata')
    INSERT INTO orderly.menu_items (category_id, item_name, price)
    SELECT category_id, N'Mevsim Salata', 45 FROM orderly.menu_categories WHERE category_name=N'Salatalar';

IF NOT EXISTS (SELECT 1 FROM orderly.menu_items mi 
               INNER JOIN orderly.menu_categories mc ON mi.category_id = mc.category_id 
               WHERE mc.category_name = N'Salatalar' AND mi.item_name = N'Roka Salata')
    INSERT INTO orderly.menu_items (category_id, item_name, price)
    SELECT category_id, N'Roka Salata', 55 FROM orderly.menu_categories WHERE category_name=N'Salatalar';

-- Tatlılar
IF NOT EXISTS (SELECT 1 FROM orderly.menu_items mi 
               INNER JOIN orderly.menu_categories mc ON mi.category_id = mc.category_id 
               WHERE mc.category_name = N'Tatlılar' AND mi.item_name = N'Baklava')
    INSERT INTO orderly.menu_items (category_id, item_name, price)
    SELECT category_id, N'Baklava', 120 FROM orderly.menu_categories WHERE category_name=N'Tatlılar';

IF NOT EXISTS (SELECT 1 FROM orderly.menu_items mi 
               INNER JOIN orderly.menu_categories mc ON mi.category_id = mc.category_id 
               WHERE mc.category_name = N'Tatlılar' AND mi.item_name = N'Sütlaç')
    INSERT INTO orderly.menu_items (category_id, item_name, price)
    SELECT category_id, N'Sütlaç', 60 FROM orderly.menu_categories WHERE category_name=N'Tatlılar';

IF NOT EXISTS (SELECT 1 FROM orderly.menu_items mi 
               INNER JOIN orderly.menu_categories mc ON mi.category_id = mc.category_id 
               WHERE mc.category_name = N'Tatlılar' AND mi.item_name = N'Künefe')
    INSERT INTO orderly.menu_items (category_id, item_name, price)
    SELECT category_id, N'Künefe', 150 FROM orderly.menu_categories WHERE category_name=N'Tatlılar';

IF NOT EXISTS (SELECT 1 FROM orderly.menu_items mi 
               INNER JOIN orderly.menu_categories mc ON mi.category_id = mc.category_id 
               WHERE mc.category_name = N'Tatlılar' AND mi.item_name = N'Dondurma')
    INSERT INTO orderly.menu_items (category_id, item_name, price)
    SELECT category_id, N'Dondurma', 70 FROM orderly.menu_categories WHERE category_name=N'Tatlılar';

-- İçecekler
IF NOT EXISTS (SELECT 1 FROM orderly.menu_items mi 
               INNER JOIN orderly.menu_categories mc ON mi.category_id = mc.category_id 
               WHERE mc.category_name = N'İçecekler' AND mi.item_name = N'Ayran')
    INSERT INTO orderly.menu_items (category_id, item_name, price)
    SELECT category_id, N'Ayran', 40 FROM orderly.menu_categories WHERE category_name=N'İçecekler';

IF NOT EXISTS (SELECT 1 FROM orderly.menu_items mi 
               INNER JOIN orderly.menu_categories mc ON mi.category_id = mc.category_id 
               WHERE mc.category_name = N'İçecekler' AND mi.item_name = N'Kola')
    INSERT INTO orderly.menu_items (category_id, item_name, price)
    SELECT category_id, N'Kola', 35 FROM orderly.menu_categories WHERE category_name=N'İçecekler';

IF NOT EXISTS (SELECT 1 FROM orderly.menu_items mi 
               INNER JOIN orderly.menu_categories mc ON mi.category_id = mc.category_id 
               WHERE mc.category_name = N'İçecekler' AND mi.item_name = N'Çay')
    INSERT INTO orderly.menu_items (category_id, item_name, price)
    SELECT category_id, N'Çay', 15 FROM orderly.menu_categories WHERE category_name=N'İçecekler';

IF NOT EXISTS (SELECT 1 FROM orderly.menu_items mi 
               INNER JOIN orderly.menu_categories mc ON mi.category_id = mc.category_id 
               WHERE mc.category_name = N'İçecekler' AND mi.item_name = N'Kahve')
    INSERT INTO orderly.menu_items (category_id, item_name, price)
    SELECT category_id, N'Kahve', 50 FROM orderly.menu_categories WHERE category_name=N'İçecekler';

IF NOT EXISTS (SELECT 1 FROM orderly.menu_items mi 
               INNER JOIN orderly.menu_categories mc ON mi.category_id = mc.category_id 
               WHERE mc.category_name = N'İçecekler' AND mi.item_name = N'Su')
    INSERT INTO orderly.menu_items (category_id, item_name, price)
    SELECT category_id, N'Su', 10 FROM orderly.menu_categories WHERE category_name=N'İçecekler';

-- Kahvaltılık
IF NOT EXISTS (SELECT 1 FROM orderly.menu_items mi 
               INNER JOIN orderly.menu_categories mc ON mi.category_id = mc.category_id 
               WHERE mc.category_name = N'Kahvaltılık' AND mi.item_name = N'Menemen')
    INSERT INTO orderly.menu_items (category_id, item_name, price)
    SELECT category_id, N'Menemen', 100 FROM orderly.menu_categories WHERE category_name=N'Kahvaltılık';

IF NOT EXISTS (SELECT 1 FROM orderly.menu_items mi 
               INNER JOIN orderly.menu_categories mc ON mi.category_id = mc.category_id 
               WHERE mc.category_name = N'Kahvaltılık' AND mi.item_name = N'Omlet')
    INSERT INTO orderly.menu_items (category_id, item_name, price)
    SELECT category_id, N'Omlet', 90 FROM orderly.menu_categories WHERE category_name=N'Kahvaltılık';

IF NOT EXISTS (SELECT 1 FROM orderly.menu_items mi 
               INNER JOIN orderly.menu_categories mc ON mi.category_id = mc.category_id 
               WHERE mc.category_name = N'Kahvaltılık' AND mi.item_name = N'Serpme Kahvaltı')
    INSERT INTO orderly.menu_items (category_id, item_name, price)
    SELECT category_id, N'Serpme Kahvaltı', 180 FROM orderly.menu_categories WHERE category_name=N'Kahvaltılık';

-- ---------- Değişkenler (Tüm batch boyunca geçerli) ----------
DECLARE @AdminId BIGINT = (SELECT user_id FROM orderly.users WHERE username=N'admin');
DECLARE @Waiter1Id BIGINT = (SELECT user_id FROM orderly.users WHERE username=N'waiter1');
DECLARE @Waiter2Id BIGINT = (SELECT user_id FROM orderly.users WHERE username=N'waiter2');
DECLARE @Waiter3Id BIGINT = (SELECT user_id FROM orderly.users WHERE username=N'waiter3');
DECLARE @Kitchen1Id BIGINT = (SELECT user_id FROM orderly.users WHERE username=N'kitchen1');

DECLARE @A1Id BIGINT = (SELECT table_id FROM orderly.dining_tables WHERE table_code=N'A1');
DECLARE @A2Id BIGINT = (SELECT table_id FROM orderly.dining_tables WHERE table_code=N'A2');
DECLARE @A3Id BIGINT = (SELECT table_id FROM orderly.dining_tables WHERE table_code=N'A3');
DECLARE @A4Id BIGINT = (SELECT table_id FROM orderly.dining_tables WHERE table_code=N'A4');
DECLARE @B1Id BIGINT = (SELECT table_id FROM orderly.dining_tables WHERE table_code=N'B1');
DECLARE @B2Id BIGINT = (SELECT table_id FROM orderly.dining_tables WHERE table_code=N'B2');
DECLARE @B3Id BIGINT = (SELECT table_id FROM orderly.dining_tables WHERE table_code=N'B3');
DECLARE @C1Id BIGINT = (SELECT table_id FROM orderly.dining_tables WHERE table_code=N'C1');
DECLARE @C2Id BIGINT = (SELECT table_id FROM orderly.dining_tables WHERE table_code=N'C2');
DECLARE @C3Id BIGINT = (SELECT table_id FROM orderly.dining_tables WHERE table_code=N'C3');

DECLARE @GrilledChickenId BIGINT = (SELECT item_id FROM orderly.menu_items WHERE item_name=N'Izgara Tavuk');
DECLARE @AyranId BIGINT = (SELECT item_id FROM orderly.menu_items WHERE item_name=N'Ayran');
DECLARE @KofteId BIGINT = (SELECT item_id FROM orderly.menu_items WHERE item_name=N'Köfte');
DECLARE @SoupId BIGINT = (SELECT item_id FROM orderly.menu_items WHERE item_name=N'Mercimek Çorbası');
DECLARE @SaladId BIGINT = (SELECT item_id FROM orderly.menu_items WHERE item_name=N'Çoban Salata');
DECLARE @KebapId BIGINT = (SELECT item_id FROM orderly.menu_items WHERE item_name=N'Kebap');
DECLARE @BaklavaId BIGINT = (SELECT item_id FROM orderly.menu_items WHERE item_name=N'Baklava');
DECLARE @LahmacunId BIGINT = (SELECT item_id FROM orderly.menu_items WHERE item_name=N'Lahmacun');
DECLARE @ColaId BIGINT = (SELECT item_id FROM orderly.menu_items WHERE item_name=N'Kola');
DECLARE @FishId BIGINT = (SELECT item_id FROM orderly.menu_items WHERE item_name=N'Balık Tava');
DECLARE @KunefeId BIGINT = (SELECT item_id FROM orderly.menu_items WHERE item_name=N'Künefe');
DECLARE @PideId BIGINT = (SELECT item_id FROM orderly.menu_items WHERE item_name=N'Pide');
DECLARE @SutlacId BIGINT = (SELECT item_id FROM orderly.menu_items WHERE item_name=N'Sütlaç');

-- Ticket ID değişkenleri
DECLARE @Ticket1Id BIGINT;
DECLARE @Ticket2Id BIGINT;
DECLARE @Ticket3Id BIGINT;
DECLARE @Ticket4Id BIGINT;
DECLARE @Ticket5Id BIGINT;
DECLARE @Ticket6Id BIGINT;
DECLARE @Ticket7Id BIGINT;
DECLARE @Ticket8Id BIGINT;
DECLARE @Ticket9Id BIGINT;
DECLARE @Ticket10Id BIGINT;
DECLARE @OpenTicket1Id BIGINT;
DECLARE @OpenTicket2Id BIGINT;
DECLARE @PrintedTicket1Id BIGINT;
DECLARE @PrintedTicket2Id BIGINT;

-- ---------- Tickets (Kapalı ticketlar için farklı tarihler) ----------
-- Kapalı Ticket 1 (10 gün önce açıldı, 8 gün önce kapandı)
IF NOT EXISTS (SELECT 1 FROM orderly.tickets WHERE table_id=@A1Id AND [status]=N'closed' AND closed_at=DATEADD(day, -8, GETUTCDATE()))
BEGIN
    INSERT INTO orderly.tickets (table_id, opened_by_user_id, closed_by_user_id, [status], opened_at, closed_at, meal_ready, closed_payment_method, closed_total)
    VALUES (@A1Id, @Waiter1Id, @Waiter1Id, N'closed', DATEADD(day, -10, GETUTCDATE()), DATEADD(day, -8, GETUTCDATE()), 1, N'cash', 440);
    SET @Ticket1Id = SCOPE_IDENTITY();
    
    INSERT INTO orderly.ticket_items (ticket_id, item_id, quantity, unit_price, created_at)
    VALUES (@Ticket1Id, @GrilledChickenId, 2, 220, DATEADD(day, -10, GETUTCDATE()));
END

-- Kapalı Ticket 2 (7 gün önce açıldı, 6 gün önce kapandı)
IF NOT EXISTS (SELECT 1 FROM orderly.tickets WHERE table_id=@A2Id AND [status]=N'closed' AND closed_at=DATEADD(day, -6, GETUTCDATE()))
BEGIN
    INSERT INTO orderly.tickets (table_id, opened_by_user_id, closed_by_user_id, [status], opened_at, closed_at, meal_ready, closed_payment_method, closed_total)
    VALUES (@A2Id, @Waiter1Id, @Waiter1Id, N'closed', DATEADD(day, -7, GETUTCDATE()), DATEADD(day, -6, GETUTCDATE()), 1, N'credit', 520);
    SET @Ticket2Id = SCOPE_IDENTITY();
    
    INSERT INTO orderly.ticket_items (ticket_id, item_id, quantity, unit_price, created_at)
    VALUES 
    (@Ticket2Id, @SoupId, 2, 80, DATEADD(day, -7, GETUTCDATE())),
    (@Ticket2Id, @KofteId, 1, 200, DATEADD(day, -7, GETUTCDATE())),
    (@Ticket2Id, @SaladId, 1, 50, DATEADD(day, -7, GETUTCDATE())),
    (@Ticket2Id, @AyranId, 2, 40, DATEADD(day, -7, GETUTCDATE()));
END

-- Kapalı Ticket 3 (5 gün önce açıldı, 4 gün önce kapandı)
IF NOT EXISTS (SELECT 1 FROM orderly.tickets WHERE table_id=@B1Id AND [status]=N'closed' AND closed_at=DATEADD(day, -4, GETUTCDATE()))
BEGIN
    INSERT INTO orderly.tickets (table_id, opened_by_user_id, closed_by_user_id, [status], opened_at, closed_at, meal_ready, closed_payment_method, closed_total)
    VALUES (@B1Id, @Waiter2Id, @Waiter2Id, N'closed', DATEADD(day, -5, GETUTCDATE()), DATEADD(day, -4, GETUTCDATE()), 1, N'cash', 680);
    SET @Ticket3Id = SCOPE_IDENTITY();
    
    INSERT INTO orderly.ticket_items (ticket_id, item_id, quantity, unit_price, created_at)
    VALUES 
    (@Ticket3Id, @KebapId, 2, 250, DATEADD(day, -5, GETUTCDATE())),
    (@Ticket3Id, @SaladId, 2, 50, DATEADD(day, -5, GETUTCDATE())),
    (@Ticket3Id, @BaklavaId, 1, 120, DATEADD(day, -5, GETUTCDATE())),
    (@Ticket3Id, @AyranId, 2, 40, DATEADD(day, -5, GETUTCDATE()));
END

-- Kapalı Ticket 4 (12 gün önce açıldı, 11 gün önce kapandı)
IF NOT EXISTS (SELECT 1 FROM orderly.tickets WHERE table_id=@B2Id AND [status]=N'closed' AND closed_at=DATEADD(day, -11, GETUTCDATE()))
BEGIN
    INSERT INTO orderly.tickets (table_id, opened_by_user_id, closed_by_user_id, [status], opened_at, closed_at, meal_ready, closed_payment_method, closed_total)
    VALUES (@B2Id, @Waiter2Id, @Waiter2Id, N'closed', DATEADD(day, -12, GETUTCDATE()), DATEADD(day, -11, GETUTCDATE()), 1, N'credit', 360);
    SET @Ticket4Id = SCOPE_IDENTITY();
    
    INSERT INTO orderly.ticket_items (ticket_id, item_id, quantity, unit_price, created_at)
    VALUES 
    (@Ticket4Id, @LahmacunId, 4, 60, DATEADD(day, -12, GETUTCDATE())),
    (@Ticket4Id, @SaladId, 2, 50, DATEADD(day, -12, GETUTCDATE())),
    (@Ticket4Id, @ColaId, 2, 35, DATEADD(day, -12, GETUTCDATE()));
END

-- Kapalı Ticket 5 (3 gün önce açıldı, 2 gün önce kapandı)
IF NOT EXISTS (SELECT 1 FROM orderly.tickets WHERE table_id=@C1Id AND [status]=N'closed' AND closed_at=DATEADD(day, -2, GETUTCDATE()))
BEGIN
    INSERT INTO orderly.tickets (table_id, opened_by_user_id, closed_by_user_id, [status], opened_at, closed_at, meal_ready, closed_payment_method, closed_total)
    VALUES (@C1Id, @Waiter3Id, @Waiter3Id, N'closed', DATEADD(day, -3, GETUTCDATE()), DATEADD(day, -2, GETUTCDATE()), 1, N'cash', 750);
    SET @Ticket5Id = SCOPE_IDENTITY();
    
    INSERT INTO orderly.ticket_items (ticket_id, item_id, quantity, unit_price, created_at)
    VALUES 
    (@Ticket5Id, @SoupId, 2, 80, DATEADD(day, -3, GETUTCDATE())),
    (@Ticket5Id, @FishId, 2, 280, DATEADD(day, -3, GETUTCDATE())),
    (@Ticket5Id, @SaladId, 2, 50, DATEADD(day, -3, GETUTCDATE())),
    (@Ticket5Id, @KunefeId, 1, 150, DATEADD(day, -3, GETUTCDATE()));
END

-- Kapalı Ticket 6 (9 gün önce açıldı, 7 gün önce kapandı)
IF NOT EXISTS (SELECT 1 FROM orderly.tickets WHERE table_id=@C2Id AND [status]=N'closed' AND closed_at=DATEADD(day, -7, GETUTCDATE()))
BEGIN
    INSERT INTO orderly.tickets (table_id, opened_by_user_id, closed_by_user_id, [status], opened_at, closed_at, meal_ready, closed_payment_method, closed_total)
    VALUES (@C2Id, @Waiter1Id, @Waiter1Id, N'closed', DATEADD(day, -9, GETUTCDATE()), DATEADD(day, -7, GETUTCDATE()), 1, N'credit', 590);
    SET @Ticket6Id = SCOPE_IDENTITY();
    
    INSERT INTO orderly.ticket_items (ticket_id, item_id, quantity, unit_price, created_at)
    VALUES 
    (@Ticket6Id, @KebapId, 1, 250, DATEADD(day, -9, GETUTCDATE())),
    (@Ticket6Id, @GrilledChickenId, 1, 220, DATEADD(day, -9, GETUTCDATE())),
    (@Ticket6Id, @BaklavaId, 1, 120, DATEADD(day, -9, GETUTCDATE()));
END

-- Kapalı Ticket 7 (14 gün önce açıldı, 13 gün önce kapandı)
IF NOT EXISTS (SELECT 1 FROM orderly.tickets WHERE table_id=@A3Id AND [status]=N'closed' AND closed_at=DATEADD(day, -13, GETUTCDATE()))
BEGIN
    INSERT INTO orderly.tickets (table_id, opened_by_user_id, closed_by_user_id, [status], opened_at, closed_at, meal_ready, closed_payment_method, closed_total)
    VALUES (@A3Id, @Waiter2Id, @Waiter2Id, N'closed', DATEADD(day, -14, GETUTCDATE()), DATEADD(day, -13, GETUTCDATE()), 1, N'cash', 420);
    SET @Ticket7Id = SCOPE_IDENTITY();
    
    INSERT INTO orderly.ticket_items (ticket_id, item_id, quantity, unit_price, created_at)
    VALUES 
    (@Ticket7Id, @KofteId, 2, 200, DATEADD(day, -14, GETUTCDATE())),
    (@Ticket7Id, @AyranId, 2, 40, DATEADD(day, -14, GETUTCDATE()));
END

-- Kapalı Ticket 8 (6 gün önce açıldı, 5 gün önce kapandı)
IF NOT EXISTS (SELECT 1 FROM orderly.tickets WHERE table_id=@B3Id AND [status]=N'closed' AND closed_at=DATEADD(day, -5, GETUTCDATE()))
BEGIN
    INSERT INTO orderly.tickets (table_id, opened_by_user_id, closed_by_user_id, [status], opened_at, closed_at, meal_ready, closed_payment_method, closed_total)
    VALUES (@B3Id, @Waiter3Id, @Waiter3Id, N'closed', DATEADD(day, -6, GETUTCDATE()), DATEADD(day, -5, GETUTCDATE()), 1, N'credit', 920);
    SET @Ticket8Id = SCOPE_IDENTITY();
    
    INSERT INTO orderly.ticket_items (ticket_id, item_id, quantity, unit_price, created_at)
    VALUES 
    (@Ticket8Id, @KebapId, 2, 250, DATEADD(day, -6, GETUTCDATE())),
    (@Ticket8Id, @PideId, 2, 80, DATEADD(day, -6, GETUTCDATE())),
    (@Ticket8Id, @SaladId, 2, 50, DATEADD(day, -6, GETUTCDATE())),
    (@Ticket8Id, @SutlacId, 2, 60, DATEADD(day, -6, GETUTCDATE())),
    (@Ticket8Id, @ColaId, 2, 35, DATEADD(day, -6, GETUTCDATE()));
END

-- Kapalı Ticket 9 (11 gün önce açıldı, 9 gün önce kapandı)
IF NOT EXISTS (SELECT 1 FROM orderly.tickets WHERE table_id=@C3Id AND [status]=N'closed' AND closed_at=DATEADD(day, -9, GETUTCDATE()))
BEGIN
    INSERT INTO orderly.tickets (table_id, opened_by_user_id, closed_by_user_id, [status], opened_at, closed_at, meal_ready, closed_payment_method, closed_total)
    VALUES (@C3Id, @Waiter1Id, @Waiter1Id, N'closed', DATEADD(day, -11, GETUTCDATE()), DATEADD(day, -9, GETUTCDATE()), 1, N'cash', 310);
    SET @Ticket9Id = SCOPE_IDENTITY();
    
    INSERT INTO orderly.ticket_items (ticket_id, item_id, quantity, unit_price, created_at)
    VALUES 
    (@Ticket9Id, @LahmacunId, 2, 60, DATEADD(day, -11, GETUTCDATE())),
    (@Ticket9Id, @SoupId, 1, 80, DATEADD(day, -11, GETUTCDATE())),
    (@Ticket9Id, @AyranId, 2, 40, DATEADD(day, -11, GETUTCDATE())),
    (@Ticket9Id, @BaklavaId, 1, 120, DATEADD(day, -11, GETUTCDATE()));
END

-- Kapalı Ticket 10 (4 gün önce açıldı, 3 gün önce kapandı)
IF NOT EXISTS (SELECT 1 FROM orderly.tickets WHERE table_id=@A4Id AND [status]=N'closed' AND closed_at=DATEADD(day, -3, GETUTCDATE()))
BEGIN
    INSERT INTO orderly.tickets (table_id, opened_by_user_id, closed_by_user_id, [status], opened_at, closed_at, meal_ready, closed_payment_method, closed_total)
    VALUES (@A4Id, @Waiter2Id, @Waiter2Id, N'closed', DATEADD(day, -4, GETUTCDATE()), DATEADD(day, -3, GETUTCDATE()), 1, N'credit', 640);
    SET @Ticket10Id = SCOPE_IDENTITY();
    
    INSERT INTO orderly.ticket_items (ticket_id, item_id, quantity, unit_price, created_at)
    VALUES 
    (@Ticket10Id, @GrilledChickenId, 2, 220, DATEADD(day, -4, GETUTCDATE())),
    (@Ticket10Id, @SoupId, 2, 80, DATEADD(day, -4, GETUTCDATE())),
    (@Ticket10Id, @SaladId, 1, 50, DATEADD(day, -4, GETUTCDATE()));
END

-- Açık Ticket 1
IF NOT EXISTS (SELECT 1 FROM orderly.tickets WHERE table_id=@A1Id AND [status]=N'open')
BEGIN
    INSERT INTO orderly.tickets (table_id, opened_by_user_id, [status], opened_at, meal_ready)
    VALUES (@A1Id, @Waiter1Id, N'open', DATEADD(hour, -2, GETUTCDATE()), 0);
    SET @OpenTicket1Id = SCOPE_IDENTITY();
    
    INSERT INTO orderly.ticket_items (ticket_id, item_id, quantity, unit_price, created_at)
    VALUES 
    (@OpenTicket1Id, @KebapId, 1, 250, DATEADD(hour, -2, GETUTCDATE())),
    (@OpenTicket1Id, @SaladId, 1, 50, DATEADD(hour, -2, GETUTCDATE()));
END

-- Açık Ticket 2
IF NOT EXISTS (SELECT 1 FROM orderly.tickets WHERE table_id=@A2Id AND [status]=N'open')
BEGIN
    INSERT INTO orderly.tickets (table_id, opened_by_user_id, [status], opened_at, meal_ready)
    VALUES (@A2Id, @Waiter2Id, N'open', DATEADD(hour, -1, GETUTCDATE()), 0);
    SET @OpenTicket2Id = SCOPE_IDENTITY();
    
    INSERT INTO orderly.ticket_items (ticket_id, item_id, quantity, unit_price, created_at)
    VALUES 
    (@OpenTicket2Id, @SoupId, 2, 80, DATEADD(hour, -1, GETUTCDATE())),
    (@OpenTicket2Id, @KofteId, 2, 200, DATEADD(hour, -1, GETUTCDATE()));
END

-- Printed Ticket 1
IF NOT EXISTS (SELECT 1 FROM orderly.tickets WHERE table_id=@B1Id AND [status]=N'printed' AND meal_ready=0)
BEGIN
    INSERT INTO orderly.tickets (table_id, opened_by_user_id, [status], opened_at, meal_ready)
    VALUES (@B1Id, @Waiter3Id, N'printed', DATEADD(hour, -3, GETUTCDATE()), 0);
    SET @PrintedTicket1Id = SCOPE_IDENTITY();
    
    INSERT INTO orderly.ticket_items (ticket_id, item_id, quantity, unit_price, created_at)
    VALUES 
    (@PrintedTicket1Id, @GrilledChickenId, 2, 220, DATEADD(hour, -3, GETUTCDATE())),
    (@PrintedTicket1Id, @SoupId, 2, 80, DATEADD(hour, -3, GETUTCDATE())),
    (@PrintedTicket1Id, @AyranId, 2, 40, DATEADD(hour, -3, GETUTCDATE()));
END

-- Printed Ticket 2 (meal ready)
IF NOT EXISTS (SELECT 1 FROM orderly.tickets WHERE table_id=@B2Id AND [status]=N'printed' AND meal_ready=1)
BEGIN
    INSERT INTO orderly.tickets (table_id, opened_by_user_id, [status], opened_at, meal_ready)
    VALUES (@B2Id, @Waiter1Id, N'printed', DATEADD(hour, -4, GETUTCDATE()), 1);
    SET @PrintedTicket2Id = SCOPE_IDENTITY();
    
    INSERT INTO orderly.ticket_items (ticket_id, item_id, quantity, unit_price, created_at)
    VALUES 
    (@PrintedTicket2Id, @FishId, 1, 280, DATEADD(hour, -4, GETUTCDATE())),
    (@PrintedTicket2Id, @SaladId, 1, 50, DATEADD(hour, -4, GETUTCDATE())),
    (@PrintedTicket2Id, @BaklavaId, 1, 120, DATEADD(hour, -4, GETUTCDATE()));
END

-- ---------- Özet ----------
DECLARE @UserCount INT = (SELECT COUNT(*) FROM orderly.users);
DECLARE @TableCount INT = (SELECT COUNT(*) FROM orderly.dining_tables);
DECLARE @CategoryCount INT = (SELECT COUNT(*) FROM orderly.menu_categories);
DECLARE @MenuItemCount INT = (SELECT COUNT(*) FROM orderly.menu_items);
DECLARE @TicketCount INT = (SELECT COUNT(*) FROM orderly.tickets);
DECLARE @TicketItemCount INT = (SELECT COUNT(*) FROM orderly.ticket_items);

PRINT N'Dummy data başarıyla eklendi!';
PRINT N'- ' + CAST(@UserCount AS NVARCHAR) + N' kullanıcı';
PRINT N'- ' + CAST(@TableCount AS NVARCHAR) + N' masa';
PRINT N'- ' + CAST(@CategoryCount AS NVARCHAR) + N' kategori';
PRINT N'- ' + CAST(@MenuItemCount AS NVARCHAR) + N' menü öğesi';
PRINT N'- ' + CAST(@TicketCount AS NVARCHAR) + N' ticket';
PRINT N'- ' + CAST(@TicketItemCount AS NVARCHAR) + N' ticket item';
