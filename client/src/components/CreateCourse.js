import { Container, Row, Col, Card, Button, Form, Image } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import '../styletemplate/css/CreateCourse.css'

export default function CreateCourse() {

    const [page, setPage] = useState(0);

    const [formData, setFormData] = useState({
        //trang 1
        licensePlate: '', //Biển số xe
        brand: '',
        model: '',
        color: '',
        seats: 4,
        productionYear: 2024,
        transmissionType: 'Số tự động', //Số sàn hoặc số tự động
        fuelType: 'Xăng',
        fuelConsumption: '10',
        description: '',
        additionalFunction: [],
        //trang 2
        mileage: 0, //Số quãng đường đã đi đc
        price: 470,
        deposit: 0,
        address: '',
        termOfUse: '',
        //trang 3
        images: {},
        //tạm thời cho mặc định
        carOwner: 'Minh'
    });

    const [newFormData, setNewFormData] = useState({ ...formData });

    // const handleChangeForm = (e) => {
    //     setNewFormData({ ...newFormData, [e.target.name]: e.target.value });
    // }

    const handleChangeForm = (e) => {
        const { name, value, type } = e.target;

        setNewFormData((prev) => ({
            ...prev,
            [name]:
                type === "number" || (!isNaN(value) && ["seats", "productionYear", "price", "deposit", "mileage"].includes(name))
                    ? +value : value
        }));
    };



    const handleNextPage = () => {
        if (page === 2) {
            alert(`Submit form: ${JSON.stringify(newFormData)}`);
            setPage(0);
            setNewFormData({ ...formData });
        } else {
            setPage(page + 1);
        }

    };

    const handlePreviousPage = () => {
        setPage(page - 1);

    }

    const renderPage = () => {



        switch (page) {
            case 0:
                return <CarInformation newFormData={newFormData} handleChangeForm={handleChangeForm} />;
            case 1:
                return <CarHired newFormData={newFormData} handleChangeForm={handleChangeForm} />;
            case 2:
                return <CarImages newFormData={newFormData} handleChangeForm={handleChangeForm} />;
            default:
                return null;
        }
    };

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [page]);

    return (
        <>
            <div className="container-fluid page-header" style={{ paddingBottom: 50 }}>
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
            <Container fluid className="register-car-page-container">
                {/* <Row>
                    <span style={{ marginLeft: '30px' }}>
                        <i class="bi bi-chevron-left" ></i> &nbsp;
                        <Link to={"/viewprofile/registercar"} style={{ color: 'black', textDecoration: 'none' }}>Quay lại</Link>
                    </span>

                </Row> */}

                <Row>
                    <Col>
                        <h2 style={{ textAlign: 'center', marginBottom: '40px', marginTop:'50px' }}>Create Course</h2>
                    </Col>
                </Row>

                <Row>
                    <Col md={{ span: 8, offset: 2 }}>
                        <Card style={{ border: 'none', borderRadius: '0px' }}>
                            <Card.Text className="card-header-container">
                                <ul>
                                    <li className={page == 0 ? "circle-option-active" : "circle-option-deactive"}>1
                                    </li>
                                    <li>
                                        <i class="bi bi-chevron-right"></i>
                                    </li>
                                    <li className={page == 1 ? "circle-option-active" : "circle-option-deactive"}>2</li>
                                    <li>
                                        <i class="bi bi-chevron-right"></i>
                                    </li>
                                    <li className={page == 2 ? "circle-option-active" : "circle-option-deactive"}>3</li>
                                </ul>

                            </Card.Text>

                            <Card.Text className="card-body-container">
                                {renderPage()}
                            </Card.Text>

                            <Card.Footer className="card-footer-container">
                                <Button disabled={page == 0 ? true : false} onClick={handlePreviousPage} className="footer-btn">Previous</Button>
                                <Button  onClick={handleNextPage} className="footer-btn ">{page == 2 ? "Submit" : "Next"}</Button>
                            </Card.Footer>


                        </Card>
                    </Col>
                </Row>


            </Container>
        </>
    );
}

function CarInformation({ newFormData, handleChangeForm }) {
    const year = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014];

    const numberOfSeats = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

    const transmission = ["Số sàn", "Số tự động"];

    const fuel = ["Xăng", "Dầu diesel", "Điện", "Xăng điện"];

    const addFunction = [
        { image: "/map.png", name: "Bản đồ" },
        { image: "/bluetooth.png", name: "Bluetooth" },
        { image: "/cam360.png", name: "Camera 360" },
        { image: "/camht.png", name: "Camera hành trình" },
        { image: "/gps.png", name: "Định vị GPS" },
        { image: "/usb.png", name: "Khe cắm USB" }
    ];

    console.log(newFormData);


    const toggleSelect = (feature) => {
        const updatedFunctions = newFormData.additionalFunction.includes(feature.name)
            ? newFormData.additionalFunction.filter((f) => f !== feature.name) // Deselect
            : [...newFormData.additionalFunction, feature.name]; // Select

        handleChangeForm({
            target: {
                name: "additionalFunction",
                value: updatedFunctions,
            },
        });
    };

    return (
        <Container className="car-infor-container">
            <Form>
                {/* <h6 className="car-register-title">Title</h6>
                <span className="note">
                    Lưu ý: Biển số sẽ không thể thay đổi sau khi đăng ký.
                </span>

                <Form.Group className="mb-5 col-md-6">
                    <Form.Control
                        type="text"
                        name="licensePlate"
                        value={newFormData.licensePlate}
                        onChange={handleChangeForm}
                    />
                </Form.Group> */}

                <h6 className="car-register-title">Course Information</h6>

                <Row>

                    {/* Hãng xe */}
                    <Form.Group className="mb-3 col-md-6">
                        <Form.Label className="form-lable-basic-infor">Title</Form.Label>
                        <Form.Control
                            type="text"
                            name="title"
                            value={newFormData.title}
                            onChange={handleChangeForm}
                        />
                    </Form.Group>

                    {/* <Form.Group className="mb-3 col-md-6">
                        <Form.Label className="form-lable-basic-infor">Mẫu xe</Form.Label>
                        <Form.Select
                            disabled={newFormData.brand == '' ? true : false}
                            onChange={handleChangeForm}
                            name="model"
                            value={newFormData.model}
                        >
                            <option>{newFormData.brand == '' ? 'Chọn hãng xe trước' : 'Chưa chọn'}</option>
                            <option value="1">One</option>
                            <option value="2">Two</option>
                            <option value="3">Three</option>
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3 col-md-6">
                        <Form.Label className="form-lable-basic-infor">Số ghế</Form.Label>

                        <Form.Select onChange={handleChangeForm} name="seats" value={newFormData.seats}>
                            {
                                numberOfSeats.map((seat, index) => (
                                    <option key={`seat-${index}`} value={+seat}>{seat}</option>
                                ))
                            }
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3 col-md-6">
                        <Form.Label className="form-lable-basic-infor">Năm sản xuất</Form.Label>

                        <Form.Select onChange={handleChangeForm} name="productionYear" value={newFormData.productionYear}>
                            {
                                year.map((year, index) => (
                                    <option key={`year-${index}`} value={+year}>{year}</option>
                                ))
                            }
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3 col-md-6">
                        <Form.Label className="form-lable-basic-infor">Truyền động</Form.Label>

                        <Form.Select onChange={handleChangeForm} name="transmissionType" value={newFormData.transmissionType}>
                            {
                                transmission.map((trans, index) => (
                                    <option key={`trans-${index}`} value={trans}>{trans}</option>
                                ))
                            }
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3 col-md-6">
                        <Form.Label className="form-lable-basic-infor">Loại nhiên liệu</Form.Label>

                        <Form.Select onChange={handleChangeForm} name="fuelType" value={newFormData.fuelType}>
                            {
                                fuel.map((fuel, index) => (
                                    <option key={`fuel-${index}`} value={fuel}>{fuel}</option>
                                ))
                            }
                        </Form.Select>
                    </Form.Group> */}
                </Row>

                {/* Mức tiêu thụ nhiên liệu */}
                {/* <h6 className="car-register-title" style={{ marginTop: "20px" }}>Mức tiêu thụ nhiên liệu</h6>
                <span className="script">
                    Số lít nhiên liệu cho quãng đường 100km.
                </span>
                <Form.Group className="mb-5 col-md-6">
                    <Form.Control
                        type="number"
                        name="fuelConsumption"
                        value={newFormData.fuelConsumption}
                        onChange={handleChangeForm}
                    />
                </Form.Group> */}

                {/* Mô tả */}
                <h6 className="car-register-title" style={{ marginTop: "20px", marginBottom: '20px' }}>Description</h6>
                <Form.Group className="mb-5 ">
                    <Form.Control
                        as="textarea" rows={3}
                        name="description"
                        value={newFormData.description}
                        onChange={handleChangeForm}
                        type="text"
                    />
                </Form.Group>

                {/* Tính năng */}
                {/* <h6 className="car-register-title" style={{ marginTop: '20px', marginBottom: '20px' }}>Tính năng</h6>
                <Row>
                    {addFunction.map((f, index) => (
                        <Col md={6} lg={4} key={index}>
                            <Card
                                onClick={() => toggleSelect(f)}
                                className={newFormData.additionalFunction.includes(f.name) ? "card-fnc-selected" : "card-fnc-nonselected"}
                            >
                                <Card.Text className="card-fnc-text-container">
                                    <Image src={`/images/${f.image}`} style={{ height: '50%' }} />
                                    <br />
                                    <span style={{ fontSize: '15px', color: 'black' }}>{f.name}</span>
                                </Card.Text>
                            </Card>
                        </Col>
                    ))}
                </Row> */}
            </Form>
        </Container>
    );
}

function CarHired({ newFormData, handleChangeForm }) {

    // const handlePrice = (e) => {
    //     handleChangeForm({
    //         target: {
    //             name: e.target.name,
    //             value: +e.target.value * 1000,
    //         },
    //     });
    // };

    console.log(newFormData);


    // const priceInK = newFormData.price / 1000 || 0;

    return (
        <Container className="car-infor-container">
            <h6 className="car-register-title">Đơn giá thuê mặc định</h6>
            <span className="script" style={{ marginBottom: '15px' }}>
                Đơn giá áp dụng cho tất cả các ngày
            </span>

            <span className="script" style={{ marginBottom: '20px' }}>
                Giá đề xuất: 470K
            </span>

            <Col className="car-price-container">
                <Form.Group className="col-md-6">
                    <Form.Control
                        type="number"
                        name="price"
                        value={newFormData.price}
                        onChange={handleChangeForm}
                    />
                </Form.Group>
                <span style={{ fontSize: '15px' }}>&nbsp;K</span>
            </Col>

            <h6 className="car-register-title" style={{ marginBottom: '20px' }}>Địa chỉ xe</h6>

            <Form.Group className="mb-5">
                <Form.Control
                    type="text"
                    name="address"
                    value={newFormData.address}
                    onChange={handleChangeForm}
                    placeholder="Địa chỉ mặc định để giao nhận xe."
                />
            </Form.Group>

            <h6 className="car-register-title" >Quãng đường đã đi</h6>
            <span className="script">
                Tổng số quãng đường xe đã di chuyển được (km)
            </span>

            <Form.Group className="mb-5 col-md-6">
                <Form.Control
                    type="number"
                    name="mileage"
                    value={newFormData.mileage}
                    onChange={handleChangeForm}
                />
            </Form.Group>

            <h6 className="car-register-title" >Giá đặt cọc xe</h6>

            <Form.Group className="mb-5 col-md-6 mt-4">
                <Form.Control
                    type="number"
                    name="deposit"
                    value={newFormData.deposit}
                    onChange={handleChangeForm}
                />
            </Form.Group>
        </Container>
    );
}

function CarImages({ newFormData, handleChangeForm }) {

    const [imagePreview, setImagePreview] = useState(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0]; // Get the selected file
        if (!file) return;

        // Generate preview and set image preview state
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);

        // Update the form data in the parent component
        handleChangeForm({
            target: {
                name: "images", // Input name to match form field
                value: file, // Pass the file object
            },
        });
    };

    console.log(newFormData);


    return (
        <Container className="car-infor-container">
            <h6 className="car-register-title">Hình ảnh</h6>
            <span className="script">
                Đăng nhiều hình ở các góc độ khác nhau để tăng thông tin cho xe của bạn.
            </span>

            {/* <Form.Control type="file" multiple className="car-image-input" /> */}
            {/* <input type="file" className="car-image-input"/> */}
            <Container style={{ display: 'flex', justifyContent: 'space-evenly' }}>
                <Form.Group controlId="formFile" className="mb-3 col-md-7">
                    <div className="upload-container">
                        <label htmlFor="file-upload" className="upload-label">
                            {imagePreview ? (
                                <div className="preview-box">
                                    <img src={imagePreview} alt="Preview" className="preview-img" />
                                </div>
                            ) : (
                                <>
                                    <i className="bi bi-cloud-arrow-up"></i>
                                    <p>Chọn hình ảnh</p>
                                </>
                            )}
                        </label>
                        <input
                            id="file-upload"
                            type="file"
                            hidden
                            onChange={handleFileChange} // Handle file upload
                        />
                    </div>
                </Form.Group>

                <Form.Group controlId="formFile" className="mb-3 col-md-4">
                    <div className="upload-container">
                        <label htmlFor="file-upload" className="upload-label">
                            {imagePreview ? (
                                <div className="preview-box">
                                    <img src={imagePreview} alt="Preview" className="preview-img" />
                                </div>
                            ) : (
                                <>
                                    <i className="bi bi-cloud-arrow-up"></i>
                                    <p>Chọn hình ảnh</p>
                                </>
                            )}
                        </label>
                        <input
                            id="file-upload"
                            type="file"
                            hidden
                            onChange={handleFileChange} // Handle file upload
                        />
                    </div>
                </Form.Group>
            </Container>
        </Container>
    );
}