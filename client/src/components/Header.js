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

  const accessToken = localStorage.getItem("accessToken");
  const userEmail = localStorage.getItem("email");
  // const userAvatar = localStorage.getItem("avatar") || "/default-avatar.png"; // Thêm avatar

  const navigate = useNavigate();

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);



  const handleLogin = async () => {
    try {
      const response = await API.post("/user/login", { email, password });

      if (response.data.success) {
        localStorage.setItem("accessToken", response.data.accessToken);
        localStorage.setItem("email", response.data.userData.email);
        // localStorage.setItem("avatar", response.data.userData.avatar);
        const decodedToken = jwtDecode(localStorage.getItem("accessToken"));
        localStorage.setItem('role', decodedToken.role)


        sweetalert("Success", "Login successfully!", "success");
        handleClose();
        setEmail("");
        setPassword("");
      }
    } catch (error) {
      sweetalert("Error", error.response?.data?.mes || "Login failed!", "error");
    }
  };

  console.log(localStorage.getItem('role'));


  const handleLogout = async () => {
    try {
      await API.get("/user/logout");

      localStorage.removeItem("accessToken");
      localStorage.removeItem("email");
      localStorage.removeItem("role")

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
                  {accessToken && (
                    <Link to="/my-course" className={`nav-item nav-link ${path === "/my-course" ? "active" : ""}`}>
                      My Courses
                    </Link>
                  )}

                  {accessToken && localStorage.getItem('role') == 'teacher' && (
                    <Link to="/create" className={`nav-item nav-link ${path === "/create" ? "active" : ""}`}>
                      Create Course
                    </Link>
                  )}
                </div>

                {accessToken ? (
                  <Dropdown className="user-dropdown">
                    <Dropdown.Toggle variant="light" className="user-dropdown-toggle">
                      <img src='/user.jpg' alt="Avatar" className="user-avatar" />
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
                    Join Now
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
