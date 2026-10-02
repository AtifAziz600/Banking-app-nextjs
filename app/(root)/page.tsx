import { redirect } from "next/navigation";
import HeaderBox from "@/components/HeaderBox";
import RightSidebar from "@/components/RightSidebar";
import TotalBalanceBox from "@/components/TotalBalanceBox";
import { getLoggedInUser } from "@/lib/actions/user.actions";
import { getBanks, getBank } from "@/lib/actions/user.actions";
import RecentTransactions from "@/components/RecentTransactions";
import { getTransactionsByBankId } from "@/lib/actions/transaction.actions";
import { formatAmount } from "@/lib/utils";
import ConnectBankButton from "@/components/ConnectBankButton";

const Home = async ({ searchParams: { id, page } }: SearchParamProps) => {
  const currentPage = Number(page as string) || 1;
  const loggedIn = await getLoggedInUser();

  if (!loggedIn) redirect("/sign-in");

  const banks = await getBanks({ userId: loggedIn.userId });

  const accounts = banks?.documents || [];

  let transactions: any[] = [];

  if (accounts.length > 0) {
    const transactionsData = await getTransactionsByBankId({
      bankId: (id as string) || accounts[0].bankId,
    });
    transactions = transactionsData?.documents || [];
  }

  return (
    <section className="home">
      <div className="home-content">
        <header className="home-header">
          <HeaderBox
            type="greeting"
            title="Welcome"
            user={loggedIn?.firstName || "Guest"}
            subtext="Access and manage your account and transactions efficiently."
          />
          <TotalBalanceBox
            accounts={accounts}
            totalBanks={banks?.total || 0}
            totalCurrentBalance={accounts.reduce(
              (total: number, account: Account) =>
                total + account.currentBalance,
              0
            )}
          />
          {accounts.length === 0 && (
            <ConnectBankButton user={loggedIn} />
          )}
        </header>

        <RecentTransactions
          accounts={accounts}
          transactions={transactions}
          appwriteItemId={(id as string) || accounts[0]?.appwriteItemId}
          page={currentPage}
        />
      </div>
      <RightSidebar
        user={loggedIn}
        transactions={transactions}
        banks={accounts}
      />
    </section>
  );
};

export default Home;
