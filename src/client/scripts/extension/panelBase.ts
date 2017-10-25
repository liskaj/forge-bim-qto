/// <reference path='../../../../types/forge/viewer.d.ts' />

export class PanelBase extends Autodesk.Viewing.UI.DockingPanel {
    constructor(parentContainer: any, id: string, title: string, options?: any) {
        super(parentContainer, id, title, options);
    }

    public toggleVisibility(): void {
        this.setVisible(!this.isVisible());
    }
}
