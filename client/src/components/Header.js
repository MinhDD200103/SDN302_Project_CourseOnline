import { Navbar, Container, Nav, Form, Button } from "react-bootstrap";

export default function Header() {
  return (
    <Container fluid style={{ paddingLeft: '0px', paddingRight: '0px' }}>
      <Navbar expand="lg" className="bg-body" style={{ paddingBottom: '0px', width:'90%', margin: 'auto' }}>
        <Container fluid>
          <Navbar.Brand href="#home">Course Online</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            {/* Search Bar with Button Inside */}
            <Form className="d-flex me-auto position-relative">
              <Form.Control
                type="search"
                placeholder="What do you want to learn?"
                className="me-2 rounded-pill pe-5"
                aria-label="Search"
                style={{ width: '300px', marginLeft: '20px' }}
                
              />
              <Button 
                variant="primary" 
                className="rounded-circle position-absolute"
                style={{ right: '12px', top: '50%', transform: 'translateY(-50%)', width: '30px', height: '30px', padding: '0' }}
              >
                <i className="bi bi-search"></i>
              </Button>
            </Form>
            
            {/* Right-side navigation items */}
            <Nav style={{marginRight: '0px'}}>
              
              <Button variant="outline-primary" className="ms-2 rounded">Log in</Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <hr/>
    </Container>
  );
}