import React from 'react';
import Link from 'next/link'
import { Container, Row, Form, Button } from 'react-bootstrap';

function Intern() {
  return (
    <Container fluid className="bg-all min-vh-100 d-flex align-items-center justify-content-center">
            <Row className="">
                <div>
                    <h1 className="text-center fw-bold">Sign in to your account</h1>
                    <p className="text-center text-muted">to enjoy all your work related updates on single <a href="#" className="text-primary">dashboard</a> ✌️</p>
                </div>
                <div className="shadow p-3 bg-white rounded my-3 mx-auto my-3 w-75 w-lg-50">
                    <Form>
                    <Form.Group controlId="formEmail" className='my-3'>
                        <Form.Label>Email address</Form.Label>
                        <Form.Control type="email" />
                    </Form.Group>
                    <Form.Group controlId="formPassword" className='my-3'>
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" />
                    </Form.Group>
                    <Form.Group controlId="formCheckbox" className="d-flex justify-content-between my-3">
                        <Form.Check type="checkbox" label="Remember me" />
                        <a href="#" className="text-primary">Forgot password?</a>
                    </Form.Group>
                    <Button variant="primary" type="submit" className="w-100 my-3">
                        Sign in
                    </Button>
                    </Form>
                    <div className="text-center mt-3">
                        <small>New here? <Link href="/careers" className="text-primary">Join Us!</Link></small>
                    </div>
                </div>
            </Row>
    </Container>
  );
};

export default Intern;
