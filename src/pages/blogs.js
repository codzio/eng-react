import React, { useEffect, useState } from 'react';
//import OtherBanner from '../component/other-banner';
import BlogListing from '../component/blog-listing';
import Layout from '../component/layout';
import PreLoader from "../component/preloader";
import { useLocation } from 'react-router-dom';
// import Pagination from '../component/pagination';

const BlogMain = () => {
    // const bannerImg = "images/banner1.png";
    // const bannerTitle = "Our Blogs";
    const [loadedData, setLoadedData] = useState({ totalBlogs: 0, blogs: []});
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get('search') || '';
    // const [searchQuery, setSearchQuery] = useState('');
    const [filteredBlogs, setFilteredBlogs] = useState([]);
    const [pageTitle, setPageTitle] = useState('Enggenv Solutions');
    const [metaData, setMetaData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}api/blogs`); // Replace with your actual API endpoint
            const data = await res.json();
            
            const metaDescription = '';
            const metaImage = 'images/team_image.jpg';
            
            setPageTitle(`Enggenv Solutions | Blogs`);
            setMetaData({metaDescription: metaDescription, metaImage:metaImage});
            setLoadedData(data);
            // console.log(data)
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        };

        fetchData();
    }, []);

    // useEffect(() =>{
    //     const urlSearchParams = new URLSearchParams(window.location.search);
    //     const query = urlSearchParams.get('search');
    //     console.log(urlSearchParams)
    //     if(query){
    //         setSearchQuery(query);
    //     }else{
    //         setSearchQuery('');
    //     }
    // }, []);

    useEffect(() => {
        const filterBlogs = () => {
            const filtered = loadedData.blogs.filter((blog) => {
                return blog.title.toLowerCase().includes(searchQuery.toLowerCase());
            });
    
            setFilteredBlogs(filtered);
        };

        if(loadedData){
            filterBlogs();
        }
    }, [searchQuery, loadedData]);


    // console.log(loadedData.totalBlogs);

    // Loader component
    // const Loader = () => {
    //     return (
    //         <div className="loader">
    //             <p>Loading...</p>
    //         </div>
    //     );
    // };

    return (
        <Layout hasBanner="false" pageTitle={pageTitle} metaData={metaData}>
            {/*<OtherBanner bannerImg={bannerImg} bannerTitle={bannerTitle} />*/}
            {filteredBlogs.length > 0 ? (

                loadedData.totalBlogs? (
                    <BlogListing totalBlogs={loadedData.totalBlogs} blogs={filteredBlogs} />
                ) : (
                     <PreLoader />
                )
                
            ) : (

                loadedData.totalBlogs? (
                    <BlogListing totalBlogs={loadedData.totalBlogs} blogs={loadedData.blogs} />
                ) : (
                    <PreLoader />
                )

            )}
        </Layout>
    );
};

export default BlogMain;