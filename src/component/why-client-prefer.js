import React from "react";
import '../styles/Home.css';

const WhyClientPrefer = () => {
    return (
        <div className="about_company_sec _case _useCase">
            <div className="containers">
                <div className="about_company_sec_inner">
                    <p className="company_text">Why Clients Prefer E&Es Water Level Recorders</p>
                    <div className="about_icon_sec">
                        <div className="_icons_sec">
                            <img src="images/level1.png" alt="" />
                            <p>Complete Solution <br />
                            under one roof</p>
                        </div>
                        <div className="_icons_sec">
                            <img src="images/level2.png" alt="" />
                            <p>Excellent <br />
                            maintenance services </p>
                        </div>
                        <div className="_icons_sec">
                            <img src="images/level3.png" alt="" />
                            <p>Value for <br />
                            money</p>
                        </div>
                        <div className="_icons_sec">
                            <img src="images/level4.png" alt="" />
                            <p>Proven Track <br />
                            Records </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WhyClientPrefer;