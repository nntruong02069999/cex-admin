const omitUndefinedAndEmptyArr = <T>(obj: T): T => {
  const newObj: any = {} as T;
  Object.keys(obj || {}).forEach((key) => {
    if (Array.isArray((obj as any)[key]) && (obj as any)[key]?.length === 0) {
      return;
    }
    if ((obj as any)[key] === undefined) {
      return;
    }
    newObj[key] = (obj as any)[key];
  });
  return newObj;
};

export default omitUndefinedAndEmptyArr;
