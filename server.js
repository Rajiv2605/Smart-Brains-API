/**
 * TODO: / - this is working
 * TODO: /signin - POST success/fail
 * TODO: /register --> POST user
 * TODO: /profile/:userId --> GET user
 * TODO: /image --> PUT --> user
 * ! POSTMAN is deprecated. Install a new one.
 */

const Clarifai = require('clarifai');
const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const app = express();
app.use(bodyParser.json());
app.use(cors());

const knex = require('knex')({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        user: 'postgres',
        password: 'test',
        database: 'imgdb'
    }
});

// root endpoint
app.get('/', (req, res) => {
    res.send(database.users);
})

app.listen(3000, () => {
    console.log("App running at 3000 port");
});

// signin endpoint
app.post('/signin', (req, res) => {
    if(!req.body.email || !req.body.password)
        return res.status(400).json("Invalid email or password");
    knex.select('email', 'hash').from('login')
        .where('email', '=', req.body.email)
        .then(data => {
            const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
            if(isValid) {
                return knex.select('*').from('users')
                           .where('email', '=', req.body.email)
                           .then(user => {
                               res.json(user[0]);
                           })
                           .catch(err => res.status(400).json('unable to get user'));
            } else {
                res.status(400).json('wrong credentials');
            }
        })
        .catch(err => res.status(400).json('something went wrong'));
});

// register endpoint
app.post('/register', (req, res) => {
    const {email, name, password} = req.body;
    if(!email || !name || !password)
        return res.status(400).json("Invalid registration");
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(password, salt);

    knex.transaction(trx => {
        trx.insert({
            hash: hash,
            email: email
        })
        .into('login')
        .returning('email')
        .then(loginEmail => {
            return trx('users')
            .returning('*')
            .insert({
                name: name,
                email: loginEmail[0],
                joined: new Date()
            }).then(user => {
                res.json(user[0]);
            })
            .catch(err => res.status(400).json('error, unable to register'));
        })
        .then(trx.commit)
        .catch(trx.rollback);
    })
})

app.get('/profile/:id', (req, res) => {
    const  { id } = req.params;

    knex.select('*').from('users').where({id})
                    .then(user => {
                        if(user.length)
                            res.json(user[0]);
                        else
                            res.status(400).json('user not found');
                    })
                    .catch(err => res.status(400).json('error getting user'));
})

const appC = new Clarifai.App({
    apiKey: '5e510ab73ee240e7a846b9caee5c38f3'
   });

app.post('/imageUrl', (req, res) => {
    appC.models.predict(Clarifai.FACE_DETECT_MODEL, req.body.input)
               .then(response => res.json(response))
               .catch(err => res.status(400).json("Error"));
});

app.put('/image', (req, res) => {
    const  { id } = req.body;

    knex('users').where('id', '=', id)
                 .increment('entries', 1)
                 .returning('entries')
                 .then(entries => {
                     res.json(entries[0]);
                 })
})