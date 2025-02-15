import {IndexTable,Spinner,Text} from "@shopify/polaris";
import ProductTableRow from "./ProductTableRow";

const ProductTable = ({ productData,spinner,editingProduct,editReorderDay,resetReorderfield,saveReorderDay,cancelReorderDays,handleReorderChange,activeModal,toggleModal,confirmReset,selected_productId,selected_variantId}) => {

    return(
        <>
            <IndexTable
                resourceName={{
                    singular: "Product",
                    plural: "Products",
                }}
                itemCount={productData.length}
                headings={[
                    { title: "Product Name" },
                    { title: "Estimated Usage Days" },
                    { title: "Date created" },
                    {
                    title: spinner ? (
                        <div style={{ display: "flex", alignItems: "center" }}>
                        <Spinner size="small" accessibilityLabel="Loading data" />
                        <Text variant="bodyMd" as="span" style={{ marginLeft: "8px" }}>
                            Saving
                        </Text>
                        </div>
                    ) : (
                        "Actions"
                    ),
                    },
                ]}
                selectable={false}
                >
                {productData.map((product) => (
                    <ProductTableRow
                    key={product.shopify_variant_id}
                    product={product}
                    isEditing={editingProduct === product.shopify_variant_id}
                    onEdit={() => editReorderDay(product.shopify_variant_id)}
                    onReset={resetReorderfield}
                    onSave={() => saveReorderDay(product)}
                    onCancel={()=>cancelReorderDays(product.shopify_variant_id)}
                    onReorderChange={handleReorderChange}
                    activeModal={activeModal}
                    toggleModal={toggleModal}
                    confirmReset={confirmReset}
                    selectedProductId={product.shopify_product_id}
                    selectedVariantId={product.shopify_variant_id}
                    />
                ))}
                </IndexTable>
        </>
  );
};
export default ProductTable;

    