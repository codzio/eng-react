import React from "react";
import { Link } from "react-router-dom";
import "../styles/Home.css";

const BlogCategoryList = ({ data }) => {
    const blogs = data.blogs;
    console.log(blogs);

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

    return (
        <div className="blog_listing_sec">
            <div className="containers">
                <div className="blog_listing_sec_inner">
                    {blogs.map((blog) => (
                        <div className="blog_lisitng_card" key={blog._id}>
                            <a href={`#/blogs/${blog.slug}`}>
                                <div className="blog_top_img">
                                    <img src={`${process.env.REACT_APP_API_URL}${blog.image}`} alt="" />
                                </div>
                            </a>
                            <div className="blog_bottom_content">
                                <div className="blog_card_icons">
                                    <p><span><img src="images/user.png" alt="" /></span>{blog.credit || blog.userData.name}</p>
                                    <p><span><img src="images/posted.png" alt="" /></span>
                                        {blog.publishDate ? (
                                            <p>Posted {formatDate(blog.publishDate)}</p>
                                          ) : (
                                            <p>Posted {formatDate(blog.createdAt)}</p>
                                        )}
                                    </p>
                                </div>
                                <div className="blog__inner_bottom_content">
                                    <h2>{blog.title}</h2>
                                    <p>{blog.shortDescription}</p>
                                    <Link to={`/blogs/${blog.slug}`} className="_green_btn">Read More</Link>
                                </div>
                            </div>				
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default BlogCategoryList;