"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { cn, formatAmount, formatDateTime, getTransactionStatus, formUrlQuery } from "@/lib/utils";
import { transactionCategoryStyles } from "@/constants";
import { CategoryBadge } from "./CategoryBadge";
import { BankTabItem } from "./BankTabItem";

const RecentTransactions = ({
  accounts,
  transactions = [],
  appwriteItemId,
  page = 1,
}: RecentTransactionsProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleBankChange = (appwriteItemId: string) => {
    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: "id",
      value: appwriteItemId,
    });
    router.push(newUrl, { scroll: false });
  };

  const rowsPerPage = 10;
  const totalPages = Math.ceil(transactions.length / rowsPerPage);
  const indexOfLastTransaction = page * rowsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - rowsPerPage;
  const currentTransactions = transactions.slice(
    indexOfFirstTransaction,
    indexOfLastTransaction
  );

  return (
    <section className="recent-transactions">
      <header className="flex items-center justify-between">
        <h2 className="recent-transactions-label">Recent transactions</h2>
        <Link
          href={`/transaction-history/?id=${appwriteItemId}`}
          className="view-all-btn"
        >
          View all
        </Link>
      </header>

      {accounts.length > 1 && (
        <div className="recent-transactions-tablist">
          {accounts.map((account: Account) => (
            <BankTabItem
              key={account.appwriteItemId}
              account={account}
              appwriteItemId={appwriteItemId}
            />
          ))}
        </div>
      )}

      <div className="flex flex-col gap-6">
        {currentTransactions.length > 0 ? (
          currentTransactions.map((transaction: Transaction) => {
            const colors =
              transactionCategoryStyles[transaction.category as keyof typeof transactionCategoryStyles] ||
              transactionCategoryStyles.default;

            const status = getTransactionStatus(new Date(transaction.date));

            return (
              <div
                key={transaction.id}
                className="flex items-center gap-4 rounded-lg border border-gray-100 p-4 transition-all hover:bg-gray-50"
              >
                <div
                  className={cn(
                    "flex size-10 items-center justify-center rounded-full",
                    colors.backgroundColor
                  )}
                >
                  <div
                    className={cn(
                      "size-4 rounded-full",
                      colors.backgroundColor
                    )}
                  />
                </div>

                <div className="flex w-full flex-1 items-center justify-between gap-2">
                  <div className="flex flex-col gap-1">
                    <p className="text-14 font-medium text-gray-900 truncate max-w-[200px]">
                      {transaction.name}
                    </p>
                    <p className="text-12 text-gray-500">
                      {formatDateTime(new Date(transaction.date)).dateTime}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <p
                      className={cn("text-14 font-medium", {
                        "text-green-600": transaction.type === "credit",
                        "text-red-600": transaction.type === "debit",
                      })}
                    >
                      {transaction.type === "credit" ? "+" : "-"}$
                      {formatAmount(transaction.amount)}
                    </p>
                    <CategoryBadge category={transaction.category} />
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-16 font-medium text-gray-500">
              No transactions yet
            </p>
            <p className="text-14 text-gray-400">
              Connect your bank account to see transactions
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default RecentTransactions;
