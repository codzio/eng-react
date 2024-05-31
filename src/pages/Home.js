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

const fetchPageData = async (slug, isHomePage) => {
  const endpoint = isHomePage ? 'api/home' : `api/page/${slug}`;
  const response = await fetch(`${process.env.REACT_APP_API_URL}${endpoint}`);
  if (!response.ok) throw new Error('Network response was not ok');
  return response.json();
};

const Home = () => {
  const { pageSlug } = useParams();
  const [loadedData, setLoadedData] = useState(null);
  const [pageTitle, setPageTitle] = useState('Enggenv Solutions');
  const [metaData, setMetaData] = useState({});
  const [homePage, setHomePage] = useState(true);
  const bannerImg = 'images/banner1.png';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const isHomePage = typeof pageSlug === 'undefined';
        const data = await fetchPageData(pageSlug, isHomePage);

        const pageData = isHomePage ? data.home[0] : data.page[0];
        const newPageTitle = pageData.metaTitle || pageData.title;
        const metaDescription = pageData.metaDescription || '';
        const metaImage = 'images/team_image.jpg';

        setPageTitle(`Enggenv Solutions | ${newPageTitle}`);
        setMetaData({ metaDescription, metaImage });
        setLoadedData(data);
        setHomePage(isHomePage);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [pageSlug]);

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
              <OtherBanner bannerImg={bannerImg} bannerTitle={loadedData.page[0].title} />
              <CmsPage data={loadedData} />
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