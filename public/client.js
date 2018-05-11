window.onload = (function (){



  var getNode = function (s) {
    return document.querySelector(s)
  }
  // get reuired nodes
  spanStatus = getNode('#status')
  textarea = getNode ('#enterMsg')
  chatName = getNode ('#name')
  messageDiv = getNode('.messages')


    statusDefault = spanStatus.textContent = 'Connected'



  let setStatus = function (s){

  spanStatus.textContent = s



  if (s != statusDefault) {

    let delay = setTimeout (function (){
      setStatus (statusDefault)
      if (spanStatus.classList.contains ('alert')) {

        spanStatus.classList.remove ('alert')
        spanStatus.classList.remove ('alert-danger')
        spanStatus.setAttribute ('class', 'alert alert-success')
      }
      //spanStatus.removeAttribute('class')

    }, 5000)

  }



}


try {
  var socket = io.connect('http://127.0.0.1:8080')
}  catch {

  // set status to warn
}

if (socket != undefined) {

  // listen for output enterMsg

  socket.on ('output', function (data){
console.log (data)
    if (data.length) {
      // loop thrue come msg

    for (var i = 0 ; i < data.length; i++) {

      var oneMessage = document.createElement ('div')
      oneMessage.setAttribute('class', 'onemessage alert alert-dark')
      oneMessage.innerHTML = '<strong> Name: '+data[i].name+'</strong>'+ '<br>'+ data[i].message
            messageDiv.appendChild (oneMessage)
      messageDiv.insertBefore (oneMessage, messageDiv.firstChild)

      }


    }

  })


  //listen for the STATUS
  socket.on ('status', function (data) {

    setStatus ( (typeof data === 'object' ? data.message : data))


    if (data.clear === true) {
      spanStatus.setAttribute ('class', 'alert alert-success')
      textarea.value = ''


    } else {

        spanStatus.setAttribute ('class', 'alert alert-danger')
    }

  })




  // listen for key down
    textarea.addEventListener ('keydown',function (event){
        var self = this,
            name = chatName.value



     if (event.which === 13 && event.shiftKey === false) {
            socket.emit ('enterMsg', {
              name: name,
              message: self.value
        })

        event.preventDefault()


     }



    })


}

})()
