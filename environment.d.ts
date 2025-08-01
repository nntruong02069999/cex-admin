declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production'
      PORT?: string | number
      PWD: string
      SKIP_PREFLIGHT_CHECK?: boolean
      GENERATE_SOURCEMAP?: boolean
      REACT_APP_URL?: string
      REACT_APP_PAGESIZE?: number | string
      REACT_APP_NOTIFICATION_ERROR?: number | string
      REACT_APP_IMAGE_URI?: string
      REACT_APP_FILE_MANAGER?: string
      REACT_APP_PAGE_SIZE?: number | string
      REACT_APP_APP_NAME?: string
      REACT_APP_CHAT_URL?: string
    }
  }
}

// export {}
