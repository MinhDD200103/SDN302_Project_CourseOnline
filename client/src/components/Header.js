import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import sweetalert from "sweetalert";
import { Button, Form, Modal, Dropdown } from "react-bootstrap";
import API from "../axiosConfig";
import { jwtDecode } from "jwt-decode";

export default function Header() {
  const location = useLocation();
  const path = location.pathname;
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("");

  const navigate = useNavigate();

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // Kiểm tra token khi component được mount và khi location thay đổi
  useEffect(() => {
    checkTokenValidity();
    
    // Đăng ký một event listener để bắt sự kiện storage thay đổi
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup listener khi component unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [location]); // Thêm location vào dependencies để kiểm tra mỗi khi người dùng chuyển trang

  // Xử lý khi localStorage thay đổi (từ tab/window khác)
  const handleStorageChange = (e) => {
    if (e.key === 'accessToken') {
      checkTokenValidity();
    }
  };

  // Hàm kiểm tra tính hợp lệ của token
  const checkTokenValidity = () => {
    const token = localStorage.getItem("accessToken");
    
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        // Nếu token đã hết hạn
        if (decodedToken.exp < currentTime) {
          // Axios interceptor sẽ tự động xử lý refresh token
          // Chúng ta chỉ cần gọi một API request bất kỳ để kích hoạt
          API.get("/user/current")
            .then(response => {
              // Nếu refresh token thành công, interceptor đã cập nhật token mới
              // Cập nhật state với thông tin người dùng
              setIsLoggedIn(true);
              setUserEmail(localStorage.getItem("email"));
              setUserRole(localStorage.getItem("role"));
            })
            .catch(error => {
              // Nếu có lỗi và không thể refresh, interceptor sẽ đăng xuất người dùng
              setIsLoggedIn(false);
              setUserEmail("");
              setUserRole("");
            });
        } else {
          // Token vẫn còn hiệu lực
          setIsLoggedIn(true);
          setUserEmail(localStorage.getItem("email"));
          setUserRole(localStorage.getItem("role"));
        }
      } catch (error) {
        // Nếu có lỗi khi giải mã token, xóa token từ localStorage
        handleLogout();
      }
    } else {
      setIsLoggedIn(false);
    }
  };

  const handleLogin = async () => {
    try {
        const response = await API.post("/user/login", { email, password });

        if (response.data.success) {
            localStorage.setItem("accessToken", response.data.accessToken);
            localStorage.setItem("email", response.data.userData.email);
            
            const decodedToken = jwtDecode(response.data.accessToken);
            localStorage.setItem('role', decodedToken.role);
            
            if (decodedToken.role === 'teacher') {
                localStorage.setItem('tid', decodedToken._id);
            }

            setIsLoggedIn(true);
            setUserEmail(response.data.userData.email);
            setUserRole(decodedToken.role);

            sweetalert("Success", "Login successfully!", "success");
            handleClose();
            setEmail("");
            setPassword("");
            
            // Kích hoạt sự kiện storage và courseLogin để các component khác biết có thay đổi
            window.dispatchEvent(new Event('storage'));
            window.dispatchEvent(new Event('courseLogin'));
        }
    } catch (error) {
        sweetalert("Error", error.response?.data?.mes || "Login failed!", "error");
    }
};

  const handleLogout = async () => {
    try {
      await API.get("/user/logout");

      localStorage.removeItem("accessToken");
      localStorage.removeItem("email");
      localStorage.removeItem("role");
      localStorage.removeItem("tid");
      
      setIsLoggedIn(false);
      setUserEmail("");
      setUserRole("");

      // Kích hoạt sự kiện storage để các component khác biết có thay đổi
      window.dispatchEvent(new Event('storage'));

      sweetalert("Success", "Logged out successfully!", "success").then(() => {
        navigate("/");
      });
    } catch (error) {
      sweetalert("Error", error.response?.data?.message || "Logout failed!", "error");
    }
  };


  return (
    <>
      <div className="container-fluid">
        <div className="row align-items-center py-3 px-xl-5">
          <div className="col-lg-3">
            <a href="" className="text-decoration-none">
              <h1 className="m-0">
                <span className="text-primary">E</span>COURSES
              </h1>
            </a>
          </div>
          <div className="col-lg-9">
            <nav className="navbar navbar-expand-lg bg-light navbar-light py-0">
              <button
                type="button"
                className="navbar-toggler"
                data-toggle="collapse"
                data-target="#navbarCollapse"
              >
                <span className="navbar-toggler-icon" />
              </button>
              <div className="collapse navbar-collapse justify-content-between" id="navbarCollapse">
                <div className="navbar-nav py-0">
                  <Link to="/" className={`nav-item nav-link ${path === "/" ? "active" : ""}`}>
                    Home
                  </Link>
                  <Link to="/course" className={`nav-item nav-link ${path === "/course" ? "active" : ""}`}>
                    Courses
                  </Link>
                  {isLoggedIn && (
                    <Link to="/my-course" className={`nav-item nav-link ${path === "/my-course" ? "active" : ""}`}>
                      My Courses
                    </Link>
                  )}

                  {isLoggedIn && userRole === 'teacher' && (
                    <Link to="/create" className={`nav-item nav-link ${path === "/create" ? "active" : ""}`}>
                      Create Course
                    </Link>
                  )}
                </div>

                {isLoggedIn ? (
                  <Dropdown className="user-dropdown">
                    <Dropdown.Toggle variant="light" className="user-dropdown-toggle">
                      <img src="/avatar.jpg" alt="Avatar" className="user-avatar" />
                      <span className="user-email">{userEmail}</span>
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                      <Dropdown.Item href="#/profile">Profile</Dropdown.Item>
                      <Dropdown.Item as={Link} to={"/my-course"}>
                        My Courses
                      </Dropdown.Item>
                      <Dropdown.Item onClick={handleLogout}>Log Out</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                ) : (
                  <button className="btn btn-primary py-2 px-4 ml-auto" onClick={handleShow}>
                    Login
                  </button>
                )}
              </div>
            </nav>
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

      {/* CSS */}
      <style>
        {`
          .user-dropdown {
            display: flex;
            align-items: center;
          }

          .user-dropdown-toggle {
            display: flex;
            align-items: center;
           
            color: black;
            border: none;
            padding: 5px 10px;
            border-radius: 5px;
          }

          .user-avatar {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            margin-right: 8px;
          }

          .user-email {
            font-size: 14px;
          }

          .user-dropdown-toggle::after {
            display: none;
          }
        `}
      </style>
    </>
  );
}