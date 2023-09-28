import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/download(1).svg";
import {
  allMessagesRoute,
  allPeopleRoute,
  logoutRoute,
} from "../API_Routes/API_Routes";
import axios from "axios";
import { isUndefined, omitBy, uniqBy } from "lodash";
import { UserContext } from "../contexts/UserContext";
import Contacts from "../components/Contacts";

export default function Chat({ avatar }) {
  const [ws, setWs] = useState(null);
  const [usersOnline, setUsersOnline] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [inputMsg, setInputMsg] = useState("");
  const [messages, setMessages] = useState([]);
  const [usersOffline, setUsersOffline] = useState({});
  const navigate = useNavigate();

  const ref = useRef(null);

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
    connectToWs();
  }, []);

  function connectToWs() {
    const ws = new WebSocket("wss://taalk.onrender.com/");
    setWs(ws);
    ws.addEventListener("message", handleMessage);
    ws.addEventListener("close", () => {
      connectToWs();
    });
  }

  function handleMessage(e) {
    const messageData = JSON.parse(e.data);
    if ("online" in messageData) {
      showPeopleOnline(messageData.online);
    } else if ("text" in messageData) {
      if (messageData.from === selectedUserId)
        setMessages((prev) => [...prev, { ...messageData }]);
    }
  }

  function showPeopleOnline(peopleArray) {
    const onlinePeople = {};
    peopleArray.forEach((item) => {
      onlinePeople[item.userId] = item.username;
    });
    setUsersOnline(omitBy(onlinePeople, isUndefined));
  }

  function sendMsg(e) {
    e.preventDefault();
    if (inputMsg !== "") {
      ws.send(
        JSON.stringify({
          to: selectedUserId,
          text: inputMsg,
        })
      );
      setInputMsg("");
      setMessages((prev) => [
        ...prev,
        {
          text: inputMsg,
          from: userData.id,
          to: selectedUserId,
          _id: Date.now(),
        },
      ]);
    }
  }

  useEffect(() => {
    axios
      .get(allPeopleRoute, { withCredentials: true })
      .then((data) => {
        const offlinePeopleArr = data.data
          .filter((item) => item._id !== userData.id)
          .filter((item) => !Object.keys(usersOnline).includes(item._id));
        const offlinePeople = {};
        offlinePeopleArr.forEach((item) => {
          offlinePeople[item._id] = item.username;
        });
        setUsersOffline(offlinePeople);
      })
      .catch((error) => console.log(error));
  }, [usersOnline]);

  useEffect(() => {
    if (selectedUserId) {
      axios
        .get(`${allMessagesRoute}/${selectedUserId}`, { withCredentials: true })
        .then((data) => setMessages(data.data))
        .catch((error) => console.log(error));
    }
  }, [selectedUserId]);

  useEffect(() => {
    if (messages.length) {
      ref.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages.length]);

  function logout() {
    axios.get(logoutRoute, { withCredentials: true });
    userData.setUsername(null);
    userData.setUserLoaded((prev) => prev + 1);
  }

  const messagesWithoutDupes = uniqBy(messages, "_id");

  return (
    <div className="flex h-screen">
      {/* CONTACTS SECTION */}
      <div className="bg-white w-1/4 flex flex-col">
        <div className="flex items-center justify-center">
          <img className="w-[17rem]" src={logo} alt="logo" />
        </div>
        <div className="overflow-y-auto flex flex-col flex-grow">
          {Object.keys(usersOnline)
            .filter((userId) => userId != userData.id)
            .map((userId) => (
              <Contacts
                key={userId}
                selectedUserId={selectedUserId}
                setSelectedUserId={setSelectedUserId}
                userId={userId}
                users={usersOnline}
                online={true}
              />
            ))}
          {Object.keys(usersOffline)
            .filter((userId) => userId != userData.id)
            .map((userId) => (
              <Contacts
                key={userId}
                selectedUserId={selectedUserId}
                setSelectedUserId={setSelectedUserId}
                userId={userId}
                users={usersOffline}
                online={false}
              />
            ))}
        </div>
        <div className="self-start w-full bg-[#01103d] rounded-t-sm opacity-90 flex">
          <div className="flex justify-start items-center gap-3 py-2 pl-4 w-full">
            <img
              src={`data:image/svg+xml;base64,${avatar}`}
              alt="avatar"
              className="w-14 h-14 cursor-pointer"
              onClick={() => {
                userData.setIsAvatarImageSet(false);
                navigate("/avatar");
              }}
            />
            <span className="text-white">{userData.username}</span>
          </div>
          <button className="pr-4 text-white" onClick={logout}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-10 h-10"
            >
              <path
                fillRule="evenodd"
                d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6zm5.03 4.72a.75.75 0 010 1.06l-1.72 1.72h10.94a.75.75 0 010 1.5H10.81l1.72 1.72a.75.75 0 11-1.06 1.06l-3-3a.75.75 0 010-1.06l3-3a.75.75 0 011.06 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
      <div className="bg-blue-100 w-3/4 flex flex-col">
        {/* CHAT SECTION */}

        <div className="flex-grow overflow-y-auto flex flex-col-reverse">
          <div ref={ref}></div>
          {!selectedUserId ? (
            <div className="flex items-center justify-center h-full w-full">
              <div className="text-gray-500 opacity-70 flex items-center flex-col gap-3">
                <h1 className="text-3xl">
                  Welcome,{" "}
                  <span className="text-[#01103d]">{userData.username}</span>
                </h1>
                <h1 className="text-xl">&larr; Select a chat to continue.</h1>
              </div>
            </div>
          ) : (
            <div className="flex flex-col mt-3 w-full">
              {messagesWithoutDupes.map((msg, index) => (
                <div
                  key={index}
                  className={
                    "flex " +
                    (msg.from == userData.id
                      ? "self-end flex-row-reverse"
                      : "self-start")
                  }
                >
                  <img
                    src={`data:image/svg+xml;base64,${
                      userData.allAvatars[
                        msg.from == userData.id ? userData.id : selectedUserId
                      ]
                    }`}
                    alt="avatar"
                    className={
                      "w-10 h-10 " +
                      (msg.from == userData.id
                        ? "self-end mb-3 mr-2"
                        : "self-start mt-3 ml-2")
                    }
                  />
                  <div
                    key={index}
                    className={
                      "p-3 mx-2 my-3 rounded-lg text-lg inline-block " +
                      (msg.from == userData.id
                        ? "bg-[#01103d] text-white self-end"
                        : "bg-blue-50 self-start")
                    }
                  >
                    <h1>{msg.text}</h1>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* INPUT SECTION */}

        {!!selectedUserId && (
          <form
            className="flex m-2 bg-white outline-none border rounded-l-md"
            onSubmit={sendMsg}
          >
            <input
              type="text"
              placeholder="Message"
              className="p-2 flex-grow outline-none text-xl rounded-l-md bg-white"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
            />
            <button className="p-2 border rounded-md bg-[#01103d]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-7 h-7 text-blue-50"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                />
              </svg>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
