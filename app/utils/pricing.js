const query = `
  mutation appSubscriptionCreate($name: String!, $returnUrl: URL!, $price: Decimal!) {
    appSubscriptionCreate(
      name: $name
      returnUrl: $returnUrl
      lineItems: [
        {
          plan: {
            appRecurringPricingDetails: {
              price: { amount: $price, currencyCode: USD }
            }
          }
        }
      ]
      test: true
      trialDays: 7
    ) {
      appSubscription {
        id
      }
      userErrors {
        field
        message
      }
      confirmationUrl
    }
  }
`;

export const pricing = async (accessToken, shop, price) => {
  
  const shopifyGraphQLEndpoint = `https://${shop}/admin/api/2024-10/graphql.json`;
  console.log(process.env.SHOPIFY_APP_URL)
  // Prepare GraphQL variables
  const variables = {
    name: "Pro Plan",
    returnUrl: `${process.env.SHOPIFY_APP_URL}/billing/callback?shop=${shop}`,
    price, // Dynamic pricing
  };

  try {
    const response = await fetch(shopifyGraphQLEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({ query, variables }),
    });

    const result = await response.json();

    // Check for GraphQL errors
    if (result.errors) {
      console.error("GraphQL errors:", result.errors);
      return null;
    }

    const { appSubscriptionCreate } = result.data;

    // Check for user errors in the response
    if (appSubscriptionCreate.userErrors?.length) {
      console.error("User errors:", appSubscriptionCreate.userErrors);
      return null;
    }

    // Return the confirmation URL for further use
    return appSubscriptionCreate.confirmationUrl;
  } catch (error) {
    console.error("Error during app subscription creation:", error);
    return null; // Return null in case of any runtime error
  }
};
