import React, { useState, useEffect } from "react";
import "../styles/Home.css";
import { Link, useNavigate, useParams } from "react-router-dom";
import { StickyContainer, Sticky } from "react-sticky";

const CmsPage = (props) => {
    console.log(props);
    const navigate = useNavigate();
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

    const { title, description, createdAt } = props.data.page[0];

    function refreshPage() {
        setTimeout(function() {
            window.location.reload(true);
        }, 500);
    }

    return (
        <div className="blog_category_sec">
            <div className="containers">
                <div className="blog_category_sec_inner">
                    <div className="climate_change">
                        <div className="mb-3 blog-content cms-content" dangerouslySetInnerHTML={{ __html: description }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CmsPage; 