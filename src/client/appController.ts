import axios from 'axios';
import { BIMExtension } from './extension/bimExtension';

Autodesk.Viewing.theExtensionManager.registerExtension('BIMExtension', BIMExtension);

export class AppController {
    private _initialized: boolean;
    private _urn: string;
    private _viewer: Autodesk.Viewing.ViewingApplication;

    constructor() {
        this._initialized = false;
        // sample URN - replace with your own
        this._urn = 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bG12ZGVtb193ZzZqZDFkem8xaG5wNng0Z2ZjdW93Y2czYXJyM2h1dC9TdXBlcm1hcmtldC1BcmNoaXRlY3R1cmUucnZ0';
    }

    public initialize(): void {
        this.load(this._urn).then(() => {
            // tslint:disable-next-line
            console.debug('document loaded');
        });
    }

    private getToken(callback: (token: string, expires: number) => void): void {
        axios.get('/api/v1/viewtoken').then((response: any) => {
            callback(response.data.access_token, response.data.expires_in);
        });
    }

    private load(urn: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (!this._initialized) {
                const options: Autodesk.Viewing.InitializerOptions = Autodesk.Viewing.createInitializerOptions();

                options.env = 'AutodeskProduction';
                options.getAccessToken = this.getToken.bind(this);
                options.refreshToken = this.getToken.bind(this);
                options.useADP = false;
                Autodesk.Viewing.Initializer(options, () => {
                    this._initialized = true;
                    const config = Autodesk.Viewing.createViewerConfig();

                    config.extensions = [ 'BIMExtension' ];
                    this._viewer = new Autodesk.Viewing.ViewingApplication('viewer-container');
                    this._viewer.registerViewer(this._viewer.k3D, Autodesk.Viewing.Private.GuiViewer3D, config);
                    this.loadDocument(this._viewer, urn).then((document) => {
                        this.selectItem(this._viewer, document).then(() => {
                            resolve();
                        });
                    });
                });
            } else {
                this.loadDocument(this._viewer, this._urn).then((document) => {
                    this.selectItem(this._viewer, document).then(() => {
                        resolve();
                    });
                });
            }
        });
    }

    private loadDocument(viewer: Autodesk.Viewing.ViewingApplication, urn: string): Promise<Autodesk.Viewing.Document> {
        return new Promise<Autodesk.Viewing.Document>((resolve, reject) => {
            let documentId: string = urn;

            if (documentId.indexOf('urn:') !== 0) {
                documentId = 'urn:' + documentId;
            }
            viewer.loadDocument(documentId, (doc: Autodesk.Viewing.Document) => {
                resolve(doc);
            }, (errorCode, errorMsg, messages) => {
                reject(new Error(errorMsg));
            });
        });
    }

    private selectItem(viewer: Autodesk.Viewing.ViewingApplication, document: Autodesk.Viewing.Document): Promise<Autodesk.Viewing.ViewerItem> {
        return new Promise<Autodesk.Viewing.ViewerItem>((resolve, reject) => {
            const viewables = viewer.bubble.search({ type: 'geometry' });

            if (viewables.length > 0) {
                viewer.selectItem(viewables[0], (viewer2, item) => {
                    resolve(item);
                }, (errorCode, errorMsg, statusCode, statusText, messages) => {
                    reject(new Error(errorMsg));
                });
            } else {
                reject(new Error('No viewables found'));
            }
        });
    }
}
