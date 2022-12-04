import { Express } from 'express';

class BaseController {
  expressApp:Express;

  constructor(expressApp:Express) {
    this.expressApp = expressApp;

    this.initializeRoutes();
  }

  initializeRoutes() {
  }
}

export default BaseController;