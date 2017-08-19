import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Row, Col, Button } from 'react-bootstrap'
import { gettingAllUsers, filteringUsers, buildBodyThenSearch } from 'APP/src/reducers/actions/users'
import { grabbingCoords } from 'APP/src/reducers/actions/jobs'
import { gettingAllSkills } from 'APP/src/reducers/actions/skills'
import SearchBar from '../utilities/SearchBar'
import CandidateSearchAdvanced from '../utilities/CandidateSearchAdvanced'
import CandidateList from './CandidateList.js'
import axios from 'axios'
// import './Home.css'

class CandidateSearch extends Component {

  constructor (props) {
    super(props)
    this.state = {
      query: '',
      terms: [],
      coords: '',
      pendingTerms: [],
      filtered: false,
      distance: '',
      sortBy: '',
      page_num:1,
      from:0,
    }
  }

  componentDidMount () {
    this.props.getUsers()
    if (!this.props.user || !this.props.user.coords) {
      grabbingCoords()
      .then(coords => this.setState({coords}))
      .catch(err => console.error(err))
    }
  }

  handleLocation(zip_code) {
    axios.get(`http://maps.googleapis.com/maps/api/geocode/json?address=${zip_code}`)
    .then(res => res.data)
    .then(json => {
      const city = json.results[0].address_components[1].long_name
      const state = json.results[0].address_components[2].short_name
      const location = `${city}, ${state}`
      const coords = `${json.results[0].geometry.location.lat},${json.results[0].geometry.location.lng}`
      this.setState({coords, zip_code, location})
    })
    .catch(err => console.error(err.stack))
  }

  handleChange = type => event => {
    const {value} = event.target
    const nextState = {}
    nextState[`${type}`] = value
    if (type === 'query') nextState.pendingTerms = value.split(' ')
    this.setState(nextState)
  }

  clearFilter = filter => {
    if (filter) {
      // if this method is invoked with a filter param,
      // we reset all search interface elements by:
      // clearing the search bar, showing all job listings, and hiding search-header
      // see SearchAdvanced.js line 21 (the Clear Filter button onClick)
      this.setState({
        query: '',
        pendingTerms: [],
        terms: [],
        sortBy: '',
        filtered: false
      })
      this.filterUsers()
    } else {
      // just clear the search bar, nbd
      this.setState({query: ''})
    }
  }

  clearChip = event => {
    event.preventDefault()
    const chipToClear = event.target.value
    let terms = this.state.terms.filter(term => {
      return term !== chipToClear && term !== ''
    })
    const query = terms.join(' ')
    this.setState(
      {terms, query, filtered: query.length > 0},
      this.filterJobs
      // ^second param of setState (optional) is callback to execute after setting state
    )
  }

  clearFilter = (filter) => {
    if (filter) {
      // clear the search bar, show all job listings, and hide search header
      this.setState({
        query: '',
        filtered: false
      })
      this.filterJobs()
    } else {
      // just clear the search bar, nbd
      this.setState({query: ''})
    }
  }

  filterUsers = event => {
    // this is an event handler but we also use this in clearFilter,
    // in which case there's no event object to preventDefault of
    if (event) event.preventDefault()

    const {query} = this.state
    this.props.filterUsers(query)
    // ^ when query === '', all users are shown
    if (query) this.setState({filtered: true, terms: [...this.state.pendingTerms]})
    // we only show the search results header if this.state.filtered === true
    this.clearFilter()
  }

  buildBody = (coords, from) => {
    const {terms, distance, sortBy} = this.state
    let must = terms.map(term => ({term: {_all: term}}))
    const body = {
      query: {
        bool: {
          must,
          filter: [

          ]
        }
      },
      sort: [
        {_score: {order: 'desc'}}
      ]
    }
    if (distance) {
      body.query.bool.filter.push({
        geo_distance: {
          coords,
          distance: `${distance}mi`
        }
      })
    }
    if (sortBy === 'projectCount') {
      body.sort.push({
        _script: {
          type: 'number',
          script: 'params._source?.projects?.length ?: 0',
          order: 'desc'
        }
      })
    }
    if (sortBy === 'distance') {
      body.sort = [{
        _geo_distance: {
          coords,
          order: 'asc',
          unit: 'mi',
          distance_type: 'arc'
        }
      }]
    }
    console.log('ADV SEARCH BODY: ', body)
    body.from = from
    return body
  }

  handlePagination(users, sign){
    let page_num = 1
    let from = 0
    const next_page= eval(`${this.state.page_num} ${sign} 1`)
    if(sign){
      const nextPageHasItems = (!(this.props.users.length < 10) || sign === "-" )
      if(next_page > 0 && nextPageHasItems){
        page_num = next_page
        from = eval(`${this.state.from} ${sign} 10`)
      } else{
        return {page_num:null, from}
      }
    }
    return {page_num, from}
  }

  advancedFilterUsers = event = (sign) => {
    event.preventDefault()
    const coords = this.props.user.coords
      ? this.props.user.coords
      : this.state.coords
      const {page_num, from} = this.handlePagination(this.props.users, sign)
      if(!page_num){
        return
      }
      this.setState(
        { filtered: true,
          page_num,
          from},
        () => this.props.advancedFilterUsers(this.buildBody, coords, from)
      )
  }

  render () {
    let users = this.props.users || []
    return (
      <Row className='JobBoard'>
        <SearchBar
          type='project'
          inline
          query={this.state.query}
          handleSubmit={this.filterUsers}
          handleChange={this.handleChange('query')}
          labelText='Filter users by skills'
          submitButtonText='Search'
        />
        <div className='container__flex'>
          <Col className='SearchAdvanced__container' xs={12} sm={3} md={3} lg={3}>
            <CandidateSearchAdvanced
              advancedFilterUsers={this.advancedFilterUsers}
              handleChange={this.handleChange}
              clearFilter={this.clearFilter}
              clearChip={this.clearChip}
              filtered={this.state.filtered}
              query={this.state.query}
              terms={this.state.terms}
              state={this.state}
            />
          </Col>
          <Col xs={12} sm={9} md={9} lg={9}>
            <Row>
              <Col className="paginate"  xs={12} sm={12} md={12} lg={12}>
                <Button onClick={() => this.advancedFilterUsers("-")}>
                Back
                </Button>
                <p className="page-number">
                {this.state.page_num}
                </p>
                <Button onClick={() => this.advancedFilterUsers("+")}>
                Next
                </Button>
              </Col>
            </Row>
            {
              this.state.loading
                ? <p>Loading Candidates...</p>
                : <CandidateList
                    filtered={this.state.filtered}
                    users={users}
                    query={this.state.query}
                    clearFilter={this.clearFilter}
                    clearChip={this.clearChip}
                    terms={this.state.terms}
                  />
            }
          </Col>
        </div>
      </Row>
    )
  }
}

const mapStateToProps = state => ({
  users: state.users.all,
  user: state.users.currentUser,
  skills: state.skills.all,
  loading: state.loading
})

const mapDispatchToProps = dispatch => ({
  getUsers: post => dispatch(gettingAllUsers()),
  getSkills: post => dispatch(gettingAllSkills()),
  filterUsers: query => dispatch(filteringUsers(query)),
  advancedFilterUsers: (bodyBuilderFunc, coords, from) => {
    return dispatch(buildBodyThenSearch(bodyBuilderFunc, coords, from))
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(CandidateSearch)
