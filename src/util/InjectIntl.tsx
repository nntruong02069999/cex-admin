import { injectIntl } from 'react-intl'

const InjectIntl: any =
  ({ intl }: {
    intl: any
  }) =>
  (Component: any) => {
    return <Component intl={intl} />
  }

export default injectIntl(InjectIntl)
