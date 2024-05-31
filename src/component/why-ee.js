import React from "react";
import '../styles/Home.css';

const WhyEE = (why) => {
    return (
        <div className="about_company_sec _case home_what_we_do __offering _home_why">
            <div className="containers">
                <div className="about_company_sec_inner">
                    <p className="home_main_heading">Why Choose <span>E&E?</span></p>
                    <div className="about_icon_sec">
                        {why.why.map((data) => (
                            <div className="_icons_sec" key={data._id}>
                                <div className="_icon_cont">
                                    <img src={`${process.env.REACT_APP_API_URL}${data.image}`} alt="" />
                                    <h2 dangerouslySetInnerHTML={{ __html: data.title }}></h2>
                                </div>
                                <div dangerouslySetInnerHTML={{ __html: data.description }}></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WhyEE;