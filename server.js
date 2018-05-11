'use strict'

var express = require('express')
var app = express();
var http = require('http').Server(app);
var nunjucks = require('nunjucks');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var UsersModel = require('./models/users.model');
const _ = require('lodash');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const passport = require('passport');
const { Strategy } = require('passport-jwt');

const { jwt } = require('./config');

passport.use(new Strategy(jwt, function(jwt_payload, done) {
    if(jwt_payload != void(0)) return done(false, jwt_payload);
    done();
}));

http.listen(3000, function(){
  console.log('listening on 3000');
});

nunjucks.configure('views', {
    autoescape: true,
    express: app
});


app.use (express.static('public'))


function checkAuth (req, res, next) {
    passport.authenticate('jwt', { session: false }, (err, decryptToken, jwtError) => {


        if(jwtError != void(0) || err != void(0)) return res.render('index.html', { error: err || jwtError});
        req.user = decryptToken;
        next();
    })(req, res, next);
}

function createToken (body) {
    return jwt.sign(
        body,
        config.jwt.secretOrKey,
        {expiresIn: config.expiresIn}
    );
}




app.get('/',checkAuth, function(req, res){

  res.render('index.html'/*, {username: req.user.username}*/ );
});


app.post ("/login", function (req, res ) {


res.send()
})

app.post ("/register", async function (req, res ) {


/*
          let user = await UsersModel.findOne({username: {$regex: _.escapeRegExp(req.body.username), $options: "i"}}).lean().exec();

          if(user != void(0)) return res.status(400).send({message: "User already exist"});
*/

          console.log (req.body.name)
      /*    let name = req.body.username
          let pass = req.body.password
          console.log (name)
          console.log (pass)*/

          let user = await UsersModel.create({
              username: req.body.username,
              password: req.body.password
          });


          if (user) {
            const token = createToken({id: user._id, username: user.username});

            res.cookie('token', token, {
                httpOnly: true
            });

            res.status(200).send ({message: "User login success."});


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
      var  whitespacePattern = /^\s*$/;

      console.log (name)
      console.log (userMessage)

      if (whitespacePattern.test(name) || whitespacePattern.test(userMessage)) {

        sendStatus(
        {
          message:'Name and message is required',
          clear: false
        })

      } else {
        db.collection('messages').insert ({name: name, message: userMessage}, ()=>{
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
