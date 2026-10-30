-- The shop sells over WhatsApp now, so online orders and customer accounts are gone.
-- (IF EXISTS keeps this safe whichever earlier migrations were applied.)
DROP TABLE IF EXISTS "order_items" CASCADE;
DROP TABLE IF EXISTS "orders" CASCADE;
DROP TABLE IF EXISTS "session" CASCADE;
DROP TABLE IF EXISTS "account" CASCADE;
DROP TABLE IF EXISTS "verification" CASCADE;
DROP TABLE IF EXISTS "user" CASCADE;
