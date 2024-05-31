import React, { useState, useEffect } from "react";
import OtherBanner from "../component/other-banner";
import UseCaseModel from "../component/use-case-model";
import Layout from "../component/layout";
import PreLoader from "../component/preloader";

const UseCases = () => {
    const bannerImg = 'images/banner1.png';
    const bannerTitle = "Projects";
    const [loadedData, setLoadedData] = useState(null);
    const [pageTitle, setPageTitle] = useState('Enggenv Solutions | Projects');
    const [metaData, setMetaData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}api/use-cases`); // Replace with your actual API endpoint
            const data = await res.json();

            const metaDescription = '';
            const metaImage = 'images/team_image.jpg';
            setMetaData({metaDescription: metaDescription, metaImage:metaImage});

            setLoadedData(data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        };

        fetchData();
    }, []);

    if(!loadedData){
        return <PreLoader />;
    }

    return (
        <Layout hasBanner="false" pageTitle={pageTitle} metaData={metaData}>
            {loadedData ? (
                <>
                    {/*<OtherBanner bannerImg={bannerImg} bannerTitle={bannerTitle} />*/}
                    <UseCaseModel useCase={loadedData} />
                </>
            ) : (
                <PreLoader />
            )};
        </Layout>
    );
}

export default UseCases;