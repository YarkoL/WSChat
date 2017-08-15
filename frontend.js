var connection = null;
var WebSocket = WebSocket || MozWebSocket;

var connectionButton = document.getElementById('connectionButton');
connectionButton.onclick = connect;

var chat = document.getElementById('chat');
var textInput = document.getElementById('textInput');
var nameInput = document.getElementById('nameInput');
var userlist = document.getElementById("userlist");

var clientID;

function setUsername() {
  var msg = {
    name: nameInput.value,
    date: Date.now(),
    id: clientID,
    type: "username"
  };
  connection.send(JSON.stringify(msg));
}

function connect() { 
  console.log('connect ');
  var serverUrl = "ws://localhost:1984";

  connection = new WebSocket(serverUrl, 'my-protocol');
  
  connection.onopen = function(evt) {
    console.log('connection opened');
    //connection.send('hello from client');
    connectionButton.disabled = true;
    textInput.disabled = false;
  };

  connection.onerror = function(evt) {
  	console.log('got error : ' + evt.data);
    connectionButton.disabled = false;
    textInput.disabled = false;
  };

  connection.onmessage = function(evt) {  
    var text = "";
    var msg = JSON.parse(evt.data);
    var time = new Date(msg.date);
    var timeStr = time.toLocaleTimeString();

    switch(msg.type) {
      case "id":
        clientID = msg.id;
        setUsername();
        break;
      case "username":
        text = "<b>User " + msg.name + " signed in at " + timeStr +"</b>"  
        break;
      case "message":
        text =  msg.name + " : " + msg.text;
        break;
      case "rejectusername":
        text = "<b> The name you chose is in use.</b>";
        connectionButton.disabled = false;
        textInput.disabled = true;
        break;
      case "userlist":
        handleUserlistMsg(msg);
        break;
      }
      if (text.length) {
        addMessage(text);
      }
    };
  }
 
function handleUserlistMsg(msg) {
  var i;
  
  //clear list
  while (userlist.firstChild) {
    userlist.removeChild(userlist.firstChild);
  }

  //repopulate

  for (i = 0; i < msg.users.length; i++) {
    var item = document.createElement("span");
    item.classList.add('useritem');
    item.appendChild(document.createTextNode(msg.users[i]));
    //item.addEventListener("click", invite, false);

    userlist.appendChild(item);
  }
}


function addMessage(txt) {
  chat.innerHTML += txt + '<br>';
}

function send() {
  var msg = {
    text: textInput.value,
    type: "message",
    id: clientID,
    date: Date.now()
  };
  connection.send(JSON.stringify(msg));
  textInput.value = "";
} 


function handleKey(evt) {
  if (evt.keyCode === 13 || evt.keyCode === 14) {
    if (!textInput.disabled) {
      send();
    }
  }
} 






