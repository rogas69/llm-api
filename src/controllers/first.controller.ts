import * as express from 'express';
import { route, GET } from 'awilix-express';
import { ILogger } from '../services/ILogger';

@route('/tests')
export class FirstController {
  
  constructor(private readonly logger: ILogger){}

  @GET()
  async test(req: express.Request, res: express.Response) {
    this.logger.log('Hello World called;');
    res.status(200);
    res.json({msg: 'Hello World'});
  }
}