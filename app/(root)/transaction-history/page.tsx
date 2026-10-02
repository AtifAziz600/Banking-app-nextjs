import { redirect } from "next/navigation";
import { getLoggedInUser } from "@/lib/actions/user.actions";
import { getBanks, getBank } from "@/lib/actions/user.actions";
import { getTransactionsByBankId } from "@/lib/actions/transaction.actions";
import { formatAmount } from "@/lib/utils";
import HeaderBox from "@/components/HeaderBox";
import TransactionTable from "@/components/TransactionTable";
import Pagination from "@/components/Pagination";
import BankInfo from "@/components/BankInfo";

const TransactionHistory = async ({
  searchParams: { id, page },
}: SearchParamProps) => {
  const currentPage = Number(page as string) || 1;
  const loggedIn = await getLoggedInUser();

  if (!loggedIn) redirect("/sign-in");

  const banks = await getBanks({ userId: loggedIn.userId });

  const accounts = banks?.documents || [];

  let transactions: any[] = [];
  let account: any = null;

  if (accounts.length > 0) {
    const bankId = (id as string) || accounts[0].bankId;
    const transactionsData = await getTransactionsByBankId({ bankId });
    transactions = transactionsData?.documents || [];
    account = accounts.find((a: any) => a.bankId === bankId) || accounts[0];
  }

  const rowsPerPage = 10;
  const totalPages = Math.ceil(transactions.length / rowsPerPage);

  return (
    <section className="transactions">
      <div className="transactions-header">
        <HeaderBox
          title="Transaction History"
          subtext="See your bank details and transactions."
        />
      </div>

      <div className="space-y-6">
        <div className="transactions-account">
          <div className="flex flex-col gap-2">
            <h2 className="text-18 font-bold text-white">{account?.name}</h2>
            <p className="text-12 text-blue-25">{account?.subtype}</p>
            <p className="text-14 font-semibold tracking-[1.1px] text-white">
              ●●●● ●●●● ●●●● <span className="text-16">{account?.mask}</span>
            </p>
          </div>

          <div className="transactions-account-balance">
            <p className="text-12">Current balance</p>
            <p className="text-24 font-bold text-white">
              ${formatAmount(account?.currentBalance || 0)}
            </p>
          </div>
        </div>

        <section className="flex w-full flex-col gap-6">
          <h2 className="header-2">Recent transactions</h2>
          <TransactionTable transactions={transactions} />

          {totalPages > 1 && (
            <div className="my-4 w-full">
              <Pagination page={currentPage} totalPages={totalPages} />
            </div>
          )}
        </section>
      </div>
    </section>
  );
};

export default TransactionHistory;
