import React, { useEffect, useState } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import Header from "./Header";
import Footer from "./footer";
import { useLocation } from "react-router-dom";


const Layout = ( props ) => {
    const [loadData, setLoadedData] = useState(null);
    const [common, setCommon] = useState(null);
    const location = useLocation();
    const pageTitle = props.pageTitle || location.pathname;
    const metaData = props.metaData || [];

    useEffect(() => {
        // Fetch data here and set it in the state
        const fetchData = async () => {
          try {
            // const res = await fetch(`${process.env.REACT_APP_API_URL}/api/products/category`);
            const resCommon = await fetch(`${process.env.REACT_APP_API_URL}api/comman`);
            // const data = await res.json();
            const dataCommon = await resCommon.json();
            // setLoadedData(data);
            setLoadedData(dataCommon);
            setCommon(dataCommon);
          } catch (error) {
            console.error('Error fetching data:', error);
            // setLoadedData(null);
            setCommon(null);
            setLoadedData(null);
          }
        };
    
        fetchData();
      }, [location.pathname]);

      const getPageTitle = (path) => {
        if(path === "/"){
          return "Home";
        }else{
          const title = path.slice(1);
          return title.charAt(0).toUpperCase() + title.slice(1);
        }
      };

    return (
        <div>
          <HelmetProvider>
            <Helmet>
                // <title>{getPageTitle(location.pathname)}</title>
                
                <title>{pageTitle}</title>

                <meta property="og:title" content={pageTitle} />
                <meta name="twitter:title" content={pageTitle} />
                
                {metaData.metaDescription && (
                  <meta property="og:description" content={metaData.metaDescription} />
                )}

                {metaData.metaDescription && (
                  <meta property="og:description" content={metaData.metaDescription} />
                )}

                {metaData.metaImage && (
                  <meta property="og:image" content={`${process.env.REACT_APP_API_URL}${metaData.metaImage}`} />
                )}

                {metaData.metaImage && (
                  <meta name="twitter:image" content={`${process.env.REACT_APP_API_URL}${metaData.metaImage}`} />
                )}

            </Helmet>
            <Header loadData={loadData} />
            <main>{props.children}</main>
            <Footer common={common} />
          </HelmetProvider>
        </div>
    );
};

export default Layout;