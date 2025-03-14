import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import sweetalert from "sweetalert";
import { Button, Form, Modal } from 'react-bootstrap';
import API from "../axiosConfig";

export default function Header() {
  const location = useLocation();
  const path = location.pathname;
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const accessToken = localStorage.getItem('accessToken')

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);


  const handleLogin = async () => {
    try {
      const response = await API.post("/user/login", { email, password });

      if (response.data.success) {
        localStorage.setItem("accessToken", response.data.accessToken);
        sweetalert("Success", "Login successful!", "success");
        handleClose(); // Đóng modal sau khi login thành công
      }
    } catch (error) {
      sweetalert("Error", error.response?.data?.mes || "Login failed!", "error");
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
              <div
                className="collapse navbar-collapse justify-content-between"
                id="navbarCollapse"
              >
                <div className="navbar-nav py-0">
                  <Link
                    to="/"
                    className={`nav-item nav-link ${path === "/" ? "active" : ""}`}
                  >
                    Home
                  </Link>
                  <Link
                    to="/course"
                    className={`nav-item nav-link ${path === "/course" ? "active" : ""}`}
                  >
                    Courses
                  </Link>

                  {
                    accessToken && (<Link
                      to="/my-course"
                      className={`nav-item nav-link ${path === "/my-course" ? "active" : ""}`}
                    >
                      My Courses
                    </Link>)
                  }

                </div>
                <button
                  className="btn btn-primary py-2 px-4 ml-auto"
                  onClick={handleShow}
                >
                  Join Now
                </button>
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
          <Button variant="primary" style={{ padding: "10px 20px" }} onClick={handleLogin}>
            Login
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
