import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/config';
import { Accordion } from 'react-bootstrap';
// import Swal from 'sweetalert2';
import sweetalert from 'sweetalert'
import { Button, Form, Modal } from "react-bootstrap";
import API from "../axiosConfig";

import { jwtDecode } from "jwt-decode";

const CourseDetail = () => {
    const [course, setCourse] = useState({});
    const { cid } = useParams();
    const [teacherName, setTeacherName] = useState('');
    const [lectures, setLectures] = useState([]);
    const [currentDate, setCurrentDate] = useState('');
    const [show, setShow] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'))
    const [role, setRole] = useState(localStorage.getItem('role'))
    const [userCourses, setUserCourses] = useState([])
    const [isEnroll, setIsEnroll] = useState(false)
    const [enrolledDate, setEnrolledDate] = useState('')

    const navigate = useNavigate()
    useEffect(() => {
        const fetchClass = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/class/${cid}`);
                // console.log(response.data.class.lectures);
                setLectures(response.data.class.lectures);
                setCourse(response.data.class);
                setTeacherName(response.data.class.createdBy.name);
            } catch (error) {
                console.log("Cannot get class from server", error);
            }
        }

        fetchClass();

        const today = new Date();
        const options = { month: 'short', day: 'numeric' };
        setCurrentDate(today.toLocaleDateString('en-US', options)); // Format: "Mar 13"

        const fetchUserClass = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/enrollment/my-classes`,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        },
                        withCredentials: true
                    }
                );

                setUserCourses(response.data.userClass)
                // console.log();

            } catch (error) {
                console.log("Cannot get class from server", error);
            }


        }

        fetchUserClass()

        const checkEnroll = () => {
            userCourses.map(course => {
                console.log(course.student);

                if (course.classId._id == cid) {
                    setIsEnroll(true)
                    setEnrolledDate(course.enrolledAt.toLocaleDateString('en-US', options))
                    return
                }
            })
        }
        checkEnroll()

    }, [cid, accessToken]);

    useEffect(() => {
        if (userCourses.length > 0) {
            userCourses.forEach(course => {
                if (course.classId._id === cid) {
                    setIsEnroll(true);
                    const options = { month: 'short', day: 'numeric' };
                    setEnrolledDate(new Date(course.enrolledAt).toLocaleDateString('en-US', options));
                }
            });
        }
    }, [userCourses]);
    // console.log(accessToken);

    console.log(userCourses);





    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const handleLogin = async () => {
        try {
            const response = await API.post("/user/login", { email, password });

            if (response.data.success) {
                localStorage.setItem("accessToken", response.data.accessToken);
                localStorage.setItem("email", response.data.userData.email);
                // localStorage.setItem("avatar", response.data.userData.avatar);
                setAccessToken(localStorage.getItem('accessToken'))
                const decodedToken = jwtDecode(accessToken)
                localStorage.setItem('role', decodedToken.role)
                setRole(localStorage.getItem('role'))

                sweetalert("Success", "Login successfully!", "success").then(() => {
                    handleClose();
                    navigate(`/course/${cid}`)
                });

                setEmail("");
                setPassword("");
            }
        } catch (error) {
            sweetalert("Error", error.response?.data?.mes || "Login failed!", "error");
        }
    };


    const handleEnroll = async () => {
        try {
            const response = await axios.post(`${API_BASE_URL}/enrollment/${cid}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,  // Gửi token chính xác
                        // "Content-Type": "application/json"
                    },
                    withCredentials: true // Nếu backend yêu cầu cookie
                }
            );
            console.log(response.data);
            sweetalert("Success", "Enrollment successful!", "success");
        } catch (error) {
            console.error("Enrollment error:", error);
            sweetalert("Error", error.response?.data?.message || "Enrollment failed!", "error");
        }
    };



    // Function to download file using the provided download link
    // const handleDownload = (downloadLink, originalFileName) => {
    //     if (!downloadLink) {
    //         console.error("Download link not available");
    //         return;
    //     }

    //     // Tạo thẻ `<a>` ẩn để tải file về với đúng tên file
    //     const link = document.createElement("a");
    //     link.href = downloadLink;
    //     link.setAttribute("download", originalFileName); // Giữ đúng định dạng file
    //     document.body.appendChild(link);
    //     link.click();
    //     document.body.removeChild(link);
    // };

    const handleDownload = async (lecture) => {
        if (!accessToken) {
            sweetalert("Error", "You need to login course to download", "error");
            return
        }

        if (!isEnroll) {
            sweetalert("Error", "You need to enroll course to download", "error");
            return
        }


        if (!lecture.downloadLink) {
            console.error("Download link not available");
            return;
        }

        try {
            const response = await fetch(lecture.downloadLink);
            if (!response.ok) {
                throw new Error("Failed to fetch file");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');

            link.href = url;
            link.setAttribute('download', lecture.originalFileName || 'downloaded_file'); // Giữ đúng tên file
            document.body.appendChild(link);
            link.click();

            // Giải phóng URL sau khi tải xong
            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);
        } catch (error) {
            console.error("Error downloading file:", error);
        }
    };

    // Function to get a display name for the file
    const getFileDisplayName = (lecture) => {
        if (lecture.originalFileName) {
            return lecture.originalFileName;
        } else {
            // If no original filename, create one from the title
            const fileExtension = lecture.file ? lecture.file.split('.').pop() : 'pdf';
            return `${lecture.title}.${fileExtension}`;
        }
    };

    return (
        <>
            {/* Header */}
            <div className="container-fluid page-header" style={{ marginBottom: 50 }}>
                <div className="container">
                    <div
                        className="d-flex flex-column justify-content-center"
                        style={{ minHeight: 300 }}
                    >
                        <h3 className="display-4 text-white text-uppercase">Courses</h3>
                        <div className="d-inline-flex text-white">
                            <p className="m-0 text-uppercase">
                                <Link className="text-white" to="/">
                                    Home
                                </Link>
                            </p>
                            <i className="bi bi-chevron-double-right" style={{ marginLeft: "10px", marginRight: '10px' }}></i>
                            <p className="m-0 text-uppercase">
                                <Link className="text-white" to="/course">
                                    Courses
                                </Link>
                            </p>
                            <i className="bi bi-chevron-double-right" style={{ marginLeft: "10px", marginRight: '10px' }}></i>
                            <p className="m-0 text-uppercase">Detail</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Course Info */}
            <div className="container-fluid py-5">
                <div className="container py-5">
                    <div className="row">
                        <div className="col-lg-8">
                            <div className="mb-5">
                                <h1 className="mb-5">
                                    {course.title}
                                </h1>
                                <img className="img-fluid rounded w-100 mb-4" src={course.image} alt="" />

                                <p>
                                    {course.description}
                                </p>
                                {role == 'student' && (<button className='btn btn-primary mb-3' disabled={isEnroll ? true : false} onClick={accessToken ? handleEnroll : handleShow}>
                                    <p style={{ marginBottom: "-7px" }}>{isEnroll ? 'Enrolled' : 'Enroll'}</p>
                                    {/* <br /> */}
                                    <span style={{ fontSize: '12px' }}> {isEnroll ? `At ${enrolledDate}` : `Starts ${currentDate}`}</span>
                                </button>)}

                                {/* Course Content */}
                                <h2 className="mb-4">Course Content</h2>


                                <Accordion>
                                    {Array.isArray(lectures) && lectures.length > 0 ? (
                                        lectures.map((lecture, index) => (
                                            <Accordion.Item eventKey={index.toString()} key={`lecture-${index}`}>
                                        <Accordion.Header>{lecture.title}</Accordion.Header>
                                        <Accordion.Body style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                {lecture.content}
                                            </div>
                                            {lecture.file && (
                                                <div>
                                                    <button className='btn btn-primary'
                                                        onClick={() => handleDownload(lecture)}
                                                        title={getFileDisplayName(lecture)}
                                                    >
                                                        <i className="bi bi-download" style={{ marginRight: '8px' }}></i>
                                                        Download file
                                                        {/* {lecture.originalFileName && 
                                                                    <span className="ms-1">({getFileDisplayName(lecture)})</span>
                                                                } */}
                                                    </button>
                                                </div>
                                            )}
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    ))
                                    ) : (
                                    <p>No lectures available for this course.</p>
                                    )}
                                </Accordion>
                            </div>
                        </div>
                        <div className="col-lg-4 mt-5 mt-lg-0">
                            {/* Author Bio */}
                            <div className="d-flex flex-column text-center bg-dark rounded mb-5 py-5 px-4">
                                <img
                                    src="/avatar.jpg"
                                    className="img-fluid rounded-circle mx-auto mb-3"
                                    style={{ width: 100 }}
                                    alt="Teacher"
                                />
                                <h3 className="text-primary mb-3">{teacherName}</h3>
                                <h3 className="text-uppercase mb-4" style={{ letterSpacing: 5 }}>
                                    Tag Cloud
                                </h3>
                                <p className="text-white m-0">
                                    Conset elitr erat vero dolor ipsum et diam, eos dolor lorem, ipsum
                                    sit no ut est ipsum erat kasd amet elitr
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title style={{ marginLeft: "200px" }}>Login</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Email address</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" style={{ padding: "10px 20px" }} onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" style={{ padding: "10px 20px" }} onClick={handleLogin}>
                        Login
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default CourseDetail;