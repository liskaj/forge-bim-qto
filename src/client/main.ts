import { AppController } from './appController';

let appController: AppController = null;

$(document).ready(async () => {
    // tslint:disable-next-line
    console.info('Document is loaded');
    if (!appController) {
        appController = new AppController();
    }
    await appController.initialize();
    await appController.load();
});
