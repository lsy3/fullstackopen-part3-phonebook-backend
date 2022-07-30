const express = require('express')
const app = express()
const cors = require('cors')
const morgan = require('morgan')

const MAX_ID = 10000

let persons = [
  {
    "id": 1,
    "name": "Arto Hellas",
    "number": "040-123456"
  },
  {
    "id": 2,
    "name": "Ada Lovelace",
    "number": "39-44-5323523"
  },
  {
    "id": 3,
    "name": "Dan Abramov",
    "number": "12-43-234345"
  },
  {
    "id": 4,
    "name": "Mary Poppendieck",
    "number": "39-23-6423122"
  }
]

morgan.token('postdata', function getPostData(req) {
  let ret = ' '
  if (req['_body']) {
    ret = JSON.stringify(req['body'])
  }
  return ret
})

app.use(express.json())
app.use(cors())
// app.use(morgan('tiny'))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postdata'))

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

app.get('/info', (req, res) => {
  res.send(`Phonebook has info for ${persons.length} people<br\>${new Date()}`)
})

const generateId = () => {
  return Math.floor(Math.random() * MAX_ID);
}

app.post('/api/persons', (request, response) => {
  const body = request.body

  missing = [];
  if (!body.name) {
    missing.push('name')
  }
  if (!body.number) {
    missing.push('number')
  }
  if (missing.length > 0) {
    return response.status(400).json({
      error: `missing: ${missing.join(', ')}`
    })
  }

  const existP = persons.find(p => p.name === body.name)

  if (existP) {
    return response.status(400).json({
      error: 'name must be unique'
    })
  } else {
    const p = {
      name: body.name,
      number: body.number,
      id: generateId(),
    }

    persons = persons.concat(p)

    response.json(p)
  }
})

app.get('/api/persons', (req, res) => {
  res.json(persons)
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(p => p.id !== id)

  response.status(204).end()
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const p = persons.find(p => p.id === id)

  if (p) {
    response.json(p)
  } else {
    response.status(404).end()
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})