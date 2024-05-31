import React from "react";
import '../styles/Home.css';

const WhatWeDo = () => {
    return (
        <div className="about_company_sec _case home_what_we_do __offering">
            <div className="containers">
                <div className="about_company_sec_inner">
                    <p className="home_main_heading">What <span>We Do ?</span></p>
                    <div className="about_icon_sec">
                        <div className="_icons_sec">
                            <img src="images/what1.png" alt="" />
                            <p>Protect & improve <br />
                            the environment's quality </p>
                        </div>
                        <div className="_icons_sec">
                            <img src="images/what2.png" alt="" />
                            <p>Conserve <br />
                            resources</p>
                        </div>
                        <div className="_icons_sec">
                            <img src="images/what3.png" alt="" />
                            <p>Encourage waste <br />
                            management </p>
                        </div>
                        <div className="_icons_sec">
                            <img src="images/what4.png" alt="" />
                            <p>Encourage the <br />
                            efficient use of energy </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WhatWeDo;