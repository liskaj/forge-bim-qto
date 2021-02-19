import { BIMExtension } from './extension/bimExtension';
import { ViewerController } from './viewerController';

Autodesk.Viewing.theExtensionManager.registerExtension('BIMExtension', BIMExtension);

export class AppController {
    private _initialized: boolean;
    private _urn: string;
    private _viewerController: ViewerController;

    constructor() {
        this._initialized = false;
        // sample URN - replace with your own
        this._urn = 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bG12ZGVtb193ZzZqZDFkem8xaG5wNng0Z2ZjdW93Y2czYXJyM2h1dC9TdXBlcm1hcmtldC1BcmNoaXRlY3R1cmUucnZ0';
    }

    public initialize(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this._initialized) {
                resolve();
            } else {
                const options = {
                    env: 'AutodeskProduction',
                    getAccessToken: this.getToken.bind(this)
                };

                Autodesk.Viewing.Initializer(options, () => {
                    this._initialized = true;
                    resolve();
                });
            }
        });
    }

    public async load(): Promise<void> {
        this._viewerController = new ViewerController('viewer-container', {
            extensions: [
                'BIMExtension'
            ]
        });
        await this._viewerController.loadModel(this._urn);
    }

    private async getToken(callback: (token: string, expires: number) => void): Promise<void> {
        const response = await fetch('/api/v1/viewtoken');
        const data = await response.json();

        callback(data.access_token, data.expires_in);
    }
}
