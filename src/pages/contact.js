import React, { useEffect, useState } from "react";
import OtherBanner from "../component/other-banner";
import ContactForm from "../component/contact-form";
import Layout from "../component/layout";
import PreLoader from "../component/preloader";

const ContactUs = () => {
    const [loadedData, setLoadedData] = useState(null);
    const bannerImg = 'images/banner1.png';
    const bannerTitle = "Contact Us";
    const [pageTitle, setPageTitle] = useState('Enggenv Solutions | Contact');

    const metaDescription = '';
    const metaImage = 'images/team_image.jpg';
    const [metaData, setMetaData] = useState({metaDescription: metaDescription, metaImage:metaImage});

    useEffect(() => {
        const fetchData = async () => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}api/comman`); // Replace with your actual API endpoint
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
            {loadedData ? (
                <>
                    {/*<OtherBanner bannerImg={bannerImg} bannerTitle={bannerTitle} />*/}
                    <ContactForm loadedData={loadedData} />
                </>
            ) : (
                <PreLoader />
            )};
        </Layout>
    );
}

export default ContactUs;