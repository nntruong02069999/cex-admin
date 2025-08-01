import React, { Component } from "react";
import { connect,routerRedux } from "dva";
import { Avatar, Popover } from "antd";

class UserInfo extends Component {

  render() {
    const userMenuOptions = (
      <ul className="gx-user-popover">
        <li onClick={()=>{
            this.props.dispatch(routerRedux.push({ pathname: `/account/userinfo` }))
        }}
        >Thông tin
        </li>
        {/* <li>Connections</li> */}
        <li onClick={() => {
          this.props.dispatch({
            type: "auth/userSignOut"
          });
        }}>Đăng xuất
        </li>
      </ul>
    );

    return (<>
      <Popover overlayClassName="gx-popover-horizantal" placement="bottomRight" content={userMenuOptions}
        trigger="click">
        <Avatar src='https://via.placeholder.com/150x150'
          className="gx-avatar gx-pointer" alt="" />
      </Popover>
      </>

      
    );

  }
}

export default connect(null)(UserInfo);
