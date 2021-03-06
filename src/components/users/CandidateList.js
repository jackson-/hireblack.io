import React from 'react'
import { Row, Col } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import PropTypes from 'prop-types'

const CandidateList = ({users, filtered, total, canSearch}) => (
  <div className='CandidateList'>
    {
      filtered &&
        <h2 className='CandidateList__heading'>
          {`Search Results (${total})`}
        </h2>
    }
    {
      !canSearch &&
        <h2 className='CandidateList__heading'>
          To protect our user's privacy, candidate search is only available to employers with active jobs listed.
        </h2>
    }
    {
      users && canSearch && users.map((user, i) => {
        let skills = new Set([])
        if (user.projects) {
          user.projects.forEach(p => {
            if (p.skills) {
              p.skills.forEach(s => {
                skills.add(s.title)
              })
            }
          })
        }
        skills = [...skills].join(', ')
        return (
          <LinkContainer className='UserCard' key={i} to={`/users/${user.id}`}>
            <Row>
              <Col xs={12} sm={6} md={6} lg={6}>
                <h2 className='UserCard-name'>
                  {`${user.first_name} ${user.last_name}`}
                </h2>
                <h2 className='UserCard-title'>
                  {`${user.title}`}
                </h2>
                <p className='UserCard-skills'>
                  {skills}
                </p>
              </Col>
              <Col xs={12} sm={6} md={6} lg={6}>
                <Row>
                  <Col xs={12} sm={6} md={6} lg={6}>
                    <h2 className='UserCard-projects'>
                      {`${user.projects.length} Portfolio Projects`}
                    </h2>
                  </Col>
                  <Col xs={12} sm={6} md={6} lg={6}>
                    <p className='UserCard-location'>{user.location}</p>
                    {user.employment_types && user.employment_types.map((type, i) => (
                      <span key={i} className='UserCard-type'>{type}</span>
                    ))}
                  </Col>
                </Row>
              </Col>
            </Row>
          </LinkContainer>
        )
      })
    }
  </div>
)

CandidateList.propTypes = {
  users: PropTypes.arrayOf(PropTypes.object),
  filtered: PropTypes.bool,
  canSearch: PropTypes.bool,
  total: PropTypes.number
}

export default CandidateList
