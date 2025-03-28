import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";  // Import Layout mới tạo
import Homepage from "./components/Homepage";
import Courses from "./components/Courses";
import CourseDetail from "./components/CourseDetail";
import MyCourse from "./components/MyCourse";
import UpdateCourse from "./components/UpdateCourse";
import ViewStudent from "./components/ViewStudent";
import CreateCourse from "./components/CreateCourse";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Homepage />} />
        <Route path="course" element={<Courses />} />
        <Route path="course/:cid" element={<CourseDetail/>} />
        <Route path="my-course" element={<MyCourse/>} />
        <Route path="update-course/:cid" element={<UpdateCourse/>} />
        <Route path="create" element={<CreateCourse/>} />
        <Route path="view-student/:cid" element={<ViewStudent/>} />
      </Route>
    </Routes>
  );
}

export default App;