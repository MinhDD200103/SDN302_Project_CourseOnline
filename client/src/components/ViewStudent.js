import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Form, InputGroup, Button, Table, Card, Pagination, Badge } from 'react-bootstrap';
import API_BASE_URL from '../config/config';
import { useParams } from 'react-router-dom';

const ViewStudent = () => {

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [limit, setLimit] = useState(3)
    const { cid } = useParams()
    const [email, setEmail] = useState('')
    const [students, setStudents] = useState([])
    const [sort, setSort] = useState(false)
    const [courseTitle, setCourseTitle] = useState('')



    useEffect(() => {
        const fetchStudent = async () => {
            try {
                let query = `${API_BASE_URL}/enrollment/${cid}?page=${currentPage}&limit=${limit}`;
                if (email.trim() !== '') {
                    query += `&email=${email}`;
                }

                query += `&sort=${sort ? '-email' : 'email'}`;

                const response = await axios.get(query, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
                    withCredentials: true
                });

                setCurrentPage(response.data.currentPage);
                setTotalPages(response.data.totalPages);
                setStudents(response.data.enrollments);


            } catch (error) {
                console.error("Error fetching students:", error);
            }
        };

        const fetchCourse = async () => {
            try {

                const response = await axios.get(`${API_BASE_URL}/class/${cid}`);
                
                setCourseTitle(response.data.class.title)


            } catch (error) {
                console.error("Error fetching students:", error);
            }
        };


        fetchStudent();
        fetchCourse();
    }, [email, sort, currentPage, limit, cid]);

    console.log(sort);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        // Scroll lên đầu trang khi chuyển trang
        // window.scrollTo(0, 0);
    }


    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [])

    return (
        <Container fluid className="p-4">
            <Row className="mb-4 align-items-center">
                <Col>
                    <div className="d-flex align-items-center">
                        <h4 className="mb-0">Students</h4>
                        <Badge className="ms-3" pill >{students.length}</Badge>
                    </div>
                </Col>
                <Col className="d-flex justify-content-end">
                    <InputGroup className="me-3" style={{ maxWidth: '250px', paddingBottom: '6px' }}>
                        <InputGroup.Text className="bg-white">
                            <i className="bi bi-search text-muted"></i>
                        </InputGroup.Text>
                        <Form.Control
                            placeholder="Search student's email"
                            aria-label="Search"
                            className="border-start-0"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </InputGroup>
                    {/* <Button variant="outline-secondary" className="me-2">
                        <i className="bi bi-list"></i>
                    </Button>
                    <Button variant="outline-secondary">
                        <i className="bi bi-bell"></i>
                    </Button>
                    <div className="ms-3 avatar-container">
                        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                            JD
                        </div>
                    </div> */}
                </Col>
            </Row>

            <Row className="mb-4">
                <Col md={3}>
                    <Form.Group>
                        <Form.Label>Course</Form.Label>
                        {/* <Form.Select  >
                            <option>Big Ben</option>
                           
                        </Form.Select> */}
                        <p>{courseTitle}</p>
                    </Form.Group>
                </Col>
                <Col className="d-flex justify-content-end align-items-end">
                    <Button variant="outline-success" className="me-2" onClick={() => setSort(!sort)}>
                        <i className="bi bi-funnel me-2"></i>
                        Sort
                    </Button>
                    {/* <Button variant="primary">
                        <i className="bi bi-person-plus me-2"></i>
                        Add a student
                    </Button> */}
                </Col>
            </Row>


            <Table striped bordered hover style={{ marginBottom: '50px' }}>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Email</th>
                        {/* <th>Username</th> */}
                    </tr>
                </thead>
                {students.map((s, index) => (
                    <tbody key={`student-${index}`}>
                        <tr>
                            <td>{index + 1}</td>
                            <td>{s.student.name}</td>
                            <td>{s.student.email}</td>
                        </tr>
                    </tbody>
                ))}



            </Table>


            <div className="d-flex justify-content-center mt-4">
                <Pagination>

                    <Pagination.Prev
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    />

                    {/* Hiển thị các số trang */}
                    {[...Array(totalPages)].map((_, index) => (
                        <Pagination.Item
                            key={index + 1}
                            active={index + 1 === currentPage}
                            onClick={() => handlePageChange(index + 1)}
                        >
                            {index + 1}
                        </Pagination.Item>
                    ))}

                    <Pagination.Next
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    />

                </Pagination>
            </div>
        </Container>
    );
};

export default ViewStudent;