import { useParams } from "react-router-dom";

const UpdateCourse = () => {
    const {cid} = useParams
    console.log(cid);
    
    return (
        <>
            <p>Update Course</p>
        </>
    );
}

export default UpdateCourse