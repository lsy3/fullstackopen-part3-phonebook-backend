const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
}

const password = process.argv[2]
const url = `mongodb+srv://fullstack:${password}@cluster0.2mwywxr.mongodb.net/?retryWrites=true&w=majority`

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3) {
  mongoose
    .connect(url)
    .then(() => {
      console.log('connected')

      return Person.find({})
    })
    .then((result) => {
      console.log('phonebook:')
      result.forEach(p => {
        console.log(`${p.name} ${p.number}`)
      })
      mongoose.connection.close()
    })
    .catch((err) => console.log(err))
} else {
  mongoose
    .connect(url)
    .then(() => {
      console.log('connected')

      const p = new Person({
        name: process.argv[3],
        number: process.argv[4]
      })

      return p.save()
    })
    .then((person) => {
      console.log(`added ${person.name} number ${person.number} to phonebook`)

      return mongoose.connection.close()
    })
    .catch((err) => console.log(err))
}
