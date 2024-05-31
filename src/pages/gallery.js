import React, { useState, useEffect } from "react";
import OtherBanner from "../component/other-banner";
import Events from "../component/events";
import AwardsRecognition from "../component/awards-recognition";
import Certificate from "../component/certificate";
import Layout from "../component/layout";
import PreLoader from "../component/preloader";

const Gallery = () => {
    const [gallerData, setGalleryData] = useState(null);
    const bannerImg = 'images/banner1.png';
    const bannerTitle = "Our Gallery";
    const [pageTitle, setPageTitle] = useState('Enggenv Solutions | Our Gallery');
    const [metaData, setMetaData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}api/gallery`); // Replace with your actual API endpoint
            const data = await res.json();

            const metaDescription = data.galleryPageData[0].metaDescription || '';
            const metaImage = 'images/team_image.jpg';            
            setMetaData({metaDescription: metaDescription, metaImage:metaImage});
            setGalleryData(data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        };

        fetchData();
    }, []);

    return (
        <Layout hasBanner="false" pageTitle={pageTitle} metaData={metaData}>
            {gallerData ? (
                <>
                    {/*<OtherBanner bannerImg={bannerImg} bannerTitle={bannerTitle} />*/}
                    <Events gallery={gallerData.events} />
                    <AwardsRecognition gallery={gallerData.galleryPageData} />
                    <Certificate gallery={gallerData.certificate} />
                </>
            ) : (
                <PreLoader />
            )};
        </Layout>
    );
}

export default Gallery;