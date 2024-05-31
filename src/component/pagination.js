import React from "react";
import "../styles/Home.css";
import { Link } from "react-router-dom";

const Pagination = () => {
    return (
        <div className="blog_pagination">
            <div className="containers">
                <div className="blog_pagination_inner">
                    <Link href="/" className="active"><i className="fa-solid fa-angle-left"></i></Link>
                    <Link href="/"><i className="fa-solid fa-angle-right"></i></Link>
                    <Link href="/">Next Page</Link>
                </div>
            </div>
        </div>
    );
}

export default Pagination;