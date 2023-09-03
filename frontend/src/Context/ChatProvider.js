import React, { createContext, useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [selectedChat, setSelectedChat] = useState();
  const [user, setUser] = useState();
  const [notification, setNotification] = useState([]);
  const [chats, setChats] = useState([]);

  const history = useHistory();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    setUser(userInfo);

    if (!userInfo) history.push("/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history]);

  //  useEffect(() => {
  //   const fetchUserData = async () => {
  //     const userInfo = await JSON.parse(localStorage.getItem("userInfo"));
  //     setUser(userInfo);
  //     if (!userInfo) {
  //       navigate("/");
  //     }
  //   };
  //   fetchUserData();    //tick rtik 59min video
  // }, [navigate])


  // useEffect(() => {
  //   const fetchUserData = async () => {
  //     const userInfo = await JSON.parse(localStorage.getItem("userInfo"));
  //     setUser(userInfo);
  //     if (!userInfo) {
  //       history.push("/");
  //     }
  //   };
  //   fetchUserData(); //hm, rigth check this first before above
  // }, [history])


  return (
    <ChatContext.Provider
      value={{
        selectedChat,
        setSelectedChat,
        user,
        setUser,
        notification,
        setNotification,
        chats,
        setChats,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const ChatState = () => {
  return useContext(ChatContext);
};

export default ChatProvider;