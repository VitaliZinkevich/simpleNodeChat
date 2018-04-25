

window.onload = (function (){



  var getNode = function (s) {
    return document.querySelector(s)
  }
  // get reuired nodes
  spanStatus = getNode('#status')
  textarea = getNode ('#enterMsg')
  chatName = getNode ('#name')

    console.log (spanStatus.textContent)
    console.log (spanStatus)

  let setStatus = function (s){
  spanStatus.textContent = s
  }

  

try {
  var socket = io.connect('http://127.0.0.1:8080')
}  catch {

  // set status to warn
}

if (socket != undefined) {

  //listen for the STATUS
  socket.on ('status', function (data) {



  })




  // lesten for key down
    textarea.addEventListener ('keydown',function (event){
        var self = this,
            name = chatName.value



     if (event.which === 13 && event.shiftKey === false) {
            socket.emit ('enterMsg', {
              name: name,
              message: self.value
        })

        event.preventDefault()
        self.value = ''

     }



    })


}

})()
