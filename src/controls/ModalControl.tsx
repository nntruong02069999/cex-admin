import React, { Component } from 'react'
import { Button, Modal } from 'antd'
import { connect } from 'dva'
// import VoucherApproveCtrl from './VoucherApproveCtrl'
// import SyncVoucherCtrl from './SyncVoucherCtrl'
import FormCtrl from './layouts/schemaTemplate/FormCtrl'
// import VoucherPreview from './VoucherPreview'

class ModalControl extends Component<{
  dispatch: (payload?: any) => void
  modals?: any
}> {
  onClose(modal: any) {
    this.props.dispatch({ type: 'HIDE_MODAL', data: modal })
    setTimeout(() => {
      this.props.dispatch({ type: 'POP_MODAL', data: modal })
    }, 300)
  }

  render() {
    if (!this.props.modals) return null
    let content = null
    return (
      <React.Fragment>
        {this.props.modals.map((modal: any, index: number) => {
          let buttons = []
          switch (modal.type) {
            case 'message':
              buttons = [
                <Button
                  key={1}
                  color="secondary"
                  onClick={() => {
                    if (modal.cb) {
                      modal.cb()
                    }
                    this.onClose(modal)
                  }}
                >
                  Đóng
                </Button>,
              ]
              content = (
                <React.Fragment>
                  <p className="text-wrap">{modal.content}</p>
                  {buttons}
                </React.Fragment>
              )
              break
            case 'confirm':
              buttons = [
                <Button
                  color="secondary"
                  key={1}
                  onClick={() => {
                    this.onClose(modal)
                    if (modal.cb && typeof modal.cb === 'function') {
                      modal.cb(0)
                    }
                  }}
                >
                  Không
                </Button>,
                <Button
                  className="ml-2"
                  color="primary"
                  key={2}
                  onClick={() => {
                    this.onClose(modal)
                    if (modal.cb && typeof modal.cb === 'function') {
                      modal.cb(1)
                    }
                  }}
                >
                  Đồng ý
                </Button>,
              ]
              content = (
                <React.Fragment>
                  <p className="text-wrap">{modal.content}</p>
                  {buttons}
                </React.Fragment>
              )
              break
            case 'preview':
              content = (
                <div className="form-modal-container">
                  {/* <VoucherPreview query={modal.props} /> */}
                  <>VoucherPreview</>
                </div>
              )
              break
            case 'voucherApprove':
              content = (
                <div className="form-modal-container">
                  {/* <VoucherApproveCtrl query={modal.props} />{' '} */}
                  <>VoucherApproveCtrl</>
                </div>
              )
              break
            case 'sync':
              content = (
                <div className="form-modal-container">
                  {/* <SyncVoucherCtrl query={modal.props} />  */}
                  <>SyncVoucherCtrl</>
                </div>
              )
              break
            case 'form':
            default:
              content = (
                <div className="form-modal-container">
                  <FormCtrl query={modal.props} />{' '}
                </div>
              )
              break
          }
          return (
            <Modal
              key={index}
              visible={modal.show}
              style={{
                top: 0,
                left: '50%',
                right: 'auto',
                bottom: 'auto',
                marginRight: '-50%',
                transform: 'translate(-50%, 0)',
                overflow: 'scroll',
                background: 'transparent',
                border: 'none',
                zIndex: 2000,
              }}
              // onAfterOpen={this.afterOpenModal}
              onCancel={() => {
                this.onClose(modal)
              }}
            >
              <div className="modal-container">
                <div className="modal-head">
                  <p>Quản lý</p>
                  <span
                    onClick={() => {
                      this.onClose(modal)
                    }}
                  >
                    X
                  </span>
                </div>
                {content}
              </div>
            </Modal>
          )
        })}
      </React.Fragment>
    )
  }
}
const mapStateToProps = (state: any) => {
  return { modals: state.modals }
}
export default connect(mapStateToProps)(ModalControl)
