import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Form, Accordion } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import axios from 'axios';
import sweetalert from 'sweetalert';
import { jwtDecode } from "jwt-decode";
import API_BASE_URL from '../config/config';

export default function UpdateCourse() {
    const navigate = useNavigate();
    const { cid } = useParams();
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken') || '');
    const [userId, setUserId] = useState('');
    const [originalLectures, setOriginalLectures] = useState([]);

    // Initial form data state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        lectures: [],
        image: null,
        createdBy: ''
    });

    // Decode token and set user ID
    useEffect(() => {
        try {
            if (accessToken && typeof accessToken === 'string' && accessToken.trim() !== '') {
                const decoded = jwtDecode(accessToken);
                setUserId(decoded?._id || '');
            } else {
                console.log('No valid token found');
            }
        } catch (error) {
            console.error('Error decoding token:', error);
            localStorage.removeItem('accessToken');
            setAccessToken('');
        }
    }, [accessToken]);

    // Fetch course data when component mounts
    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_BASE_URL}/class/${cid}`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });

                const courseData = response.data.class;

                // Transform lectures to match the create course format
                const transformedLectures = courseData.lectures.map(lecture => ({
                    _id: lecture._id,
                    title: lecture.title,
                    content: lecture.content || '',
                    file: null,
                    originalFileName: lecture.originalFileName,
                    downloadLink: lecture.downloadLink
                }));

                setFormData({
                    title: courseData.title,
                    description: courseData.description,
                    lectures: transformedLectures,
                    image: courseData.image,
                    createdBy: courseData.createdBy._id
                });
            } catch (error) {
                sweetalert("Error", "Failed to fetch course details", "error");
                console.error("Error fetching course:", error);
            } finally {
                setLoading(false);
            }
        };

        if (cid) {
            fetchCourseData();
        }
    }, [cid, accessToken]);

    // Submit form for updating course
    const submitForm = async () => {
        // Validation checks
        if (!formData.title) {
            sweetalert("Error", "Course title is required", "error");
            setPage(0);
            return;
        }

        if (!formData.lectures || formData.lectures.length === 0) {
            sweetalert("Error", "A class must have at least one lecture", "error");
            setPage(1);
            return;
        }

        for (let i = 0; i < formData.lectures.length; i++) {
            if (!formData.lectures[i].title) {
                sweetalert("Error", `Lecture #${i + 1} must have a title`, "error");
                return;
            }
        }

        setLoading(true);

        try {
            // Create FormData object for multipart/form-data upload
            const formDataToSend = new FormData();

            // Add basic course information
            formDataToSend.append("title", formData.title);
            formDataToSend.append("description", formData.description || "");

            // Add course image if available and changed
            if (formData.image instanceof File) {
                formDataToSend.append("image", formData.image);
            }

            // Prepare lectures data
            const lecturesData = formData.lectures.map(lecture => {
                const lectureData = {
                    title: lecture.title,
                    content: lecture.content || ""
                };

                // If the lecture is an existing one from the original course
                if (lecture._id) {
                    lectureData._id = lecture._id;
                }

                return lectureData;
            });

            formDataToSend.append("lectures", JSON.stringify(lecturesData));

            // Add new or updated lecture files
            formData.lectures.forEach((lecture, index) => {
                if (lecture.file) {
                    formDataToSend.append("lectureFiles", lecture.file);
                }
            });

            // Make API call with FormData
            const response = await axios.put(`${API_BASE_URL}/class/${cid}`, formDataToSend, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                },
                withCredentials: true
            });

            sweetalert("Success", "Course updated successfully!", "success");
            navigate(`/course/${cid}`);  // Navigate to course details page
        } catch (err) {
            sweetalert("Error", err.response?.data?.message || "Failed to update course", "error");
            console.error("Error updating course:", err);
        } finally {
            setLoading(false);
        }
    };


    const handleChangeForm = (e, index = null) => {
        const { name, value } = e.target;

        setFormData((prev) => {
            if (index !== null) {
                // Update lecture
                const updatedLectures = [...prev.lectures];
                updatedLectures[index][name] = value;
                return { ...prev, lectures: updatedLectures };
            }
            return { ...prev, [name]: value };
        });
    };

    const handleFileChange = (e, index) => {
        const file = e.target.files[0];
        if (!file) return;

        setFormData((prev) => {
            const updatedLectures = [...prev.lectures];
            updatedLectures[index] = {
                ...updatedLectures[index],
                file: file
            };
            return { ...prev, lectures: updatedLectures };
        });
    };

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                image: file
            }));
        }
    };

    const handleNextPage = () => {
        if (page === 2) {
            // Call API on final submission
            submitForm();
        } else {
            setPage(page + 1);
        }
    };

    const handlePreviousPage = () => {
        setPage(page - 1);
    };

    const addLecture = () => {
        setFormData(prev => ({
            ...prev,
            lectures: [...prev.lectures, { title: '', file: null }]
        }));
    };

    const removeLecture = (index) => {
        setFormData(prev => {
            const updatedLectures = [...prev.lectures];
            updatedLectures.splice(index, 1);
            return { ...prev, lectures: updatedLectures };
        });
    };

    const renderPage = () => {
        switch (page) {
            case 0:
                return <CourseInformation formData={formData} handleChangeForm={handleChangeForm} />;
            case 1:
                return (
                    <LectureInformation
                        formData={formData}
                        handleChangeForm={handleChangeForm}
                        handleFileChange={handleFileChange}
                        addLecture={addLecture}
                        removeLecture={removeLecture}
                    />
                );
            case 2:
                return <CourseImage formData={formData} handleImageChange={handleImageChange} />;
            default:
                return null;
        }
    };

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [page]);

    // if (loading) {
    //     return <div>Loading...</div>;
    // }

    return (
        <Container fluid className="register-car-page-container">
            <Row>
                <Col>
                    <h2 className="text-center my-4">Update Course</h2>
                </Col>
            </Row>

            <Row>
                <Col md={{ span: 8, offset: 2 }}>
                    <Card style={{ border: 'none', borderRadius: '0px' }}>
                        <div className="card-header-container">
                            <ul>
                                <li className={page === 0 ? "circle-option-active" : "circle-option-deactive"}>1</li>
                                <li><i className="bi bi-chevron-right"></i></li>
                                <li className={page === 1 ? "circle-option-active" : "circle-option-deactive"}>2</li>
                                <li><i className="bi bi-chevron-right"></i></li>
                                <li className={page === 2 ? "circle-option-active" : "circle-option-deactive"}>3</li>
                            </ul>
                        </div>

                        <Card.Text className="card-body-container">{renderPage()}</Card.Text>

                        <Card.Footer className="card-footer-container">
                            <Button disabled={page === 0} onClick={handlePreviousPage} className="footer-btn">Previous</Button>
                            <Button onClick={handleNextPage} className="footer-btn">{page === 2 ? "Update" : "Next"}</Button>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

// The following components (CourseInformation, LectureInformation, CourseImage) 
// can be copied directly from the CreateCourse component with minor modifications:
// - Replace newFormData with formData
// - Update console.log statements if needed

function CourseInformation({ formData, handleChangeForm }) {
    return (
        <Container className="car-infor-container">
            <Form>
                <h6 className="car-register-title">Course Information</h6>
                <Row>
                    <Form.Group className="mb-3 col-md-6">
                        <Form.Label>Title</Form.Label>
                        <Form.Control type="text" name="title" value={formData.title} onChange={handleChangeForm} />
                    </Form.Group>
                </Row>
                <h6 className="mt-3 mb-3">Description</h6>
                <Form.Group className="mb-5">
                    <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleChangeForm} />
                </Form.Group>
            </Form>
        </Container>
    );
}

function LectureInformation({ formData, handleChangeForm, handleFileChange, addLecture, removeLecture }) {
    return (
        <Container className="car-infor-container">
            <h6 className="car-register-title">Lecture Information</h6>
            <span className="note">A class must have at least one lecture</span>

            <Accordion defaultActiveKey="0" className="mt-3">
                {formData.lectures.map((lecture, index) => (
                    <Accordion.Item eventKey={index.toString()} key={lecture._id || index}>
                        <Accordion.Header>
                            Lecture #{index + 1} {lecture.title && `- ${lecture.title}`}
                        </Accordion.Header>
                        <Accordion.Body>
                            <Form.Group className="mb-3">
                                <Form.Label>Title</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="title"
                                    value={lecture.title}
                                    onChange={(e) => handleChangeForm(e, index)}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Content</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="content"
                                    value={lecture.content}
                                    onChange={(e) => handleChangeForm(e, index)}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>File</Form.Label>
                                <Form.Control
                                    type="file"
                                    name="file"
                                    onChange={(e) => handleFileChange(e, index)}
                                />
                                {(lecture.file || lecture.originalFileName) && (
                                    <p className="mt-2 text-success">
                                        <i className="bi bi-check-circle me-2"></i>
                                        File selected: {lecture.file ? lecture.file.name : lecture.originalFileName}
                                    </p>
                                )}
                                {/* {lecture.downloadLink && !lecture.file && (
                                    <p className="mt-2">
                                        <a href={lecture.downloadLink} target="_blank" rel="noopener noreferrer">
                                            <i className="bi bi-download me-2"></i>
                                            Download Existing File
                                        </a>
                                    </p>
                                )} */}
                            </Form.Group>

                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() => removeLecture(index)}
                                className="mt-2"
                                disabled={formData.lectures.length === 1}
                            >
                                <i className="bi bi-trash me-1"></i> Remove Lecture
                            </Button>
                        </Accordion.Body>
                    </Accordion.Item>
                ))}
            </Accordion>

            <Button
                variant="success"
                className="mt-3 mb-3"
                onClick={addLecture}
            >
                <i className="bi bi-plus-circle me-1"></i> Add Lecture
            </Button>
        </Container>
    );
}

function CourseImage({ formData, handleImageChange }) {
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        if (formData.image instanceof File) {
            setImagePreview(URL.createObjectURL(formData.image));
            return () => {
                if (imagePreview) URL.revokeObjectURL(imagePreview);
            };
        } else if (typeof formData.image === 'string') {
            // If image is a URL from the backend
            setImagePreview(formData.image);
        }
    }, [formData.image]);

    return (
        <Container className="car-infor-container">
            <h6 className="car-register-title mb-5">Course Image</h6>
            <Container>
                <Form.Group controlId="formFile" className="mb-3 col-md-8">
                    <div className="upload-container">
                        <label htmlFor="file-upload" className="upload-label">
                            {imagePreview ? (
                                <div className="preview-box">
                                    <img src={imagePreview} alt="Preview" className="preview-img" />
                                </div>
                            ) : (
                                <>
                                    <i className="bi bi-cloud-arrow-up"></i>
                                    <p>Choose Image</p>
                                </>
                            )}
                        </label>
                        <input
                            id="file-upload"
                            type="file"
                            hidden
                            name="image"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                    </div>
                </Form.Group>
                {formData.image && (
                    <p className="text-success">
                        <i className="bi bi-check-circle me-2"></i>
                        Image selected: {formData.image instanceof File ? formData.image.name : 'Existing image'}
                    </p>
                )}
            </Container>
        </Container>
    );
}
