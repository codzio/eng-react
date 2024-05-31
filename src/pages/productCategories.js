import React, { useEffect, useState, lazy, Suspense } from "react";
import { useParams } from "react-router-dom";
import Layout from "../component/layout";
import PreLoader from "../component/preloader";

const OtherBanner = lazy(() => import("../component/other-banner"));
const QualityProductsonMarket = lazy(() => import("../component/quality-products-on-market"));
const ProductCategoriesComp = lazy(() => import("../component/product-categories-comp"));
const ProductSubCategoriesComp = lazy(() => import("../component/product-sub-categories-comp"));

const ProductCategories = () => {
  const [loadedData, setLoadedData] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const [pageTitle, setPageTitle] = useState('Enggenv Solutions');
  const [metaData, setMetaData] = useState({});
  const { categorySlug } = useParams();
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = categorySlug 
          ? await fetch(`${process.env.REACT_APP_API_URL}api/productCat/${categorySlug}`) 
          : await fetch(`${process.env.REACT_APP_API_URL}api/productCat`);

        const data = await res.json();
        setLoadedData(data);

        const newPageTitle = categorySlug ? data.category.title : 'Product Categories';
        const metaDescription = categorySlug ? data.category.description : '';
        const metaImage = categorySlug ? (data.category.image || 'images/team_image.jpg') : 'images/team_image.jpg';

        setPageTitle(`Enggenv Solutions | ${newPageTitle}`);
        setMetaData({ metaDescription, metaImage });

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false); // Set loading to false when data fetching is complete
      }
    };

    fetchData();
  }, [categorySlug]);

  return (
    <Layout hasBanner="false" pageTitle={pageTitle} metaData={metaData}>
      <Suspense fallback={<PreLoader />}>
        {loadedData ? (
          <>
            {/* <OtherBanner bannerImg={bannerImg} bannerTitle={bannerTitle} /> */}
            {categorySlug ? (
              <ProductSubCategoriesComp productData={loadedData} loading={loading} />
            ) : (
              <>
                <QualityProductsonMarket />
                <ProductCategoriesComp categories={loadedData} loading={loading} />
              </>
            )}
          </>
        ) : (
          <PreLoader />
        )}
      </Suspense>
    </Layout>
  );
};

export default ProductCategories;