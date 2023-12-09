import React, { useRef } from 'react';
import { FormControl } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import "./styles.css";
import { IconButton, Image, Spinner, useToast } from "@chakra-ui/react";
import { getSender, getSenderFull } from "../config/ChatLogics";
import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowBackIcon } from "@chakra-ui/icons";
import ProfileModal from "./miscellaneous/ProfileModal";
import ScrollableChat from "./ScrollableChat";
import Lottie from "react-lottie";
import animationData from './animations/typing.json';

import io from "socket.io-client";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import { ChatState } from "../Context/ChatProvider";
const ENDPOINT = "http://localhost:5000"; 
var socket, selectedChatCompare;

const SingleChat = ({fetchAgain, setFetchAgain}) => {

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const toast = useToast();

  // from here
  const [file, setFile] = useState(); 
  const [image, setImage] = useState("");

  const [displayedSummary, setDisplayedSummary] = useState(null); //2611
  const [isBoxVisible, setIsBoxVisible] = useState(false);

  const scrollRef = useRef();
  // to here 

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

    const { selectedChat, setSelectedChat, user, 
        notification, 
        setNotification 
    } =
    ChatState();

    const fetchMessages = async () => {
      if (!selectedChat) return;
  
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };
  
        setLoading(true);
  
        const { data } = await axios.get(
          `/api/message/${selectedChat._id}`,
          config
        );
        // console.log(messages);
        setMessages(data);
        setLoading(false);
  
        socket.emit("join chat", selectedChat._id);
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to Load the Messages",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    };

    useEffect(() => {
      socket = io(ENDPOINT);
      socket.emit("setup", user);
      socket.on("connected", () => setSocketConnected(true));
      socket.on("typing", () => setIsTyping(true));
      socket.on("stop typing", () => setIsTyping(false));
  
      // eslint-disable-next-line
    }, []);

    useEffect(() => {
      fetchMessages();
  
      selectedChatCompare = selectedChat;
      // eslint-disable-next-line
    }, [selectedChat]);


    useEffect(() => {
      socket.on("message recieved", (newMessageRecieved) => {
        if (
          !selectedChatCompare || // if chat is not selected or doesn't match current chat
          selectedChatCompare._id !== newMessageRecieved.chat._id
        ) {
          if (!notification.includes(newMessageRecieved)) {
            setNotification([newMessageRecieved, ...notification]);
            setFetchAgain(!fetchAgain);
          }
        } else {
          setMessages([...messages, newMessageRecieved]);
        }
      });
    });


    // from here
    useEffect(() => {
      scrollRef.current?.scrollIntoView({ transition : "smooth" })
    }, [messages])
    // to here

    const sendMessage = async (event) => {
      if (event.key === "Enter" && newMessage) {
        socket.emit("stop typing", selectedChat._id);
        if(!file) {    //this
          try {
            const config = {
              headers: {
                "Content-type": "application/json",
                Authorization: `Bearer ${user.token}`,
              },
            };
            setNewMessage("");
            const { data } = await axios.post(
              "/api/message",
              {
                content: newMessage,
                chatId: selectedChat._id,
                type: "text"    //this
              },
              config
            );
  
            socket.emit("new message", data);
            setMessages([...messages, data]);
          } catch (error) {
            toast({
              title: "Error Occured!",
              description: "Failed to send the Message",
              status: "error",
              duration: 5000,
              isClosable: true,
              position: "bottom",
            });
          }
        } else {    //this
          // from here
          try {
            const config = {
              headers: {
                "Content-type": "application/json",
                Authorization: `Bearer ${user.token}`,
              },
            };
            setNewMessage("");
            const { data } = await axios.post(
              "/api/message",
              {
                content: image,               //newMessage,
                chatId: selectedChat._id,
                type: "file"    //this
              },
              config
            );
            setImage("");
            setFile("");
            //511 
            console.log("'data' received after posting to /api/msg"+data);
            socket.emit("new message", data);
            setMessages([...messages, data]);
          } catch (error) {
            toast({
              title: "Error Occured!",
              description: "Failed to send the Message",
              status: "error",
              duration: 5000,
              isClosable: true,
              position: "bottom",
            });
          }
          // to here
        }    //this
        
      }
    };



    const typingHandler = (e) => {
      setNewMessage(e.target.value);
  
      if (!socketConnected) return;
  
      if (!typing) {
        setTyping(true);
        socket.emit("typing", selectedChat._id);
      }
      let lastTypingTime = new Date().getTime();
      var timerLength = 3000;
      setTimeout(() => {
        var timeNow = new Date().getTime();
        var timeDiff = timeNow - lastTypingTime;
        if (timeDiff >= timerLength && typing) {
          socket.emit("stop typing", selectedChat._id);
          setTyping(false);
        }
      }, timerLength);
    };


    // from here

    useEffect(() => {
      const getImage = async () => {
        if(file) {
          // setLoading(true);   //here 
          const data = new FormData();
          data.append("name", file.name);
          data.append("file", file);

          let response;

          try {
            response = await axios.post('/api/message/file/upload', data);
            //511
            console.log("'response' received after posting to /file/upload"+response);
          } catch (error) {
            console.log("error while file upload apu", error.message);
          }

          setImage(response.data);
          // setLoading(false);   //here 
        }
      }
      getImage();
    }, [file])

    const onFileChange = (e) => {
      setFile(e.target.files[0]);
      setNewMessage(e.target.files[0].name);

    }
    // to here

      const handleSummarizeClick = async (chatId) => {
        try {
          // const config = {
          //   headers: {
          //     "Content-type": "application/json",
          //     Authorization: `Bearer ${user.token}`,
          //   },
          // };

          //
          const { data } = await axios.get(
            // `/api/chat/summarize/${chatId}`,
            `http://localhost:8000/messages/${chatId}`
            // config
          );
          //
          // const response = await axios.get(`/api/chat/summarize/${chatId}`);
          console.log(chatId);
          console.log("Summary:", data);
          setDisplayedSummary(data);
          // setDisplayedSummary(response.data.summary);
          setIsBoxVisible(true);
          
          // Handle the summary in your frontend UI
        } catch (error) {
          console.error("Error while summarizing:", error.message);
          console.log(chatId)
        }
      };
    
    const handleClearSummary = () => {
      setDisplayedSummary(null);
    };
  
    const handleCloseBox = () => {
      setIsBoxVisible(false);
    };

    const SummaryBox = ({ chatId, chatName, onClose, onClear, summary }) => {
      return (

        <div style={{
          border: '1px solid #ccc',
          padding: '20px',
          margin: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 1)',
          backgroundColor: '#fff',
          maxWidth: '850px',
          textAlign: 'center',
        }}>
                     <h2 style={{
            marginBottom: '30px',
            color: '#333',
            fontSize: '1.5em',
            fontWeight: 'bold',
            borderBottom: '2px solid #3399ff',
            paddingBottom: '5px',
          }}>
            Summary for Chat: {chatName}
          </h2> 

          {summary ? (
            <div>
              <div>
                <p>{summary}</p>
    </div>
              <button style={{backgroundColor: '#3399ff',color: '#fff',padding: '8px 16px',borderRadius: '5px', border: 'none',cursor: 'pointer',fontSize: '14px',fontWeight: 'bold',marginTop: '10px',marginRight: '5px',transition: 'background-color 0.3s ease',display: 'inline-block', }} 
              onClick={onClear}
              >
                Clear Summary
              </button>

              <button
                style={{backgroundColor: '#ccc',color: '#333',padding: '8px 16px',borderRadius: '5px', border: 'none',cursor: 'pointer',fontSize: '14px',fontWeight: 'bold',marginTop: '10px',transition: 'background-color 0.3s ease',display: 'inline-block', }}
                onClick={onClose}
              >
                Close
              </button>

            </div>
          ) : (
            <p>No summary available.</p>
          )}
        </div>
        
        
      );
    };

    return (
        <>
        {selectedChat ? (
          <>
            <Text
              fontSize={{ base: "28px", md: "30px" }}
              pb={3}
              px={2}
              w="100%"
              fontFamily="Work sans"
              display="flex"
              justifyContent={{ base: "space-between" }}
              alignItems="center"
            >
              <IconButton
                display={{ base: "flex", md: "none" }}
                icon={<ArrowBackIcon />}
                onClick={() => setSelectedChat("")}
              />
              {messages &&  //this wa s commemted
                (!selectedChat.isGroupChat ? (
                  <>
                    {getSender(user, selectedChat.users)}
                    <ProfileModal
                      user={getSenderFull(user, selectedChat.users)}
                    />
                  </>
                ) : (
                  <>
                    {selectedChat.chatName.toUpperCase()}
                    {
                    //sum
                    }
                                        <button style={{
                      backgroundColor: "#3399ff",
                      color: "white",
                      padding: "10px 20px",
                      borderRadius: "5px",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "16px",
                      fontWeight: "bold",
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                      transition: "background-color 0.3s ease",
                    }} onClick={() => handleSummarizeClick(selectedChat._id)}>
                      Summarize this chat
                    </button>
                        
                    {
                    //sum
                    }
                    <UpdateGroupChatModal
                      fetchMessages={fetchMessages}
                      fetchAgain={fetchAgain}
                      setFetchAgain={setFetchAgain}
                    />
                  </>
                ))}
            </Text>
            <Box
              display="flex"
              flexDir="column"
              justifyContent="flex-end"
              p={3}
              bg="#E8E8E8"
              w="100%"
              h="100%"
              borderRadius="lg"
              overflowY="hidden"
            >
              {isBoxVisible && (
                          <SummaryBox
                            chatId={selectedChat._id}
                            chatName={selectedChat.chatName}
                            onClose={handleCloseBox}
                            onClear={handleClearSummary}
                            summary={displayedSummary}
                          />
                        )}
              {loading ? (
                <Spinner
                  size="xl"
                  w={20}
                  h={20}
                  alignSelf="center"
                  margin="auto"
                />
              ) : (
                 <div className="messages" ref={scrollRef}>     { /* this being change */}
                  <ScrollableChat messages={messages} />
                </div>
              )}
  
              <FormControl
                onKeyDown={sendMessage}
                id="first-name"
                isRequired
                mt={3}
              >
                {istyping ? (
                  <div>
                    <Lottie
                      options={defaultOptions}
                      // height={50}
                      width={70}
                      style={{ marginBottom: 15, marginLeft: 0 }}
                    />
                  </div>
                ) : (
                  <></>
                )}
              
                <div>
                  {/* from here, and above div was placed */}
                  <label htmlFor='giffy-icon'>
                  <Image display={"inline"} id='gif-icon' src='https://media.istockphoto.com/id/1371870517/de/vektor/gif-icon-vektor-f%C3%BCr-grafikdesign-logo-website-social-media-mobile-app-ui-illustration.jpg?s=612x612&w=0&k=20&c=6t04k71rl9_buLHIiV7E2HnXXUeNL9rGj-j6EGzgbhk=' alt='giffy icon' height={8} width={8} borderRadius={'50%'} />
                  </label>
                <Input
                  type='file'
                  accept='image/gif, image/jpg, image/png, image/jpeg'
                  id='giffy-icon'
                  display={"none"}
                  ml={2}
                  onChange={(e) => onFileChange(e)}
                  // value={newMessage}
                />
                {/* to here, */}
                <Input
                  variant="filled"
                  bg="#E0E0E0"
                  placeholder="Enter a message.."
                  value={newMessage}
                  onChange={typingHandler}
                  width={"95%"}
                  ml={2}
                />
                </div>
                
              </FormControl>
            </Box>
          </>
        ) : (
          // to get socket.io on same page
          <Box display="flex" alignItems="center" justifyContent="center" h="100%">
            <Text fontSize="3xl" pb={3} fontFamily="Work sans">
              Click on a user to start chatting
            </Text>
          </Box>
        )}
      </>
    );
};

export default SingleChat