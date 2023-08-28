//  App Error (Function)
const appErrFunc = (message, statusCode) => {
  let error = new Error(message);

  error.statusCode = statusCode ? statusCode : 500;

  error.stack = error.stack;

  return error;
};

//  App Error (Class)
class AppErrClass extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = "failed";
  }
}

module.exports = { appErrFunc, AppErrClass };
