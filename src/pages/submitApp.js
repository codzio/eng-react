import React, { useEffect, useState, lazy, Suspense } from "react";
import { useLocation } from 'react-router-dom';
import Layout from "../component/layout";
import PreLoader from "../component/preloader";

const CareerForm = lazy(() => import("../component/career-form"));

const SubmitApp = () => {    
    const [pageTitle, setPageTitle] = useState('Enggenv Solutions | Career');
    const metaDescription = '';
    const metaImage = 'images/team_image.jpg';
    const [metaData, setMetaData] = useState({metaDescription: metaDescription, metaImage:metaImage});

    const location = useLocation();
    const [params, setParams] = useState({});

    useEffect(() => {
        // Extract query parameters from the URL
        const searchParams = new URLSearchParams(location.search);
        const title = searchParams.get('title');
        const department = searchParams.get('department');
        setParams({ title, department });
    }, [location]);

    return (
        <Layout hasBanner="false" pageTitle={pageTitle} metaData={metaData}>
            <Suspense fallback={<PreLoader />}>
                <CareerForm jobData={params} />
            </Suspense>
        </Layout>
    );
}

export default SubmitApp;