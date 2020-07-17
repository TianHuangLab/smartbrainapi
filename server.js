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

app.get('/', (req, res) => {
    res.send(dataBase.users)
})

app.post('/signin', (req, res) => {
    //find the user who is logging from the database
    db.select('email','hash').from('login')
    .where('email','=', req.body.email)
    .then(data => {
        //check if user's password is correct
        const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
        if (isValid) {
            //if it's correct, it returns the user info from table users as response
            return db.select('*').from('users')
            .where('email','=',req.body.email)
            .then(user => {
                res.json(user[0])
            })
            .catch(err => res.status(400).json('Unable to get user'))
        } else {
            res.status(400).json('Wrong credentials')
        }
    })
    .catch(err => res.status(400).json('Unable to get user'))
})

app.post('/register', (req, res) => {
    //extract each items from the content of request in JSON format
    const {name, email, password} = req.body;
    //hash out the password
    const hash = bcrypt.hashSync(password);
    //construct a transaction to ensure the consistency between users & login
    db.transaction(trx => {
        trx.insert({
            hash: hash,
            email: email
        })
        .into('login')
        .returning('email') //retrun the value from column email
        .then(loginEmail => {
            return trx('users') //go to users table
            .returning('*') 
            //select the whole table for inserting the corresponding info
            .insert({
                name: name,
                email: loginEmail[0], //extract the user email from an array
                joined: new Date()
            }).then(user => {
                res.json(user[0]) //respond with json
            })
        })
        .then(trx.commit) //make sure all these changes get added into tables
        .catch(trx.rollback) //in case anything fails, it can rollback
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
