import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withRouter, Switch, Route } from 'react-router-dom'
import { LinkContainer } from 'react-router-bootstrap'
import { Nav, NavItem, Row, Col, Glyphicon } from 'react-bootstrap'
import { connect } from 'react-redux'
import { gettingUserJobs } from '../../reducers/actions/jobs'
import PostAJob from '../jobs/PostNewJobForm'
import SearchTalent from '../search/CandidateSearchPage'
import './Dashboard.css'
import Sidebar from '../utilities/Sidebar'
import '../utilities/Sidebar.css'

class EmployerDashboard extends Component {

  constructor (props) {
    super(props)
    this.state = {
      post: false,
      manage: true,
      search: false,
      profile: false
    }
  }

  componentWillReceiveProps () {
    if (this.props.user && !this.props.jobs) {
      this.props.getJobs(this.props.user.employer.id)
    }
  }

  render () {
    const firstName = this.props.user.first_name || ''
    return (
      <Row className='Dashboard'>
        <div className='container__flex'>
          <Col xsHidden sm={3} md={3} lg={3} className='Dashboard__sidebar'>
            <Sidebar
              headerText={`Welcome, ${firstName}`}
              content={
                <Nav className='Sidebar__button-container' stacked>
                  <LinkContainer to='/dashboard/post-a-job' className='Dashboard__nav-item'>
                    <NavItem><Glyphicon glyph='plus-sign' />   Post a Job</NavItem>
                  </LinkContainer>
                  <LinkContainer to='/dashboard/manage-jobs' className='Dashboard__nav-item'>
                    <NavItem><Glyphicon glyph='list-alt' />   Manage Jobs</NavItem>
                  </LinkContainer>
                  <LinkContainer to='/dashboard/search-talent' className='Dashboard__nav-item'>
                    <NavItem><Glyphicon glyph='search' />   Search Talent</NavItem>
                  </LinkContainer>
                  <LinkContainer to='/dashboard/edit-profile' className='Dashboard__nav-item'>
                    <NavItem><Glyphicon glyph='user' />   Edit Profile</NavItem>
                  </LinkContainer>
                </Nav>
              }
            />
          </Col>
          <Col xs={12} sm={9} md={9} lg={9} className='Dashboard__content'>
            <Switch>
              <Route exact path='/dashboard/post-a-job' component={PostAJob} />
              <Route exact path='/dashboard/manage-jobs' render={() => <h1>Manage Jobs</h1>} />
              <Route exact path='/dashboard/search-talent' component={SearchTalent} />
              <Route exact path='/dashboard/edit-profile' render={() => <h1>Edit Profile</h1>} />
            </Switch>
          </Col>
        </div>
      </Row>
    )
  }
}

const mapStateToProps = state => ({
  user: state.users.currentUser,
  jobs: state.jobs.user_jobs
})

const mapDispatchToProps = dispatch => ({
  getJobs: (employerId) => dispatch(gettingUserJobs(employerId))
})

EmployerDashboard.propTypes = {
  user: PropTypes.object.isRequired,
  jobs: PropTypes.array,
  getJobs: PropTypes.func.isRequired
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(EmployerDashboard))
