"use client";

import PlaidLink from "./PlaidLink";

const ConnectBankButton = ({ user }: { user: any }) => {
  return <PlaidLink user={user} variant="primary" />;
};

export default ConnectBankButton;
