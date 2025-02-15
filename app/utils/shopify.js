// // Update your function to create and pin a metafield definition


export const createAndPinReorderDaysMetafieldDefinition = async (admin) => {
    const response = await admin.graphql(
      `#graphql
         mutation {
      metafieldDefinitionCreate(
        definition: {
          namespace: "deca_reorderday_stg",
          key: "reorder_days",
          type: "number_integer",
          name: "Configure Product Usage Days",
          description: "Number of days until reorder",
          ownerType: PRODUCT,
          pin: true
        }
      ) {
        createdDefinition {
          id
          namespace
          key
          name
        }
        userErrors {
          field
          message
        }
      }
    }`
    );
    const createResponseData = await response.json();
    if (createResponseData.errors) {
      console.error("GraphQL error during creation:", createResponseData.errors);
      return;
    }
  
    const userErrors = createResponseData.data.metafieldDefinitionCreate.userErrors;
    if (userErrors.length > 0) {
      console.error("User error during creation:", userErrors);
      return;
    }
  
  };
  
  const getAllProducts = async (admin) => {
    const response = await admin.graphql(
      `#graphql
      query {
        products(first: 50) {  
          edges {
            node {
              id
              title
            }
          }
        }
      }
    `);
  
    const responseData = await response.json();
  
    if (responseData.errors) {
      console.error("GraphQL error while fetching products:", responseData.errors);
      return;
    }
  
    const products = responseData.data.products.edges.map(edge => edge.node);
    return products;
  };
  const getMetafieldForProduct = async (admin, productId) => {
   const response = await admin.graphql(
      `#graphql
      query GetProductMetafield($productId: ID!) {
        product(id: $productId) {
          metafield(namespace: "deca_reorderday_stg", key: "reorder_days") {
            id
            namespace
            key
            value
          }
        }
      }
    `,{
      variables: {
        productId:productId,
      },
    },);
  
    const responseData = await response.json();
  
    if (responseData.errors) {
      console.error("GraphQL error while fetching metafield:", responseData.errors);
      return;
    }
  
    return responseData.data.product.metafield;
  };
  
  export const listProductsWithMetafields = async (admin) => {
    // Step 1: Fetch all products
    const products = await getAllProducts(admin);
    if (!products) {
      return;
    }
    const productData = [];
    // Step 2: For each product, fetch its metafields
    for (const product of products) {
      const metafields = await getMetafieldForProduct(admin, product.id);
      // Check if metafield data exists and is not null
      if (metafields) {
        productData.push({
          productId: product.id,
          productTitle: product.title,
          created_at: product.created_at,
          reorder_days: metafields.value, // Assign the metafield's value to reorder_days
        });
        // console.log(`Product: ${product.title} (ID: ${product.id})`);
        // console.log(`  - Metafield: ${metafields.namespace}.${metafields.key} = ${metafields.value}`);
      }
    }
    return productData
  };
  
//   const getMetafieldDefinitionId = async (admin) => {
//     const response = await admin.graphql(
//       `#graphql
//       {
//         metafieldDefinitions(first: 10, namespace: "deca_reorderday", ownerType: PRODUCT) {
//           edges {
//             node {
//               id
//               namespace
//               key
//               name
//             }
//           }
//         }
//       }
//     `);
  
//     const responseData = await response.json();
  
//     if (responseData.errors) {
//       console.error("GraphQL error while fetching metafield:", responseData.errors);
//       return null;
//     }
  
//     // Extract the ID of the first metafield definition, if it exists
//     const metafieldId = responseData.data.metafieldDefinitions.edges[0]?.node.id;
//     return metafieldId;
//   };
  
  const getProductsWithMetafield = async (admin) => {
    const response = await admin.graphql(
      `#graphql
      {
        products(first: 50) {
          edges {
            node {
              id
              metafields(namespace: "deca_reorderday_stg", first: 1) {
                edges {
                  node {
                    id
                    namespace
                    key
                    value
                  }
                }
              }
            }
          }
        }
      }`
    );
  
    const responseData = await response.json();
    // console.log(responseData)
  
    if (responseData.errors) {
      console.error("GraphQL error while fetching products:", responseData.errors);
      return [];
    }
  
    return responseData.data.products.edges;
  };
//   const deleteProductMetafield = async (admin, metafieldId) => {
    
//     const response = await admin.graphql(
//       `#graphql
//       mutation metafieldDelete($input: MetafieldDeleteInput!) {
//         metafieldDelete(input: $input) {
//           deletedId
//           userErrors {
//             field
//             message
//           }
//         }
//       }`,
//       {
//         variables: {
//           "input": {
//             "id": metafieldId
//           }
//         },
//       },
//     );
    
//     const responseData = await response.json();
    
    
  
//     if (responseData.errors) {
//       console.error("GraphQL error while deleting product metafield:", responseData.errors);
//       return null;
//     }
  
//     return responseData.data.metafieldDelete;
//   };
  
//   // Function to delete metafields for all products
//   export const deleteMetafieldForAllProducts = async (admin) => {
//     const metafieldId = await getMetafieldDefinitionId(admin);
//     const products = await getProductsWithMetafield(admin);
  
//     if (!products.length) {
//       console.log("No products found with the specified metafield.");
//       return;
//     }
  
//     for (const product of products) {
//       const metafieldEdges = product.node.metafields.edges;
//       console.log("metafieldEdges",metafieldEdges)
//       if (metafieldEdges.length > 0) {
//         const metafieldId = metafieldEdges[0].node.id;
//         console.log("metafieldId",metafieldId)
//         console.log(`Deleting metafield: ${metafieldId} for product: ${product.node.id}`);
//         const deleteResult = await deleteProductMetafield(admin, metafieldId);
  
//         if (deleteResult?.deletedMetafieldId) {
//           console.log(`Successfully deleted metafield: ${deleteResult.deletedMetafieldId}`);
//         } else {
//           console.error("Failed to delete metafield:", deleteResult?.userErrors);
//         }
//       }
//     }  
//   };
  
//   export const deleteMetafieldDefinition = async (admin) => {
//     const metafieldId = await getMetafieldDefinitionId(admin);
//     console.log(metafieldId)
//     if (!metafieldId) {
//       console.error("No metafield definition found with the specified namespace.");
//       return;
//     }
//     const response = await admin.graphql(
//       `#graphql
//       mutation {
//         metafieldDefinitionDelete(
//           id: "${metafieldId}"
//         ) {
//           deletedDefinitionId
//           userErrors {
//             field
//             message
//           }
//         }
//       }
//     `);
  
//     const responseData = await response.json();
  
//     if (responseData.errors) {
//       console.error("GraphQL error while deleting metafield:", responseData.errors);
//       return;
//     }
  
//     return responseData.data.metafieldDefinitionDelete;
  
   
//   };

//   export const getShopIdFromCookie = async () =>{
//     const cookies = document.cookie.split("; ");
//     const shopCookie = cookies.find((row) => row.startsWith("shop_id="));
//     return shopCookie ? shopCookie.split("=")[1] : null;
//   };
  
  

const sendGraphQLRequest = async (shop, accessToken, query, variables = {}) => {
  const response = await fetch(`https://${shop}/admin/api/2024-10/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
    body: JSON.stringify({ query, variables }),
  });

  const responseData = await response.json();
  if (responseData.errors) {
    console.error("GraphQL Error:", responseData.errors);
  }
  return responseData.data;
};




// Delete a specific metafield
const deleteProductMetafield = async (shop, accessToken, metafieldId) => {
  const query = `
    mutation metafieldDelete($input: MetafieldDeleteInput!) {
      metafieldDelete(input: $input) {
        deletedId
        userErrors {
          field
          message
        }
      }
    }`;
  const variables = { input: { id: metafieldId } };
  const data = await sendGraphQLRequest(shop, accessToken, query, variables);
  return data.metafieldDelete;
};

// Delete metafields for all products
export const deleteMetafieldForAllProducts = async (shop, accessToken) => {
  const products = await getAllProducts(shop, accessToken);
  if (!products.length) {
    console.log("No products found with metafields.");
    return;
  }

  for (const product of products) {
    const metafields = await getMetafieldForProduct(shop, accessToken, product.id);
    if (metafields) {
      console.log(`Deleting metafield: ${metafields.id} for product: ${product.id}`);
      const deleteResult = await deleteProductMetafield(shop, accessToken, metafields.id);
      if (deleteResult?.deletedId) {
        console.log(`Deleted metafield: ${deleteResult.deletedId}`);
      } else {
        console.error("Error deleting metafield:", deleteResult?.userErrors);
      }
    }
  }
};

const getMetafieldDefinitionId = async (accessToken, shop) => {
  const query = `#graphql
    {
      metafieldDefinitions(first: 10, namespace: "deca_reorderday_stg", ownerType: PRODUCT) {
        edges {
          node {
            id
            namespace
            key
            name
          }
        }
      }
    }`;

  try {
    const data = await sendGraphQLRequest(accessToken, shop, query);
    const metafieldId = data.metafieldDefinitions.edges[0]?.node.id;
    return metafieldId || null;
  } catch (error) {
    console.error("Error fetching metafield definition ID:", error.message);
    return null;
  }
};

export const deleteMetafieldDefinition = async (accessToken, shop) => {
  const metafieldId = await getMetafieldDefinitionId(accessToken, shop);

  if (!metafieldId) {
    console.error("No metafield definition found with the specified namespace.");
    return;
  }

  const mutation = `#graphql
    mutation {
      metafieldDefinitionDelete(
        id: "${metafieldId}"
      ) {
        deletedDefinitionId
        userErrors {
          field
          message
        }
      }
    }`;

  try {
    const data = await sendGraphQLRequest(accessToken, shop, mutation);
    const { deletedDefinitionId, userErrors } = data.metafieldDefinitionDelete;

    if (userErrors?.length) {
      console.error("User errors while deleting metafield definition:", userErrors);
      return null;
    }

    console.log(`Successfully deleted metafield definition: ${deletedDefinitionId}`);
    return deletedDefinitionId;
  } catch (error) {
    console.error("Error deleting metafield definition:", error.message);
    return null;
  }
};

// export const getProductsWithMetafield = async (accessToken, shop) => {
//   const query = `#graphql
//     {
//       products(first: 50) {
//         edges {
//           node {
//             id
//             metafields(namespace: "deca_reorderday", first: 1) {
//               edges {
//                 node {
//                   id
//                   namespace
//                   key
//                   value
//                 }
//               }
//             }
//           }
//         }
//       }
//     }`;

//   try {
//     const data = await sendGraphQLRequest(accessToken, shop, query);
//     return data.products.edges.map((product) => ({
//       id: product.node.id,
//       metafields: product.node.metafields.edges.map((metafield) => ({
//         id: metafield.node.id,
//         namespace: metafield.node.namespace,
//         key: metafield.node.key,
//         value: metafield.node.value,
//       })),
//     }));
//   } catch (error) {
//     console.error("Error fetching products with metafields:", error.message);
//     return [];
//   }
// };

// Get shop ID from cookie
export const getShopIdFromHeaders = (request) => {
  const cookieHeader = request.headers.get("Cookie") || "";
  const cookies = cookieHeader.split("; ");
  const shopCookie = cookies.find((cookie) => cookie.startsWith("shop_id="));
  return shopCookie ? shopCookie.split("=")[1] : null;
};


export const getShopDetails = async (admin) =>{
  const response_shop = await admin.graphql(
    `#graphql
      query {
        shop {
        name
        createdAt
        domains {
          url
        }
        email
      }
    }`,
    );
  
    // Destructure the response
    const shop_body = await response_shop.json();
    
    const shop_data = shop_body;
    return shop_data.data.shop
  
}



  
  