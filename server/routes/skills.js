const db = require('APP/db')
const {Skill, Employer} = db

module.exports = require('express').Router()
  .get('/', (req, res, next) => {
    Skill.findAll()
      .then(skills => res.json(skills))
      .catch(next)
  })

  .post('/', (req, res, next) => {
    const {skills} = req.body
    Skill.bulkCreate(skills)
      .then(() => Skill.findAll()) // bulkCreate doesn't return any params
      .then(updatedSkills => res.json(updatedSkills))
      .catch(next)
  })

  .get('/:id', (req, res, next) => {
    Skill.findById(req.params.id, { include: [Employer] })
      .then(skill => res.json(skill))
      .catch(next)
  })
