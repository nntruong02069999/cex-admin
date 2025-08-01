const DescriptionItem = ({
  title,
  content,
}: {
  title: string
  content: React.ReactNode | string
}) => (
  <div className="nv-detail-item-wrapper">
    <p className="nv-detail-item-label">{title}:</p>
    <span className="nv-detail-item-content">{content}</span>
  </div>
)

export default DescriptionItem
