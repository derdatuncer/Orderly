/* ============================================================
   Orderly Minimal (SQL Server / T-SQL) — FIXED
   - Remove multiple cascade paths by NOT using ON UPDATE CASCADE
     on tickets → users FKs (opened_by / closed_by).
   ============================================================ */

-- ---------- Clean reset (DEV only) ----------
IF OBJECT_ID('orderly.trg_OrderItems_EnsureOpen_Insert', 'TR') IS NOT NULL DROP TRIGGER orderly.trg_OrderItems_EnsureOpen_Insert;
IF OBJECT_ID('orderly.trg_OrderItems_EnsureOpen_Update', 'TR') IS NOT NULL DROP TRIGGER orderly.trg_OrderItems_EnsureOpen_Update;
IF OBJECT_ID('orderly.trg_Tickets_SyncTable_Insert', 'TR') IS NOT NULL DROP TRIGGER orderly.trg_Tickets_SyncTable_Insert;
IF OBJECT_ID('orderly.trg_Tickets_SyncTable_Update', 'TR') IS NOT NULL DROP TRIGGER orderly.trg_Tickets_SyncTable_Update;
GO
IF OBJECT_ID('orderly.v_kitchen_tickets_queue', 'V') IS NOT NULL DROP VIEW orderly.v_kitchen_tickets_queue;
IF OBJECT_ID('orderly.v_ticket_totals', 'V') IS NOT NULL DROP VIEW orderly.v_ticket_totals;
IF OBJECT_ID('orderly.v_ticket_item_totals', 'V') IS NOT NULL DROP VIEW orderly.v_ticket_item_totals;
GO
IF OBJECT_ID('orderly.usp_PrintTicket', 'P') IS NOT NULL DROP PROCEDURE orderly.usp_PrintTicket;
IF OBJECT_ID('orderly.usp_MarkMealReady', 'P') IS NOT NULL DROP PROCEDURE orderly.usp_MarkMealReady;
IF OBJECT_ID('orderly.usp_CloseTicket', 'P') IS NOT NULL DROP PROCEDURE orderly.usp_CloseTicket;
GO
IF OBJECT_ID('orderly.ticket_items', 'U') IS NOT NULL DROP TABLE orderly.ticket_items;
IF OBJECT_ID('orderly.tickets', 'U') IS NOT NULL DROP TABLE orderly.tickets;
IF OBJECT_ID('orderly.menu_items', 'U') IS NOT NULL DROP TABLE orderly.menu_items;
IF OBJECT_ID('orderly.menu_categories', 'U') IS NOT NULL DROP TABLE orderly.menu_categories;
IF OBJECT_ID('orderly.dining_tables', 'U') IS NOT NULL DROP TABLE orderly.dining_tables;
IF OBJECT_ID('orderly.users', 'U') IS NOT NULL DROP TABLE orderly.users;
GO
IF EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'orderly') DROP SCHEMA orderly;
GO

-- ---------- Schema ----------
CREATE SCHEMA orderly;
GO

-- ---------- Users ----------
CREATE TABLE orderly.users (
  user_id     BIGINT IDENTITY(1,1) PRIMARY KEY,
  username    NVARCHAR(100) NOT NULL UNIQUE,
  [password]  NVARCHAR(256) NOT NULL,  -- düz metin, sen istedin :)
  role        NVARCHAR(16)  NOT NULL
               CONSTRAINT CK_users_role CHECK (role IN (N'admin',N'waiter',N'kitchen')),
  created_at  DATETIME2(0)  NOT NULL CONSTRAINT DF_users_created DEFAULT SYSUTCDATETIME()
);
GO

-- ---------- Dining tables ----------
CREATE TABLE orderly.dining_tables (
  table_id    BIGINT IDENTITY(1,1) PRIMARY KEY,
  table_code  NVARCHAR(20) NOT NULL UNIQUE,
  [status]    NVARCHAR(16) NOT NULL
               CONSTRAINT DF_tables_status DEFAULT (N'closed')
               CONSTRAINT CK_tables_status CHECK ([status] IN (N'open',N'printed',N'closed'))
);
GO

-- ---------- Menu ----------
CREATE TABLE orderly.menu_categories (
  category_id    BIGINT IDENTITY(1,1) PRIMARY KEY,
  category_name  NVARCHAR(100) NOT NULL UNIQUE,
  sort_order     INT NOT NULL CONSTRAINT DF_menu_categories_sort DEFAULT (0)
);
GO

CREATE TABLE orderly.menu_items (
  item_id      BIGINT IDENTITY(1,1) PRIMARY KEY,
  category_id  BIGINT NOT NULL,
  item_name    NVARCHAR(120) NOT NULL,
  price        DECIMAL(12,2) NOT NULL CONSTRAINT CK_menu_items_price CHECK (price >= 0),
  CONSTRAINT FK_menu_items_categories
    FOREIGN KEY (category_id) REFERENCES orderly.menu_categories(category_id),
  CONSTRAINT UQ_menu_items_cat_name UNIQUE (category_id, item_name)
);
GO

-- ---------- Tickets (NO CASCADE to users to avoid multiple paths) ----------
-- table_id is NULLable to allow table deletion while preserving tickets
CREATE TABLE orderly.tickets (
  ticket_id           BIGINT IDENTITY(1,1) PRIMARY KEY,
  table_id            BIGINT NULL,  -- NULLable: allows table deletion with ON DELETE SET NULL
  opened_by_user_id   BIGINT NOT NULL,
  closed_by_user_id   BIGINT NULL,
  [status]            NVARCHAR(16) NOT NULL
                        CONSTRAINT DF_tickets_status DEFAULT (N'open')
                        CONSTRAINT CK_tickets_status CHECK ([status] IN (N'open',N'printed',N'closed')),
  opened_at           DATETIME2(0) NOT NULL CONSTRAINT DF_tickets_opened DEFAULT SYSUTCDATETIME(),
  closed_at           DATETIME2(0) NULL,
  meal_ready          BIT NOT NULL CONSTRAINT DF_tickets_mealready DEFAULT (0),
  closed_payment_method NVARCHAR(16) NULL
                        CONSTRAINT CK_tickets_payment CHECK (closed_payment_method IN (N'cash',N'credit') OR closed_payment_method IS NULL),
  closed_total        DECIMAL(12,2) NULL,
  CONSTRAINT FK_tickets_table
    FOREIGN KEY (table_id) REFERENCES orderly.dining_tables(table_id)
    ON DELETE SET NULL,  -- Preserves tickets when table is deleted
  CONSTRAINT FK_tickets_opened_by
    FOREIGN KEY (opened_by_user_id) REFERENCES orderly.users(user_id),
  CONSTRAINT FK_tickets_closed_by
    FOREIGN KEY (closed_by_user_id) REFERENCES orderly.users(user_id)
);
GO

-- Only one ACTIVE (open/printed) ticket per table (allows NULL table_id)
CREATE UNIQUE INDEX UX_Tickets_Active_Per_Table
  ON orderly.tickets(table_id)
  WHERE [status] IN (N'open', N'printed') AND table_id IS NOT NULL;
GO

-- ---------- Ticket items ----------
CREATE TABLE orderly.ticket_items (
  order_item_id  BIGINT IDENTITY(1,1) PRIMARY KEY,
  ticket_id      BIGINT NOT NULL,
  item_id        BIGINT NOT NULL,
  quantity       DECIMAL(12,2) NOT NULL CONSTRAINT DF_items_qty DEFAULT (1)
                  CONSTRAINT CK_items_qty CHECK (quantity > 0),
  unit_price     DECIMAL(12,2) NOT NULL CONSTRAINT CK_items_price CHECK (unit_price >= 0),
  line_total     AS CAST(quantity * unit_price AS DECIMAL(12,2)) PERSISTED,
  created_at     DATETIME2(0) NOT NULL CONSTRAINT DF_items_created DEFAULT SYSUTCDATETIME(),
  CONSTRAINT FK_items_ticket
    FOREIGN KEY (ticket_id) REFERENCES orderly.tickets(ticket_id) ON DELETE CASCADE, -- NO UPDATE CASCADE
  CONSTRAINT FK_items_menu_item
    FOREIGN KEY (item_id) REFERENCES orderly.menu_items(item_id)                     -- NO UPDATE CASCADE
);
GO

CREATE INDEX IX_items_ticket   ON orderly.ticket_items(ticket_id);
CREATE INDEX IX_items_item     ON orderly.ticket_items(item_id);
CREATE INDEX IX_tickets_status ON orderly.tickets([status]);
CREATE INDEX IX_tables_status  ON orderly.dining_tables([status]);
GO

/* ======================== TRIGGERS ======================== */

-- Add/Update items only if parent ticket is OPEN
CREATE TRIGGER orderly.trg_OrderItems_EnsureOpen_Insert
ON orderly.ticket_items
AFTER INSERT
AS
BEGIN
  SET NOCOUNT ON;
  IF EXISTS (
    SELECT 1
    FROM inserted i
    JOIN orderly.tickets t ON t.ticket_id = i.ticket_id
    WHERE t.[status] <> N'open'
  )
  BEGIN
    RAISERROR (N'Ticket is not open. Cannot add items.', 16, 1);
    ROLLBACK TRANSACTION;
    RETURN;
  END
END;
GO

CREATE TRIGGER orderly.trg_OrderItems_EnsureOpen_Update
ON orderly.ticket_items
AFTER UPDATE
AS
BEGIN
  SET NOCOUNT ON;
  IF EXISTS (
    SELECT 1
    FROM inserted i
    JOIN orderly.tickets t ON t.ticket_id = i.ticket_id
    WHERE t.[status] <> N'open'
  )
  BEGIN
    RAISERROR (N'Ticket is not open. Cannot modify items.', 16, 1);
    ROLLBACK TRANSACTION;
    RETURN;
  END
END;
GO

-- Sync dining_tables.status with tickets.status (INSERT)
-- Only sync if table_id is not NULL
CREATE TRIGGER orderly.trg_Tickets_SyncTable_Insert
ON orderly.tickets
AFTER INSERT
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE dt
    SET dt.[status] = i.[status]
  FROM orderly.dining_tables dt
  JOIN inserted i ON i.table_id = dt.table_id
  WHERE i.table_id IS NOT NULL;
END;
GO

-- Sync dining_tables.status with tickets.status (UPDATE) + guardrails
-- Only sync if table_id is not NULL
CREATE TRIGGER orderly.trg_Tickets_SyncTable_Update
ON orderly.tickets
AFTER UPDATE
AS
BEGIN
  SET NOCOUNT ON;

  -- Block invalid direct CLOSE (must be meal_ready=1 and method set)
  IF EXISTS (
    SELECT 1
    FROM inserted i
    WHERE i.[status] = N'closed'
      AND (i.meal_ready = 0 OR i.closed_payment_method IS NULL)
  )
  BEGIN
    RAISERROR (N'Cannot set CLOSED without meal_ready=1 and payment method.', 16, 1);
    ROLLBACK TRANSACTION;
    RETURN;
  END

  UPDATE dt
    SET dt.[status] = i.[status]
  FROM orderly.dining_tables dt
  JOIN inserted i ON i.table_id = dt.table_id
  WHERE i.table_id IS NOT NULL;
END;
GO

/* ======================== VIEWS ======================== */

CREATE VIEW orderly.v_ticket_item_totals AS
SELECT
  ti.ticket_id,
  COALESCE(SUM(ti.line_total), 0) AS subtotal
FROM orderly.ticket_items ti
GROUP BY ti.ticket_id;
GO

CREATE VIEW orderly.v_ticket_totals AS
SELECT
  t.ticket_id,
  it.subtotal AS total_due
FROM orderly.tickets t
LEFT JOIN orderly.v_ticket_item_totals it ON it.ticket_id = t.ticket_id;
GO

-- Tickets visible to kitchen (not yet meal_ready)
-- Handles NULL table_id (deleted tables)
CREATE VIEW orderly.v_kitchen_tickets_queue AS
SELECT
  t.ticket_id,
  ISNULL(dt.table_code, N'(Silinmiş Masa)') AS table_code,
  t.[status],
  t.meal_ready,
  t.opened_at,
  it.subtotal AS current_total
FROM orderly.tickets t
LEFT JOIN orderly.dining_tables dt ON dt.table_id = t.table_id
LEFT JOIN orderly.v_ticket_item_totals it ON it.ticket_id = t.ticket_id
WHERE t.[status] IN (N'open', N'printed')
  AND t.meal_ready = 0;
GO

/* ====================== PROCEDURES ====================== */

-- open -> printed
CREATE PROCEDURE orderly.usp_PrintTicket
  @TicketId BIGINT
AS
BEGIN
  SET NOCOUNT ON;

  IF NOT EXISTS (SELECT 1 FROM orderly.tickets WHERE ticket_id=@TicketId AND [status]=N'open')
  BEGIN
    RAISERROR (N'Ticket is not open or not found.', 16, 1);
    RETURN;
  END

  UPDATE orderly.tickets
    SET [status] = N'printed'
  WHERE ticket_id = @TicketId;
END;
GO

-- kitchen/admin marks ticket as meal ready
CREATE PROCEDURE orderly.usp_MarkMealReady
  @UserId   BIGINT,
  @TicketId BIGINT
AS
BEGIN
  SET NOCOUNT ON;

  IF NOT EXISTS (
    SELECT 1 FROM orderly.users WHERE user_id=@UserId AND role IN (N'kitchen',N'admin')
  )
  BEGIN
    RAISERROR (N'Only kitchen/admin can mark meal ready.', 16, 1);
    RETURN;
  END

  IF NOT EXISTS (
    SELECT 1 FROM orderly.tickets WHERE ticket_id=@TicketId AND [status] IN (N'open',N'printed')
  )
  BEGIN
    RAISERROR (N'Ticket is not active (open/printed) or not found.', 16, 1);
    RETURN;
  END

  UPDATE orderly.tickets
    SET meal_ready = 1
  WHERE ticket_id = @TicketId;
END;
GO

-- close (requires meal_ready=1), sets payment snapshot and closes table
CREATE PROCEDURE orderly.usp_CloseTicket
  @UserId   BIGINT,
  @TicketId BIGINT,
  @Method   NVARCHAR(16)   -- 'cash' | 'credit'
AS
BEGIN
  SET NOCOUNT ON;

  IF @Method NOT IN (N'cash', N'credit')
  BEGIN
    RAISERROR (N'Payment method must be cash or credit.', 16, 1);
    RETURN;
  END

  IF NOT EXISTS (
    SELECT 1 FROM orderly.tickets
     WHERE ticket_id=@TicketId AND [status] IN (N'open',N'printed')
  )
  BEGIN
    RAISERROR (N'Ticket is not active (open/printed) or not found.', 16, 1);
    RETURN;
  END

  IF NOT EXISTS (
    SELECT 1 FROM orderly.tickets WHERE ticket_id=@TicketId AND meal_ready=1
  )
  BEGIN
    RAISERROR (N'Ticket not marked as meal_ready.', 16, 1);
    RETURN;
  END

  DECLARE @Total DECIMAL(12,2);
  SELECT @Total = COALESCE(subtotal, 0)
  FROM orderly.v_ticket_item_totals
  WHERE ticket_id = @TicketId;

  UPDATE orderly.tickets
    SET [status] = N'closed',
        closed_by_user_id = @UserId,
        closed_at = SYSUTCDATETIME(),
        closed_payment_method = @Method,
        closed_total = @Total
  WHERE ticket_id = @TicketId;
END;
GO

/* ======================== DEMO SEED ======================== */
INSERT INTO orderly.users (username,[password],role) VALUES
(N'admin',   N'admin123',   N'admin'),
(N'waiter1', N'waiter123',  N'waiter'),
(N'kitchen1',N'kitchen123', N'kitchen');

INSERT INTO orderly.dining_tables (table_code,[status]) VALUES
(N'A1',N'closed'),(N'A2',N'closed'),(N'B1',N'closed');

INSERT INTO orderly.menu_categories (category_name,sort_order) VALUES
(N'Soup',10),(N'Main',20),(N'Dessert',30),(N'Drinks',40);

INSERT INTO orderly.menu_items (category_id,item_name,price)
SELECT category_id, N'Lentil Soup',  80 FROM orderly.menu_categories WHERE category_name=N'Soup';
INSERT INTO orderly.menu_items (category_id,item_name,price)
SELECT category_id, N'Grilled Chicken', 220 FROM orderly.menu_categories WHERE category_name=N'Main';
INSERT INTO orderly.menu_items (category_id,item_name,price)
SELECT category_id, N'Baklava', 120 FROM orderly.menu_categories WHERE category_name=N'Dessert';
INSERT INTO orderly.menu_items (category_id,item_name,price)
SELECT category_id, N'Ayran', 40 FROM orderly.menu_categories WHERE category_name=N'Drinks';

-- quick smoke test: open ticket on A1 and add an item
DECLARE @A1 BIGINT = (SELECT table_id FROM orderly.dining_tables WHERE table_code=N'A1');
DECLARE @Waiter BIGINT = (SELECT user_id FROM orderly.users WHERE username=N'waiter1');

INSERT INTO orderly.tickets(table_id, opened_by_user_id, [status]) VALUES (@A1, @Waiter, N'open');
DECLARE @Ticket BIGINT = SCOPE_IDENTITY();

INSERT INTO orderly.ticket_items(ticket_id, item_id, quantity, unit_price)
SELECT @Ticket, mi.item_id, 2, mi.price
FROM orderly.menu_items mi WHERE mi.item_name=N'Grilled Chicken';
