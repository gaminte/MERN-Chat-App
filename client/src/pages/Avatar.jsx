import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { Buffer } from "buffer";
import Loader from "../assets/loaderNew.gif";
import "react-toastify/dist/ReactToastify.css";
import { avatarRoute } from "../API_Routes/API_Routes";
import { UserContext } from "../contexts/UserContext";

export default function Avatar({ setUserAvatar }) {
  const api = "https://api.multiavatar.com";
  const navigate = useNavigate();
  const [avatars, setAvatars] = useState([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isAvatarsLoading, setIsAvatarsLoading] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  const toastOptions = {
    position: "top-center",
    autoClose: 5000,
    pauseOnHover: true,
    pauseOnFocusLoss: true,
    theme: "dark",
    closeOnClick: true,
  };

  const userData = useContext(UserContext);

  useEffect(() => {
    if (userData.username) {
      if (userData.isAvatarImageSet) {
        navigate("/");
      } else {
        navigate("/avatar");
      }
    } else {
      navigate("/login");
    }
  }, [userData.userLoaded]);

  useEffect(() => {
    async function fetchData() {
      const data = [];
      for (let i = 1; i <= 5; i++) {
        const image = await axios.get(
          `${api}/${Math.round(
            Math.random() * 1000
          )}?apikey=process.env.REACT_APP_MULTIAVATAR_API_KEY`
        );
        let buf = new Buffer(image.data);
        data.push(buf.toString("base64"));
      }
      setAvatars(data);
      setIsPageLoading(false);
    }
    fetchData();
  }, []);

  async function setAvatar() {
    if (selectedAvatar === null && !userData.isAvatarImageSet) {
      toast.error("Please select an avatar", toastOptions);
    }
    if (selectedAvatar !== null || userData.isAvatarImageSet) {
      if (selectedAvatar !== null) {
        axios
          .post(
            `${avatarRoute}/${userData.id}`,
            { image: avatars[selectedAvatar] },
            { withCredentials: true }
          )
          .then((data) => {
            userData.setIsAvatarImageSet(data.data.isAvatarImageSet);
            userData.setUserLoaded((prev) => prev + 1);
            navigate("/");
          })
          .catch((error) => console.log(error));
      } else {
        navigate("/");
      }
    }
  }

  async function refreshAvatars() {
    const data = [];
    for (let i = 1; i <= 5; i++) {
      const image = await axios.get(
        `${api}/${Math.round(
          Math.random() * 1000
        )}?apikey=process.env.REACT_APP_MULTIAVATAR_API_KEY`
      );
      let buf = new Buffer(image.data);
      data.push(buf.toString("base64"));
    }
    setAvatars(data);
    setIsAvatarsLoading(false);
  }

  return (
    <>
      {isPageLoading ? (
        <div className="w-screen h-screen flex justify-center items-center bg-[#0e103d]">
          <img src={Loader} alt="loading" className="w-3/12" />
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center w-screen h-screen bg-[#0e103d]">
          <div className="md:text-6xl mb-16 text-white min-[320px]:text-4xl">
            <h1>Choose your avatar</h1>
          </div>
          {isAvatarsLoading ? (
            <div className="flex justify-center items-center">
              <img src={Loader} alt="loading" className="w-1/5" />
            </div>
          ) : (
            <div className="flex justify-center items-center min-[320px]: flex-wrap">
              {avatars.map((item, index) => {
                return (
                  <div
                    key={index}
                    className={`m-4 ${
                      selectedAvatar === index
                        ? "border-btnColor rounded-full w-32 border-8"
                        : ""
                    }`}
                  >
                    <img
                      className="w-28"
                      src={`data:image/svg+xml;base64,${item}`}
                      alt="avatar"
                      onClick={() => setSelectedAvatar(index)}
                    />
                  </div>
                );
              })}
            </div>
          )}
          <div className="mt-8">
            <button
              className="text-white text-base border-2 rounded-md px-2.5 hover:bg-white hover:text-[#01103d]"
              onClick={() => {
                refreshAvatars();
                setIsAvatarsLoading(true);
                setSelectedAvatar(null);
              }}
            >
              Refresh
            </button>
          </div>
          <div className="mt-16">
            <button
              className="text-white"
              onClick={() => {
                setUserAvatar(avatars[selectedAvatar]);
                setAvatar();
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-20 h-20"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
