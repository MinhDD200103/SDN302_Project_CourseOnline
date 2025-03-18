import React, { useState } from 'react';
import { Container, Row, Col, Form, InputGroup, Button, Table, Card, Pagination, Badge } from 'react-bootstrap';

const ViewStudent = () => {
    const [students, setStudents] = useState([
        { id: '12289', firstName: 'Daisy', lastName: 'Scott', email: 'daisy22@gmail.com', phone: '+442146886341', yearGroup: 'Grade 10', photo: 'green' },
        { id: '12288', firstName: 'Isabel', lastName: 'Harris', email: 'isabel887@gmail.com', phone: '+442251886322', yearGroup: 'Grade 12', photo: 'red' },
        { id: '12287', firstName: 'Dan', lastName: 'Thomas', email: 'dan87675@gmail.com', phone: '+442445825355', yearGroup: 'Grade 12', photo: 'teal' },
        { id: '12286', firstName: 'Debra', lastName: 'Nelson', email: 'debra1212@gmail.com', phone: '+442342292343', yearGroup: 'Grade 11', photo: 'purple' },
        { id: '12285', firstName: 'Vera', lastName: 'Cooper', email: 'vera8888@gmail.com', phone: '+442118925444', yearGroup: 'Grade 12', photo: 'aqua' },
        { id: '12284', firstName: 'Brian', lastName: 'Miller', email: 'brian5564@gmail.com', phone: '+442243236311', yearGroup: 'Grade 12', photo: 'navy' },
        { id: '12283', firstName: 'Lauren', lastName: 'Martin', email: 'lauren7712@gmail.com', phone: '+442898235622', yearGroup: 'Grade 10', photo: 'blue' },
        { id: '12282', firstName: 'Milton', lastName: 'Smith', email: 'milton2244@gmail.com', phone: '+442044975177', yearGroup: 'Grade 12', photo: 'brown' },
        { id: '12281', firstName: 'Molly', lastName: 'White', email: 'molly4747@gmail.com', phone: '+442041996398', yearGroup: 'Grade 12', photo: 'gold' },
    ]);

    const [selectedSchool, setSelectedSchool] = useState('Big Ben');
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = 10;

    // Get avatar color based on the profile color
    const getAvatarStyle = (color) => {
        const colorMap = {
            green: 'bg-success',
            red: 'bg-danger',
            teal: 'bg-info',
            purple: 'bg-purple',
            aqua: 'bg-info',
            navy: 'bg-primary',
            blue: 'bg-primary',
            brown: 'bg-secondary',
            gold: 'bg-warning',
        };
        
        return `${colorMap[color] || 'bg-secondary'} text-white rounded-circle d-flex align-items-center justify-content-center`;
    };

    // Get initials for avatar
    const getInitials = (firstName, lastName) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`;
    };

    return (
        <Container fluid className="p-4">
            <Row className="mb-4 align-items-center">
                <Col>
                    <div className="d-flex align-items-center">
                        <h4 className="mb-0">Students</h4>
                        <Badge className="ms-3 bg-light text-dark" pill>82</Badge>
                    </div>
                </Col>
                <Col className="d-flex justify-content-end">
                    <InputGroup className="me-3" style={{ maxWidth: '250px' }}>
                        <InputGroup.Text className="bg-white">
                            <i className="bi bi-search text-muted"></i>
                        </InputGroup.Text>
                        <Form.Control 
                            placeholder="Search" 
                            aria-label="Search"
                            className="border-start-0"
                        />
                    </InputGroup>
                    <Button variant="outline-secondary" className="me-2">
                        <i className="bi bi-list"></i>
                    </Button>
                    <Button variant="outline-secondary">
                        <i className="bi bi-bell"></i>
                    </Button>
                    <div className="ms-3 avatar-container">
                        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                            JD
                        </div>
                    </div>
                </Col>
            </Row>

            <Row className="mb-4">
                <Col md={3}>
                    <Form.Group>
                        <Form.Label>Select school</Form.Label>
                        <Form.Select value={selectedSchool} onChange={e => setSelectedSchool(e.target.value)}>
                            <option>Big Ben</option>
                            <option>Oxford High</option>
                            <option>Cambridge Primary</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col className="d-flex justify-content-end align-items-end">
                    <Button variant="outline-secondary" className="me-2">
                        <i className="bi bi-funnel me-2"></i>
                        Filter
                    </Button>
                    <Button variant="primary">
                        <i className="bi bi-person-plus me-2"></i>
                        Add a student
                    </Button>
                </Col>
            </Row>

            <Card className="mb-4 border-0 shadow-sm">
                <Table responsive hover className="mb-0">
                    <thead>
                        <tr>
                            <th>
                                <Form.Check 
                                    type="checkbox" 
                                    id="selectAll"
                                />
                            </th>
                            <th>Photo</th>
                            <th>ID</th>
                            <th>First name</th>
                            <th>Last name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Year group</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student) => (
                            <tr key={student.id}>
                                <td>
                                    <Form.Check 
                                        type="checkbox" 
                                        id={`student-${student.id}`}
                                    />
                                </td>
                                <td>
                                    <div className={getAvatarStyle(student.photo)} style={{ width: '35px', height: '35px' }}>
                                        {getInitials(student.firstName, student.lastName)}
                                    </div>
                                </td>
                                <td>{student.id}</td>
                                <td>{student.firstName}</td>
                                <td>{student.lastName}</td>
                                <td>{student.email}</td>
                                <td>{student.phone}</td>
                                <td>{student.yearGroup}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card>

            <Row className="align-items-center">
                <Col xs="auto">
                    <Pagination>
                        <Pagination.Item>
                            <i className="bi bi-chevron-left"></i>
                        </Pagination.Item>
                        <Pagination.Item active>{currentPage}</Pagination.Item>
                        <Pagination.Item>
                            <i className="bi bi-chevron-right"></i>
                        </Pagination.Item>
                    </Pagination>
                </Col>
                <Col xs="auto">
                    <span className="text-muted">of {totalPages}</span>
                </Col>
            </Row>
        </Container>
    );
};

export default ViewStudent;