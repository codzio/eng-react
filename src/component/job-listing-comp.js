import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import "../styles/Home.css";

const JobListingComp = ({ jobData, isLoaded }) => {
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

    if (!jobData || !Array.isArray(jobData.jobs)) {
        return null; // or some fallback UI
    }

    const { jobs } = jobData;

    return (
        <div className="career_sec">
            <div className="containers">
                <div className="contact_form">
                    <h2>Job Opportunities</h2>
                    <p className="job-content">E&E is always looking for qualified individuals who are very passionate about their job.</p>

                    <div className="detail-table">
                        <table className="job-listing-table">
                            <thead>
                                <tr>
                                    <th>JOB TITLE</th>
                                    <th>DEPARTMENT</th>
                                    <th>LOCATION</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>                              
                                {jobs.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: "center" }}>There are no jobs available at the moment.</td>
                                    </tr>
                                ) : (
                                    jobs.map((job) => (
                                        <tr key={job._id}>
                                            <td data-label="Name">{job.title}</td>
                                            <td data-label="Department">{job.department}</td>
                                            <td data-label="Location">{job.location}</td>
                                            <td data-label="Status">
                                                <Link to={`/career/${job.slug}`} className="detail-table-btn">View Job</Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
        </div>
    );
};

JobListingComp.propTypes = {
    jobData: PropTypes.shape({
        jobs: PropTypes.arrayOf(
            PropTypes.shape({
                _id: PropTypes.string.isRequired,
                title: PropTypes.string.isRequired,
                department: PropTypes.string.isRequired,
                location: PropTypes.string.isRequired,
                slug: PropTypes.string.isRequired,
            })
        )
    }),
    isLoaded: PropTypes.bool.isRequired
};

export default JobListingComp;