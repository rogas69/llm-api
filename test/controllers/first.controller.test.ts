import request from 'supertest';
import express from 'express';
import { FirstController } from '../../src/controllers/first.controller';
import { ILogger } from '../../src/services/ILogger';
import { createRequest, createResponse } from 'node-mocks-http';
import { Request, Response } from 'express';


describe('FirstController', () => {
  let logger: ILogger;
  let firstController: FirstController;

  beforeEach(() => {
    logger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };
    firstController = new FirstController(logger);
  });

  it('should log "Hello World called;" and return "Hello World"', async () => {
    const req = createRequest();
    const res = createResponse();
    const jsonSpy = jest.spyOn(res, 'json');

    await firstController.test(req as Request, res as Response);

    expect(logger.log).toHaveBeenCalledWith('Hello World called;');
    expect(jsonSpy).toHaveBeenCalledWith({ msg: 'Hello World' });
  });

  it('should return status 200', async () => {
    const req = createRequest();
    const res = createResponse();
    const statusSpy = jest.spyOn(res, 'status');

    await firstController.test(req as Request, res as Response);

    expect(statusSpy).toHaveBeenCalledWith(200);
  });

  it('should handle GET requests to /tests', async () => {
    const app = express();
        
    app.use('/tests', (req: Request, res: Response) => firstController.test(req, res));

    const response = await request(app).get('/tests');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ msg: 'Hello World' });
  });
});
