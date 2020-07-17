const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt-nodejs')
const knex = require('knex');

const app = express();
app.use(express.json());
app.use(cors());

const db = knex({
    client: 'pg',
    connection: {
      host : '127.0.0.1', //this is the ip of localhost
      user : 'huang',
      password : '',
      database : 'smart-brain'
    }
  });

const dataBase = {
    users: [
        {
            id: '123',
            name: 'john',
            email: 'john@gmail.com',
            password: 'cookies',
            entries: 0,
            joined: new Date(),
        },
        {
            id: '124',
            name: 'mike',
            email: 'mike@gmail.com',
            password: 'apples',
            entries: 0,
            joined: new Date(),
        },
        {
            id: '125',
            name: 'q',
            email: 'q',
            password: 'q',
            entries: 0,
            joined: new Date(),
        }
    ]
    // login: [
    //     {id: '123',
    //     hash: '',
    //     email: 'john@gmail.com'
    //     }
    // ]
}

app.get('/', (req, res) => {
    res.send(dataBase.users)
})

app.post('/signin', (req, res) => {
    if (req.body.email === dataBase.users[0].email &&
        req.body.password === dataBase.users[0].password) {
            res.json(dataBase.users[0])
        } else {
            res.status(400).json('error logging in')
        }
})

app.post('/register', (req, res) => {
    //extract each items from the content of request in JSON format
    const {name, email, password} = req.body;
    db('users')
        .returning('*')
        .insert({
            name: name,
            email: email,
            joined: new Date()
        }).then(user => {
            res.json(user[0])
        })
        .catch(err => res.status(400).json('Unable to register'))
})

app.get('/profile/:id', (req, res) => {
    const { id } = req.params;
    db.select('*').from('users').where({id})
    .then(user => {
        if (user.length) {
            res.json(user[0])
        } else {
            res.status(400).json('Not found')
        }
    })
    .catch(err => res.status(400).json('Error getting'))
})

app.put('/image', (req, res) => {
    const { id } = req.body;
    db('users').where('id','=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
        res.json(entries[0])
    })
    .catch(err => res.status(400).json('Unable to get entries'))
})

app.listen(3000, ()=> {
    console.log('app is now running on port 3000')
})
