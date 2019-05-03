'use strict';

import { AppController } from './appController';

let appController: AppController = null;

$(document).ready(() => {
    // tslint:disable-next-line
    console.info('Document is loaded');
    if (!appController) {
        appController = new AppController();
    }
    appController.initialize();
});
