import React, {useEffect, useState} from 'react';
import '../assets/css/main.css'
import {useAuth} from "../hooks/userContext";

const Contact = ({contactName, lastMessage, lastMessageSender, timestamp, id, username}) => {
    const { contactClicked,  setContactClicked, user } = useAuth();
    const [className, setClassName] = useState('contact');
    const isSender = lastMessageSender !== user.username;
    const previewText = (isSender ? '' : 'You: ') + lastMessage;


    useEffect(() => {
        let { isContactClicked, roomId } = contactClicked
        if ((isContactClicked) && (roomId === id))
            setClassName(prev => prev + ' active')
        else
            setClassName('contact')
    }, [contactClicked, id])

    const handleContactClicked = () => {
        if ((contactClicked.isContactClicked) && (contactClicked.roomId === id))
            return
        setContactClicked(prevState => ({
            ...prevState,
            isContactClicked: true,
            roomId: id,
            name: contactName,
            username
        }));
    }

    return (
        <>
            <li id={id} className={className} onClick={handleContactClicked}>
                <div className="wrap">
                    <span className="contact-status online"></span>
                    <img src="http://emilcarlsson.se/assets/donnapaulsen.pngnk" alt="" />
                    <div className="meta">
                        <p className="name">
                            { contactName }
                        </p>
                        <p className="preview">
                            <span>
                                { previewText }
                                <span id="timestamp" >
                                    { timestamp }
                                </span>
                            </span>
                        </p>
                    </div>
                </div>
            </li>
        </>
    );
};

export default Contact;
