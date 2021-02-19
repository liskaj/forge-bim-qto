export class PanelBase extends Autodesk.Viewing.UI.DockingPanel {
    constructor(public viewer: Autodesk.Viewing.GuiViewer3D, id: string, title: string, options?: any) {
        super(viewer.container as HTMLElement, id, title, { addFooter: false });
        this.footer = (<any> this).createFooter();
        this.container.appendChild(this.footer);
    }

    public toggleVisibility(): void {
        this.setVisible(!this.isVisible());
    }
}
