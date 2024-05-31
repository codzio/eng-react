import React from "react";
import '../styles/Home.css';

const OurOffering = () => {
    return (
        <div className="about_company_sec  _case home_what_we_do our_offering">
            <div className="about_company_sec_inner">
                <p className="home_main_heading">Our Offerings</p>
                <div className="about_icon_sec">
                    <div className="_icons_sec">
                        <span>
                            <img src="images/sens1.png" alt="" />
                        </span>
                        <p>Sense</p>
                    </div>
                    <div className="_icons_sec">
                        <span>
                            <img src="images/sens2.png" alt="" />
                        </span>
                        <p>Send</p>
                    </div>
                    <div className="_icons_sec">
                        <span>
                            <img src="images/sens3.png" alt="" />
                        </span>
                        <p>Store</p>
                    </div>
                    <div className="_icons_sec">
                        <span>
                            <img src="images/sens4.png" alt="" />
                        </span>
                        <p>Visualize</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OurOffering;