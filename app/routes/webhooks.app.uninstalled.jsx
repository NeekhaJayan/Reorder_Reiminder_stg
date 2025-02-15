import { authenticate } from "../shopify.server";


export const action = async ({ request }) => {
  const { shop, topic } = await authenticate.webhook(request);
  
  console.log(`Received ${topic} webhook for ${shop}`);
  
  
  // Webhook requests can trigger multiple times and after an app has already been uninstalled.
  // If this webhook already ran, the session may have been deleted previously.
  if (session) {
    const session = await db.session.findUnique({
      where: { shop }, // Find the session by shop field
      select: { accessToken: true }, // Retrieve only the accessToken field
    });
    if (!session || !session.accessToken) {
      throw new Error(`Access token not found for shop: ${shop}`);
    }
    
   
    await db.session.deleteMany({ where: { shop } });
  }
  return new Response();
};
