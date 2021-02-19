import { QtoController } from './qtoController';
import { QtoPanel } from './qtoPanel';

export class BIMExtension extends Autodesk.Viewing.Extension {
    private _qtoController: QtoController;
    private _qtoPanel: QtoPanel;
    // buttons
    private _btnQto: Autodesk.Viewing.UI.Button;

    constructor(viewer: Autodesk.Viewing.GuiViewer3D, options: any) {
        super(viewer, options);
    }

    public load(): boolean {
        this._qtoController = new QtoController(this.viewer);
        return true;
    }

    public unload(): boolean {
        if (this._qtoPanel) {
            this.viewer.removePanel(this._qtoPanel);
            this._qtoPanel.uninitialize();
            this._qtoPanel = null;
        }
        return true;
    }

    public onToolbarCreated(toolbar?: Autodesk.Viewing.UI.ToolBar): void {
        this.createToolbar();
    }

    private createToolbar(): void {
        // create button
        this._btnQto = new Autodesk.Viewing.UI.Button('BIMExtension.Toolbar.Qto');
        this._btnQto.setIcon('qto-btn');
        this._btnQto.setToolTip('Quantity Take Off');
        this._btnQto.onClick = (e: MouseEvent) => {
            this.onQto(e);
        };
        // add button to the goup
        const ctrlGroup = new Autodesk.Viewing.UI.ControlGroup('BIMExtension.Toolbar.ControlGroup');

        ctrlGroup.addControl(this._btnQto);
        // add group to main toolbar
        this.viewer.toolbar.addControl(ctrlGroup);
    }

    private onQto(e: MouseEvent): void {
        if (!this._qtoPanel) {
            this._qtoPanel = new QtoPanel(this.viewer, 'BIMExtension.QtoPanel', this._qtoController);
            this.viewer.addPanel(this._qtoPanel);
            // as the panel visibility changes, we fix the button state
            this._qtoPanel.addVisibilityListener((state: boolean) => {
                this._btnQto.setState(state ? Autodesk.Viewing.UI.Button.State.ACTIVE : Autodesk.Viewing.UI.Button.State.INACTIVE);
            });
            this._qtoPanel.setVisible(true);
        }
        else {
            this._qtoPanel.toggleVisibility();
        }
        if (this._qtoPanel.isVisible()) {
            this._qtoPanel.refresh();
        }
    }
}
