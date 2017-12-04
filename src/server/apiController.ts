/// <reference path='../../types/forge/forge.d.ts' />
/// <reference path='../../types/forge/forge-apis.d.ts' />

'use strict';

import * as express from 'express';
import * as fs from 'fs';
import * as forge from 'forge-apis';

import { StatusCodes } from './statusCodes';

export interface ApiControllerOptions {
    consumerKey: string;
    consumerSecret: string;
}

export class ApiController {
    private _router: express.Router;
    private _auth: forge.AuthClientTwoLegged;
    private _options: ApiControllerOptions;

    constructor(options: ApiControllerOptions) {
        this._options = options;
        this._router = express.Router();
        this.initializeRoutes();
    }

    public get router(): express.Router {
        return this._router;
    }

    private initializeRoutes(): void {
        this._router.get('/viewtoken', (req, res) => {
            this.getViewToken(req, res);
        });
        this._router.get('/reports', (req, res) => {
            this.getReports(req, res);
        });
    }

    private getViewToken(req: express.Request, res: express.Response): void {
        if (!this._auth) {
            this._auth = new forge.AuthClientTwoLegged(this._options.consumerKey, this._options.consumerSecret, ['viewables:read'], true);
        }
        this._auth.authenticate().then((token) => {
            res.status(StatusCodes.OK).json(token);
        }).catch((reason) => {
            res.status(StatusCodes.InternalServerError).json(reason);
        });
    }

    private async getReports(req: express.Request, res: express.Response) {
        try {
            const data = await this.getReportData();

            res.status(StatusCodes.OK).json(data);
        }
        catch (err) {
            res.status(StatusCodes.InternalServerError).json({ error: err });
        }
    }

    private getReportData(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            fs.readFile(__dirname + '/data/reports.json', 'utf-8', (err, data) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(JSON.parse(data));
                }
            });
        });
    }
}
