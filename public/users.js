function changeForms () {

let regForm = document.getElementById ('reg')
let logForm = document.getElementById ('log')

if (regForm.style.display == 'none') {

  logForm.style.display = 'none'
  regForm.style.display = 'block'

} else {

  logForm.style.display = 'block'
  regForm.style.display = 'none'

}

}

function submitFunc(e) {
  e.preventDefault()

var xhttp = new XMLHttpRequest();
var params = "lorem=ipsum&name=binny";

let data = 'name='+ e.target.username.value+"&"+"pass"+ e.target.password.value

xhttp.open("POST", "/"+e.target.className, true);
xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
xhttp.send(data)




}
