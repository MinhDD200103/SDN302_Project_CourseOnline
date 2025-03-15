import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API_BASE_URL from "../config/config";
import { jwtDecode } from "jwt-decode";

const MyCourse = () => {
    const [studentCourses, setStudentCourses] = useState([])
    const [teacherCourses, setTeacherCourses] = useState([])
    const accessToken = localStorage.getItem('accessToken')
    const [role, setRole] = useState('');

    useEffect(() => {
        const fetchUserCourses = async () => {
            try {
                if (!accessToken) {
                    console.log("No access token found");
                    return;
                }
                const decodedToken = jwtDecode(accessToken);
                setRole(decodedToken.role); // Cập nhật role

                const response = await axios.get(`${API_BASE_URL}/enrollment/my-classes`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                    withCredentials: true,
                });

                console.log(response.data.userClas);
                if (decodedToken.role === 'teacher') {
                    setTeacherCourses(response.data.userClass);
                } else {
                    setStudentCourses(response.data.userClass);
                }
            } catch (error) {
                console.log('Cannot load class from server', error);
            }
        };

        fetchUserCourses();
    }, []);

    console.log(teacherCourses);
    console.log(studentCourses);
    console.log(role);


    return (
        <>
            {/* Header */}
            <div className="container-fluid page-header" style={{ marginBottom: 50 }}>
                <div className="container">
                    <div
                        className="d-flex flex-column justify-content-center"
                        style={{ minHeight: 300 }}
                    >
                        <h3 className="display-4 text-white text-uppercase">My Courses</h3>
                        <div className="d-inline-flex text-white">
                            <p className="m-0 text-uppercase">
                                <Link className="text-white" to="/">
                                    Home
                                </Link>
                            </p>
                            <i className="bi bi-chevron-double-right" style={{ marginLeft: "10px", marginRight: '10px' }}></i>
                            <p className="m-0 text-uppercase">
                                My Courses
                            </p>

                        </div>
                    </div>
                </div>
            </div>

            <div className="container-fluid py-5">
                <div className="container py-5">
                    <div className="text-center mb-5">
                        <h4
                            className="text-primary text-uppercase mb-3"
                            style={{ letterSpacing: 5 }}
                        >
                            Courses
                        </h4>
                        <h1>My Courses</h1>
                    </div>

                    {/* Course List */}
                    <div className="row">
                        {role == 'teacher'
                            ? teacherCourses?.map((course) => (
                                <div key={course._id} className="col-lg-4 col-md-6 mb-4">
                                    <div className="rounded overflow-hidden mb-2">
                                        <img className="img-fluid" src={course.image} alt="" />
                                        <div className="bg-secondary p-4">
                                            <Link className="h5" to={`/course/${course._id}`}>
                                                {course.title}
                                            </Link>
                                            <div className="border-top mt-4 pt-4">
                                                <div className="d-flex justify-content-between">
                                                    <h6 className="m-0">
                                                        <i className="bi bi-person-fill text-primary me-2" />
                                                        {course.createdBy.name}
                                                    </h6>
                                                    <h6 className="m-0">
                                                        <i className="bi bi-book text-primary me-2" />
                                                        {course.lectures.length} lectures
                                                    </h6>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                            : studentCourses?.map((course) => (
                                <div key={course.classId._id} className="col-lg-4 col-md-6 mb-4">
                                    <div className="rounded overflow-hidden mb-2">
                                        <img className="img-fluid" src={course.classId.image} alt="" />
                                        <div className="bg-secondary p-4">
                                            <Link className="h5" to={`/course/${course.classId._id}`}>
                                                {course.classId.title}
                                            </Link>
                                            <div className="border-top mt-4 pt-4">
                                                <div className="d-flex justify-content-between">
                                                    <h6 className="m-0">
                                                        <i className="bi bi-person-fill text-primary me-2" />
                                                        {course.classId.createdBy.name}
                                                    </h6>
                                                    <h6 className="m-0">
                                                        <i className="bi bi-book text-primary me-2" />
                                                        {course.classId.lectures.length} lectures
                                                    </h6>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>

                </div>
            </div>
        </>
    );
}

export default MyCourse