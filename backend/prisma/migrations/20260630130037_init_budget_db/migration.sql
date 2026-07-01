-- CreateTable
CREATE TABLE "Month" (
    "id" TEXT NOT NULL,
    "notionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Month_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "notionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpenseCategory" (
    "id" TEXT NOT NULL,
    "notionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExpenseCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncomeCategory" (
    "id" TEXT NOT NULL,
    "notionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IncomeCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncomePlan" (
    "id" TEXT NOT NULL,
    "notionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "plannedAmount" DOUBLE PRECISION NOT NULL,
    "categoryId" TEXT NOT NULL,
    "monthId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IncomePlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpensePlan" (
    "id" TEXT NOT NULL,
    "notionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "plannedAmount" DOUBLE PRECISION NOT NULL,
    "categoryId" TEXT NOT NULL,
    "monthId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExpensePlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Income" (
    "id" TEXT NOT NULL,
    "notionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "categoryId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "monthId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Income_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "notionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "categoryId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "monthId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncLog" (
    "id" SERIAL NOT NULL,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "itemsSynced" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,

    CONSTRAINT "SyncLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Month_notionId_key" ON "Month"("notionId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_notionId_key" ON "Account"("notionId");

-- CreateIndex
CREATE UNIQUE INDEX "ExpenseCategory_notionId_key" ON "ExpenseCategory"("notionId");

-- CreateIndex
CREATE UNIQUE INDEX "IncomeCategory_notionId_key" ON "IncomeCategory"("notionId");

-- CreateIndex
CREATE UNIQUE INDEX "IncomePlan_notionId_key" ON "IncomePlan"("notionId");

-- CreateIndex
CREATE UNIQUE INDEX "ExpensePlan_notionId_key" ON "ExpensePlan"("notionId");

-- CreateIndex
CREATE UNIQUE INDEX "Income_notionId_key" ON "Income"("notionId");

-- CreateIndex
CREATE UNIQUE INDEX "Expense_notionId_key" ON "Expense"("notionId");

-- AddForeignKey
ALTER TABLE "IncomePlan" ADD CONSTRAINT "IncomePlan_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "IncomeCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncomePlan" ADD CONSTRAINT "IncomePlan_monthId_fkey" FOREIGN KEY ("monthId") REFERENCES "Month"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpensePlan" ADD CONSTRAINT "ExpensePlan_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ExpenseCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpensePlan" ADD CONSTRAINT "ExpensePlan_monthId_fkey" FOREIGN KEY ("monthId") REFERENCES "Month"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Income" ADD CONSTRAINT "Income_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "IncomeCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Income" ADD CONSTRAINT "Income_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Income" ADD CONSTRAINT "Income_monthId_fkey" FOREIGN KEY ("monthId") REFERENCES "Month"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ExpenseCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_monthId_fkey" FOREIGN KEY ("monthId") REFERENCES "Month"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
