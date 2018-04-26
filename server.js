'use strict'

var express = require('express')
var app = express();
var http = require('http').Server(app);

http.listen(3000, function(){
  console.log('listening on *:3000');
});

app.use (express.static('public'))

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});


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
