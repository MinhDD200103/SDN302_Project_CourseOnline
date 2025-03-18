import { Link } from 'react-router-dom'
import axios from 'axios';
import { useEffect, useState } from 'react';
import API_BASE_URL from '../config/config';
import { Pagination } from 'react-bootstrap'

export default function Courses() {
    const [classes, setClasses] = useState([])
    const [totalPages, setTotalPages] = useState(0)
    const [currentPage, setCurrentPage] = useState(1) // Đặt giá trị mặc định là 1 thay vì 0
    const [limit, setLimit] = useState(3) // Thêm state cho limit, mặc định hiển thị 6 khóa học mỗi trang
    const [title, setTitle] = useState('')

    const fetchClasses = async () => {
        try {
            let query = `${API_BASE_URL}/class?page=${currentPage}&limit=${limit}`
            if (title.trim() !== "")
                query += `&title=${title}`;
            console.log(query);
            console.log(title);

            const response = await axios.get(query)
            console.log(response.data);
            setClasses(response.data.classes)
            setCurrentPage(response.data.currentPage);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Error fetching classes:', error)
        }
    }

    useEffect(() => {
        fetchClasses()
    }, [currentPage, limit]) // Thêm limit vào dependencies

    const handleSearch = () => {
        setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
        fetchClasses();
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        // Scroll lên đầu trang khi chuyển trang
        // window.scrollTo(0, 0);
    }

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
                                <Link className="text-white" to="/">Home</Link>
                            </p>
                            <i className="bi bi-chevron-double-right" style={{ margin: "0 10px" }}></i>
                            <p className="m-0 text-uppercase">
                                <Link className="text-white" to="/course">Courses</Link>
                            </p>
                            {/* <i className="bi bi-chevron-double-right" style={{ margin: "0 10px" }}></i>
                            <p className="m-0 text-uppercase">Detail</p> */}
                        </div>
                        {/* Search Box */}
                        <div className="d-flex align-items-center position-relative mt-4">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="What do you want to learn?"
                                style={{
                                    maxWidth: "400px",
                                    borderRadius: "50px",
                                    padding: "22px 27px",
                                    paddingRight: "50px",
                                }}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                            <button
                                className="btn btn-primary position-absolute"
                                style={{
                                    borderRadius: "50%",
                                    width: "40px",
                                    height: "40px",
                                    left: '355px',
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                                onClick={handleSearch}
                            >
                                <i className="bi bi-search"></i>
                            </button>
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
                        <h1>Our Popular Courses</h1>
                    </div>

                    {/* Course List */}
                    <div className="row">
                        {classes?.map((course) => (
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

                    {/* Pagination - Đã được cải thiện */}
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
                </div>
            </div>
        </>
    );
}
