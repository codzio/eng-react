import React, { useEffect, useState, lazy, Suspense } from "react";
import Layout from "../component/layout";
import PreLoader from "../component/preloader";

const VideoComp = lazy(() => import("../component/video-comp"));

const Videos = () => {
  const [loadedData, setLoadedData] = useState(null);
  // const [pageTitle, setPageTitle] = useState('Enggenv Solutions | Videos');
  // const [metaData, setMetaData] = useState({});    
  const [pageTitle] = useState('Enggenv Solutions | Videos');
  const [metaData] = useState({});   

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}api/videos`);
        const data = await res.json();
        setLoadedData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <Layout hasBanner="false" pageTitle={pageTitle} metaData={metaData}>
      <div className="we_do_sec product_we_do_sec">
        <div className="containers">
          <div className="we_do_sec_inner">
            <div className="focus_content" data-aos="fade-up-left">
              <h2>Videos</h2>
            </div>
            <div className="we_do_content" data-aos="fade-up-right">
              <p>
                Engineering & Environmental Solutions Pvt Ltd is a pioneer in providing breakthrough technological solutions centralized towards protecting the environment and promoting a sustainable tomorrow. We develop environmental monitoring instruments using sensor-driven technologies
              </p>
            </div>
          </div>
        </div>
      </div>
      <Suspense fallback={<PreLoader />}>
        {loadedData ? (
          <VideoComp videos={loadedData} />
        ) : (
          <PreLoader />
        )}
      </Suspense>
    </Layout>
  );
};

export default Videos;