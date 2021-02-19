type EventCallback = (event: any) => void;

export class ViewerController {
    private _viewerEvents: { [key: string]: EventCallback } = {};
    private _container: HTMLElement;
    private _viewer: Autodesk.Viewing.GuiViewer3D;
    private _viewerConfig: Autodesk.Viewing.ViewerConfig;

    constructor(id: string, config?: Autodesk.Viewing.ViewerConfig) {
        this._container = document.getElementById(id);
        this._viewerConfig = config;
    }

    public get viewer(): Autodesk.Viewing.GuiViewer3D {
        return this._viewer;
    }

    public get onFinalFrameRenderedChanged(): EventCallback {
        return this._viewerEvents[Autodesk.Viewing.FINAL_FRAME_RENDERED_CHANGED_EVENT];
    }

    public set onFinalFrameRenderedChanged(callback: EventCallback) {
        this._viewerEvents[Autodesk.Viewing.FINAL_FRAME_RENDERED_CHANGED_EVENT] = callback;
    }

    public get onGeometryLoaded(): EventCallback {
        return this._viewerEvents[Autodesk.Viewing.GEOMETRY_LOADED_EVENT];
    }

    public set onGeometryLoaded(callback: EventCallback) {
        this._viewerEvents[Autodesk.Viewing.GEOMETRY_LOADED_EVENT] = callback;
    }

    public get onProgressUpdate(): EventCallback {
        return this._viewerEvents[Autodesk.Viewing.PROGRESS_UPDATE_EVENT];
    }

    public set onProgressUpdate(callback: EventCallback) {
        this._viewerEvents[Autodesk.Viewing.PROGRESS_UPDATE_EVENT] = callback;
    }

    public get onSelectionChanged(): EventCallback {
        return this._viewerEvents[Autodesk.Viewing.SELECTION_CHANGED_EVENT];
    }

    public set onSelectionChanged(callback: EventCallback) {
        this._viewerEvents[Autodesk.Viewing.SELECTION_CHANGED_EVENT] = callback;
    }

    public loadModel(urn: string, options?: any): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let documentId: string = urn;

            if (documentId.indexOf('urn:') !== 0) {
                documentId = `urn:${documentId}`;
            }
            Autodesk.Viewing.Document.load(documentId, (doc) => {
                const viewable = doc.getRoot().getDefaultGeometry();

                if (!this._viewer) {
                    this._viewer = new Autodesk.Viewing.GuiViewer3D(this._container, this._viewerConfig);
                }
                if (!this._viewer.started) {
                    this._viewer.start();
                    // subscribe to viewer events
                    const events: string[] = Object.keys(this._viewerEvents);

                    for (let i = 0; i < events.length; i++) {
                        const eventName: string = events[i];

                        this._viewer.addEventListener(eventName, (event: any) => {
                            // for each event we try to find corresponding callback and trigger it
                            const callback: EventCallback = this._viewerEvents[eventName];

                            if (callback) {
                                callback(event);
                            }
                        });
                    }
                }
                this._viewer.loadDocumentNode(doc, viewable).then((model) => {
                    resolve();
                });
            }, (errorCode, errorMsg, messages) => {
                reject(new Error(errorMsg));
            });
        });
    }
}
