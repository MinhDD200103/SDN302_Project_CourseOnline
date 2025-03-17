import { Container, Row, Col, Card, Button, Form, Accordion } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import '../styletemplate/css/CreateCourse.css'
import sweetalert from 'sweetalert'
import axios from 'axios';
import API_BASE_URL from '../config/config';
import { jwtDecode } from "jwt-decode";

export default function CreateCourse() {
    const navigate = useNavigate(); // For redirecting after successful submission
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false); // Add loading state
    // const [error, setError] = useState(null); // Add error state
    const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken') || '');
    const [userId, setUserId] = useState('');

    // console.log(accessToken);

    useEffect(() => {
        try {
            // Only attempt to decode if we have a token
            if (accessToken && typeof accessToken === 'string' && accessToken.trim() !== '') {
                const decoded = jwtDecode(accessToken);
                setUserId(decoded?._id || '');
                console.log('User id', decoded?._id);
            } else {
                // Handle case where no valid token exists
                console.log('No valid token found');
                // Optional: Redirect to login
                // navigate('/login');
            }
        } catch (error) {
            console.error('Error decoding token:', error);
            // Handle invalid token (e.g., clear it and redirect to login)
            localStorage.removeItem('accessToken');
            setAccessToken('');
            // Optional: Redirect to login
            // navigate('/login');
        }
    }, [accessToken, navigate]);


    const [formData, setFormData] = useState({
        // Trang 1
        title: '',
        description: '',
        // Trang 2
        lectures: [{
            title: '',
            file: null,
            content: ''
        }],
        // Trang 3
        image: null,
        // Tạm thời cho mặc định
        createdBy: ''
    });
    useEffect(() => {
        if (userId) {
            setFormData(prev => ({
                ...prev,
                createdBy: userId
            }));
        }
    }, [userId]);

    const [newFormData, setNewFormData] = useState({ ...formData });

    useEffect(() => {
        setNewFormData({ ...formData });
    }, [formData]);

    //Claude
    // const submitForm = async () => {
    //     // Check for required fields
    //     if (!newFormData.title) {
    //         // setError("Course title is required");
    //         sweetalert("Error", "Course title is required", "error");
    //         setPage(0)
    //         return;
    //     }

    //     // Validate lectures
    //     if (!newFormData.lectures || newFormData.lectures.length === 0) {
    //         // setError("A class must have at least one lecture");
    //         sweetalert("Error", "A class must have at least one lecture", "error");
    //         setPage(1)
    //         return;
    //     }

    //     for (let i = 0; i < newFormData.lectures.length; i++) {
    //         if (!newFormData.lectures[i].title) {
    //             // setError(`Lecture ${i + 1} must have a title`);
    //             sweetalert("Error", `Lecture #${i + 1} must have a title`, "error");
    //             return;
    //         }
    //     }

    //     setLoading(true);
    //     // setError(null);

    //     try {
    //         // Create FormData object
    //         const formDataToSend = new FormData();
    //         formDataToSend.append("title", newFormData.title);
    //         formDataToSend.append("description", newFormData.description || "");

    //         // Add course image if available
    //         if (newFormData.image) {
    //             formDataToSend.append("image", newFormData.image);
    //         }

    //         console.log(formDataToSend);


    //         // Add lectures as JSON string
    //         const lecturesData = newFormData.lectures.map(lecture => ({
    //             title: lecture.title,
    //             content: lecture.content || ""
    //         }));

    //         formDataToSend.append("lectures", JSON.stringify(lecturesData));

    //         // Add lecture files
    //         newFormData.lectures.forEach((lecture, index) => {
    //             if (lecture.file) {
    //                 formDataToSend.append("lectureFiles", lecture.file);
    //             }
    //         });

    //         // Make API call
    //         // const response = await axios.post(`${API_BASE_URL}/class`, formDataToSend, {
    //         //     headers: {
    //         //         'Content-Type': 'multipart/form-data',
    //         //         // Include authorization header if using JWT
    //         //         'Authorization': `Bearer ${accessToken}`,

    //         //     },
    //         //     withCredentials: true
    //         // });

    //         const response = await axios.post(`${API_BASE_URL}/class`, formDataToSend,
    //             {
    //                 headers: {
    //                     Authorization: `Bearer ${accessToken}`,
    //                     // Don't set Content-Type for FormData - browser will set it with boundary
    //                 },
    //                 withCredentials: true
    //             }
    //         );

    //         // Handle successful response
    //         console.log("Course created successfully:", response.data);

    //         // Reset form and show success message
    //         setNewFormData({ ...formData });
    //         setPage(0)
    //         sweetalert("Success", "Course created successfully!", "success")
    //         // alert("Course created successfully!");

    //         // Redirect to courses page or the newly created course
    //         // navigate('/course');

    //     } catch (err) {
    //         // Handle errors
    //         sweetalert("Error", err.response?.data?.message || "Failed to create course", "error");
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    //ChatGPT

    // const submitForm = async () => {
    //     // Kiểm tra các trường bắt buộc
    //     if (!newFormData.title) {
    //         sweetalert("Error", "Course title is required", "error");
    //         setPage(0);
    //         return;
    //     }

    //     if (!newFormData.lectures || newFormData.lectures.length === 0) {
    //         sweetalert("Error", "A class must have at least one lecture", "error");
    //         setPage(1);
    //         return;
    //     }

    //     for (let i = 0; i < newFormData.lectures.length; i++) {
    //         if (!newFormData.lectures[i].title) {
    //             sweetalert("Error", `Lecture #${i + 1} must have a title`, "error");
    //             return;
    //         }
    //     }

    //     setLoading(true);

    //     try {
    //         // Chuẩn bị dữ liệu JSON để gửi
    //         const requestData = {
    //             title: newFormData.title,
    //             description: newFormData.description || "",
    //             lectures: newFormData.lectures.map(lecture => ({
    //                 title: lecture.title,
    //                 content: lecture.content || ""
    //             }))
    //         };

    //         // Gửi API request với JSON
    //         const response = await axios.post(`${API_BASE_URL}/class`, requestData, {
    //             headers: {
    //                 "Content-Type": "application/json",
    //                 Authorization: `Bearer ${accessToken}`
    //             },
    //             withCredentials: true
    //         });

    //         // Xử lý khi tạo lớp học thành công
    //         console.log("Course created successfully:", response.data);
    //         setNewFormData({ ...formData });
    //         setPage(0);
    //         sweetalert("Success", "Course created successfully!", "success");
    //     } catch (err) {
    //         sweetalert("Error", err.response?.data?.message || "Failed to create course", "error");
    //     } finally {
    //         setLoading(false);
    //     }
    // };


    const submitForm = async () => {
        // Validation checks
        if (!newFormData.title) {
            sweetalert("Error", "Course title is required", "error");
            setPage(0);
            return;
        }

        if (!newFormData.lectures || newFormData.lectures.length === 0) {
            sweetalert("Error", "A class must have at least one lecture", "error");
            setPage(1);
            return;
        }

        for (let i = 0; i < newFormData.lectures.length; i++) {
            if (!newFormData.lectures[i].title) {
                sweetalert("Error", `Lecture #${i + 1} must have a title`, "error");
                return;
            }
        }

        setLoading(true);

        try {
            // Create FormData object for multipart/form-data upload
            const formDataToSend = new FormData();

            // Add basic course information
            formDataToSend.append("title", newFormData.title);
            formDataToSend.append("description", newFormData.description || "");
            formDataToSend.append("createdBy", newFormData.createdBy);

            // Add course image if available
            if (newFormData.image) {
                formDataToSend.append("image", newFormData.image);
            }

            // Add lectures as JSON string
            const lecturesData = newFormData.lectures.map(lecture => ({
                title: lecture.title,
                content: lecture.content || ""
            }));

            formDataToSend.append("lectures", JSON.stringify(lecturesData));

            // Add lecture files
            newFormData.lectures.forEach((lecture, index) => {
                if (lecture.file) {
                    formDataToSend.append("lectureFiles", lecture.file);
                }
            });

            // Make API call with FormData
            const response = await axios.post(`${API_BASE_URL}/class`, formDataToSend, {
                headers: {
                    // Don't set Content-Type for FormData - browser will set it with boundary
                    Authorization: `Bearer ${accessToken}`
                },
                withCredentials: true
            });

            console.log("Course created successfully:", response.data);
            setNewFormData({ ...formData });
            setPage(0);
            sweetalert("Success", "Course created successfully!", "success");
        } catch (err) {
            sweetalert("Error", err.response?.data?.message || "Failed to create course", "error");
            console.error("Error creating course:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleChangeForm = (e, index = null) => {
        const { name, value } = e.target;

        setNewFormData((prev) => {
            if (index !== null) {
                // Nếu đang cập nhật lecture
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

        const allowedTypes = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
            "application/vnd.openxmlformats-officedocument.presentationml.presentation" // .pptx
        ];

        if (!allowedTypes.includes(file.type)) {
            sweetalert("Error", "Only .docx, .pdf, and .pptx files are allowed.", 'error');
            return;
        }

        setNewFormData((prev) => {
            const updatedLectures = [...prev.lectures];
            updatedLectures[index] = {
                ...updatedLectures[index],
                file: file  // Lưu trực tiếp file vào newFormData
            };
            return { ...prev, lectures: updatedLectures };
        });
    };

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setNewFormData(prev => ({
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
        setNewFormData(prev => ({
            ...prev,
            lectures: [...prev.lectures, { title: '', file: null }]
        }));
    };

    const removeLecture = (index) => {

        setNewFormData(prev => {
            const updatedLectures = [...prev.lectures];
            updatedLectures.splice(index, 1);
            return { ...prev, lectures: updatedLectures };
        });
    };

    const renderPage = () => {
        switch (page) {
            case 0:
                return <CourseInformation newFormData={newFormData} handleChangeForm={handleChangeForm} />;
            case 1:
                return (
                    <LectureInformation
                        newFormData={newFormData}
                        handleChangeForm={handleChangeForm}
                        handleFileChange={handleFileChange}
                        addLecture={addLecture}
                        removeLecture={removeLecture}
                    />
                );
            case 2:
                return <CourseImage newFormData={newFormData} handleImageChange={handleImageChange} />;
            default:
                return null;
        }
    };

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [page]);

    return (
        <>

            <Container fluid className="register-car-page-container">
                <Row>
                    <Col>
                        <h2 className="text-center my-4">Create Course</h2>
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
                                <Button onClick={handleNextPage} className="footer-btn">{page === 2 ? "Submit" : "Next"}</Button>
                            </Card.Footer>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
}

function CourseInformation({ newFormData, handleChangeForm }) {

    console.log(newFormData);

    return (
        <Container className="car-infor-container">
            <Form>
                <h6 className="car-register-title">Course Information</h6>
                <Row>
                    <Form.Group className="mb-3 col-md-6">
                        <Form.Label>Title</Form.Label>
                        <Form.Control type="text" name="title" value={newFormData.title} onChange={handleChangeForm} />
                    </Form.Group>
                </Row>
                <h6 className="mt-3 mb-3">Description</h6>
                <Form.Group className="mb-5">
                    <Form.Control as="textarea" rows={3} name="description" value={newFormData.description} onChange={handleChangeForm} />
                </Form.Group>
            </Form>
        </Container>
    );
}

function LectureInformation({ newFormData, handleChangeForm, handleFileChange, addLecture, removeLecture }) {
    console.log(newFormData);


    return (
        <Container className="car-infor-container">
            <h6 className="car-register-title">Lecture Information</h6>
            <span className="note">A class must have at least one lecture</span>

            <Accordion defaultActiveKey="0" className="mt-3">
                {newFormData.lectures.map((lecture, index) => (
                    <Accordion.Item eventKey={index.toString()} key={index}>
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
                                {lecture.file && (
                                    <p className="mt-2 text-success">
                                        <i className="bi bi-check-circle me-2"></i>
                                        File selected: {lecture.file.name}
                                    </p>
                                )}
                            </Form.Group>

                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() => removeLecture(index)}
                                className="mt-2"
                                disabled={newFormData.lectures.length == 1 ? true : false}
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

function CourseImage({ newFormData, handleImageChange }) {
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        if (newFormData.image instanceof File) {
            setImagePreview(URL.createObjectURL(newFormData.image));
            return () => {
                if (imagePreview) URL.revokeObjectURL(imagePreview);
            };
        }
    }, [newFormData.image]);

    console.log(newFormData);


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
                {newFormData.image && (
                    <p className="text-success">
                        <i className="bi bi-check-circle me-2"></i>
                        Image selected: {newFormData.image.name}
                    </p>
                )}
            </Container>
        </Container>
    );
}