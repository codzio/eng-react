import React, { useState } from "react";
import "../styles/Home.css";
import { Link, useNavigate, useParams } from "react-router-dom";
import { StickyContainer, Sticky } from "react-sticky";

const BlogDetail = (props) => {
    const { blogSlug } = useParams();
    const navigate = useNavigate();
    const recentBlog = props.blog.recentBlogs;
    const filteredRecentBlog = recentBlog.filter(data => data.slug !== blogSlug);
    const [searchQuery, setSearchQuery] = useState("");
    const [showErr, setShowErr] = useState(false);
    const Category = props.blog.getCategoryData;

    const { image, title, description, user, credit, publishDate, createdAt } = props.blog.blog[0];

    const months = [
        "January", "February", "March", "April",
        "May", "June", "July", "August",
        "September", "October", "November", "December"
    ];
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = months[date.getMonth()];
        const day = date.getDate();
        return `${month} ${day}, ${year}`;
    };

    let dateComponents = new Date(createdAt);

    if (publishDate) {
        dateComponents = new Date(publishDate);
    }

    //const dateComponents = new Date(createdAt);
    const year = dateComponents.getFullYear();
    const month = months[dateComponents.getMonth()];
    const day = dateComponents.getDate();

    const onNavigateSearch = (searchQuery) =>{
        navigate(`/blogs?search=${searchQuery}`);
    }

    const onSearch = async (event) => {
        event.preventDefault();
        // console.log(searchQuery)
        try{
            const response = await fetch(`${process.env.REACT_APP_API_URL}api/blogs?search=${searchQuery}`);
            const data = await response.json();
            // console.log(data.blogs.length > 0)

            if (data.blogs.length > 0) {
                onNavigateSearch(searchQuery);
                setShowErr(false);
            } else {
                setShowErr(true);
            }
        } catch (error) {
            console.error('Error while searching:', error);
        }
    };
    const onCategory = async (slug) => {
        // setIsCategory(slug);
        try{
            await new Promise((resolve) => setTimeout(resolve, 0));
            const response = await fetch(`${process.env.REACT_APP_API_URL}api/blogs/category?category=${slug}`);
            const data = await response.json();
            // console.log(data.blogs)

            if (data.blogs.length > 0) {
                navigate({
                    pathname: `/category/${slug}`,
                    query: {},
                });
                // setShowErr(false);
            } else {
                // setShowErr(true);
            }
        } catch (error) {
            console.error('Error while searching:', error);
        }
    };

    function refreshPage() {
        setTimeout(function() {
            window.location.reload(true);
        }, 500);
    }

    return (
        <div className="blog_category_sec">
            <div className="containers">
                <StickyContainer className="blog_category_sec_inner">
                    <div className="blog_category_img_sec">
                        <img src={`${process.env.REACT_APP_API_URL}${image}`} alt="" />
                        <div className="blog_category_content">
                            <div className="blog_card_icons category_posted">
                                <p><span><img src="images/user.png" alt="" /></span>{credit || user.name}</p>
                                <p><span><img src="images/posted.png" alt="" /></span>{`Posted ${month} ${day}, ${year}`}</p>
                            </div>
                            <div className="climate_change">
                                <h2>{title}</h2>
                                <div className="mb-3 blog-content" dangerouslySetInnerHTML={{ __html: description }}></div>
                            </div>
                        </div>
                    </div>
                    <div className="blog_category_content_sec">
                        <Sticky>
                        {({ style, distanceFromTop }) => (
                            <div style={style}>
                                <form onSubmit={onSearch} style={{ marginTop: distanceFromTop >= 150 ? '0' : '25%' }}>
                                    <div className="blog_search_bar">
                                        <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} type="text" placeholder="Enter Keyword Search" />
                                        <button type="submit"><i className="fa-solid fa-magnifying-glass"></i></button>
                                    </div>
                                    {showErr && (
                                        <div className="climate_change">
                                            <p>No Blog Found!</p>
                                        </div>
                                    )}
                                </form>
                                <div className="recent_post_sec">
                                    <h2>Recent Post</h2>
                                    <div className="recent_post_sec_inner">
                                        {filteredRecentBlog.map((data) => (
                                            <Link onClick={refreshPage} to={`/blogs/${data.slug}`} key={data._id}>
                                                <div className="recent_post_blog">
                                                    <div className="recent_img"><img src={`${process.env.REACT_APP_API_URL}${data.image}`} alt="" /></div>
                                                    <div className="recent_post_content">
                                                        <h2>{data.title}</h2>
                                                        <p>
                                                            {(data.publishDate)? `${formatDate(data.publishDate)}`:`${formatDate(data.createdAt)}`}
                                                        </p>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                                <div className="recent_post_arrow">
                                    <h2>Categories</h2>
                                    <div className="recent_post_arrow_inner">
                                        {Category.map((data) => (
                                            <p key={data._id} onClick={() => onCategory(data.slug)}><span><img src="images/recent_post_arrow.png" alt="" /></span>{data.title}</p>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        </Sticky>
                    </div>
                </StickyContainer>
            </div>
        </div>
    );
};

export default BlogDetail; 