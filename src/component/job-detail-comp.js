import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import "../styles/Home.css";

const JobDetailComp = ({ jobData, isLoaded }) => {
    if (isLoaded) {
        return (
            <div className="blog_listing_sec use_cases_gallery">
                <div className="containers">
                    <div className="blog_listing_sec_inner">
                        Loading jobs...
                    </div>
                </div>
            </div>
        ); // or a spinner
    }

    if (!jobData || !jobData.jobs) {
        return null; // or some fallback UI
    }

    const { jobs } = jobData;

    return (
        <div className="career_sec">
            <div className="containers">
                <div className="contact_form">
                    <h2>{jobs.title}</h2>
                    <p className="job-content">
                      E&E is looking for <strong>{jobs.department}</strong> individuals who are very passionate about their job.
                    </p>
                    <p className="job-specifications">
                      <div>
                        <strong>Job Title:</strong> <span>{jobs.title}</span> 
                      </div>
                      <div>
                        <strong>Department:</strong> <span>{jobs.department}</span> 
                      </div>
                      <div>
                        <strong>Location:</strong> <span>{jobs.location}</span>
                      </div>

                      <div>
                        <Link
                            className="contact_us_btn"
                            to={{
                                pathname: '/submit-application',
                                search: `?title=${jobs.title}&department=${jobs.department}`
                            }}
                        >
                            Apply Now
                        </Link>
                      </div>
                    </p>

                    <div className="job-detail-description" dangerouslySetInnerHTML={{__html: jobs.description}}></div>

                </div>
            </div>
        </div>
    );
};

export default JobDetailComp;