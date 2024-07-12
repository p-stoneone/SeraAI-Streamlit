import React, { useState } from 'react';
import Image from 'next/image';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa';
import ReCAPTCHA from 'react-google-recaptcha';
import styles from '../styles/Careers.module.css';

const avatars = [
  { name: 'Ryan Florence', url: 'https://bit.ly/ryan-florence' },
  { name: 'Segun Adebayo', url: 'https://bit.ly/sage-adebayo' },
  { name: 'Kent Dodds', url: 'https://bit.ly/kent-c-dodds' },
  { name: 'Prosper Otemuyiwa', url: 'https://bit.ly/prosper-baba' },
  { name: 'Christian Nwamba', url: 'https://bit.ly/code-beast' },
];

const Careers = () => {
  const [validated, setValidated] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [captchaVerified, setCaptchaVerified] = useState(false);

  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';
  
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const form = event.currentTarget;
    if (form.checkValidity() === false || !captchaVerified) {
      setValidated(true);
    } else {
      form.submit();
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.size < 2 * 1024 * 1024 && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      alert('Please select a PDF file smaller than 2MB.');
    }
  };

  const handleCaptchaVerify = () => {
    setCaptchaVerified(true);
  };

  return (
    <Container fluid className="bg-all min-vh-100 d-flex align-items-center justify-content-center">
      <Row>
        <Col md={5} className="text-left my-5 mx-4">
          <h1 className="display-4 fw-bold">Internships <span>&</span> <br />Job Opportunities </h1>
          <div className="d-inline-flex my-5">
            {avatars.map((avatar, index) => (
              <Image key={index} src={avatar.url} alt={avatar.name} className="rounded-circle mr-3 blur-effect" width="50" height="50" />
            ))}
            <span className='align-self-center mx-2'>
              <FaPlus className="icon" />
            </span>
            <span className="rounded-circle bg-black text-white align-self-center me-2 p-3"> YOU</span>
          </div>
        </Col>
        <Col md={6} className="shadow p-4 bg-white rounded my-3">
          <h2 className='fw-bolder'>Join our team<span>!</span></h2>
          <p className='text-muted'>Submit your resume along with the form and one of our team members will reach out to you promptly!</p>
          <Form
            noValidate
            validated={validated}
            onSubmit={handleSubmit}
            encType="multipart/form-data"
            action="https://formsubmit.co/bf6ed2db8263d8cc4d41e6582e64706e"
            method="POST"
          >
            <input type="hidden" name="_subject" value="New Career Form Submission" />
            <input type="hidden" name="_captcha" value="false" />
            <input type="hidden" name="_template" value="table" />
            <input type="hidden" name="_next" value="https://www.seraphicglobal.com/careers"/>
            <Form.Group controlId="formName" className='my-3'>
              <Form.Control type="text" name="name" placeholder="Name" required />
              <Form.Control.Feedback type="invalid">Please provide your name.</Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="formEmail" className='my-3'>
              <Form.Control type="email" name="email" placeholder='Email' required />
              <Form.Control.Feedback type="invalid">Please provide a valid email address.</Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="formPhone" className='my-3'>
              <Form.Control type="tel" name="phone" placeholder="Phone" required />
              <Form.Control.Feedback type="invalid">Please provide your phone number.</Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="formFileUpload" className='my-3'>
              <div className={styles.uploadAndCaptcha}>
                <div className={styles.fileUploadForm}>
                  <label htmlFor="file" className={styles.fileUploadLabel}>
                    <div className={styles.fileUploadDesign}>
                      <svg viewBox="0 0 640 512" height="1em">
                        <path d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128H144zm79-217c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39V392c0 13.3 10.7 24 24 24s24-10.7 24-24V257.9l39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z"></path>
                      </svg>
                      <span className={styles.browseButton}>Browse file</span>
                      <input id="file" type="file" name="resume" onChange={handleFileUpload} />
                    </div>
                  </label>
                </div>
                <div className={styles.captcha}>
                  <ReCAPTCHA sitekey={recaptchaSiteKey} onChange={handleCaptchaVerify} />
                </div>
              </div>
            </Form.Group>
            <Button variant="dark" type="submit" className='w-100 mt-2' disabled={!captchaVerified}>Submit</Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default Careers;
