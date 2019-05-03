import { ViewerController } from './viewerController';
import { BIMExtension } from './extension/bimExtension';

Autodesk.Viewing.theExtensionManager.registerExtension('BIMExtension', BIMExtension);

export class AppController {
    private _initialized: boolean;
    private _urn: string;
    private _viewer: ViewerController;

    constructor() {
        this._initialized = false;
        // sample URN - replace with your own
        this._urn = 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bG12ZGVtb193ZzZqZDFkem8xaG5wNng0Z2ZjdW93Y2czYXJyM2h1dC9TdXBlcm1hcmtldC1BcmNoaXRlY3R1cmUucnZ0';
    }

    public initialize(): void {
        this.load();
    }

    private getToken(callback: (token: string, expires: number) => void): void {
        $.get('/api/v1/viewtoken', (tokenResponse: any) => {
            callback(tokenResponse.access_token, tokenResponse.expires_in);
        });
    }

    private load(): void {
        if (!this._initialized) {
            const options: Autodesk.Viewing.InitializerOptions = Autodesk.Viewing.createInitializerOptions();

            options.env = 'AutodeskProduction';
            options.getAccessToken = this.getToken.bind(this);
            options.refreshToken = this.getToken.bind(this);
            options.useADP = false;
            Autodesk.Viewing.Initializer(options, () => {
                this._initialized = true;
                this.loadDocument(this._urn);
            });
        }
        else {
            this.loadDocument(this._urn);
        }
    }

    private loadDocument(urn: string): void {
        let documentId: string = urn;

        if (documentId.indexOf('urn:') !== 0) {
            documentId = 'urn:' + documentId;
        }
        Autodesk.Viewing.Document.load(documentId, (doc: Autodesk.Viewing.Document) => {
            this.onDocumentLoaded(doc);
        }, (errorCode: number, errorMsg: string, messages: any[]) => {
            this.onDocumentError(errorCode, errorMsg, messages);
        });
    }

    private onDocumentLoaded(document: Autodesk.Viewing.Document): void {
        const options = {
            type: 'geometry',
            role: '3d'
        };
        const items = Autodesk.Viewing.Document.getSubItemsWithProperties(document.getRootItem(), options, true);

        if (items.length > 0) {
            const path: string = document.getViewablePath(items[0]);
            const viewerOptions = {
                isAEC: true,
                sharedPropertyDbPath: document.getPropertyDbPath()
            };

            this.updateViewer(path, viewerOptions);
        }
    }

    private onDocumentError(errorCode: number, errorMsg: string, messages: any[]): void {
        console.error('document load error: ' + errorMsg + '(' + errorCode + ')');
    }

    private updateViewer(path: string, options?: any) {
        if (!this._viewer) {
            const config: Autodesk.Viewing.ViewerConfig = Autodesk.Viewing.createViewerConfig();

            this._viewer = new ViewerController('viewer-container', config);
            this._viewer.onGeometryLoaded = this.onGeometryLoaded.bind(this);
        }
        this._viewer.loadModel(path, options);
    }

    private onGeometryLoaded(event: any) {
        this._viewer.viewer.loadExtension('BIMExtension').then((e) => {
            // tslint:disable-next-line
            console.debug('BIM extension loaded');
        });
    }
}
