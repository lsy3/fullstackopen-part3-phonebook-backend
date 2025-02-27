require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const morgan = require('morgan')
const Person = require('./models/person')

app.use(express.static('build'))
app.use(express.json())
app.use(cors())

morgan.token('postdata', function getPostData(req) {
  let ret = ' '
  if (req['_body']) {
    ret = JSON.stringify(req['body'])
  }
  return ret
})

// app.use(morgan('tiny'))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postdata'))


app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

app.get('/info', (req, res) => {
  Person.find({})
    .then(results => {
      res.send(`Phonebook has info for ${results.length} people<br\\>${new Date()}`)
    })

})

// const generateId = () => {
//   return Math.floor(Math.random() * MAX_ID);
// }

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  // missing = [];
  // if (!body.name) {
  //   missing.push('name')
  // }
  // if (!body.number) {
  //   missing.push('number')
  // }
  // if (missing.length > 0) {
  //   return response.status(400).json({
  //     error: `missing: ${missing.join(', ')}`
  //   })
  // }

  // const existP = persons.find(p => p.name === body.name)
  Person.find({ name: body.name })
    .then((results) => {
      if (results.length > 0) {
        return response.status(400).json({
          error: 'name must be unique'
        })
      } else {
        const p = new Person({
          name: body.name,
          number: body.number,
        })

        p.save().then(savedP => {
          response.json(savedP)
        })
          .catch(error => next(error))
      }
    })
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then(results => {
    res.json(results)
  })
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person,
    { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(p => {
      if (p) {
        response.json(p)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))

  // response.status(404).end()
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})