import React, { useState, useEffect } from "react";
import '../styles/Home.css';
import { Link, useNavigate, useParams } from "react-router-dom";

const CasesProductOptions = (props) => {

    const { title, description, image, createdAt, products } = props.projectData;

    return (
        <div className="cases_sec">
            <div className="containers">
                <div className="cases_sec_inner">
                    <div className="_cases_img case_f_img">
                        <img src={`${process.env.REACT_APP_API_URL}${image}`} alt="" />
                    </div>
                    <div className="_cases_content">
                        
                        <h2>{title}</h2>
                        <div className="air_content_sec_inner blog-content" dangerouslySetInnerHTML={{ __html: description }}></div>

                        {/*<div className="option_sec">
                            <h2>Product Options</h2>
                            <div className="option_slides_main">
                                <div className="option_slides">
                                    <span className="option_box"><img src="images/case_1.png" alt="" /></span>
                                    <h2>Telemetric Water Level Sensors</h2>
                                    <span className="option_arrow"><i className="fa-solid fa-chevron-right"></i></span>
                                </div>
                                <div className="option_slides">
                                    <span className="option_box"><img src="images/case_1.png" alt="" /></span>
                                    <h2>Radar Based Water Level Sensors</h2>
                                    <span className="option_arrow"><i className="fa-solid fa-chevron-right"></i></span>
                                </div>
                                <div className="option_slides">
                                    <span className="option_box"><img src="images/case_1.png" alt="" /></span>
                                    <h2>Ultrasonic Water Level Sensors</h2>
                                    <span className="option_arrow"><i className="fa-solid fa-chevron-right"></i></span>
                                </div>
                            </div>
                        </div>*/}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CasesProductOptions;