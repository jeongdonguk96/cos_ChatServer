// 로그인 시스템 미구현으로 임시 아이디, 채팅방
let username = prompt("아이디를 입력하세요");
let roomNum = prompt("채팅방 번호를 입력하세요");

document.querySelector("#username").innerHTML = username;

// SSE 연결
const eventSource = new EventSource(`http://localhost:8080/chat/roomNum/${roomNum}`);
eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if(data.sender == username) { // 내가 쓴 채팅
        initMyMsg(data);
    } else {                      // 외 모든 채팅
        initOthersMsg(data);
    }
}

// 내가 쓴 채팅 기록
function getSendMsgBox(data) {

    let md = data.createdAt.substring(5, 10)
	let tm = data.createdAt.substring(11, 16)
	convertTime = tm + " | " + md

    return `<div class="sent_msg">
            <p>${data.msg}</p>
            <span class="time_date">${convertTime} / <b>${data.sender}</b></span>
            </div>`;
}

// 남이 쓴 채팅 기록
function getReceiveMsgBox(data) {

    let md = data.createdAt.substring(5, 10)
	let tm = data.createdAt.substring(11, 16)
	convertTime = tm + " | " + md

    return `<div class="received_withd_msg">
            <p>${data.msg}</p>
            <span class="time_date">${convertTime} / <b>${data.sender}</b></span>
            </div>`;
}

// 누구의 채팅이 post로 insert되든
// 바뀐 데이터를 @tailable로 flux해줌
// 즉, 이 함수는 데이터를 출력하기만 하면 됨

    // 내가 쓴 채팅
    function initMyMsg(data) {
        let chatBox = document.querySelector("#chat-box");
        let chatSendBox = document.createElement("div");
        chatSendBox.className = "outgoing_msg";

        chatSendBox.innerHTML = getSendMsgBox(data); 
        chatBox.append(chatSendBox);

        document.documentElement.scrollTop = document.body.scrollHeight;
    }

    // 남이 쓴 채팅
    function initOthersMsg(data) {
        let chatBox = document.querySelector("#chat-box");
        let chatReceiveBox = document.createElement("div");
        chatReceiveBox.className = "received_msg";

        chatReceiveBox.innerHTML = getReceiveMsgBox(data); 
        chatBox.append(chatReceiveBox);

        document.documentElement.scrollTop = document.body.scrollHeight;
}

// 채팅 전송 시 db에 post로 insert됨
// 그러면 initMyMsg()에서 db가 @tailable 상태이기 때문에
// 실시간으로 flux
// 즉, 이 함수는 데이터를 넣기만 하면 됨
async function addMsg() {
    let chatBox = document.querySelector("#chat-box");
    let msgInput = document.querySelector("#chat-outgoing-msg");

    let chat = {
        sender: username,
        roomNum: roomNum,
        msg: msgInput.value
    };

    fetch("http://localhost:8080/chat", {
        method: "post",
        body: JSON.stringify(chat),
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        }
    });

    msgInput.value = "";
}

// 전송버튼 클릭 시 채팅 전송
document.querySelector("#chat-send").addEventListener("click", ()=>{
    addMsg();
});

// 엔터키 칠 때 채팅 전송
document.querySelector("#chat-outgoing-msg").addEventListener("keydown", (e)=>{
    if(e.keyCode == 13) {
        addMsg();
    }
});