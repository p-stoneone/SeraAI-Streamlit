import React, { useState } from 'react';
import Link from 'next/link';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { FaPhone, FaEnvelope } from 'react-icons/fa';
import ReCAPTCHA from 'react-google-recaptcha';
import styles from '../styles/Contact.module.css';

const handleCopyPhoneNumber = () => {
  navigator.clipboard.writeText("+911146025522");
};

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '', subject: '', message: '' });
  const [errors, setErrors] = useState({ firstName: '', email: '', phone: '', subject: '', message: '' });
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    let valid = true;
    let errors = { firstName: '', email: '', phone: '', subject: '', message: '' };

    if (!formData.firstName.trim()) {
      errors.firstName = 'First Name is required';
      valid = false;
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!formData.email || !emailPattern.test(formData.email)) {
      errors.email = 'Valid email is required';
      valid = false;
    }

    const phonePattern = /^[0-9]{6,10}$/;
    if (!formData.phone || !phonePattern.test(formData.phone)) {
      errors.phone = 'Valid phone number is required';
      valid = false;
    }

    if (!formData.subject.trim()) {
      errors.subject = 'Subject is required';
      valid = false;
    }

    if (!formData.message.trim()) {
      errors.message = 'Message is required';
      valid = false;
    }

    setErrors(errors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validate() && captchaVerified) {
      setLoading(true);
      const form = e.currentTarget;
      form.submit();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCaptchaVerify = () => {
    setCaptchaVerified(true);
  };

  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';

  return (
    <div className='bg-all'>
      <Container className="pt-5 contact-us">
        <Row className="mt-3">
          <Col md={6} className="mx-auto mb-4 order-2 order-md-1">
            <div className="shadow p-3 bg-white rounded">
              <h3 className='fw-bold mt-3'>Get In Touch</h3>
              <Form
                className="mt-4"
                noValidate
                onSubmit={handleSubmit}
                action="https://formsubmit.co/ee1cadda961c196d74f4da2839958490"
                method="POST"
              >
                <input type="hidden" name="_subject" value="New Contact Form Submission" />
                <input type="hidden" name="_captcha" value="false" />
                <input type="hidden" name="_template" value="table" />
                <input type="hidden" name="_next" value="https://www.seraphicglobal.com/contact-us"/>
                <Row>
                  <Form.Group className="col-md-6 my-2">
                    <Form.Control
                      type="text"
                      placeholder="First Name"
                      className={`pl-bg form-control-lg ${errors.firstName ? 'is-invalid' : ''}`}
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.firstName && <div className="invalid-feedback">{errors.firstName}</div>}
                  </Form.Group>
                  <Form.Group className="col-md-6 my-2">
                    <Form.Control
                      type="text"
                      placeholder="Last Name"
                      className='pl-bg form-control-lg'
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Row>
                <Row>
                  <Form.Group className="col-md-6 my-2">
                    <Form.Control
                      type="email"
                      placeholder="Email"
                      className={`pl-bg form-control-lg ${errors.email ? 'is-invalid' : ''}`}
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </Form.Group>
                  <Form.Group className="col-md-6 my-2">
                    <Form.Control
                      type="tel"
                      placeholder="Phone"
                      className={`pl-bg form-control-lg ${errors.phone ? 'is-invalid' : ''}`}
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                  </Form.Group>
                </Row>
                <Form.Group className='my-2'>
                  <Form.Control
                    type="text"
                    placeholder="Subject"
                    className={`pl-bg form-control-lg ${errors.subject ? 'is-invalid' : ''}`}
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                  />
                  {errors.subject && <div className="invalid-feedback">{errors.subject}</div>}
                </Form.Group>
                <Form.Group className='my-3'>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    placeholder="Message"
                    className={`pl-bg form-control-lg ${errors.message ? 'is-invalid' : ''}`}
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                  />
                  {errors.message && <div className="invalid-feedback">{errors.message}</div>}
                </Form.Group>
                <ReCAPTCHA
                  sitekey={recaptchaSiteKey}
                  onChange={handleCaptchaVerify}
                />
                <Button variant="primary" type="submit" className="submit-btn arrow-hide" disabled={!captchaVerified || loading}>
                  {loading ? <div className={styles.loader}></div> : 'Submit Now'}
                </Button>
              </Form>
            </div>
          </Col>
          <Col md={6} className="mx-auto mb-4 order-1 order-md-2">
            <div className="p-3 text-black rounded">
              <h6 className='w-25 rounded bg-black text-light p-2 text-center small'>Contact Us</h6>
              <h1>Contact For Expert Legal Advice</h1>
              <div className={`${styles.contactInfoBox} mb-3`}>
                <div className={styles.iconBox}>
                  <FaPhone className={`${styles.iconInsideCircle} rev`} />
                </div>
                <div className={styles.contactInfoText}>
                  <span>Give us a Call: </span>
                  <Link href="tel:+911146025522" onCopy={handleCopyPhoneNumber} className='text-reset text-decoration-none'>+91 11 46025522</Link>
                </div>
              </div>
              <div className={styles.contactInfoBox}>
                <div className={styles.iconBox}>
                  <FaEnvelope className={styles.iconInsideCircle} />
                </div>
                <div className={styles.contactInfoText}>
                  <span>Send Mail: </span>
                  <Link href="mailto:contact@seraphicadvisors.com" className='text-reset text-decoration-none'>contact@seraphicadvisors.com</Link>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Contact;