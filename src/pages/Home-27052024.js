import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../component/layout';
import HomeBanner from '../component/home-banner';
import HomeAboutVideo from '../component/home-about-video';
import PreLoader from '../component/preloader';

// Lazy-loaded components
const WhatWeDo = React.lazy(() => import('../component/what-we-do'));
const OurOffering = React.lazy(() => import('../component/our-offering'));
const Projects = React.lazy(() => import('../component/projects'));
const WhyEE = React.lazy(() => import('../component/why-ee'));
const OurProduct = React.lazy(() => import('../component/our-product'));
const DataVisualization = React.lazy(() => import('../component/data-visualization'));
const Testimonial = React.lazy(() => import('../component/testimonials'));
const OurClient = React.lazy(() => import('../component/our-client'));
const CmsPage = React.lazy(() => import('../component/cms-page'));
const OtherBanner = React.lazy(() => import('../component/other-banner'));

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
          const res = await fetch(`${process.env.REACT_APP_API_URL}api/page/` + pageSlug);
          const data = await res.json();
          const newPageTitle = data.page[0].metaTitle || data.page[0].title;
          const metaDescription = data.page[0].metaDescription || '';
          const metaImage = 'images/team_image.jpg';
          setPageTitle(`Enggenv Solutions | ${newPageTitle}`);
          setMetaData({ metaDescription: metaDescription, metaImage: metaImage });
          setLoadedData(data);
          setHomePage(false);
        } else {
          const res = await fetch(`${process.env.REACT_APP_API_URL}api/home`);
          const data = await res.json();
          const newPageTitle = data.home[0].metaTitle || data.home[0].title;
          const metaDescription = data.home[0].metaDescription || '';
          const metaImage = 'images/team_image.jpg';
          setPageTitle(`Enggenv Solutions | ${newPageTitle}`);
          setMetaData({ metaDescription: metaDescription, metaImage: metaImage });
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
      <Suspense fallback={<PreLoader />}>
        {loadedData ? (
          homePage ? (
            <>
              <HomeBanner banners={loadedData.banners} />
              <HomeAboutVideo />
              <Suspense fallback={<PreLoader />}>
                <WhatWeDo />
                <OurOffering />
                <Projects projects={loadedData.projects} />
                <WhyEE why={loadedData.why} />
                <OurProduct products={loadedData.prodCatUpdated} />
                <DataVisualization />
                <Testimonial testimonials={loadedData} />
                <OurClient clients={loadedData} />
              </Suspense>
            </>
          ) : (
            <>
              <Suspense fallback={<PreLoader />}>
                <OtherBanner bannerImg={bannerImg} bannerTitle={loadedData.page[0].title} />
                <CmsPage data={loadedData} />
              </Suspense>
            </>
          )
        ) : (
          <PreLoader />
        )}
      </Suspense>
    </Layout>
  );
};

export default Home;