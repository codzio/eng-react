import React, { useEffect, useState } from "react";
import OtherBanner from "../component/other-banner";
import BlogDetail from "../component/blog-detail";
import PreLoader from "../component/preloader";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../component/layout";

const BlogSingle = () => {
    const navigate = useNavigate();
    const bannerImg = "../images/banner1.png";
    const bannerPattern = "../images/other_banner_pattern.png";
    const bannerTitle = "Our Blogs";
    const [blog, setBlog] = useState(null);
    const { blogSlug } = useParams();
    const [pageTitle, setPageTitle] = useState('Enggenv Solutions');
    const [metaData, setMetaData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}api/blogs/${blogSlug}`); // Replace with your actual API endpoint
            const data = await res.json();

            console.log(data.blog[0]);
            
            const newPageTitle = data.blog[0].metaTitle || data.blog[0].title;
            const metaDescription = data.blog[0].metaDescription || data.blog[0].shortDescription;
            const metaImage = data.blog[0].image || 'images/team_image.jpg';

            setPageTitle(`Enggenv Solutions | ${newPageTitle}`);
            setMetaData({metaDescription: metaDescription, metaImage:metaImage});
            setBlog(data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        };

        fetchData();
    }, [blogSlug]);

    // if(!blog.blog.length){
    //     if(typeof window !== 'undefined'){
    //         history.push('/blogs');
    //     }
    //     return null;
    // }
    useEffect(() => {
        if (blog && blog.blog.length === 0) {
            // Handle the case where the blog post is not found
            navigate('/blogs'); // Redirect to the blog listing page
        }
    }, [blog, navigate]);

    if (!blog) {
        // Handle loading state here
        return <PreLoader />;
    }

    return (
        <Layout hasBanner="false" pageTitle={pageTitle} metaData={metaData}>
            {/*<OtherBanner bannerImg={bannerImg} bannerTitle={bannerTitle} bannerPattern={bannerPattern} />*/}
            <BlogDetail blog={blog} />
        </Layout>
    );
};

export default BlogSingle;