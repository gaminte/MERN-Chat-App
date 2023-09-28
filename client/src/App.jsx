import { ToastContainer } from "react-toastify";
import Register from "./pages/Register";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Chat from "./pages/Chat";
import Avatar from "./pages/Avatar";
import { UserContextProvider } from "./contexts/UserContext";
import { useState } from "react";

function App() {
  const [avatar, setAvatar] = useState("");

  function setUserAvatar(selectedAvatar) {
    setAvatar(selectedAvatar);
  }

  return (
    <>
      <UserContextProvider>
        <Router>
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/avatar" element={<Avatar setUserAvatar={setUserAvatar}/>}></Route>
            <Route path="/" element={<Chat avatar={avatar}/>}></Route>
          </Routes>
        </Router>
      </UserContextProvider>
      <ToastContainer />
    </>
  );
}

export default App;
