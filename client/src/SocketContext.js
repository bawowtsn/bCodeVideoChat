import React, { createContext, useState, useRef, useEffect} from 'react';

import { io } from 'socket.io-client';
import Peer from 'simple-peer';


const SocketContext = createContext();

const socket = io('http://localhost:3000');



const ContextProvider = ({ children }) => {

    //we use the useState field here to set our current stream to state
    //the value for these variables in state are changed when ever we declare the set..(e.g setStream), their initial values are set here (e.g. null)

    const [stream, setStream] = useState(null);
    const [me, setMe] = useState('');
    const [call, setCall] = useState(null);
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [name, setName] = useState('');
    
    //useRef(object value) allows us to return an object as the initial value for the variables set here, this is special because it does not change with state and can be altered manually
    const myVideo = useRef();
    const userVideo = useRef();
    const connectionRef = useRef();

    //useEffect is like a component that mounts, as soons as it mounts, the code inside runs

    useEffect( async () => {
    
        //so what do we want to do as soon as our page loads? get permission to use video, camera & microphone by using ghte navigator.mediadevices method

        //this returns a promise so we can use .then method, so we get our stream and set it to the state

        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true});
                                  
         setStream(mediaStream);
          myVideo.current.srcObject = mediaStream;

        // navigator.mediaDevices.getUserMedia({ video: true, audio: true}).then((currentStream) => {
        //         setStream(currentStream);

        //         //setting the stream is not enough, we need to immediately populate the video frame with the src of our stream using useRefs

        //         console.log(myVideo)

        //         myVideo.current.srcObject = currentStream;
        //         console.log(myVideo)
        //     });
        
        //below we set the functions to listen to the things we are sending from our server socket

        socket.on('me', (id) => setMe(id));

        socket.on('callUser', ({ from, name: callerName, signal }) => {

            //we now use the setCall hook to populate values for our call variable

            setCall({ isReceivedCall: true, from, name: callerName, signal })
        });
    }, []);

    const answerCall = () => {
        setCallAccepted(true)

        //now we need to create a peer capable of video (a data channel is created by peer for texts, but we have to specify a 'stream' channel for videos), peer behaves similar to the socket, it will have some actions and handlers that will happen once we call sombody or answer a call

        const peer = new Peer({ initiator: false, trickle: false, stream });

        //once we receive a signal from peer we use a call back function, 
        peer.on('signal', (data) => {

            //now we use sockets intertwined with peers to establish that video connection
            //the 'from' value for call is gotten when we use the setCall hook above

            socket.emit('answerCall', { signal: data, to: call.from });

        });

        peer.on('stream', (currentStream) => {

            //here we strongly set the value of the useRef to what ever we are getting from this peer on connection.

            userVideo.srcObject = currentStream;

        });

        //the 'signal' value for call is gotten when we use the setCall hook above
        //below we are setting the calues for signal method of the peer connection and we are setting what we are receiving from peer as Ref hook we set for connectionRef

        peer.signal(call.signal);

        connectionRef.current = peer;
    }

    const callUser = (id) => {

        const peer = new Peer({ initiator: true, trickle: false, stream });

        peer.on('signal', (data) => {
            socket.emit('callUser', { userToCall: id, signal: data, from: me, name })
        });

        peer.on('stream', (currentStream) => {
            userVideo.current.srcObject = currentStream;
        });

        socket.on('callAccepted', (signal) => {
            setCallAccepted(true);

            peer.signal(signal);
        });

        connectionRef.current = peer;
    }

    const leaveCall = () => {
        setCallEnded(true);
        
        connectionRef.current.destroy();

        //this code below reloads the page and provides the user with a new ID so the user cal call another user right after connection is terminated

        window.location.reload();
    }

    return (
    <SocketContext.Provider value={call,callAccepted,myVideo,userVideo,stream,name,setName, callEnded,me,callUser,leaveCall,answerCall}>
            { children }
        </SocketContext.Provider>
    )

}

export { ContextProvider, SocketContext };