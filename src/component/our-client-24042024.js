import React from "react";
import '../styles/Home.css';

const OurClient = (clients) => {
    const Clients = clients.clients.clients;
    return (
        <div className="home_client_sec">
            <div className="containers">
                <h2 className="home_main_heading">Our <span>Clientele</span></h2>
                <div className="home_client_sec_inner">
                    {Clients.map((data) => (
                        <div key={data._id}><img src={`${process.env.REACT_APP_API_URL}${data.image}`} data-aos="flip-left" alt="" /></div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default OurClient;