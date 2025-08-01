import loader from '../../assets/images/loader.svg'

const CircularProgress = ({ className } : {
  className?: string
}) => (
  <div className={`loader ${className}`}>
    <img src={loader} alt="loader" />
  </div>
)
export default CircularProgress
