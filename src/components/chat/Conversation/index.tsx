import ReceivedMessageCell from './ReceivedMessageCell/index'
import SentMessageCell from './SentMessageCell/index'

const Conversation = ({ conversationData, selectedUser }: any) => {
  return (
    <div className="gx-chat-main-content">
      {conversationData.map((conversation: any, index: number) =>
        conversation.type === 'sent' ? (
          <SentMessageCell key={index} conversation={conversation} />
        ) : (
          <ReceivedMessageCell
            key={index}
            conversation={conversation}
            user={selectedUser}
          />
        )
      )}
    </div>
  )
}

export default Conversation
