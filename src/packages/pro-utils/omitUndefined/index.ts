const omitUndefined = <T>(obj: T): T => {
  const newObj: any = {} as T;
  Object.keys(obj || {}).forEach((key) => {
    if ((obj as any)[key] !== undefined) {
      newObj[key] = (obj as any)[key];
    }
  });
  if (Object.keys(newObj).length < 1) {
    return undefined as any;
  }
  return newObj;
};

export default omitUndefined;
