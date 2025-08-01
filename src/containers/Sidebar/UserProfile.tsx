import { Component } from 'react'
import { connect } from 'dva'
import { Avatar, Popover } from 'antd'
import { StoreState } from '@src/interfaces'
// import {userSignOut} from "appRedux/actions/Auth";

class UserProfile extends Component<{
  dispatch?: any
  authUser?: any
}> {
  render() {
    const { authUser } = this.props
    const userMenuOptions = (
      <ul className="gx-user-popover">
        {/* <li>My Account</li>
        <li>Connections</li> */}
        <li
          onClick={() => {
            this.props.dispatch({
              type: 'auth/userSignOut',
            })
          }}
        >
          Đăng xuất
        </li>
      </ul>
    )

    return (
      <div className="gx-flex-row gx-align-items-center gx-mb-4 gx-avatar-row">
        <Popover
          placement="bottomRight"
          content={userMenuOptions}
          trigger="click"
        >
          <Avatar
            src="https://via.placeholder.com/150x150"
            className="gx-size-40 gx-pointer gx-mr-3"
            alt=""
          />
          <span className="gx-avatar-name">
            {authUser ? `${authUser.name}` : ''}
            <i className="icon icon-chevron-down gx-fs-xxs gx-ml-2" />
          </span>
        </Popover>
      </div>
    )
  }
}

const mapStateToProps = ({ auth }: StoreState) => {
  const { authUser } = auth
  return { authUser }
}
export default connect(mapStateToProps, null)(UserProfile)
