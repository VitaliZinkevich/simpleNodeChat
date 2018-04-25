'use strict'
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

  // wait gfor input
  socket.on ('enterMsg', function(data){
      console.log (data)
      let name = data.name;
      let message = data.msg;
      var  whitespacePattern = /^\s*$/;
      console.log (whitespacePattern.test(name))
      console.log (whitespacePattern.test(message))
      if (whitespacePattern.test(name) || whitespacePattern.test(message)) {

        sendStatus('Name and message is reuired')

      } else {
        db.collection('messages').insert ({name: name, message: message}, ()=>{
        console.log ('inserted')
        })
      }




})


  })

})
