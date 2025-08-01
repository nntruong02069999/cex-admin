import UserCell from "./UserCell/index";

const ContactList = ({onSelectUser, selectedSectionId, contactList}: any) => {
  return (
    <div className="gx-chat-user">
      {contactList.map((user: any, index: number) =>
        <UserCell key={index} user={user} selectedSectionId={selectedSectionId} onSelectUser={onSelectUser}/>
      )}
    </div>
  )
};

export default ContactList;
