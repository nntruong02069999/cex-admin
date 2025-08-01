import { io as socketIOClient } from 'socket.io-client'
import { IS_DEBUG } from '@src/constants/constants'

type SocketProps = {
  ENDPOINT?: string
  socket?: any
  newUserCallback?: any
  receiveMessageCallback?: any
  roomId?: any
  token: string
}

const generateUrl = () => {
  return process.env.REACT_APP_CHAT_URL || 'http://localhost:5000'
}

export default class Socket {
  _socket: any

  constructor(opts: SocketProps) {
    const { ENDPOINT, roomId, token } = opts

    const query: any = {}
    if (roomId) {
      query.roomId = roomId
    }
    this._socket = socketIOClient(ENDPOINT || 'http://localhost:5000', {
      query,
      auth: {
        token:
          token ||
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImFkbWluIiwibmFtZSI6ImFkbWluIiwidGh1bWIiOiIiLCJhcHAiOiJtMWNoYXQiLCJpYXQiOjE2Mzk5OTM5MDF9.X7dpOx69IMBQ0fKxLSU5a4P4PHWMkefNMOzcTCmSEjg',
      },
    })
    this.init({
      ...opts,
      socket: this._socket,
    })
  }

  async init(opts: SocketProps) {
    this.handleSocket(opts)
  }

  async handleSocket({ socket, ...rest }: SocketProps) {
    socket.on('connect_error', () => {
      if (IS_DEBUG) {
        console.log(
          `🚀 ~ file: ChatCtrl.tsx ~ line 338 ~ ChatCtrl ~ this.socket.on ~ connect_error`
        )
      }
      /* this.socket.auth.token = 'abcd'
      this.socket.connect() */
    })
    socket.on('connect', () => {
      if (IS_DEBUG) {
        console.log(
          `🚀 ~ file: ChatCtrl.tsx ~ connect ~ this.socket.connected`,
          socket.connected
        )
        console.log(`🚀 ~ file: ChatCtrl.tsx ~ connect ~ this.socket`, socket)
      }
    })
    socket.on('disconnect', () => {
      if (IS_DEBUG) {
        console.log(
          `🚀 ~ file: ChatCtrl.tsx ~ disconnect ~ this.socket.connected`,
          socket.connected
        )
        console.log(
          `🚀 ~ file: ChatCtrl.tsx ~ disconnect ~ this.socket.id`,
          socket.id
        )
      }
    })
    socket.on('new user', (data: any) => {
      console.log(
        `🚀 ~ file: ChatCtrl.tsx ~ line 335 ~ ChatCtrl ~ this.socket.on ~ data`,
        data
      )
      rest.newUserCallback?.(data)
    })

    socket.on('new message', (msg: any) => {
      if (IS_DEBUG) {
        console.log(
          `🚀 ~ file: Socket.ts ~ line 68 ~ Socket ~ socket.on new message ~ msg`,
          msg
        )
      }
      rest.receiveMessageCallback?.(msg)
    })
  }

  getSocketAdapter() {
    return this._socket
  }
}

let socket: any

export const connect = (roomId: any) => {
  socket = socketIOClient(generateUrl(), {
    query: {
      roomId,
    },
    forceNew: true,
  })
  return socket
}

export const getSocket = () => socket
