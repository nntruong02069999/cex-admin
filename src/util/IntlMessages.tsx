import { FormattedMessage, injectIntl } from 'react-intl'

const InjectMessages = (props: any) => <FormattedMessage {...props} />
export default injectIntl(InjectMessages)
