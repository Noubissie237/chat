import React, {useEffect, useRef, useState} from 'react';
import {useAuth} from "../hooks/userContext";
import {BASE_WS_URL, getMessages} from "../fetcher";
import MessageComponent from "./message";

const MessagesContent = () => {
    const { contactClicked, user, setContactClicked, generalWebSocket } = useAuth()
    const [messages, setMessages] = useState([]);
    const [textValue, setTextValue] = useState("");
    const [websocket, setWebsocket] = useState(null);
    const divRef = useRef(null);

    const scrollToBottom = () => {
        // Scroll to the bottom of the container
        if (divRef.current) {
            divRef.current.scrollTop = divRef.current.scrollHeight;
        }
    };

    //  To scroll to the bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.which === 13) {
                // Handle Enter key press
                // You can call the function or perform the desired action here
                document.querySelector('.submit').click();
            } else if (e.which === 27) {
                // Handle Escape key press
                // You can call the function or perform the desired action here
                setContactClicked({isContactClicked: false})
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        }
    }, [setContactClicked])

    // To fetch messages
    useEffect(() => {
        const fetchMessages = async () => {
            return await getMessages(contactClicked.roomId, {method: 'GET', credentials: 'include'});
        }
        fetchMessages().then(res => setMessages(res.data['data']))
        return () => {
            setMessages([])
        }
    }, [contactClicked.roomId])

    // To handle websockets
    useEffect(() => {
        const ws = new WebSocket(BASE_WS_URL + `${contactClicked.roomId.toString()}/`)
        ws.onopen = function (e) {
            console.log("The chat socket was opened successfully !", e);
        }

        ws.onclose = function (e) {
            console.log("Chat socket closed unexpectedly", e)
        }

        setWebsocket(ws);

        // Clean up the event listener when the component unmounts
        return () => {
            ws.close()
        }
    }, [contactClicked.roomId])


    useEffect(() => {
        if (websocket) {
            websocket.onmessage = function (e) {
                const data = JSON.parse(e.data);
                let content = data['message']
                let sender = data['sender_username']
                let timestamp = data['timestamp']
                setMessages(prevState => ([...prevState, {content, sender, timestamp}]))

                if (sender === user.username)
                    setTextValue('')
            }
        }

    }, [user.username, websocket])

    const handleChange = (event) => {
        setTextValue(event.target.value)
    }

    const handleMessageSubmit = () => {
        if (textValue === '') return
        websocket.send(JSON.stringify({
            "message": textValue,
            "room_id": contactClicked.roomId,
            "sender_username": user.username
        }));
        generalWebSocket.send(JSON.stringify({
            "message": textValue,
            "room_id": contactClicked.roomId,
            "sender_username": user.username,
            "timestamp": new Date().toISOString()
        }));
    }

    const renderMessages = () => {
        if (messages)
            return messages.map((m, i) => {
                return <MessageComponent key={i} msg={m}/>;
            })
    }


    return (
        <>
            <div className="content">
                <div className="contact-profile">
                    <img src="http://emilcarlsson.se/assets/harveyspecter.pngnk" alt="" />
                    <p>{contactClicked.name}</p>
                </div>
                <div className="messages" ref={divRef}>
                    <ul>
                        {renderMessages()}
                    </ul>
                </div>
                <div className="message-input">
                    <div className="wrap">
                        <input type="text" placeholder="Message..." value={textValue} onChange={handleChange} />
                        <button className='attach'>
                            <i className="fa fa-none attachment" aria-hidden="true"></i>
                        </button>
                        <button className="submit" onClick={handleMessageSubmit}>
                            <i className="fa fa-paper-plane" aria-hidden="true"></i>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MessagesContent;
