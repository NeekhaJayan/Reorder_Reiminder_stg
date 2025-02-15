import {
  Box,
  Card,
  Bleed,
  Tooltip,
  Layout,
  Page,
  Text,
  BlockStack,
  Button,
  Tabs,
  FormLayout,
  ProgressBar,
  LegacyStack,
  SkeletonPage, SkeletonBodyText, SkeletonDisplayText,
  Form,
  TextField,
  Image,
  DropZone,
  Banner
} from "@shopify/polaris";
import { Icon} from "@shopify/polaris";
import { InfoIcon ,AlertTriangleIcon} from "@shopify/polaris-icons";
import React, { useState,useCallback,useEffect } from "react";
import {useFetcher,useLoaderData,useSearchParams} from "@remix-run/react";
import { authenticate } from "../shopify.server";
import "react-quill/dist/quill.snow.css";

import PricingPlans from "../componets/settings/PricingPlans";
import { useOutletContext } from '@remix-run/react';
import {getShopDetails} from '../utils/shopify';
import SkeletonLoad from "../componets/SkeletonLoad";
import {useEmailSettings} from "../hooks/useEmailSettings";
import {useGeneralSettings} from "../hooks/useGeneralSettings";
import {useSettings} from "../hooks/useSettings";
import EmailSettingsTab from "../componets/settings/EmailSettingsTab";
import GeneralSettingsTab from "../componets/settings/GeneralSettingsTab";
import {settingsInstance} from "../services/api/SettingService";
import { orderInstance } from "../services/api/OrderService";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop_domain = session.shop;
  const settingDetails =await settingsInstance.getSettingData(shop_domain);
  console.log(settingDetails)
  return {shop_domain,settingDetails};  
};


export const action = async ({ request }) => {
  const {admin}=await authenticate.admin(request);
  try {
    const formData = await request.formData();
    const Settings = Object.fromEntries(formData); 
    console.log("Settings.tab:", Settings.tab);
    if (Settings.tab === "template-settings") {
      
      const result = await settingsInstance.saveSettings(Settings)
      console.log(result)
      return { success: result };
    }
    if (Settings.tab === "general-settings") {
      try {
        const shopDetail=await getShopDetails(admin);
        if (!shopDetail?.createdAt) {
          throw new Error("shopDetail.createdAt is missing or undefined");
        }
        const created_at=new Date(shopDetail.createdAt);
        const jsonResponse = await orderInstance.SyncOrderDetails(created_at,admin)   
        
      } catch (error) {
        console.error("Error fetching orders:", error);
        return { error: "Failed to fetch orders", details: error.message };
      }
    }
    
    return {  error: "Invalid tab identifier" };
  } catch (error) {
    console.error("Error in action handler:", error);
    return { error:" Failed to save the email template. Please check your content and try again. If the problem persists, contact support for assistance. " };
  }
};


export default function SettingsPage() {
  const { shop_domain} = useLoaderData();
  const { files,progress,bannerMessage,bannerStatus,isSyncDisabled,loading,imageUrlForPreview, setBannerMessage, handleSync ,handleSubmit,handleDrop,handleRemoveImage } = useGeneralSettings();
  const { subject, setSubject, fromName, setFromName, fromEmail, setFromEmail, coupon, setCoupon, discountPercent, setDiscountPercent,bufferTime, setBufferTime } = useEmailSettings();
  const {selectedTab,tabKey,tabs,handleTabChange,fetcher}=useSettings();
  const { plan } = useOutletContext();
  
  if (loading) {
    <SkeletonLoad/>
  }

  return (
    <Page
      backAction={{ content: "Settings", url: "/app" }}
      title="Settings"
    >
      <Card>
        <style>
          {`
            .Polaris-Tabs__Tab--active {
              color:rgb(10, 10, 10); /* Active tab text color */
              background-color:rgb(211, 136, 140); /* Optional: active tab background color */
            }
          `}
        </style>
        <Tabs key={tabKey} tabs={tabs} selected={selectedTab} onSelect={handleTabChange} fitted>
          <div style={{ padding: "16px" }}>
            {selectedTab === 0 && (
             <GeneralSettingsTab 
                         shop_domain={shop_domain} 
                         fetcher={fetcher}  
                         files={files} progress={progress} 
                         bannerMessage={bannerMessage}
                         isSyncDisabled={isSyncDisabled} 
                         loading={loading}
                         setBannerMessage={setBannerMessage}
                          handleSync={handleSync} 
                          handleSubmit={handleSubmit}
                          handleDrop={handleDrop}
                          handleRemoveImage={handleRemoveImage}/>
            )}
            {selectedTab === 1 && (
              <EmailSettingsTab  shop_domain={shop_domain} 
              plan={plan} 
              fetcher={fetcher} 
              imageUrlForPreview={imageUrlForPreview}
              subject={subject}
              setSubject={setSubject}
              fromName={fromName} 
              setFromName={setFromName} 
              fromEmail={fromEmail} 
              setFromEmail={setFromEmail}
               coupon={coupon}
                setCoupon={setCoupon}
                discountPercent={discountPercent}
                setDiscountPercent={setDiscountPercent}
                bufferTime={bufferTime} 
                setBufferTime={setBufferTime} />
            )}
            {selectedTab === 2 && (
              <PricingPlans plan={plan} />
                         )}
          </div>
        </Tabs>
      </Card>
    </Page>
  );
}
