
export default class ClientError extends Error {
  _type;
  constructor(m: string, type?: string) {
    super(m);
    this._type = type;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  get type() {
    return this._type;
  }
}
