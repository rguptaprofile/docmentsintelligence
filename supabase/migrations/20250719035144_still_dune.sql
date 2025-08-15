-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'processing',
    "content" TEXT,
    "filePath" TEXT,
    "userId" TEXT NOT NULL,
    CONSTRAINT "documents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "queries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "text" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'processing',
    "decision" TEXT,
    "amount" REAL,
    "currency" TEXT,
    "justification" TEXT,
    "confidence" REAL,
    "processingTime" INTEGER,
    "userId" TEXT NOT NULL,
    CONSTRAINT "queries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "clauses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "text" TEXT NOT NULL,
    "section" TEXT,
    "page" INTEGER,
    "relevanceScore" REAL,
    "documentId" TEXT NOT NULL,
    CONSTRAINT "clauses_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "query_results" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "relevanceScore" REAL NOT NULL,
    "queryId" TEXT NOT NULL,
    "clauseId" TEXT NOT NULL,
    CONSTRAINT "query_results_queryId_fkey" FOREIGN KEY ("queryId") REFERENCES "queries" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "query_results_clauseId_fkey" FOREIGN KEY ("clauseId") REFERENCES "clauses" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");