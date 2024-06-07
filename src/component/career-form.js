import React, { useState, useEffect, useRef } from "react";
import '../styles/Home.css';

const CareerForm = ({ params }) => {
    const [formData, setFormData] = useState({
        profile: params?.department || 'DEFAULT',
        title: params?.title || '',
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        message: '',
        resume: null,
    });

    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [requiredError, setRequiredError] = useState('');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        setFormData((prevData) => ({
            ...prevData,
            profile: params?.department || 'DEFAULT',
            title: params?.title || ''
        }));
    }, [params]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'resume') {
            const file = files[0];
            if (file.size > 1.5 * 1024 * 1024) {
                setErrorMessage('File size should be less than 1.5MB.');
                return;
            }
            setFormData({
                ...formData,
                [name]: file,
            });    
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.profile || !formData.firstName || !formData.lastName || !formData.email || !formData.phoneNumber || !formData.message || !formData.resume) {
            setRequiredError('Please fill in all required fields.');
            return;
        }

        setLoading(true);

        try {
            const formDataToSend = new FormData();
            for (const key in formData) {
                formDataToSend.append(key, formData[key]);
            }

            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/career`, {
                method: 'POST',
                body: formDataToSend,
            });

            if (response.ok) {
                fileInputRef.current.value = '';
                setFormData({
                    profile: params?.department || 'DEFAULT',
                    title: params?.title || '',
                    firstName: '',
                    lastName: '',
                    email: '',
                    phoneNumber: '',
                    message: '',
                    resume: null,
                });
                setSuccessMessage('Your message has been sent successfully!');
                setErrorMessage('');  
                setRequiredError('');
                setTimeout(() => {
                    setSuccessMessage('');
                }, 5000);
            } else {
                const errorData = await response.json();
                setErrorMessage(errorData.message || 'Failed to submit your message.');
            }
        } catch (error) {
            setErrorMessage('An error occurred. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (errorMessage) {
            const timer = setTimeout(() => {
                setErrorMessage('');
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [errorMessage]);

    return (
        <div className="career_sec">
            <div className="containers">
                <div className="contact_form">
                    <h2>Drop Your Resume Here</h2>
                    <p>Our HR team will contact you</p>

                    <form onSubmit={handleSubmit}>
                        <div className="form_group">
                            <label htmlFor="departments">DEPARTMENTS</label>
                            <select className="form_select" id="profile" name="profile" value={formData.profile} onChange={handleChange} required>
                                <option value="Accounts">Accounts</option>
                                <option value="HR">HR</option>
                                <option value="R&D">R&D</option>
                                <option value="Production">Production</option>
                                <option value="IT">IT</option>
                                <option value="Sales & Marketing">Sales & Marketing</option>
                                <option value="Quality Control">Quality Control</option>
                            </select>
                        </div>
                        <div className="form-row _form_row">
                            <div className="form_group col-md-6">
                                <label htmlFor="firstName">FIRST NAME</label>
                                <input type="text" className="form-control" id="firstName" name='firstName' value={formData.firstName} onChange={handleChange} placeholder="First Name" required />
                            </div>
                            <div className="form_group col-md-6">
                                <label htmlFor="lastName">LAST NAME</label>
                                <input type="text" className="form-control" id="lastName" name='lastName' value={formData.lastName} onChange={handleChange} placeholder="Last Name" required />
                            </div>
                        </div>
                        <div className="form-row _form_row">
                            <div className="form_group col-md-6">
                                <label htmlFor="email">EMAIL</label>
                                <input type="email" className="form-control" id="email" name='email' value={formData.email} onChange={handleChange} placeholder="Email" required />
                            </div>
                            <div className="form_group col-md-6">
                                <label htmlFor="phoneNumber">CONTACT</label>
                                <input type="tel" className="form-control" id="phoneNumber" name='phoneNumber' value={formData.phoneNumber} onChange={handleChange} placeholder="Your Phone Number" required />
                            </div>
                        </div>
                        <div className="form_group textara">
                            <label htmlFor="message">Message</label>
                            <textarea placeholder="Type Here" rows="4" id='message' name='message' value={formData.message} onChange={handleChange} required></textarea>
                        </div>
                        <div className="form_group _cv">
                            <label htmlFor="resume">Upload Your CV</label>
                            <input ref={fileInputRef} type="file" className="form_control_file" id='resume' name='resume' onChange={handleChange} accept='.doc, .docx, .pdf' required />
                            <p className="upload_instruction">(Attach only doc, docx, pdf and size less than 1.5MB)</p>
                        </div>
                        <input type="hidden" className="form-control" id="title" name='title' value={formData.title} onChange={handleChange} placeholder="Title" />
                        {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
                        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                        {requiredError && <p style={{ color: 'red' }}>{requiredError}</p>}
                        <button className="contact_form_btn" type="submit" disabled={loading}>{loading ? 'Please Wait...' : 'Submit Now'}</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default CareerForm;
