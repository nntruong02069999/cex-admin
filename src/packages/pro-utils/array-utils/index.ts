class ArrayUtils {
  isArray(array: Array<any>) {
    return Array.isArray(array)
  }

  filterItemObject(propsName: string, value: any, array: Array<any>) {
    if (!this.isArray(array)) return null
    return array.filter((i) => i[propsName] == value)
  }

  filterItem(value: any, array: Array<any>) {
    if (!this.isArray(array)) return null
    return array.filter((i) => i == value)
  }

  findItemObject(propsName: string, value: any, array: Array<any>) {
    if (!this.isArray(array)) return null
    return array.find((i) => i[propsName] == value)
  }

  findItem(value: any, array: Array<any>) {
    if (!this.isArray(array)) return null
    return array.find((i) => i == value)
  }
}

export const arrayUtils = new ArrayUtils()
