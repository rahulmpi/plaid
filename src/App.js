import React, { useState, useEffect } from "react";
import "./App.css";
import { BASE_URL } from "./api";
import axios from "axios";
import { usePlaidLink } from 'react-plaid-link';

function App() {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState("");
  const [userBtn, setUserBtn] = useState(false);
  const [token, setToken] = useState();

  const handleSubmit = async (e) =>{
    e.preventDefault();
    const response = await axios.post(`${BASE_URL}/server/create_new_user`, {username: userName, email: email });
    await refreshSignInStatus();
  }

  useEffect(() => {
    getExistingUsers();
  }, []);


  let linkTokenData;

  const getExistingUsers = async function () {  
    fetch(`${BASE_URL}/server/list_all_users`)
    .then((res) => res.json())
    .then((data) => setUsers(data))
    .catch((err) => console.log(err))
  }


   const refreshIDVStatus = async function () {
    const { fullInfo } = await axios(`${BASE_URL}/server/get_full_user_info`);
    // if (fullInfo["is_verified"] === 1) {
    //   const personalMessage = `Hello, ${fullInfo.first_name} ${fullInfo.last_name}. You are verified and can start using the app!`;
    //   document.querySelector("#personalInfo").textContent = personalMessage;
    // } else {
    //  // showIDVMessageForStatus(fullInfo["idv_status"]);
      fetchLinkTokenForIDV();
    // }
  };


  const fetchLinkTokenForIDV = async function () {
    linkTokenData = await axios.post(`${BASE_URL}/server/generate_link_token_for_idv`);
    setToken(linkTokenData.data.link_token)
  };

  const refreshSignInStatus = async function () {
    const userInfoObj = await axios(`${BASE_URL}/server/get_basic_user_info`, { userId });

    const userInfo = userInfoObj.data.userInfo;
    if (userInfo == null) {
      getExistingUsers();
    } else {
      await refreshIDVStatus();
    }
  };

  const handleLogin = async () =>{
    const response = await axios.post(`${BASE_URL}/server/sign_in`, { userId });
      setUserBtn(true)
      await refreshSignInStatus();
  }

  const handleLogout = async () =>{
    const response = await axios.post(`${BASE_URL}/server/sign_out`);
    console.log(response)
    setUserBtn(false)
    await refreshSignInStatus();
  }


  const { open, ready } = usePlaidLink({
    token,
    onSuccess: (public_token, metadata) => {
      // send public_token to server
    },
  });

  return (
    <div className="App">
     <form onSubmit={handleSubmit}>
         <label>Name</label>
         <input type="text" onChange={(e)=> setUserName(e.target.value)}/>
         <br/><br/>
         <label>Email</label>
         <input type="email" onChange={(e)=> setEmail(e.target.value)}/>
         <br/><br/>
         <button type="submit">Sign Up</button>
     </form>
       <select onChange={(e) => setUserId(e.target.value)}>
        <option selected>Please select</option>
        {
          users.map((elem) =>{
            return <option value={elem.id} key={elem.id} >{elem.username}</option>
          })
        }
       </select>
       {userBtn ? <button onClick={handleLogout}>Logout</button> : <button onClick={handleLogin}>Login</button> }

       <button onClick={() => open()} disabled={!ready}>Verify Identity</button>
    </div>
  );
}

export default App