import React from 'react';
import { Container, Box, Text, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import Login from '../components/Authentication/Login';
import Signup from '../components/Authentication/Signup';
import { useEffect } from "react";
import { useHistory } from "react-router";

const Homepage = () => {

    const history = useHistory();

    useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));

    if (user) history.push("/chats");
    }, [history]);


    return (
        <Container maxW="xl" centerContent>
            <Box 
            display='flex' 
            justifyContent="center"
            p={3}
            bg={"white"}
            w="100%"
            m="40px 0 15px 0"
            borderRadius="lg"
            borderWidth="1px"
            >
                <Text textAlign="Center" fontSize="4xl" fontFamily="Work sans" color="black">Chit-Chat</Text>
            </Box>
            <Box bg="white" w="100%" p={4} borderRadius="lg" color="black" borderWidth="1px">
                <Tabs isFitted variant="soft-rounded">
                    <TabList mb="1em">
                        <Tab>Login</Tab>
                        <Tab>Sign Up</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            <Login />
                        </TabPanel>
                        <TabPanel>
                            <Signup />
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </Box>
        </Container>
    );
}

export default Homepage;