import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

// Tính số giây còn lại từ chuỗi thời gian IST
export function getSecondsLeftFromIST(endTimeISTString: string): number {
  try {
    // Parse endTime as Asia/Kolkata (IST)
    console.log("🚀 ~ getSecondsLeftFromIST ~ endTimeISTString:", endTimeISTString)
    const endTime = dayjs.tz(
      endTimeISTString,
      'YYYY-MM-DD HH:mm:ss',
      'Asia/Kolkata',
    )
    const now = dayjs.utc()
    const diff = endTime.utc().valueOf() - now.valueOf()
    return Math.max(0, Math.floor(diff / 1000))
  } catch (error) {
    console.error('Lỗi khi tính thời gian còn lại từ IST:', error)
    return 60
  }
}
