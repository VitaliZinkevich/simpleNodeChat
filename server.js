'use strict'

var express = require('express')
var app = express();
var http = require('http').Server(app);
var nunjucks = require('nunjucks');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var UsersModel = require('./models/users.model');
const _ = require('lodash');
const mongoose = require('mongoose');
const bcrtypt = require('bcryptjs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser())

const passport = require('passport');
const { Strategy } = require('passport-jwt');
const jsonWebToken = require('jsonwebtoken');

const config = require('./config');
const { jwt } = require('./config');

passport.use(new Strategy(jwt, function(jwt_payload, done) {
    if(jwt_payload != void(0)) return done(false, jwt_payload);
    done();
}));


mongoose.connect('mongodb://localhost:27017/chat');
mongoose.Promise = Promise;
//mongoose.set('debug', true);


http.listen(3000, function(){
  console.log('listening on 3000');
});

nunjucks.configure('views', {
    autoescape: true,
    express: app
});


app.use (express.static('public'))


function checkAuth (req, res, next) {
//  console.log (req.cookie['token'])
    passport.authenticate('jwt', { session: false }, (err, decryptToken, jwtError) => {
/*
      console.log(jwtError)

      console.log(err)

      console.log(decryptToken)*/

        if(jwtError != void(0) || err != void(0)) return res.render('index.html', { error: err || jwtError});

        req.user = decryptToken;
        next();
    })(req, res, next);
}

function createToken (body) {
    return jsonWebToken.sign(
        body,
        config.jwt.secretOrKey,
        {expiresIn: config.expiresIn}
    );
}




app.get('/',checkAuth, function(req, res){
    res.render('index.html', {username: req.user.username});
});


app.post ("/login",async function (req, res ) {

            let user = await UsersModel.findOne({username: {$regex: _.escapeRegExp(req.body.name), $options: "i"}}).lean().exec();
          if (user) {  if(user != void(0) && bcrtypt.compareSync(req.body.pass, user.password)) {
                const token = createToken({id: user._id, username: user.username});

                res.cookie('token', token, {
                    httpOnly: true
                });

              res.status(200).send({message: "User login success."});

            } else res.status(400).send({message: "User not exist or password not correct"});
          } else {
              console.error("E, login,", e);
              res.status(500).send({message: "some error"});

            }








})

app.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.status(200).send({message: "Logout success."});
})

app.post ("/register", async function (req, res ) {



          let user = await UsersModel.findOne({username: {$regex: _.escapeRegExp(req.body.name), $options: "i"}}).lean().exec();

          if(user != void(0)) return res.status(400).send({message: "User already exist"});



          user = await UsersModel.create({
              username: req.body.name,
              password: req.body.pass
          });


          if (user) {
            const token = createToken({id: user._id, username: user.username});

            res.cookie('token', token, {
                httpOnly: true
            });
            console.log ("User created.")
            res.status(200).send({message: "User created."});


          } else {
            console.error("E, register,", e);
            res.status(500).send({message: "some error"});

          }





})


var mongoClient = require ('mongodb').MongoClient,
client = require ('socket.io').listen (8080).sockets;

mongoClient.connect ('mongodb://127.0.0.1:27017/chat', (err, c)=>{

  if (err) throw err
  console.log ('mongo up')

  client.on ('connection', function (socket){

   console.log ('connection UP')



  const db = c.db('chat');

  let sendStatus =  function(s){

      socket.emit ('status',s)

  }

  // status on connection
  sendStatus ({
    message:'Connected',
    clear: true
  })


  // emit all messages

  db.collection('messages').find({}).limit(100).sort({id:1}).toArray(function (err, res){
    socket.emit ('output', res)

  })



  // wait for input
  socket.on ('enterMsg', function(data){


      let name = data.name;
      let userMessage = data.message;
      let msgTime = new Date()

      var  whitespacePattern = /^\s*$/;

        if (whitespacePattern.test(userMessage)) {

        sendStatus(
        {
          message:'Message is required',
          clear: false
        })

      } else {

        db.collection('messages').insert ({name: name, message: userMessage, date: msgTime}, ()=>{
        client.emit('output', [data])
          sendStatus ({
            message: 'Message sent successfully',
            clear: true
          })
      })
      }
})
  })
})
