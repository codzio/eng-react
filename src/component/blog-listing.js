import React, { useEffect, useState } from "react";
import "../styles/Home.css";
import { Link } from "react-router-dom";

const BlogListing = ({ totalBlogs, blogs }) =>{
    // console.log(blogs, totalBlogs);
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

    const [Blogs, setBlogs] = useState(blogs);
    const fetchMorePosts = async (page) => {
        const response = await fetch(`${process.env.REACT_APP_API_URL}api/blogs?page=${page}`);
        const data = await response.json();
        return data;
    };
    // const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(2);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    useEffect(() => {
        const loadMorePosts = async () => {
          if (loading || !hasMore) return;
    
          setLoading(true);
          const newPosts = await fetchMorePosts(page);
          // console.log("newPosts:", newPosts);
          if(newPosts.blogs.length > 0){
            // const updatedBlogs = [...Blogs, ...newPosts.blogs];
            setPage(page + 1);
            setBlogs(newBlogs => [...blogs, ...newPosts.blogs]);
          }else{
            setHasMore(false);
          }
          setLoading(false);
        };

        const observer = new IntersectionObserver(
            (entries) => {
              if (entries[0].intersectionRatio > 0) {
                console.log("Intersections observed. Loading more posts.")

                if (totalBlogs > 9) {
                    loadMorePosts();    
                }
                
              }
            },
            { rootMargin: '0px 0px 100% 0px' } // Adjust the rootMargin as needed
          );
      
          observer.observe(document.querySelector('#load-more-marker'));
      
          return () => {
            observer.disconnect();
          };
    }, [page, loading, Blogs, hasMore, totalBlogs, blogs]);

    return (
        <div className="blog_listing_sec">
            <div className="containers">
                <div className="blog_listing_sec_inner">
                    {Blogs.map((blog) => (
                        <div className="blog_lisitng_card" key={blog._id}>
                            <a href={`#/blogs/${blog.slug}`}>
                                <div className="blog_top_img">
                                    <img src={`${process.env.REACT_APP_API_URL}${blog.image}`} alt="" />
                                </div>
                            </a>
                            <div className="blog_bottom_content">
                                <div className="blog_card_icons">
                                    <p><span><img src="images/user.png" alt="" /></span>{blog.credit || blog.user.name}</p>
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
                    <div id="load-more-marker"></div>
                </div>
                {loading && <div className="blog__inner_bottom_content blog_listing_post_msg"><p>Loading...</p></div>}
                {!loading && !hasMore && <div className="blog__inner_bottom_content blog_listing_post_msg"><p>No more posts to load.</p></div>}
            </div>
        </div>
    );
}

export default BlogListing;