import { Component } from 'react'
import { Avatar, Button, Drawer, Input, Tabs } from 'antd'
import CustomScrollbars from '@src/util/CustomScrollbars'
import dayjs from 'dayjs'
import { connect } from 'dva'
import ChatUserList from '@src/components/chat/ChatUserList'
import Conversation from '@src/components/chat/Conversation'
import ContactList from '@src/components/chat/ContactList'
import IntlMessages from '@src/util/IntlMessages'
import SearchBox from '@src/components/SearchBox'
import CircularProgress from '@src/components/CircularProgress'
// import conversationList from './data/conversationList'
import users from './data/chatUsers'
import { StoreState } from '@src/interfaces'
import Socket from '@src/util/Socket'
import * as chatServices from '@src/services/chat'
import HttpStatusCode from '@src/constants/HttpStatusCode'
import { IS_DEBUG } from '@src/constants/constants'

const { TextArea } = Input
const TabPane = Tabs.TabPane

export interface ChatCtrlProps {
  dispatch?: any
  drawerState?: any
  authUser?: any
  chatUsers?: Array<any>
  conversationList?: Array<any>
}

export interface ChatCtrlState {
  message: string
  selectedUser: any
  conversation: any
  userState: number
  searchChatUser: any
  chatUsers?: Array<any>
  selectedSectionId: string
  userNotFound: string
  contactList: Array<any>
  selectedTabIndex: number
  loader: boolean
  conversationList: Array<any>
  drawerState: boolean
  chatToken?: string
}

class ChatCtrl extends Component<ChatCtrlProps, ChatCtrlState> {
  filterContact = (userName: string) => {
    if (userName === '') {
      return users.filter((user) => !user.recent)
    }
    return users.filter(
      (user) =>
        !user.recent &&
        user.name.toLowerCase().indexOf(userName.toLowerCase()) > -1
    )
  }

  filterUsers = (userName: string) => {
    const { chatUsers } = this.props
    if (userName === '') {
      return chatUsers?.filter((user) => user.recent)
    }
    return chatUsers?.filter(
      (user) =>
        user.recent &&
        user.name.toLowerCase().indexOf(userName.toLowerCase()) > -1
    )
  }

  Communication = () => {
    const { message, selectedUser, conversation } = this.state
    const { conversationData } = conversation
    return (
      <div className="gx-chat-main">
        <div className="gx-chat-main-header">
          <span className="gx-d-block gx-d-lg-none gx-chat-btn">
            <i
              className="gx-icon-btn icon icon-chat"
              onClick={this.onToggleDrawer.bind(this)}
            />
          </span>
          <div className="gx-chat-main-header-info">
            <div className="gx-chat-avatar gx-mr-2">
              <div className="gx-status-pos">
                <Avatar
                  src={selectedUser.thumb}
                  className="gx-rounded-circle gx-size-60"
                  alt=""
                />

                <span className={`gx-status gx-${selectedUser.status}`} />
              </div>
            </div>

            <div className="gx-chat-contact-name">{selectedUser.name}</div>
          </div>
        </div>

        <CustomScrollbars className="gx-chat-list-scroll">
          <Conversation
            conversationData={conversationData}
            selectedUser={selectedUser}
          />
        </CustomScrollbars>

        <div className="gx-chat-main-footer">
          <div
            className="gx-flex-row gx-align-items-center"
            style={{ maxHeight: 51 }}
          >
            <div className="gx-col">
              <div className="gx-form-group">
                <textarea
                  id="required"
                  className="gx-border-0 ant-input gx-chat-textarea"
                  onKeyUp={this._handleKeyPress.bind(this)}
                  onChange={this.updateMessageValue.bind(this)}
                  value={message}
                  placeholder="Type and hit enter to send message"
                />
              </div>
            </div>
            <i
              className="gx-icon-btn icon icon-sent"
              onClick={this.submitComment.bind(this)}
            />
          </div>
        </div>
      </div>
    )
  }

  AppUsersInfo = () => {
    return (
      <div className="gx-chat-sidenav-main">
        <div className="gx-bg-grey-light gx-chat-sidenav-header">
          <div className="gx-chat-user-hd gx-mb-0">
            <i
              className="gx-icon-btn icon icon-arrow-left"
              onClick={() => {
                this.setState({ userState: 1 })
              }}
            />
          </div>
          <div className="gx-chat-user gx-chat-user-center">
            <div className="gx-chat-avatar gx-mx-auto">
              <Avatar
                src="https://via.placeholder.com/150x150"
                className="gx-size-60"
                alt="John Doe"
              />
            </div>

            <div className="gx-user-name h4 gx-my-2">Robert Johnson</div>
          </div>
        </div>
        <div className="gx-chat-sidenav-content">
          <CustomScrollbars className="gx-chat-sidenav-scroll">
            <div className="gx-p-4">
              <form>
                <div className="gx-form-group gx-mt-4">
                  <label>Mood</label>

                  <TextArea
                    // fullWidth
                    id="exampleTextarea"
                    // multiline
                    rows={3}
                    onKeyUp={this._handleKeyPress.bind(this)}
                    onChange={this.updateMessageValue.bind(this)}
                    defaultValue="it's a status....not your diary..."
                    placeholder="Status"
                    // margin="none"
                  />
                </div>
              </form>
            </div>
          </CustomScrollbars>
        </div>
      </div>
    )
  }

  ChatUsers = () => {
    return (
      <div className="gx-chat-sidenav-main">
        <div className="gx-chat-sidenav-header">
          <div className="gx-chat-user-hd">
            <div
              className="gx-chat-avatar gx-mr-3"
              onClick={() => {
                this.setState({
                  userState: 2,
                })
              }}
            >
              <div className="gx-status-pos">
                <Avatar
                  // id="avatar-button"
                  src="https://via.placeholder.com/150x150"
                  className="gx-size-50"
                  alt=""
                />
                <span className="gx-status gx-online" />
              </div>
            </div>

            <div className="gx-module-user-info gx-flex-column gx-justify-content-center">
              <div className="gx-module-title">
                <h5 className="gx-mb-0">Robert Johnson</h5>
              </div>
              <div className="gx-module-user-detail">
                <span className="gx-text-grey gx-link">robert@example.com</span>
              </div>
            </div>
          </div>

          <div className="gx-chat-search-wrapper">
            <SearchBox
              styleName="gx-chat-search-bar gx-lt-icon-search-bar-lg"
              placeholder="Search or start new chat"
              onChange={this.updateSearchChatUser.bind(this)}
              value={this.state.searchChatUser}
            />
          </div>
        </div>

        <div className="gx-chat-sidenav-content">
          {/*<AppBar position="static" className="no-shadow chat-tabs-header">*/}
          <Tabs className="gx-tabs-half" defaultActiveKey="1">
            <TabPane tab={<IntlMessages id="chat.chatUser" />} key="1">
              <CustomScrollbars className="gx-chat-sidenav-scroll-tab-1">
                {this.props.chatUsers?.length === 0 ? (
                  <div className="gx-p-5">{this.state.userNotFound}</div>
                ) : (
                  <ChatUserList
                    chatUsers={this.props.chatUsers?.filter(
                      (u) =>
                        u.recent && u.username !== this.props.authUser.username
                    )}
                    selectedSectionId={this.state.selectedSectionId}
                    onSelectUser={this.onSelectUser.bind(this)}
                  />
                )}
              </CustomScrollbars>
            </TabPane>
            <TabPane tab={<IntlMessages id="chat.contacts" />} key="2">
              <CustomScrollbars className="gx-chat-sidenav-scroll-tab-2">
                {this.state.contactList.length === 0 ? (
                  <div className="gx-p-5">{this.state.userNotFound}</div>
                ) : (
                  <ContactList
                    contactList={this.state.contactList}
                    selectedSectionId={this.state.selectedSectionId}
                    onSelectUser={this.onSelectUser.bind(this)}
                  />
                )}
              </CustomScrollbars>
            </TabPane>
          </Tabs>
        </div>
      </div>
    )
  }

  _handleKeyPress = (e: any) => {
    if (e.key === 'Enter') {
      this.submitComment()
    }
  }

  handleChange = (event: any, value: number) => {
    this.setState({ selectedTabIndex: value })
  }

  handleChangeIndex = (index: number) => {
    this.setState({ selectedTabIndex: index })
  }

  onSelectUser = (user: any) => {
    const roomId =
      this.props.authUser.username == 'root'
        ? `${this.props.authUser.id}-${user.id}`
        : `${user.id}-${this.props.authUser.id}`
    const socket = new Socket({
      roomId,
      token: this.state.chatToken as string,
    })
    this.socketAdapter = socket.getSocketAdapter()
    // this.socketAdapter.emit('join room', { roomId })
    this.props.dispatch({
      type: 'chat/getConversation',
      payload: {
        senderId: this.props.authUser.id,
        receiverId: user.id,
        token: this.state.chatToken,
      },
      callback: ({ conversationList }: any) => {
        if (IS_DEBUG) {
          console.log(
            `🚀 ~ file: ChatCtrl.tsx ~ line 295 ~ ChatCtrl ~ conversationList`,
            conversationList
          )
        }

        this.setState({
          loader: true,
          selectedSectionId: user.id,
          drawerState: this.props.drawerState,
          selectedUser: user,
          conversation: conversationList.find(
            (data: any) => data.id === user.id
          ),
        })
      },
    })
    /* this.socketAdapter.emit('select user', {
      conversation_id: `${this.props.authUser.id}-${user.id}`,
    }) */
    setTimeout(() => {
      this.setState({ loader: false })
    }, 1500)
  }

  showCommunication = () => {
    return (
      <div className="gx-chat-box">
        {this.state.selectedUser === null ? (
          <div className="gx-comment-box">
            <div className="gx-fs-80">
              <i className="icon icon-chat gx-text-muted" />
            </div>
            <h1 className="gx-text-muted">
              {<IntlMessages id="chat.selectUserChat" />}
            </h1>
            <Button
              className="gx-d-block gx-d-lg-none"
              type="primary"
              onClick={this.onToggleDrawer.bind(this)}
            >
              {<IntlMessages id="chat.selectContactChat" />}
            </Button>
          </div>
        ) : (
          this.Communication()
        )}
      </div>
    )
  }

  constructor(props: ChatCtrlProps) {
    super(props)
    this.state = {
      loader: false,
      userNotFound: 'No user found',
      drawerState: false,
      selectedSectionId: '',
      selectedTabIndex: 1,
      userState: 1,
      searchChatUser: '',
      contactList: users.filter((user) => !user.recent),
      selectedUser: null,
      message: '',
      chatUsers: users.filter((user) => user.recent),
      conversationList: props.conversationList || [],
      conversation: null,
    }
  }

  socketAdapter: any

  static getDerivedStateFromProps(
    nextProps: ChatCtrlProps,
    prevState: ChatCtrlState
  ) {
    if (nextProps?.conversationList != prevState?.conversationList) {
      return { conversationList: nextProps.conversationList }
    } else return null // Triggers no change in the state
  }

  componentDidMount() {
    // const ENDPOINT = 'https://mediaone-chat.mpoint.vn'
    chatServices
      .chatLogin(this.props.authUser.username, '123')
      .then((res: any) => {
        if (res.status == HttpStatusCode.OK && !res?.data.errorCode) {
          const chatToken = res.data.userToken
          this.setState({ chatToken })
          const socket = new Socket({
            token: chatToken,
            newUserCallback: (data: any) => {
              this.props.dispatch({
                type: 'chat/setUsers',
                payload: {
                  users: data,
                },
              })
            },
            receiveMessageCallback: (msg: any) => {
              if (IS_DEBUG) {
                console.log(
                  `🚀 ~ file: ChatCtrl.tsx ~ line 395 ~ ChatCtrl ~ chatServices.chatLogin ~ msg`,
                  msg
                )
                console.log(
                  `🚀 ~ file: ChatCtrl.tsx ~ line 398 ~ ChatCtrl ~ chatServices.chatLogin ~ this.props.authUser`,
                  this.props.authUser
                )
                console.log(
                  `🚀 ~ file: ChatCtrl.tsx ~ line 408 ~ ChatCtrl ~ .then ~ this.state.conversation`,
                  this.state.conversation
                )
              }

              if (
                msg.user.refId != this.props.authUser.id &&
                this.state.conversation
              ) {
                const updatedConversation =
                  this.state.conversation.conversationData.concat({
                    type: 'received',
                    message: msg.message_body,
                    sentAt: dayjs(msg.created_at).format('hh:mm:ss A'),
                  })
                this.setState({
                  conversation: {
                    ...this.state.conversation,
                    conversationData: updatedConversation,
                  },
                  message: '',
                  conversationList: this.state.conversationList.map(
                    (conversationData) => {
                      if (conversationData.id === this.state.conversation.id) {
                        return {
                          ...this.state.conversation,
                          conversationData: updatedConversation,
                        }
                      } else {
                        return conversationData
                      }
                    }
                  ),
                })
              }
            },
          })
          this.socketAdapter = socket.getSocketAdapter()

          this.socketAdapter.emit('new user', {
            refId: this.props.authUser.id,
            name: this.props.authUser.name,
            username: this.props.authUser.username,
            thumb: this.props.authUser.avatar,
            status: 'online',
            recent: true,
          })
        }
      })
  }

  componentWillUnmount() {
    this.socketAdapter.disconnect()
  }

  submitComment() {
    if (this.state.message !== '') {
      const updatedConversation =
        this.state.conversation.conversationData.concat({
          type: 'sent',
          message: this.state.message,
          sentAt: dayjs().format('hh:mm:ss A'),
        })
      this.setState({
        conversation: {
          ...this.state.conversation,
          conversationData: updatedConversation,
        },
        message: '',
        conversationList: this.state.conversationList.map(
          (conversationData) => {
            if (conversationData.id === this.state.conversation.id) {
              return {
                ...this.state.conversation,
                conversationData: updatedConversation,
              }
            } else {
              return conversationData
            }
          }
        ),
      })
      this.socketAdapter
        // .of(`${this.props.authUser.id}-${this.state.selectedSectionId}`)
        .emit('chat message', {
          message_body: this.state.message,
          sender_id: this.props.authUser.id,
          receiver_id: this.state.selectedSectionId,
          conversation_id:
            this.props.authUser.username == 'root'
              ? `${this.props.authUser.id}-${this.state.selectedSectionId}`
              : `${this.state.selectedSectionId}-${this.props.authUser.id}`,
        })
    }
  }

  updateMessageValue(evt: any) {
    this.setState({
      message: evt.target.value,
    })
  }

  updateSearchChatUser(evt: any) {
    this.setState({
      searchChatUser: evt.target.value,
      contactList: this.filterContact(evt.target.value),
      chatUsers: this.filterUsers(evt.target.value),
    })
  }

  onToggleDrawer() {
    this.setState({
      drawerState: !this.state.drawerState,
    })
  }

  render() {
    const { loader, userState, drawerState } = this.state
    if (IS_DEBUG) {
      console.log(
        `🚀 ~ file: ChatCtrl.tsx ~ line 521 ~ ChatCtrl ~ render ~ this.state`,
        this.state
      )
      console.log(
        `🚀 ~ file: ChatCtrl.tsx ~ line 522 ~ ChatCtrl ~ render ~ this.props`,
        this.props
      )
    }

    return (
      <div className="gx-main-content">
        <div className="gx-app-module gx-chat-module">
          <div className="gx-chat-module-box">
            <div className="gx-d-block gx-d-lg-none">
              <Drawer
                placement="left"
                closable={false}
                visible={drawerState}
                onClose={this.onToggleDrawer.bind(this)}
              >
                {userState === 1 ? this.ChatUsers() : this.AppUsersInfo()}
              </Drawer>
            </div>
            <div className="gx-chat-sidenav gx-d-none gx-d-lg-flex">
              {userState === 1 ? this.ChatUsers() : this.AppUsersInfo()}
            </div>
            {loader ? (
              <div className="gx-loader-view">
                <CircularProgress />
              </div>
            ) : (
              this.showCommunication()
            )}
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = ({ auth, chat }: StoreState) => {
  const { users: chatUsers, conversationList } = chat
  const { authUser } = auth
  return { authUser, chatUsers, conversationList }
}

export default connect(mapStateToProps)(ChatCtrl)
