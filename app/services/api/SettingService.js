class Settings{
    async getSettingData(shop_domain){

        try{
            const settingsResponse = await fetch(
                `http://127.0.0.1:8000/auth/get-settings?shop_name=${shop_domain}`,
                {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                  },
                }
              );
            if (!settingsResponse.ok) {
            throw new Error("Failed to fetch settings data from FastAPI");
            }
    
            return  await settingsResponse.json();

        }catch (error) {
            console.error("Error fetching shop details:", error.message);
            return null; // Return `null` or handle errors gracefully
          } 
        
    }

    async saveSettings(data){
        
      const response = await fetch(`http://127.0.0.1:8000/auth/save-settings`, {
        method: "POST", // Adjust method as per your API
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log(errorText);
        
        throw new Error(`Failed to save the email template. Please check your content and try again. If the problem persists, contact support for assistance.`);
      
      }

      return await response.json();
      
    }
}
const settingsInstance = new Settings();
export {settingsInstance}