import React from 'react'
import PropTypes from 'prop-types'
import { BrowserRouter as Router, Route, withRouter } from 'react-router-dom'
import { LinkContainer } from 'react-router-bootstrap'
import { Nav, NavItem, Row, Col, Glyphicon } from 'react-bootstrap'
import './Dashboard.css'
import Sidebar from '../utilities/Sidebar'
import EditProfile from './EditProfile'
import Projects from '../projects/ProjectsPage'
import ProjectCreate from '../projects/CreateProjectForm'
import EditProject from '../projects/EditProjectForm'
import JobDetailPage from '../jobs/JobDetailPage'
import SavedJobs from './SavedJobs'
import ScrollToTopOnMount from '../utilities/ScrollToTopOnMount'
import ImageUploader from './ImageUploader'

const ApplicantDashboard = ({
  skills,
  jobs,
  user,
  project,
  getProject,
  updateUser,
  updateProject,
  unsaveJob,
  applyToJob
}) => {
  return (
    <Router>
      <Row className='Dashboard'>
        <ScrollToTopOnMount />
        <div className='container__flex'>
          <Col xsHidden sm={3} md={3} lg={3} className='Dashboard__sidebar'>
            <Sidebar
              headerText={`Welcome, ${user.first_name}`}
              content={
                <Nav className='Sidebar__button-container' stacked>
                  <ImageUploader user={user} />
                  <LinkContainer to='/dashboard/applications' className='Dashboard__nav-item'>
                    <NavItem><Glyphicon glyph='list-alt' /> Applications</NavItem>
                  </LinkContainer>
                  <LinkContainer to='/dashboard/edit-profile' className='Dashboard__nav-item'>
                    <NavItem><Glyphicon glyph='user' /> Edit Profile</NavItem>
                  </LinkContainer>
                  <LinkContainer to='/dashboard/saved-jobs' className='Dashboard__nav-item'>
                    <NavItem><Glyphicon glyph='heart' /> Saved Jobs</NavItem>
                  </LinkContainer>
                  <LinkContainer to='/dashboard/projects' className='Dashboard__nav-item'>
                    <NavItem><Glyphicon glyph='briefcase' /> Projects</NavItem>
                  </LinkContainer>
                  <LinkContainer to='/dashboard/add-project' className='Dashboard__nav-item'>
                    <NavItem><Glyphicon glyph='plus-sign' /> Add Project</NavItem>
                  </LinkContainer>
                </Nav>
              }
            />
          </Col>
          <Col xs={12} sm={9} md={9} lg={9} className='Dashboard__content'>
            <Route exact path='/dashboard/applications' component={({history}) => (
              <h1>APPLICATION HISTORY</h1>
            )} />
            <Route exact path='/dashboard/saved-jobs' component={({history}) => (
              <SavedJobs
                jobs={jobs}
                user={user}
                updateUser={updateUser}
                history={history}
                unsaveJob={unsaveJob}
                applyToJob={applyToJob}
              />
            )} />
            <Route exact path='/dashboard/projects' component={Projects} />
            <Route exact path='/dashboard/add-project' component={ProjectCreate} />
            <Route exact path='/dashboard/edit-project/:id' component={({match}) => (
              <EditProject
                skills={skills}
                project={project}
                getProject={getProject}
                updateProject={updateProject}
              />
            )} />
            <Route exact path='/dashboard/edit-profile' component={() => (
              <EditProfile user={user} updateUser={updateUser} />
            )} />
            <Route exact path='/dashboard/saved-jobs/:id' component={JobDetailPage} />
          </Col>
        </div>
      </Row>
    </Router>
  )
}

ApplicantDashboard.propTypes = {
  jobs: PropTypes.array,
  user: PropTypes.object,
  skills: PropTypes.array,
  updateProject: PropTypes.func.isRequired,
  getProject: PropTypes.func.isRequired,
  updateUser: PropTypes.func.isRequired,
  applyToJob: PropTypes.func.isRequired,
  unsaveJob: PropTypes.func.isRequired,
  project: PropTypes.object
}

export default withRouter(ApplicantDashboard)
