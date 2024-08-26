-- CreateTable
CREATE TABLE "UserFeedback" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "rating" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "UserFeedback_id_key" ON "UserFeedback"("id");
