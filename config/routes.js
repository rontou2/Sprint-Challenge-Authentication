const axios = require('axios');
const bcrypt = require('bcryptjs');
const { authenticate } = require('./middlewares');
const db = require('../database/dbConfig.js');
const jwtSecret = require('../_secrets/keys.js');
const jwt = require('jsonwebtoken');

module.exports = server => {
  server.post('/api/register', register);
  server.post('/api/login', login);
  server.get('/api/jokes', authenticate, getJokes);
};

function generateToken (user) {
const jwtPayload = {
...user,
otherInfo:'whatever I want on the token',
};

const jwtOptions = {
expiresIn: '2m',
};

return jwt.sign(jwtPayload, jwtSecret.jwtKey, jwtOptions);
}

function register(req, res) {
const { username,password } = req.body;
const hashed = bcrypt.hashSync(password,14);
db('users')
	.insert({username:username,password:hashed})
	.then(response => {
	res.status(200).json(response);
	})
	.catch(err => {
	res.status(500).json(err);
	});
}

function login(req, res) {
const { username,password } = req.body;
db('users')
	.where({username})
	.first()
	.then(user => {
	if(user && bcrypt.compareSync(password,user.password)){
	const token = generateToken(user);
	res.status(200).json({greeting:'welcome!',token});
	}
	else{
	res.status(400).json('invalid username or password');
	}
	})
	.catch(err => {
	res.status(500).json(err);
	});
}

function getJokes(req, res) {
  axios
    .get(
      'https://08ad1pao69.execute-api.us-east-1.amazonaws.com/dev/random_ten'
    )
    .then(response => {
      res.status(200).json(response.data);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error Fetching Jokes', error: err });
    });
}
