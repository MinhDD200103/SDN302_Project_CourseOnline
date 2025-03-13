import { Link, useLocation } from "react-router-dom";

export default function Header() {
  const location = useLocation();
  const path = location.pathname;

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
                  {/* Các mục điều hướng khác có thể được thêm vào đây */}
                </div>
                <a
                  className="btn btn-primary py-2 px-4 ml-auto"
                  href=""
                >
                  Join Now
                </a>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}