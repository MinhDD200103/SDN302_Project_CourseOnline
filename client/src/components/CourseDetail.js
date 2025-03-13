import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/config';
import { Accordion } from 'react-bootstrap';

const CourseDetail = () => {
    const [course, setCourse] = useState({});
    const { cid } = useParams();
    const [teacherName, setTeacherName] = useState('');
    const [lectures, setLectures] = useState([]);

    useEffect(() => {
        const fetchClass = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/class/${cid}`);
                console.log(response.data.class.lectures);
                setLectures(response.data.class.lectures);
                setCourse(response.data.class);
                setTeacherName(response.data.class.createdBy.name);
            } catch (error) {
                console.log("Cannot get class from server", error);
            }
        }

        fetchClass();
    }, [cid]);

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

                                {/* Course Content */}
                                <h2 className="mb-4">Course Content</h2>

                                <Accordion>
                                    {Array.isArray(lectures) && lectures.length > 0 ? (
                                        lectures.map((lecture, index) => (
                                            <Accordion.Item eventKey={index.toString()} key={`lecture-${index}`}>
                                                <Accordion.Header>{lecture.title}</Accordion.Header>
                                                <Accordion.Body style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
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
        </>
    );
}

export default CourseDetail;