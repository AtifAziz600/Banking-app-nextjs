import { redirect } from "next/navigation";
import { getLoggedInUser } from "@/lib/actions/user.actions";
import { getBanks } from "@/lib/actions/user.actions";
import PaymentTransferForm from "@/components/PaymentTransferForm";
import HeaderBox from "@/components/HeaderBox";

const Transfer = async () => {
  const loggedIn = await getLoggedInUser();

  if (!loggedIn) redirect("/sign-in");

  const banks = await getBanks({ userId: loggedIn.$id });

  return (
    <section className="payment-transfer">
      <HeaderBox
        title="Payment Transfer"
        subtext="Please provide any specific details or notes related to the payment transfer"
      />

      <section className="size-full pt-5">
        <PaymentTransferForm accounts={banks?.documents} />
      </section>
    </section>
  );
};

export default Transfer;
