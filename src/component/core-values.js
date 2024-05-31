import React from "react";
import '../styles/Home.css';

const CoreValues = () => {
    return (
        <section>
            <div className="core_value_sec">
                <div className="containers containers">
                    <h2>core values</h2>
                    <div className="core_value_sec_inner">
                        <div className="core_value_card">
                            <span><img src="images/rating1.png" alt="" /></span>
                            <h2>Quality Workmanship</h2>
                            <p>We deliver precisely engineered, custom
                            made client solutions across industry domains
                            specifically in air and water quality monitoring.
                            We are enthralled to establish ourselves as a
                            solution-oriented company against a product
                            oriented one. We care to understand the
                            project issues and challenges before reaching
                            to the product design and execution.
                            </p>
                        </div>
                        <div className="core_value_card">
                            <span><img src="images/rating2.png" alt="" /></span>
                            <h2>Customer Centricity</h2>
                            <p>We care for our customer needs and ensure
                            to provide the most suitable technology
                            solutions by working in coherence with
                            our clients’ requirements. We study our
                            projects beyond business as usual and
                            consider each one of them as an opportunity
                            to showcase our best. Creating customer
                            delight by serving the finest technology at
                            affordable prices is at the heart of each project.
                            </p>
                        </div>
                        <div className="core_value_card">
                            <span><img src="images/rating3.png" alt="" /></span>
                            <h2>Employee Empowerment</h2>
                            <p>We believe strongly in sharing the responsibilities
                            of planning and decision making with all our
                            employees. We give equal work opportunities
                            to all our employees by being fair to all and
                            discriminating none. We care for our human
                            resources above all and with their collaborative
                            team efforts we aspire to be the industry leader.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CoreValues;