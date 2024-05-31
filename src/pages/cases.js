import React, { useEffect, useState } from "react";
import OtherBanner from "../component/other-banner";
import Layout from "../component/layout";
import CasesProductOptions from "../component/cases-product-options";
import ProjectProductList from '../component/project-product-list';
import WhyClientPrefer from "../component/why-client-prefer";
import PreLoader from "../component/preloader";
import { useParams } from "react-router-dom";

const Cases = () => {
    const bannerImg = 'images/banner1.png';
    const bannerTitle = "Use Cases";
    const [pageTitle, setPageTitle] = useState('Enggenv Solutions | Use Cases');

    const metaDescription = '';
    const metaImage = 'images/team_image.jpg';
    const [metaData, setMetaData] = useState({metaDescription: metaDescription, metaImage:metaImage});
    const { projectSlug } = useParams();
    const [projectData, setProjectData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try{

                const res = await fetch(`${process.env.REACT_APP_API_URL}api/projects/${projectSlug}`);
                const getData = await res.json();                

                const newPageTitle = getData.project[0].metaTitle || getData.project[0].title;
                const metaDescription = getData.project[0].metaDescription || getData.project[0].description;
                const metaImage = getData.project[0].image || 'images/team_image.jpg';                

                setPageTitle(`Enggenv Solutions | ${newPageTitle}`);
                setMetaData({metaDescription: metaDescription, metaImage:metaImage});
                setProjectData(getData.project[0]);

            }catch (error) {
                console.log("Error fetching project data:", error);
            }
        };

        fetchData();
    }, [projectSlug]);   

    if(!projectData){
        return <PreLoader />;
    } 

    return (
        <Layout hasBanner="false" pageTitle={pageTitle} metaData={metaData}>
            {/*<OtherBanner bannerImg={bannerImg} bannerTitle={bannerTitle} />*/}
            {projectData && <CasesProductOptions projectData={projectData} />}
            {projectData && <ProjectProductList products={projectData.products} />}
            <WhyClientPrefer />
        </Layout>
    );
}

export default Cases;