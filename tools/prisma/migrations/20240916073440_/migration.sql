-- CreateTable
CREATE TABLE "SmartTable" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "data" JSONB NOT NULL DEFAULT '{}',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SmartTable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chat" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isUser" BOOLEAN NOT NULL,
    "smartTableId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SmartTable_userId_idx" ON "SmartTable"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SmartTable_userId_id_key" ON "SmartTable"("userId", "id");

-- CreateIndex
CREATE INDEX "Chat_smartTableId_idx" ON "Chat"("smartTableId");

-- AddForeignKey
ALTER TABLE "SmartTable" ADD CONSTRAINT "SmartTable_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_smartTableId_fkey" FOREIGN KEY ("smartTableId") REFERENCES "SmartTable"("id") ON DELETE CASCADE ON UPDATE CASCADE;
