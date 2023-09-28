import { useContext, useEffect, useState } from "react";
import logo from "../assets/download(1).svg";
import axios from "axios";
import { loginRoute } from "../API_Routes/API_Routes";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";

export default function Register() {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState({
    username: "",
    password: "",
  });

  const userData = useContext(UserContext);

  useEffect(() => {
    if (userData.username) {
      if (userData.isAvatarImageSet) {
        navigate("/");
      } else {
        navigate("/avatar");
      }
    }
  }, [userData.userLoaded]);

  const toastOptions = {
    position: "top-center",
    autoclose: 5000,
    theme: "dark",
    closeOnClick: true,
    pauseOnHover: true,
    pauseOnFocusLoss: true,
  };

  function handleFormChange(e) {
    setUserDetails({ ...userDetails, [e.target.name]: e.target.value });
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    if (userDetails.username.length === 0) {
      toast.error("Username is required", toastOptions);
    }
    if (userDetails.password.length === 0) {
      toast.error("Password is required", toastOptions);
    }
    if (
      userDetails.username.length !== 0 &&
      userDetails.password.length !== 0
    ) {
      axios
        .post(loginRoute, userDetails, { withCredentials: true })
        .then((data) => {
          if (data.status === 200) {
            userData.setId(data.data.id);
            userData.setUsername(data.data.username);
            userData.setIsAvatarImageSet(data.data.isAvatarImageSet);
            setUserDetails({ username: "", password: "" });
            userData.setUserLoaded(prev => prev + 1);
          }
        })
        .catch((error) => {
          if (error.response.status === 401) {
            toast.error(error.response.data.message, toastOptions);
          }
        });
    }
  }

  return (
    <div className="h-screen bg-blue-50 flex items-center flex-col justify-center overflow-hidden">
      <form
        className="w-96 mx-auto h-96 flex justify-center flex-col bg-gray-300 border rounded-md px-4"
        onSubmit={handleFormSubmit}
      >
        <div className="flex justify-center mb-5">
          <img className="w-72" src={logo} alt="logo" />
        </div>
        <div className="mb-10">
          <input
            type="text"
            placeholder="username"
            className="block w-full rounded p-2 mb-2 border bg-blue-50"
            name="username"
            value={userDetails.username}
            onChange={handleFormChange}
          />
          <input
            type="password"
            placeholder="password"
            className="block w-full rounded p-2 mb-2 border bg-blue-50"
            name="password"
            value={userDetails.password}
            onChange={handleFormChange}
          />
          <button className="bg-[#01103d] w-full rounded text-white p-2 hover:bg-blue-50 hover:text-[#01103d] hover:border-4 hover:border-[#01103d] border-4 border-[#01103d] text-lg font-semibold mt-3">
            Login
          </button>
        </div>
      </form>
      <h1 className="text-lg mb-10">
        Don't have an account?{" "}
        <Link to="/register" className="text-blue-500">
          <strong>Register</strong>
        </Link>
      </h1>
    </div>
  );
}
