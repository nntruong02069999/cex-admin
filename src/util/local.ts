type localProps = {
  get: () => any
  set: (key: string, val: string) => void
  clear: () => void
}
const local: (localProps | Record<string, any>) = {}
local.get = (key: string) => {
  const t = localStorage.getItem(key) as string;
  try {
    return JSON.parse(t);
  } catch (err) {
    return t;
  }

};
local.set = (key: string, val: string) => {
  localStorage.setItem(key, val)
}
local.clear = () => {
  localStorage.clear();
};
export default local;
