-- CreateTable
CREATE TABLE "anonymous_tool_usage" (
    "id" TEXT NOT NULL,
    "ip_hash" TEXT NOT NULL,
    "tool" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "anonymous_tool_usage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "anonymous_tool_usage_tool_created_at_idx" ON "anonymous_tool_usage"("tool", "created_at");

-- CreateIndex
CREATE INDEX "anonymous_tool_usage_ip_hash_idx" ON "anonymous_tool_usage"("ip_hash");
