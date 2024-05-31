import React from "react";
import '../styles/Home.css';

const HowWeWork = ({ loadedData }) => {
    const howWeWork = loadedData.page[0].data[0].howWeWork;

    return (
        <section>
            <div className="about_flower_sec _about_flower">
                <div className="containers container">
                    <h2 className="home_main_heading">How We <span>Work</span></h2>
                    <p dangerouslySetInnerHTML={{ __html: howWeWork }}></p>
                    <div className="about_flower_sec_inner">
                        <div className="round_cards">
                            <p className="company_text">Evaluation process at early design stage:</p>
                            <div className="round_cards_inner">
                                <div className="_round_card">
                                    <img src="images/target_1.png" alt="" />
                                    <p>Assess project’s specific <br />
                                    needs & objectives</p>
                                </div>
                                <div className="_round_card">
                                    <img src="images/target_2.png" alt="" />
                                    <p>Gauge difficulties with <br />
                                    respect to the project</p>
                                </div>
                                <div className="_round_card">
                                    <img src="images/target_3.png" alt="" />
                                    <p>Provide high performance <br />
                                    and low-cost solutions</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HowWeWork;