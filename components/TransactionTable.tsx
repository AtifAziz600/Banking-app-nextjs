import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, formatAmount, formatDateTime, getTransactionStatus } from "@/lib/utils";
import { transactionCategoryStyles } from "@/constants";
import { CategoryBadge } from "./CategoryBadge";

const TransactionTable = ({ transactions = [] }: TransactionTableProps) => {
  return (
    <Table>
      <TableHeader className="bg-[#f9fafb]">
        <TableRow>
          <TableHead className="px-2 py-3 text-12 font-medium text-gray-600">Transaction</TableHead>
          <TableHead className="px-2 py-3 text-12 font-medium text-gray-600">Amount</TableHead>
          <TableHead className="px-2 py-3 text-12 font-medium text-gray-600">Status</TableHead>
          <TableHead className="px-2 py-3 text-12 font-medium text-gray-600">Date</TableHead>
          <TableHead className="px-2 py-3 text-12 font-medium text-gray-600">Category</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction: Transaction) => {
          const status = getTransactionStatus(new Date(transaction.date));
          const colors =
            transactionCategoryStyles[transaction.category as keyof typeof transactionCategoryStyles] ||
            transactionCategoryStyles.default;

          return (
            <TableRow
              key={transaction.id}
              className={cn(
                "hover:bg-[#f9fafb] transition-colors",
                colors.borderColor
              )}
            >
              <TableCell className="px-2 py-3 max-w-[250px]">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "size-10 rounded-full flex items-center justify-center",
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
                  <h1 className="text-14 font-medium text-gray-900 truncate">
                    {transaction.name}
                  </h1>
                </div>
              </TableCell>
              <TableCell
                className={cn(
                  "px-2 py-3 text-14 font-medium",
                  transaction.type === "credit" ? "text-green-600" : "text-red-600"
                )}
              >
                {transaction.type === "credit" ? "+" : "-"}$
                {formatAmount(transaction.amount)}
              </TableCell>
              <TableCell className="px-2 py-3">
                <CategoryBadge category={status} />
              </TableCell>
              <TableCell className="px-2 py-3 text-14 text-gray-600">
                {formatDateTime(new Date(transaction.date)).dateTime}
              </TableCell>
              <TableCell className="px-2 py-3 text-14 text-gray-600">
                {transaction.category}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default TransactionTable;
