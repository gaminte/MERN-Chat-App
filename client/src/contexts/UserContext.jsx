import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { allAvatarsRoute, profileCheckRoute } from "../API_Routes/API_Routes";

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
  const [username, setUsername] = useState(null);
  const [id, setId] = useState(null);
  const [isAvatarImageSet, setIsAvatarImageSet] = useState(null);
  const [userLoaded, setUserLoaded] = useState(0);
  const [allAvatars, setAllAvatars] = useState({});

  useEffect(() => {
    axios
      .get(profileCheckRoute, { withCredentials: true })
      .then((data) => {
        setId(data.data.id);
        setUsername(data.data.username);
        setIsAvatarImageSet(data.data.isAvatarImageSet);
        setUserLoaded((prev) => prev + 1);
      })
      .catch((error) => console.log(error));
  }, []);

  useEffect(() => {
    axios
      .get(allAvatarsRoute, { withCredentials: true })
      .then((data) => {
        data.data.allAvatars.forEach((item) => {
          setAllAvatars((prev) => ({
            ...prev,
            [item._id]: item.avatarImage,
          }));
        });
      })
      .catch((error) => console.log(error));
  }, []);

  return (
    <UserContext.Provider
      value={{
        username,
        setUsername,
        id,
        setId,
        isAvatarImageSet,
        setIsAvatarImageSet,
        userLoaded,
        setUserLoaded,
        allAvatars,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
