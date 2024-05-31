import React from "react";
import '../styles/Home.css';
import LazyLoad from 'react-lazyload';

const DataVisualization = () => {
    return (
        <div className="home_data_sec">
            <div className="containers">
                <h2 className="home_main_heading" data-aos="fade-right">Data Visualization <span>(Dashboard)</span></h2>
                <p className="data_p" data-aos="zoom-in-left">
                    Cloud Enviro brings you the next generation features with the best user interface. Dashboard 2.0 <br />
                    accelerates better real-time data visualization, best analytical & reporting tools with the powerful <br />
                    user experience. You can customize device, manage users & a lot more to do.
                </p>
                <div className="home_data_sec_inner" data-aos="flip-left">
                    <LazyLoad height={200} offset={100} once>
                        <img src="images/computer-new.png" alt="Data Visualization" />
                    </LazyLoad>
                </div>
            </div>
        </div>
    );
};

export default DataVisualization;