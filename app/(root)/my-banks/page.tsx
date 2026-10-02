import { redirect } from "next/navigation";
import HeaderBox from "@/components/HeaderBox";
import { getLoggedInUser } from "@/lib/actions/user.actions";
import { getBanks } from "@/lib/actions/user.actions";
import BankCard from "@/components/BankCard";

const MyBanks = async () => {
  const loggedIn = await getLoggedInUser();

  if (!loggedIn) redirect("/sign-in");

  const banks = await getBanks({ userId: loggedIn.$id });

  return (
    <section className="my-banks">
      <HeaderBox
        title="My Bank Accounts"
        subtext="Effortlessly manage your banking activities."
      />

      <div className="space-y-4">
        <h2 className="header-2">Your cards</h2>
        <div className="flex flex-wrap gap-6">
          {banks?.documents?.map((bank: any) => (
            <BankCard
              key={bank.$id}
              account={{
                id: bank.accountId,
                availableBalance: 0,
                currentBalance: 0,
                officialName: bank.name,
                mask: "",
                institutionId: "",
                name: bank.name,
                type: "depository",
                subtype: "checking",
                appwriteItemId: bank.$id,
                sharableId: bank.sharableId,
              }}
              userName={`${loggedIn?.firstName} ${loggedIn?.lastName}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MyBanks;
