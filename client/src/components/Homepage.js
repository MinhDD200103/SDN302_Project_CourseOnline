import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/config';


export default function Homepage() {
    // const [classes, setClasses] = useState([]);
    const [latestClasses, setLatestClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [popularClasses, setPopularClasses] = useState([])

    useEffect(() => {


        // Fetch các lớp học mới nhất
        const fetchLatestClasses = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/class/latest`);
                console.log(response.data);
                setLatestClasses(response.data.classes);

            } catch (err) {
                console.error('Error fetching latest classes:', err);
                setError('Failed to load latest classes');
            } finally {
                setLoading(false);
            }
        };

        const fetchPopularClasses = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/class/most-popular`);
                console.log('popular class',response.data);
                // setLatestClasses(response.data.classes);
                setPopularClasses(response.data.classes)

            } catch (err) {
                console.error('Error fetching latest classes:', err);
                setError('Failed to load latest classes');
            } 
            finally {
                setLoading(false);
            }
        };

        // fetchClasses();
        fetchPopularClasses();
        fetchLatestClasses();
    }, []);



    return (
        <>
            {/* Carousel  */}
            <div className="container-fluid p-0 pb-5 mb-0">
                <div
                    id="header-carousel"
                    className="carousel slide carousel-fade"
                    data-ride="carousel"
                >
                    <ol className="carousel-indicators">
                        <li
                            data-target="#header-carousel"
                            data-slide-to={0}
                            className="active"
                        />
                        <li data-target="#header-carousel" data-slide-to={1} />
                        <li data-target="#header-carousel" data-slide-to={2} />
                    </ol>
                    <div className="carousel-inner w-100">
                        <div className="carousel-item active w-100" style={{ minHeight: 300 }}>
                            <img
                                className="position-relative w-100"
                                src="./carousel-1.jpg"
                                style={{ minHeight: 300, objectFit: "cover" }}
                            />
                            <div className="carousel-caption d-flex align-items-center justify-content-center">
                                <div className="p-5" style={{ width: "60%" }}>
                                    <h5 className="text-white text-uppercase mb-md-3">
                                        Best Online Courses
                                    </h5>
                                    <h1 className="display-3 text-white mb-md-4">
                                        Best Education From Your Home
                                    </h1>
                                </div>
                            </div>
                        </div>
                        <div className="carousel-item" style={{ minHeight: 300 }}>
                            <img
                                className="position-relative w-100"
                                src="./carousel-2.jpg"
                                style={{ minHeight: 300, objectFit: "cover" }}
                            />
                            <div className="carousel-caption d-flex align-items-center justify-content-center">
                                <div className="p-5" style={{ width: "100%", maxWidth: 900 }}>
                                    <h5 className="text-white text-uppercase mb-md-3">
                                        Best Online Courses
                                    </h5>
                                    <h1 className="display-3 text-white mb-md-4">
                                        Best Online Learning Platform
                                    </h1>
                                </div>
                            </div>
                        </div>
                        <div className="carousel-item" style={{ minHeight: 300 }}>
                            <img
                                className="position-relative w-100"
                                src="./carousel-3.jpg"
                                style={{ minHeight: 300, objectFit: "cover" }}
                            />
                            <div className="carousel-caption d-flex align-items-center justify-content-center">
                                <div className="p-5" style={{ width: "100%", maxWidth: 900 }}>
                                    <h5 className="text-white text-uppercase mb-md-3">
                                        Best Online Courses
                                    </h5>
                                    <h1 className="display-3 text-white mb-md-4">
                                        New Way To Learn From Home
                                    </h1>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Poppular Courses List */}
            <div className="container-fluid " style={{paddingBottom: '0px', padding: '30px'}}>
                <div className="container py-5"     >
                    <div className="text-center mb-5">
                        <h5
                            className="text-primary text-uppercase mb-3"
                            style={{ letterSpacing: 5 }}
                        >
                            Courses
                        </h5>
                        <h1>Our Popular Courses</h1>
                    </div>

                    {loading ? (
                        <div className="text-center">
                            <div className="spinner-border text-primary" role="status">
                                <span className="sr-only">Loading...</span>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    ) : (
                        <div className="row">
                            {popularClasses.map((course) => (
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
                                                        <i className="bi bi-person-fill text-primary mr-2" />
                                                        {course.creatorName}
                                                    </h6>

                                                    <h6 className="m-0">
                                                        <i className="bi bi-book text-primary mr-2" />
                                                        {course.lectures.length} lectures
                                                    </h6>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="container-fluid" style={{paddingBottom: '48px', paddingTop: '0px'}}>
                <div className="container py-5">
                    <div className="text-center mb-5">
                       
                        <h1>Our Newest Courses</h1>
                    </div>

                    {loading ? (
                        <div className="text-center">
                            <div className="spinner-border text-primary" role="status">
                                <span className="sr-only">Loading...</span>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    ) : (
                        <div className="row">
                            {latestClasses.map((course) => (
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
                                                        <i className="bi bi-person-fill text-primary mr-2" />
                                                        {course.createdBy.name}
                                                    </h6>

                                                    <h6 className="m-0">
                                                        <i className="bi bi-book text-primary mr-2" />
                                                        {course.lectures.length} lectures
                                                    </h6>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}