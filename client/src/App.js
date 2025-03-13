import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";  // Import Layout mới tạo
import Homepage from "./components/Homepage";
import Courses from "./components/Courses";
import CourseDetail from "./components/CourseDetail";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Homepage />} />
        <Route path="course" element={<Courses />} />
        <Route path="course/:cid" element={<CourseDetail/>} />
      </Route>
    </Routes>
  );
}

export default App;