import React, { useEffect, useState, lazy, Suspense } from "react";
import { useParams } from 'react-router-dom';
import OtherBanner from "../component/other-banner";
import CareerForm from '../component/career-form';
import Layout from "../component/layout";
import PreLoader from "../component/preloader";

const JobListingComp = lazy(() => import("../component/job-listing-comp"));
const JobDetailComp = lazy(() => import("../component/job-detail-comp"));

const Career = () => {
    const [loadedData, setLoadedData] = useState(null);
    const [loading, setLoading] = useState(true); // Add loading state
    const { jobSlug } = useParams();    

    const bannerImg = 'images/banner1.png';
    const bannerTitle = "Join Us";
    const [pageTitle, setPageTitle] = useState('Enggenv Solutions | Career');
    const metaDescription = '';
    const metaImage = 'images/team_image.jpg';
    // const [metaData, setMetaData] = useState({metaDescription: metaDescription, metaImage:metaImage});
    const [metaData, setMetaData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = jobSlug 
                    ? await fetch(`${process.env.REACT_APP_API_URL}api/jobs/${jobSlug}`) 
                    : await fetch(`${process.env.REACT_APP_API_URL}api/jobs`);

                const data = await res.json();
                setLoadedData(data);

                const newPageTitle = jobSlug ? data.jobs.title : 'Career';
                const metaDescription = jobSlug ? data.jobs.description : '';
                const metaImage = 'images/team_image.jpg';

                setPageTitle(`Enggenv Solutions | ${newPageTitle}`);
                setMetaData({ metaDescription, metaImage });

            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false); // Set loading to false when data fetching is complete
            }
        };

        fetchData();
    }, [jobSlug]);

    return (
        <Layout hasBanner="false" pageTitle={pageTitle} metaData={metaData}>
            <Suspense fallback={<PreLoader />}>
                {loadedData ? (
                    <>
                        {jobSlug ? (
                            <JobDetailComp isLoaded={loading} jobData={loadedData} />
                        ) : (
                            <JobListingComp isLoaded={loading} jobData={loadedData} />
                        )}
                    </>
                ) : (
                    <PreLoader />
                )}
            </Suspense>
        </Layout>
    );
}

export default Career;
