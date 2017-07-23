import React from 'react'
import { withRouter } from 'react-router-dom'
import { LinkContainer } from 'react-router-bootstrap'
import { Navbar, NavbarBrand, Nav, Glyphicon,
         Col, NavItem, NavDropdown, MenuItem } from 'react-bootstrap'
import './App.css'
import navLogo from '../../img/hireblack-logo-no-border.svg'

/*
  The .active class is being applied to '/' even when it isn't the current
  location.pathname because all other paths are its children. This method
  corrects for that.
*/
const onlyOneActiveMatch = (match, location) => {
  if (match) return location.pathname === match.path
  else return false
}

const NavBar = props => (
  <Navbar fixedTop collapseOnSelect>
    <Navbar.Header>
      <NavbarBrand>
        <LinkContainer to='/'>
          <img src={navLogo} alt='HireBlack logo' height='40px' width='40px' />
        </LinkContainer>
      </NavbarBrand>
        <Col
          xsHidden={!props.user}
          onClick={props.toggleDashMenu}
          className='Dashboard-menuToggle'
          xs={3} smHidden mdHidden lgHidden
        >
          <Glyphicon glyph='cog' />
        </Col>
      <Navbar.Toggle />
    </Navbar.Header>
    <Navbar.Collapse>
      <Nav>
        <LinkContainer eventKey={1} to='/' isActive={onlyOneActiveMatch}>
          <NavItem>Home</NavItem>
        </LinkContainer>
        <LinkContainer eventKey={2} to='/about' isActive={onlyOneActiveMatch}>
          <NavItem>About</NavItem>
        </LinkContainer>
        {
          props.user
            ? <LinkContainer to='#' eventKey={3} className='dropdown-hover'>
                <NavDropdown title='Account' id='account-dropdown'>
                  <LinkContainer
                    to={
                      props.user.is_employer
                        ? '/dashboard/manage-jobs'
                        : '/dashboard/saved-jobs'
                    }
                    eventKey={3.1}
                  >
                    <MenuItem>Dashboard</MenuItem>
                  </LinkContainer>
                  <LinkContainer to='#' eventKey={3.1} onClick={props.logOut(props.history)}>
                    <MenuItem >Logout</MenuItem>
                  </LinkContainer>
                </NavDropdown>
              </LinkContainer>

            : <LinkContainer to='#' eventKey={3} className='dropdown-hover'>
                <NavDropdown title='Account' id='account-dropdown'>
                  <LinkContainer to='/login' eventKey={3.1}>
                    <MenuItem>Login</MenuItem>
                  </LinkContainer>
                  <LinkContainer to='/register' eventKey={3.2}>
                    <MenuItem>Register</MenuItem>
                  </LinkContainer>
                </NavDropdown>
              </LinkContainer>
        }
      </Nav>
      <Nav pullRight>
        <LinkContainer to='/dashboard/post-new-job'>
          <NavItem><span className='btn-oval'>Post a job</span></NavItem>
        </LinkContainer>
      </Nav>
    </Navbar.Collapse>
  </Navbar>
)

export default withRouter(NavBar)
