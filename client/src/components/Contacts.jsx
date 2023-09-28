import { useContext } from "react";
import { UserContext } from "../contexts/UserContext.jsx";

export default function Contacts({
  selectedUserId,
  setSelectedUserId,
  userId,
  users,
  online,
}) {
  const userData = useContext(UserContext);
  return (
    <div
      className={
        "border-b border-gray-200 flex items-center cursor-pointer h-20 relative " +
        (selectedUserId === userId ? "bg-blue-100" : "")
      }
      key={userId}
      onClick={() => setSelectedUserId(userId)}
    >
      {selectedUserId === userId && (
        <div className="bg-[#01103d] w-2.5 h-20 rounded-r-md"></div>
      )}
      <div className="flex justify-start items-center gap-3 py-2 pl-4 w-full">
        <img
          src={`data:image/svg+xml;base64,${userData.allAvatars[userId]}`}
          alt="avatar"
          className="w-14 h-14"
        />
        <div
          className={`absolute w-5 h-5 ${
            online ? "bg-green-700" : "bg-gray-700"
          } border-blue-100 border-2 rounded-full bottom-0 top-[52px] left-[52px]`}
        ></div>
        <span className="text-gray-800">{users[userId]}</span>
      </div>
    </div>
  );
}
