import React, { useEffect, useState } from 'react';
import '../styles/Home.css';
import Layout from '../component/layout';
import HomeBanner from '../component/home-banner';
import HomeAboutVideo from '../component/home-about-video';
import WhatWeDo from '../component/what-we-do';
import OurOffering from '../component/our-offering';
import UseCases from '../component/use-cases';
import Projects from '../component/projects';
import WhyEE from '../component/why-ee';
import OurProduct from '../component/our-product';
import DataVisualization from '../component/data-visualization';
import Testimonial from '../component/testimonials';
import OurClient from '../component/our-client';
import CmsPage from '../component/cms-page';
import OtherBanner from '../component/other-banner';
import PreLoader from '../component/preloader';
import { useParams, useNavigate } from "react-router-dom";


const Home = () => {
  const navigate = useNavigate();
  const { pageSlug } = useParams();

  const [loadedData, setLoadedData] = useState(null);
  const [pageTitle, setPageTitle] = useState('Enggenv Solutions');
  const [metaData, setMetaData] = useState([]);
  const [homePage, setHomePage] = useState(true);

  const bannerImg = 'images/banner1.png';

  useEffect(() => {
    const fetchData = async (pageSlug) => {
      try {

        if (typeof pageSlug !== 'undefined') {
          
          const res = await fetch(`${process.env.REACT_APP_API_URL}api/page/`+pageSlug); // Replace with your actual API endpoint
          const data = await res.json();
          const newPageTitle = data.page[0].metaTitle || data.page[0].title;
          const metaDescription = data.page[0].metaDescription || '';
          const metaImage = 'images/team_image.jpg';

          setPageTitle(`Enggenv Solutions | ${newPageTitle}`);
          setMetaData({metaDescription: metaDescription, metaImage:metaImage});
          setLoadedData(data);
          setHomePage(false);

        } else {
          
          const res = await fetch(`${process.env.REACT_APP_API_URL}api/home`); // Replace with your actual API endpoint
          const data = await res.json();
          const newPageTitle = data.home[0].metaTitle || data.home[0].title;        
          const metaDescription = data.home[0].metaDescription || '';
          const metaImage = 'images/team_image.jpg';

          setPageTitle(`Enggenv Solutions | ${newPageTitle}`);
          setMetaData({metaDescription: metaDescription, metaImage:metaImage});
          setLoadedData(data);
          setHomePage(true);

        }

        
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData(pageSlug);
  }, []);

  return (
    <Layout pageTitle={pageTitle} metaData={metaData}>
      {loadedData ? (
        homePage ? (
          <>
            <HomeBanner banners={loadedData.banners} />
            <HomeAboutVideo />
            <WhatWeDo />
            <OurOffering />
            {/*<UseCases useCases={loadedData.useCases} />*/}
            <Projects projects={loadedData.projects} />
            <WhyEE why={loadedData.why} />
            <OurProduct products={loadedData.prodCatUpdated} />
            <DataVisualization />
            <Testimonial testimonials={loadedData} />
            <OurClient clients={loadedData} />
          </>
        ) : (
          <>
            <OtherBanner bannerImg={bannerImg} bannerTitle={loadedData.page[0].title} />
            <CmsPage data={loadedData} />
          </>
        )
      ) : (
        <PreLoader />
      )}
    </Layout>
  );
};

export default Home;
