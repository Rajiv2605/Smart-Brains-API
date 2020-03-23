/**
 * TODO: / - this is working
 * TODO: /signin - POST success/fail
 * TODO: /register --> POST user
 * TODO: /profile/:userId --> GET user
 * TODO: /image --> PUT --> user
 * ! POSTMAN is deprecated. Install a new one.
 */

const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const app = express();
app.use(bodyParser.json());
app.use(cors());

const database = {
    users: [
        {
            id: '123',
            name: 'John',
            email: 'john@gmail.com',
            password: 'cookies',
            entries: 0,
            joined: new Date()
        },
        {
            id: '124',
            name: 'Sally',
            email: 'sally@gmail.com',
            password: 'bananas',
            entries: 0,
            joined: new Date()
        }
    ],
    login: [{
            id: '987',
            has: '',
            email: 'john@gmail.com'
        }
    ]
}

// root endpoint
app.get('/', (req, res) => {
    res.send(database.users);
})

app.listen(3000, () => {
    console.log("App running at 3000 port");
});

// signin endpoint
app.post('/signin', (req, res) => {

    // bcrypt.compare("cookies", "$2b$10$yueQRCjavbtqmHO2K65vEeXgOau6.wlBNx1yULSSMKeWXRBiTM/fG", (err, res) => {
    //     console.log("first guess", res);
    // })

    if(req.body.email === database.users[0].email &&
       req.body.password === database.users[0].password)
        res.json('success');
    else
        res.status(400).json("error loggin in");
});

// register endpoint
app.post('/register', (req, res) => {
    const {email, name, password} = req.body;
    // bcrypt.hash(password, 10, function(err, hash) {
    //     console.log(hash);
    // });
    database.users.push({
        id: '125',
        name: name,
        email: email,
        password: password,
        entries: 0,
        joined: new Date()
    });

    res.json(database.users[database.users.length - 1]);
})

app.get('/profile/:id', (req, res) => {
    const  { id } = req.params;
    let found = false;
    database.users.forEach(user => {
        if(user.id === id){
            found = true;
            return res.json(user);
        }
    })

    if(!found)
        res.status(404).json('not found');
})

app.put('/image', (req, res) => {
    const  { id } = req.body;
    let found = false;
    database.users.forEach(user => {
        if(user.id === id){
            found = true;
            user.entries++;
            return res.json(user.entries);
        }
    })

    if(!found)
        res.status(404).json('not found');
})