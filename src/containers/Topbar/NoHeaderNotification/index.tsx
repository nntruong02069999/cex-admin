import React from 'react'
import { connect } from 'dva'

// import IntlMessages from '@src/util/IntlMessages'
import { StoreState } from '@src/interfaces'

class NoHeaderNotification extends React.Component<{
  dispatch?: any
  navCollapsed?: any
}> {
  render() {
    const { navCollapsed } = this.props
    return (
      <div className="gx-no-header-horizontal">
        <div className="gx-d-block gx-d-lg-none gx-linebar gx-mr-xs-3">
          <i
            className="gx-icon-btn icon icon-menu"
            onClick={() => {
              this.props.dispatch({
                type: 'settings/toggleCollapsedNav',
                payload: !navCollapsed,
              })
            }}
          />
        </div>
        {/* <div className="gx-no-header-horizontal-top">
          <div className="gx-no-header-horizontal-top-center">
            <i className="icon icon-alert gx-mr-3" />
            <p className="gx-mb-0 gx-text-truncate">
              <IntlMessages id="app.announced" />
            </p>
          </div>
        </div> */}
      </div>
    )
  }
}

const mapStateToProps = ({ settings }: StoreState) => {
  const { navCollapsed } = settings
  return { navCollapsed }
}
export default connect(mapStateToProps)(NoHeaderNotification)
