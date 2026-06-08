-- ============================================
-- AIFA Database Migration Script
-- Run this ONCE manually before starting Node
-- ============================================

-- ─────────────────────────────────────────
-- TABLE: expenses
-- ─────────────────────────────────────────

-- Step 1: Add new source column
ALTER TABLE "Expenses" ADD COLUMN IF NOT EXISTS "source" VARCHAR(10);

-- Step 2: Copy data from old type column to source
UPDATE "Expenses" SET "source" = 
  CASE 
    WHEN "type" = 'online' THEN 'gpay'
    WHEN "type" = 'offline' THEN 'manual'
    ELSE 'manual'
  END;

-- Step 3: Make source NOT NULL now that data is filled
ALTER TABLE "Expenses" ALTER COLUMN "source" SET NOT NULL;

-- Step 4: Drop old type column
ALTER TABLE "Expenses" DROP COLUMN IF EXISTS "type";

-- Step 5: Add new columns
ALTER TABLE "Expenses" ADD COLUMN IF NOT EXISTS "description" VARCHAR(255);
ALTER TABLE "Expenses" ADD COLUMN IF NOT EXISTS "transactionId" UUID;
ALTER TABLE "Expenses" ADD COLUMN IF NOT EXISTS "isAiSuggested" BOOLEAN DEFAULT false;
ALTER TABLE "Expenses" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP;

-- Step 6: Add FK constraint for transactionId
ALTER TABLE "Expenses" 
  ADD CONSTRAINT IF NOT EXISTS "fk_expenses_transaction"
  FOREIGN KEY ("transactionId") 
  REFERENCES "Transactions"("id") 
  ON DELETE SET NULL;

-- Step 7: Add index on deletedAt for fast soft-delete filtering
CREATE INDEX IF NOT EXISTS "expenses_deleted_at" ON "Expenses"("deletedAt");

-- ─────────────────────────────────────────
-- TABLE: transactions
-- ─────────────────────────────────────────

-- Step 1: Add new columns
ALTER TABLE "Transactions" ADD COLUMN IF NOT EXISTS "type" VARCHAR(10);
ALTER TABLE "Transactions" ADD COLUMN IF NOT EXISTS "recipient" VARCHAR(255);
ALTER TABLE "Transactions" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP;

-- Step 2: Set default type for existing rows
UPDATE "Transactions" SET "type" = 'debit' WHERE "type" IS NULL;

-- Step 3: Add index on deletedAt
CREATE INDEX IF NOT EXISTS "transactions_deleted_at" ON "Transactions"("deletedAt");

-- ─────────────────────────────────────────
-- TABLE: ai_conversations (NEW)
-- ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "AIConversations" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
  "title" VARCHAR(255),
  "context" TEXT,
  "messageCount" INTEGER DEFAULT 0,
  "deletedAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "ai_conv_user_id" ON "AIConversations"("userId");
CREATE INDEX IF NOT EXISTS "ai_conv_deleted_at" ON "AIConversations"("deletedAt");

-- ─────────────────────────────────────────
-- TABLE: ai_messages (NEW)
-- ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "AIMessages" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "conversationId" UUID NOT NULL REFERENCES "AIConversations"("id") ON DELETE CASCADE,
  "userId" UUID NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
  "role" VARCHAR(10) NOT NULL CHECK ("role" IN ('user', 'assistant')),
  "content" TEXT NOT NULL,
  "contextUsed" TEXT,
  "tokensUsed" INTEGER,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "ai_msg_conversation_id" ON "AIMessages"("conversationId");
CREATE INDEX IF NOT EXISTS "ai_msg_user_id" ON "AIMessages"("userId");

-- ─────────────────────────────────────────
-- TABLE: notification_logs (NEW)
-- ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "NotificationLogs" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
  "type" VARCHAR(20) NOT NULL CHECK ("type" IN ('email', 'sms', 'reminder', 'monthly-report')),
  "channel" VARCHAR(10) NOT NULL CHECK ("channel" IN ('email', 'sms')),
  "recipient" VARCHAR(255) NOT NULL,
  "subject" VARCHAR(255),
  "status" VARCHAR(10) NOT NULL DEFAULT 'pending' CHECK ("status" IN ('sent', 'failed', 'pending')),
  "taskId" VARCHAR(255),
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "notif_log_user_id" ON "NotificationLogs"("userId");
CREATE INDEX IF NOT EXISTS "notif_log_status" ON "NotificationLogs"("status");

-- ─────────────────────────────────────────
-- VERIFY (run these SELECTs to confirm)
-- ─────────────────────────────────────────

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Expenses'
ORDER BY ordinal_position;

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Transactions'
ORDER BY ordinal_position;

SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('AIConversations', 'AIMessages', 'NotificationLogs');