import React, { useState } from "react";
import OtherBanner from "../component/other-banner";
import CareerForm from  '../component/career-form';
import Layout from "../component/layout";

const Career = () => {
    const bannerImg = 'images/banner1.png';
    const bannerTitle = "Join Us";
    const [pageTitle, setPageTitle] = useState('Enggenv Solutions | Career');
    const metaDescription = '';
    const metaImage = 'images/team_image.jpg';
    const [metaData, setMetaData] = useState({metaDescription: metaDescription, metaImage:metaImage});

    return (
        <Layout hasBanner="false" pageTitle={pageTitle} metaData={metaData}>
            {/*<OtherBanner bannerImg={bannerImg} bannerTitle={bannerTitle} />*/}
            <CareerForm />
        </Layout>
    );
}

export default Career;