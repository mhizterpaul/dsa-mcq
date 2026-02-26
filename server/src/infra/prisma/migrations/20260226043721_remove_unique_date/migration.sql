-- DropIndex
DROP INDEX "QuizSession_date_key";

-- CreateIndex
CREATE INDEX "QuizSession_date_idx" ON "QuizSession"("date");
