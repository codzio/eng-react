import React, { useEffect, useState } from "react";
//import OtherBanner from "../component/other-banner";
import ProductSingleSlider from "../component/product-single-slider";
import FeaturesSingleProduct from "../component/features-single-product";
import Layout from "../component/layout";
import PreLoader from "../component/preloader";
import { useParams } from "react-router-dom";

const SingleProduct = () => {
    //const bannerImg = "../images/banner1.png";
    //const bannerTitle = "Our Products";
    //const bannerPattern = "../images/other_banner_pattern.png";
    const [product, setProduct] = useState(null);
    const [prodVariants, setProductVariants] = useState(null);
    const [subProduct, setSubProduct] = useState(null);
    const [pageTitle, setPageTitle] = useState('Enggenv Solutions');
    const [metaData, setMetaData] = useState([]);
    const { productSlug } = useParams();
    
    useEffect(() => {
        const fetchData = async () => {
            try{
                const res = await fetch(`${process.env.REACT_APP_API_URL}api/products/${productSlug}`);
                const productData = await res.json();
                setProduct(productData.product);
                setProductVariants(productData.productVariants);
                setSubProduct(productData.subProducts);
                
                const newPageTitle = productData.product.metaTitle || productData.product.title;
                const metaDescription = productData.product.metaDescription || productData.product.description;
                const metaImage = productData.product.featuredImg || 'images/team_image.jpg';                

                setPageTitle(`Enggenv Solutions | ${newPageTitle}`);
                setMetaData({metaDescription: metaDescription, metaImage:metaImage});

            }catch (error) {
                console.log("Error fetching product data:", error);
            }
        };

        fetchData();
    }, [productSlug]);

    if(!product){
        return <PreLoader />;
    }

    // if(!product.prodFeatures || !product.prodFeatures.length){
    //     return <p>Product not found</p>;
    // }
    // console.log(!product.prodFeatures.length)

    return (
        <Layout hasBanner="false" pageTitle={pageTitle} metaData={metaData}>
            {product ? (
                <>
                    {/*<OtherBanner bannerImg={bannerImg} bannerTitle={bannerTitle} bannerPattern={bannerPattern} />*/}
                    <ProductSingleSlider product={product} />
                    <FeaturesSingleProduct product={product} prodVariants={prodVariants} subProduct={subProduct} />
                </>
            ) : (
                <PreLoader />
            )}
        </Layout>
    );

};

export default SingleProduct;