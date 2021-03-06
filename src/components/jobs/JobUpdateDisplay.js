import React, { Component } from 'react'
import {
  Row, Col, FormGroup, ControlLabel, ButtonGroup,
  FormControl, Button, Checkbox } from 'react-bootstrap'
import axios from 'axios'
import PropTypes from 'prop-types'
import SkillTypeaheadSelect from '../utilities/SkillTypeaheadSelect'
import LoadingSpinner from '../utilities/LoadingSpinner'
import RichTextarea from '../utilities/RichTextarea'
import { createValueFromString, createEmptyValue } from 'react-rte'
import '../auth/Form.css'

export default class JobUpdateDisplay extends Component {
  constructor (props) {
    super(props)
    this.state = {
      title: this.props.job.title || '',
      description: createValueFromString(this.props.job.description, 'html') || createEmptyValue(),
      application_email: this.props.job.application_email || '',
      cc_email: this.props.job.cc_email || '',
      application_url: this.props.job.application_url || '',
      coords: this.props.job.coords || '',
      location: this.props.job.location || '',
      zip_code: this.props.job.zip_code || '',
      state: this.props.job.state || '',
      pay_rate: this.props.job.pay_rate || '',
      compensation_type: this.props.job.compensation_type || '',
      travel_requirements: this.props.job.travel_requirements,
      country: 'US',
      employment_types: new Set([...this.props.job.employment_types]) || new Set([])
    }
  }

  handleClose = event => {
    event.preventDefault()
    const {closeJob, receiveAlert, job, history} = this.props
    receiveAlert({
      type: 'danger confirmation',
      style: 'danger',
      title: 'Close?',
      body: 'Are you sure you want to close this job?',
      next: '',
      footer: true,
      footerActions: [
        {
          text: `Yes, close this job`,
          action: () => { closeJob(job.id, history) }
        },
        {
          text: `Cancel`
        }
      ]
    })
  }

  handleLocation = zip_code => {
    axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${zip_code}`)
      .then(res => res.data)
      .then(json => {
        const address = json.results[0].address_components
        const geometry = json.results[0].geometry.location
        let city = address.filter(c => (
          c.types.includes('sublocality') || c.types.includes('locality')
        ))[0].long_name
        let state = address.filter(c => (
          c.types.includes('administrative_area_level_1')
        ))[0].short_name
        let country = address.filter(c => (
          c.types.includes('country')
        ))[0].long_name
        const location = country === 'United States'
          ? `${city}, ${state}`
          : `${city}, ${state} ${country}`
        const coords = {
          type: 'Point',
          coordinates: [parseFloat(geometry.lng), parseFloat(geometry.lat)],
          crs: {type: 'name', properties: {name: 'EPSG:32661'}}
        }
        this.setState({coords, zip_code, location})
      })
      .catch(err => console.error(err.stack))
  }

  handleChange = type => event => {
    let value = type === 'skills' || type === 'description'
      ? event
      : event.target.value
    if (type === 'zip_code' && value.toString().length >= 5) {
      /* first we finish updating the state of the input, then we use the zip to find the rest of the location data by passing the callback to setState (an optional 2nd param) */
      this.setState({[type]: value}, this.handleLocation(value))
    } else if (type === 'employment_types') {
      this.state.employment_types.has(value)
        ? this.state.employment_types.delete(value)
        : this.state.employment_types.add(value)
      const employment_types = new Set([...this.state.employment_types])
      /* ^Using a Set instead of an array because we need the data values to be unique */
      this.setState({employment_types})
    } else if (type === 'skills') {
      this.props.handleNewSkills(value)
    } else {
      this.setState({[type]: value})
    }
  }

  clearForm = () => {
    this.setState({
      title: this.props.job.title || '',
      description: createValueFromString(this.props.job.description, 'html') || createEmptyValue(),
      application_email: this.props.job.application_email || '',
      cc_email: this.props.job.cc_email || '',
      application_url: this.props.job.application_url || '',
      coords: this.props.job.coords || '',
      location: this.props.job.location || '',
      zip_code: this.props.job.zip_code || '',
      state: this.props.job.state || '',
      country: 'US',
      compensation_type: this.props.job.compensation_type || '',
      pay_rate: this.props.job.pay_rate || '',
      employment_types: new Set([...this.props.job.employment_types]) || new Set([]),
      travel_requirements: this.props.job.travel_requirements
    })
  }

  handleSubmit = event => {
    event.preventDefault()
    const job = {...this.state}
    const {selected, updateJob, history, user} = this.props
    job.id = this.props.job.id
    job.employer_id = user.employer.id
    job.description = job.description.toString('html')
    // change employment_types from Set to Array
    job.employment_types = [...this.state.employment_types]
    job.coords.crs = {type: 'name', properties: {name: 'EPSG:32661'}}
    const skills = selected.map(s => s.id)
    this.clearForm()
    updateJob({job, skills}, history)
  }

  isChecked = type => {
    return this.state.employment_types.has(type)
  }

  render () {
    const {job, selected} = this.props
    return (
      job && selected
        ? (
          <Row className='UpdateJobForm'>
            <Col xs={12} sm={12} md={12} lg={12}>
              <h1 className='UpdateJobForm-header'>Edit Job</h1>
              <Row>
                <form className='UpdateJobForm-body' onSubmit={this.handleSubmit}>
                  <Col xs={12} sm={6} md={6} lg={6}>
                    <FormGroup controlId='title'>
                      <ControlLabel>JOB TITLE</ControlLabel>
                      <FormControl
                        type='text'
                        value={this.state.title}
                        onChange={this.handleChange('title')}
                      />
                    </FormGroup>
                    <SkillTypeaheadSelect
                      label='KEY SKILLS'
                      handleChange={this.handleChange}
                    />
                    <RichTextarea
                      value={this.state.description}
                      label='JOB DESCRIPTION'
                      onChange={this.handleChange('description')}
                    />
                    <FormGroup controlId='application_email'>
                      <ControlLabel>APPLICATION EMAIL</ControlLabel>
                      <FormControl
                        type='email'
                        value={this.state.application_email}
                        onChange={this.handleChange('application_email')}
                      />
                    </FormGroup>
                    <FormGroup controlId='cc_email'>
                      <ControlLabel>CC EMAIL</ControlLabel>
                      <FormControl
                        type='email'
                        value={this.state.cc_email}
                        onChange={this.handleChange('cc_email')}
                      />
                    </FormGroup>
                  </Col>
                  <Col xs={12} sm={6} md={6} lg={6}>
                    <FormGroup controlId='application_url'>
                      <ControlLabel>APPLICATION URL</ControlLabel>
                      <FormControl
                        type='url'
                        value={this.state.application_url}
                        onChange={this.handleChange('application_url')}
                      />
                    </FormGroup>
                    {/* with zip_code we auto find user's city, state, country and coords */}
                    <FormGroup controlId='zip_code'>
                      <ControlLabel>ZIP CODE</ControlLabel>
                      <FormControl
                        required
                        type='tel'
                        value={this.state.zip_code}
                        onChange={this.handleChange('zip_code')}
                      />
                    </FormGroup>
                    <FormGroup
                      controlId='employment_types'
                      name='employment_types'
                      onChange={this.handleChange('employment_types')}>
                      <ControlLabel>EMPLOYMENT TYPE(S)</ControlLabel>
                      <Checkbox value='Full Time' defaultChecked={this.isChecked('Full Time')}>
                        Full Time
                      </Checkbox>
                      <Checkbox value='Part Time' defaultChecked={this.isChecked('Part Time')}>
                        Part Time
                      </Checkbox>
                      <Checkbox value='Contract' defaultChecked={this.isChecked('Contract')}>
                        Contract
                      </Checkbox>
                      <Checkbox value='Contract to Hire' defaultChecked={this.isChecked('Contract to Hire')}>
                        Contract to Hire
                      </Checkbox>
                      <Checkbox value='Internship' defaultChecked={this.isChecked('Internship')}>
                        Internship
                      </Checkbox>
                      <Checkbox value='Remote' defaultChecked={this.isChecked('Remote')}>
                        Remote
                      </Checkbox>
                      <Checkbox defaultChecked={this.isChecked('Freelance')} value='Freelance'>
                        Freelance
                      </Checkbox>
                    </FormGroup>
                    <FormGroup controlId='compensation'>
                      <ControlLabel>COMPENSATION TYPE</ControlLabel>
                      <FormControl
                        componentClass='select'
                        defaultValue={this.state.compensation_type}
                        onChange={this.handleChange('compensation_type')}
                      >
                        <option value='Salary'>Salary</option>
                        <option value='Hourly'>Hourly</option>
                      </FormControl>
                    </FormGroup>
                    <FormGroup controlId='pay_rate'>
                      <ControlLabel>PAY RATE</ControlLabel>
                      <FormControl
                        type='tel'
                        value={this.state.pay_rate}
                        onChange={this.handleChange('pay_rate')}
                      />
                    </FormGroup>
                    <FormGroup controlId='travel_requirements'>
                      <ControlLabel>TRAVEL REQUIREMENTS</ControlLabel>
                      <FormControl
                        componentClass='select'
                        defaultValue={this.state.travel_requirements} onChange={this.handleChange('travel_requirements')}
                      >
                        <option value='None'>None</option>
                        <option value='Occasional'>Occasional</option>
                        <option value='25%'>25%</option>
                        <option value='50%'>50%</option>
                        <option value='75%'>75%</option>
                        <option value='100%'>100%</option>
                      </FormControl>
                    </FormGroup>
                    <ButtonGroup justified>
                      <Button type='submit' bsStyle='success'>Update Job</Button>
                      <Button bsStyle='danger' onClick={this.handleClose}>
                        Close Job
                      </Button>
                    </ButtonGroup>
                  </Col>
                </form>
              </Row>
            </Col>
          </Row>
        )
        : (
          <LoadingSpinner />
        )
    )
  }
}

JobUpdateDisplay.propTypes = {
  job: PropTypes.object.isRequired,
  user: PropTypes.any.isRequired,
  history: PropTypes.object,
  selected: PropTypes.arrayOf(PropTypes.object), // selected skills
  closeJob: PropTypes.func.isRequired,
  updateJob: PropTypes.func.isRequired,
  receiveAlert: PropTypes.func,
  handleNewSkills: PropTypes.func
  // ^creates new skills if user made any custom ones (class method of App.js)
}
