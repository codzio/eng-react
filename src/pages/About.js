import React, { useEffect, useState } from 'react';
import Layout from '../component/layout';
import '../styles/Home.css';
import OtherBanner from '../component/other-banner';
import QuoteSection from '../component/quote-section';
import AboutJourney from '../component/about-journey';
import HowWeWork from '../component/how-we-work';
import MissionVision from '../component/mission-vision';
import CoreValues from '../component/core-values';
import PreLoader from '../component/preloader';


const About = () =>{
    const [loadedData, setLoadedData] = useState(null);
    const [pageTitle, setPageTitle] = useState('Enggenv Solutions');
    const [metaData, setMetaData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}api/page/about-us`); // Replace with your actual API endpoint
            const data = await res.json();
            const newPageTitle = data.page[0].metaTitle || data.page[0].title;
            const metaDescription = data.page[0].metaDescription || '';
            const metaImage = 'images/team_image.jpg';

            setPageTitle(`Enggenv Solutions | ${newPageTitle}`);
            setMetaData({metaDescription: metaDescription, metaImage:metaImage});
            setLoadedData(data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        };

        fetchData();
    }, []);

    return (
        <Layout pageTitle={pageTitle} metaData={metaData}>
            {loadedData ? (
                <>
                <OtherBanner />
                <QuoteSection loadedData={loadedData} />
                <AboutJourney loadedData={loadedData} />
                <HowWeWork loadedData={loadedData} />
                <MissionVision loadedData={loadedData} />
                <CoreValues />
                </>
            ) : (
                <PreLoader />
            )}
        </Layout>
    );
};

export default About;