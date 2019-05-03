/// <reference path='../../../../types/forge/viewer.d.ts' />

export class PanelBase extends Autodesk.Viewing.UI.DockingPanel {
    constructor(public viewer: Autodesk.Viewing.Private.GuiViewer3D, id: string, title: string, options?: any) {
        super(viewer.container, id, title, { addFooter: false });
        this.footer = (<any> this).createFooter();
        this.container.appendChild(this.footer);
    }

    public toggleVisibility(): void {
        this.setVisible(!this.isVisible());
    }
}
