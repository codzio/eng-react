import React, { useState, useEffect } from "react";
import BlogCategoryList from "../component/blog-category-list";
import Layout from "../component/layout";
import OtherBanner from "../component/other-banner";
import { useParams } from "react-router-dom";
import PreLoader from "../component/preloader";

const CategoryDetail = () => {
    const { categorySlug } = useParams();
    const bannerImg = "../images/banner1.png";
    const bannerPattern = "../images/other_banner_pattern.png";
    const bannerTitle = "Our Blogs";
    const [data, setData] = useState();
    const [pageTitle, setPageTitle] = useState('Enggenv Solutions');
    const [metaData, setMetaData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}api/blogs/category?category=${categorySlug}`); // Replace with your actual API endpoint
            const data = await res.json();
            
            const metaDescription = '';
            const metaImage = 'images/team_image.jpg';

            setPageTitle(`Enggenv Solutions | Category`);
            setMetaData({metaDescription: metaDescription, metaImage:metaImage});

            setData(data);
            // console.log(data)
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        };

        fetchData();
    }, [categorySlug]);

    return (
        <Layout pageTitle={pageTitle} metaData={metaData}>
            <OtherBanner bannerImg={bannerImg} bannerTitle={bannerTitle} bannerPattern={bannerPattern} />
            {data ? (
            <BlogCategoryList data={data} />
            ) : (
                <PreLoader />
            )};
        </Layout>
    );
}

export default CategoryDetail;