import UserCell from './UserCell/index'

const ChatUserList = ({ chatUsers, selectedSectionId, onSelectUser }: any) => {
  return (
    <div className="gx-chat-user">
      {chatUsers.map((chat: any, index: number) => (
        <UserCell
          key={index}
          chat={chat}
          selectedSectionId={selectedSectionId}
          onSelectUser={onSelectUser}
        />
      ))}
    </div>
  )
}

export default ChatUserList
