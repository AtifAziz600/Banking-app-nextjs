"use server"

import { ID, Query } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite";
import { cookies } from "next/headers";
import { parseStringify, encryptId } from "../utils";
import { CountryCode, ProcessorTokenCreateRequest, ProcessorTokenCreateRequestProcessorEnum, Products } from "plaid";
import { plaidClient } from "@/lib/plaid";
import { revalidatePath } from "next/cache";
import {
  addFundingSource,
  createFundingSource,
  createDwollaCustomer,
  getDwollaAccessToken,
} from "@/lib/dwolla";

export const signIn = async ({email, password}: signInProps) => {
    try {
        const { account } = await createAdminClient();
        const response = await account.createEmailPasswordSession(email, password);

        cookies().set("appwrite-session", response.secret, {
          path: "/",
          httpOnly: true,
          sameSite: "strict",
          secure: process.env.NODE_ENV === "production",
        });

        return parseStringify(response)
    } catch (error: any) {
        console.error("Sign in error:", error);
        return { error: error?.message || "Invalid email or password. Please try again." };
    }
}

export const signUp = async (userData: SignUpParams) => {
  const { email, firstName, lastName, password } = userData;
  try {
      const { account } = await createAdminClient();

      const newUserAccount =
      await account.create(
        ID.unique(),
        userData.email,
        userData.password,
        `${firstName} ${lastName}`
      );
      const session = await account.createEmailPasswordSession(email, password);

      cookies().set("appwrite-session", session.secret, {
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      });

      return parseStringify(newUserAccount);
  } catch (error: any) {
      console.error("Sign up error:", error);
      // Return error object instead of throwing to prevent server crash
      return { error: error?.message || "Sign up failed. Please try again." };
  }
};


export async function getLoggedInUser() {
  try {
    const { account } = await createSessionClient();
    const user =  await account.get();

    return parseStringify(user)
  } catch (error) {
    return null;
  }
}

export const logoutAccount = async () => {
  try {
      const { account } = await createSessionClient();

      cookies().delete("appwrite-session");

      await account.deleteSession("current");
  } catch (error) {
      return null;
  }
}

export const createLinkToken = async (user: User) => {
  try {
    const tokenParams = {
      user: {
        client_user_id: user.$id,
      },
      client_name: `${user.firstName} ${user.lastName}`,
      products: ["auth"] as Products[],
      language: "en",
      country_codes: ["US"] as CountryCode[],
    };
    const response = await plaidClient.linkTokenCreate(tokenParams);

    return parseStringify({ linkToken: response.data.link_token });
  } catch (error) {
    console.error("Error creating link token:", error);
    throw error;
  }
}

export const exchangePublicToken = async ({
  publicToken,
  user,
}: exchangePublicTokenProps) => {
  try {
    // Exchange public token for access token and item ID
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const accessToken = response.data.access_token;
    const itemId = response.data.item_id;

    // Get account information from Plaid using the access token
    const accountsResponse = await plaidClient.accountsGet({
      access_token: accessToken,
    });

    const accountData = accountsResponse.data.accounts[0];

    // Create a processor token for Dwolla using the access token and account ID
    const request: ProcessorTokenCreateRequest = {
      access_token: accessToken,
      account_id: accountData.account_id,
      processor: "dwolla" as ProcessorTokenCreateRequestProcessorEnum,
    };

    const processorTokenResponse = await plaidClient.processorTokenCreate(
      request
    );
    const processorToken = processorTokenResponse.data.processor_token;

    // Create a funding source URL for the account using the Dwolla customer ID, processor token, and bank name
    const fundingSourceUrl = await addFundingSource({
      dwollaCustomerId: user.dwollaCustomerId,
      processorToken,
      bankName: accountData.name,
    });

    // If the funding source URL is not created, throw an error
    if (!fundingSourceUrl) throw new Error("Failed to create funding source");

    // Create a bank account using the user ID, item ID, account ID, access token, funding source URL, and shareableId ID
    await createBankAccount({
      userId: user.$id,
      bankId: itemId,
      accountId: accountData.account_id,
      accessToken,
      fundingSourceUrl,
      sharableId: encryptId(accountData.account_id),
    });

    // Revalidate the path to reflect the changes
    revalidatePath("/");

    // Return a success message
    return parseStringify({
      publicTokenExchange: "complete",
    });
  } catch (error) {
     console.error("An error occurred while creating exchanging token:", error);
     throw error;
  }
}

export const createBankAccount = async ({
  userId,
  bankId,
  accountId,
  accessToken,
  fundingSourceUrl,
  sharableId,
}: createBankAccountProps) => {
  try {
    const { Databases } = await createAdminClient();
    const database = Databases;

    const bankAccount = await database.createDocument(
      process.env.NEXT_APPWRITE_DATABASE_ID!,
      process.env.NEXT_APPWRITE_BANK_COLLECTION_ID!,
      ID.unique(),
      {
        userId,
        bankId,
        accountId,
        accessToken,
        fundingSourceUrl,
        sharableId,
      }
    );

    return parseStringify(bankAccount);
  } catch (error) {
    console.error("Error creating bank account:", error);
    throw error;
  }
};

export const getBanks = async ({ userId }: getBanksProps) => {
  try {
    const { Databases } = await createAdminClient();
    const database = Databases;

    const banks = await database.listDocuments(
      process.env.NEXT_APPWRITE_DATABASE_ID!,
      process.env.NEXT_APPWRITE_BANK_COLLECTION_ID!,
      [Query.equal("userId", [userId])]
    );

    return parseStringify(banks);
  } catch (error) {
    console.error("Error getting banks:", error);
    throw error;
  }
};

export const getBank = async ({ documentId }: getBankProps) => {
  try {
    const { Databases } = await createAdminClient();
    const database = Databases;

    const bank = await database.listDocuments(
      process.env.NEXT_APPWRITE_DATABASE_ID!,
      process.env.NEXT_APPWRITE_BANK_COLLECTION_ID!,
      [Query.equal("$id", [documentId])]
    );

    return parseStringify(bank);
  } catch (error) {
    console.error("Error getting bank:", error);
    throw error;
  }
};

export const getBankByAccountId = async ({ accountId }: getBankByAccountIdProps) => {
  try {
    const { Databases } = await createAdminClient();
    const database = Databases;

    const bank = await database.listDocuments(
      process.env.NEXT_APPWRITE_DATABASE_ID!,
      process.env.NEXT_APPWRITE_BANK_COLLECTION_ID!,
      [Query.equal("accountId", [accountId])]
    );

    return parseStringify(bank);
  } catch (error) {
    console.error("Error getting bank by account ID:", error);
    throw error;
  }
};

// Dwolla functions
export {
  createFundingSource,
  createDwollaCustomer,
  addFundingSource,
  getDwollaAccessToken,
};



