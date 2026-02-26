-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Question" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "tagsText" TEXT NOT NULL DEFAULT '',
    "successRate" REAL NOT NULL DEFAULT 0,
    "totalSubmissions" INTEGER NOT NULL DEFAULT 0,
    "totalAccepted" INTEGER NOT NULL DEFAULT 0,
    "companyTags" TEXT NOT NULL DEFAULT '',
    "likes" INTEGER NOT NULL DEFAULT 0,
    "dislikes" INTEGER NOT NULL DEFAULT 0,
    "hints" TEXT NOT NULL DEFAULT '',
    "similarQuestionIds" TEXT NOT NULL DEFAULT '',
    "similarQuestionsText" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "a" TEXT NOT NULL,
    "b" TEXT NOT NULL,
    "c" TEXT NOT NULL,
    "d" TEXT NOT NULL,
    "correct" TEXT NOT NULL,
    CONSTRAINT "Question_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Question" ("a", "b", "body", "c", "categoryId", "companyTags", "correct", "createdAt", "d", "difficulty", "dislikes", "hints", "id", "likes", "similarQuestionIds", "similarQuestionsText", "successRate", "tagsText", "title", "totalAccepted", "totalSubmissions", "updatedAt") SELECT "a", "b", "body", "c", "categoryId", "companyTags", "correct", "createdAt", "d", "difficulty", "dislikes", "hints", "id", "likes", "similarQuestionIds", "similarQuestionsText", "successRate", "tagsText", "title", "totalAccepted", "totalSubmissions", "updatedAt" FROM "Question";
DROP TABLE "Question";
ALTER TABLE "new_Question" RENAME TO "Question";
CREATE INDEX "Question_difficulty_idx" ON "Question"("difficulty");
CREATE INDEX "Question_categoryId_idx" ON "Question"("categoryId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
