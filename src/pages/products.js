import React, { useEffect, useState } from "react";
// import { Routes, Route } from "react-router-dom";
import OtherBanner from "../component/other-banner";
import QualityProductsonMarket from "../component/quality-products-on-market";
import ProductListing from "../component/product-listing";
import Layout from "../component/layout";
import PreLoader from "../component/preloader";
// import SingleProduct from "./product-single";

const ProductMain = () => {
    const [loadedData, setLoadedData] = useState(null);
    const bannerImg = "images/banner1.png";
    const bannerTitle = "Our Products";

    useEffect(() => {
        const fetchData = async () => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}api/products/Category`); // Replace with your actual API endpoint
            const data = await res.json();
            setLoadedData(data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        };

        fetchData();
    }, []);

    return (
        <Layout>
            {loadedData ? (
                <>
                    <OtherBanner bannerImg={bannerImg} bannerTitle={bannerTitle} />
                    <QualityProductsonMarket />
                    <ProductListing products={loadedData} />
                </>
            ) : (
                <PreLoader />
            )};
        </Layout>
    );
}

export default ProductMain;