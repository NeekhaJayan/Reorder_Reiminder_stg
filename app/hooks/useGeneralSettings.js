import { useState, useEffect, useCallback } from "react";
import { useFetcher,useLoaderData } from "@remix-run/react";
import { useOutletContext } from '@remix-run/react';

export  function useGeneralSettings() {
  const { shop_domain, settingDetails } = useLoaderData();
  const { plan } = useOutletContext();
  const fetcher = useFetcher();
  const [files, setFiles] = useState([]);
  const [rejectedFiles, setRejectedFiles] = useState([]);
  const [imageChanged, setImageChanged] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [loading, setLoading] = useState(true);
  const { data, state } = fetcher;
  const uploadFile=settingDetails?.general_settings?.bannerImage

  const [bannerMessage, setBannerMessage] = useState(""); // Store banner message
  const [bannerStatus, setBannerStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [isSyncDisabled, setIsSyncDisabled] = useState(plan === 'FREE');

 
    useEffect(() => {
        // Optional: Handle the case where settingDetails are fetched but not immediately available
        if (settingDetails) {
          setIsSyncDisabled(!settingDetails.general_settings.syncStatus);
          if (uploadFile) {
            setFiles([{
              name: settingDetails?.general_settings?.bannerImageName , // You can replace this with the actual file name
              url: uploadFile // This can be a URL or path to the image
            }]);
          }else {
            setFiles([]); // Ensure it's empty if no uploaded file exists
          }
        }
        
        setTimeout(() => setLoading(false), 2000); // Add artificial delay for demonstration
        
      }, [settingDetails, uploadFile]);
    const handleSync = useCallback(() => {
        setBannerMessage("Syncing orders...");
        setBannerStatus("info");
        const formData = new FormData();
        formData.append("tab", "general-settings");
        formData.append("shop",shop_domain)
        fetcher.submit(formData, {
          method: "POST",
        });
        
        const interval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 100) {
              clearInterval(interval); // Clear interval when progress reaches 100%
              setBannerMessage(fetcher.data.message); // Update success message
              setBannerStatus("success");
              return 100; // Ensure progress doesn't exceed 100
            }
            return prev + 10; // Increment progress
          });
        }, 500); 
      setProgress(0);
      }, [fetcher,shop_domain]);  // Add dependencies to the useCallback hook
    const handleDrop = useCallback((_droppedFiles, acceptedFiles, rejectedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setFiles((files) => [...files, ...acceptedFiles]); // Store only the latest uploaded file
      }
      setRejectedFiles(rejectedFiles);
      setImageChanged(true);
    }, []);
    
    const handleRemoveImage = () => {
      if (imageChanged) {
        setFiles([]); 
        setHasError("");
      }
    };
    
    
    
    const imageUrlForPreview = files.length > 0 && files[0].url ? files[0].url : (files.length > 0 && window.URL.createObjectURL(files[0]));
   
    
    const handleSubmit = async (event) => {
      event.preventDefault(); 
      setLoading(true);
    
      const formData = new FormData();
      console.log(formData)
      formData.append("bannerImage", files[0]); // Ensure files is an array
      formData.append("shop_name", shop_domain);
    
      try {
        const response = await fetch(`http://127.0.0.1:8000/auth/upload_to_aws/${shop_domain}`, {
          method: "POST", 
          body: formData, 
        });
    
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to upload image. ${errorText}`);
        }
    
        const result = await response.json();
        console.log("Upload success:", result);
        setLoading(false);
      } catch (error) {
        console.error("Upload failed:", error);
        setLoading(false);
      }
    };
  

  return { files,progress,bannerMessage,bannerStatus,isSyncDisabled,imageUrlForPreview, setBannerMessage, loading, handleSync ,handleSubmit,handleDrop,handleRemoveImage};
};


