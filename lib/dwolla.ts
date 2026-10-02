"use server";

let cachedToken: { token: string; expiresAt: number } | null = null;

const getDwollaBaseUrl = () => {
  return (
    process.env.DWOLLA_API_URL ||
    process.env.DWOLLA_BASE_URL ||
    "https://api-sandbox.dwolla.com"
  );
};

export const getDwollaAccessToken = async (): Promise<string> => {
  // Return cached token if still valid (with 60-second buffer)
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60000) {
    return cachedToken.token;
  }

  const key = process.env.DWOLLA_KEY;
  const secret = process.env.DWOLLA_SECRET;

  if (!key || !secret) {
    throw new Error(
      "Missing DWOLLA_KEY or DWOLLA_SECRET in environment variables."
    );
  }

  const baseUrl = getDwollaBaseUrl();
  const credentials = Buffer.from(`${key}:${secret}`).toString("base64");

  const response = await fetch(`${baseUrl}/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to fetch Dwolla access token: ${response.status} ${errorText}`
    );
  }

  const data = await response.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
  };

  return data.access_token;
};

export const createFundingSource = async ({
  dwollaCustomerId,
  processorToken,
  bankName,
}: AddFundingSourceParams): Promise<string | undefined> => {
  try {
    const token = await getDwollaAccessToken();
    const baseUrl = getDwollaBaseUrl();

    // Customer funding sources endpoint in Dwolla
    const url = dwollaCustomerId.startsWith("http")
      ? `${dwollaCustomerId}/funding-sources`
      : `${baseUrl}/customers/${dwollaCustomerId}/funding-sources`;

    const dwollaResponse = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/vnd.dwolla.v1.hal+json",
        "Content-Type": "application/vnd.dwolla.v1.hal+json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: bankName,
        plaidToken: processorToken,
      }),
    });

    const location = dwollaResponse.headers.get("location");
    if (location) return location;

    const data = await dwollaResponse.json();
    return data?.funding_source_url || data?._links?.self?.href;
  } catch (error) {
    console.error("Error creating funding source:", error);
    throw error;
  }
};

export const createDwollaCustomer = async (
  customerData: NewDwollaCustomerParams
): Promise<string | undefined> => {
  try {
    const token = await getDwollaAccessToken();
    const baseUrl = getDwollaBaseUrl();

    const dwollaResponse = await fetch(`${baseUrl}/customers`, {
      method: "POST",
      headers: {
        Accept: "application/vnd.dwolla.v1.hal+json",
        "Content-Type": "application/vnd.dwolla.v1.hal+json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(customerData),
    });

    const location = dwollaResponse.headers.get("location");
    if (location) return location;

    const data = await dwollaResponse.json();
    return data?.customer_id || data?._links?.self?.href;
  } catch (error) {
    console.error("Error creating Dwolla customer:", error);
    throw error;
  }
};

export const addFundingSource = async ({
  dwollaCustomerId,
  processorToken,
  bankName,
}: AddFundingSourceParams): Promise<string | undefined> => {
  try {
    const fundingSourceUrl = await createFundingSource({
      dwollaCustomerId,
      processorToken,
      bankName,
    });

    return fundingSourceUrl;
  } catch (error) {
    console.error("Error adding funding source:", error);
    throw error;
  }
};
