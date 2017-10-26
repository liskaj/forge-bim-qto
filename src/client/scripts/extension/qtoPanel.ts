import { PanelBase } from './panelBase';
import { QtoController, QtoData, QtoDataRow } from './qtoController';

interface ReportData {
    name: string;
    category: string;
    properties: string[];
}

export class QtoPanel extends PanelBase {
    private _reports: { [name: string]: ReportData } = { };
    private _reportData: ReportData;
    private _controller: QtoController;
    private _data: QtoData;
    private _properties: string[] = [];
    private _templateLoaded: boolean = false;
    private _btnPropertyAdd: JQuery;
    private _labelProperty: JQuery;
    private _selProperty: JQuery;
    private _selReportType: JQuery;
    private _dataContainer: JQuery;

    constructor(container: Element, id: string, controller: QtoController, options?: any) {
        super(container, id, 'QTO', options);
        this._reports['curtain-panel-report'] = {
            name: 'Curtain Panels',
            category: 'Revit Curtain Panels',
            properties: [ 'Area', 'Height', 'Width' ]
        };
        this._reports['door-report'] = {
            name: 'Doors',
            category: 'Revit Doors',
            properties: [ 'Height', 'Width' ]
        };
        this._reports['wall-report'] = {
            name: 'Walls',
            category: 'Revit Walls',
            properties: ['Area', 'Length', 'Volume']
        };
        this._controller = controller;
        this.addVisibilityListener((state: boolean) => {
            this.onVisibilityChange(state);
        });
        this.container.classList.add('qto-panel');
        this.container.style.left = '60px';
        this.container.style.top = '40px';
        this.container.style.width = '440px';
        this.container.style.height = '300px';
        this.container.style.position = 'absolute';
        // scroll container
        this.createScrollContainer({
            heightAdjustment: 40,
            left: false,
            marginTop: 0
        });
        // create UI
        const url: string = window.location.href + 'scripts/extension/res/qtoPanel.html';

        Autodesk.Viewing.Private.getHtmlTemplate(url, (err, content) => {
            this.onTemplate(err, content);
        });
    }

    public refresh(): void {
        if (!this._templateLoaded) {
            return;
        }
        if (this._data) {
            this._controller.applyTheming(this._data);
        }
    }

    private reloadData(): void {
        this._controller.getData(this._properties, (p) => {
            return this._reportData.category === p;
        }, (data) => {
            this._data = data;
            this._dataContainer.empty();
            // header
            const headerRow: HTMLDivElement = document.createElement('div');

            headerRow.className = 'qto-data-header';
            data.properties.forEach((p) => {
                const nameCell: HTMLSpanElement = document.createElement('span');

                nameCell.innerText = p;
                headerRow.appendChild(nameCell);
            });
            const quantityCell: HTMLSpanElement = document.createElement('span');

            quantityCell.innerText = 'Quantity';
            headerRow.appendChild(quantityCell);
            const colorCell: HTMLSpanElement = document.createElement('span');

            colorCell.innerText = 'Color';
            headerRow.appendChild(colorCell);
            this._dataContainer.append(headerRow);
            // data
            data.rows.forEach((r, index) => {
                const row: HTMLDivElement = document.createElement('div');

                /* tslint:disable:no-string-literal */
                row.dataset['row'] = index.toString();
                /* tslint:enable:no-string-literal */
                row.className = 'qto-data-row';
                data.properties.forEach((p) => {
                    const cell: HTMLSpanElement = document.createElement('span');

                    cell.innerText = r.values[p];
                    row.appendChild(cell);
                });
                const quantityCell: HTMLSpanElement = document.createElement('span');

                quantityCell.innerText = r.dbIds.length.toString();
                row.appendChild(quantityCell);
                const colorCell: HTMLSpanElement = document.createElement('span');

                colorCell.style.backgroundColor = r.color;
                row.appendChild(colorCell);
                this._dataContainer.append(row);
            });
            this._controller.applyTheming(data);
        });
    }

    private onBtnPropertyAddClick(e: any): void {
        const property = <string> this._selProperty.val();

        this._properties.push(property);
        this.reloadData();
    }

    private onDataContainerClick(e: any): void {
        const rowElement = $(e.target).closest('.qto-data-row');

        if (!rowElement) {
            return;
        }
        const row: QtoDataRow = this._data.rows[parseInt(rowElement.data('row'))];

        this._controller.select(row);
    }

    private onSelReportTypeChange(e: any): void {
        const reportType: string = <string> this._selReportType.val();

        this._reportData = this._reports[reportType];
        this._selProperty.empty();
        this._reportData.properties.forEach((p) => {
            const optionElement: HTMLOptionElement = document.createElement('option');

            optionElement.value = p;
            optionElement.innerText = p;
            this._selProperty.append(optionElement);
        });
        this._properties = [];
        this._properties.push('Level');
        this._properties.push('Type Name');
        // display controls
        this._selProperty.toggleClass('hidden', false);
        this._labelProperty.toggleClass('hidden', false);
        this._btnPropertyAdd.toggleClass('hidden', false);
        this.reloadData();
    }

    private onTemplate(err: string, content: string): void {
        const tmp = document.createElement('div');

        tmp.innerHTML = content;
        this.scrollContainer.appendChild(tmp.childNodes[0]);
        this._selReportType = $('#report-type');
        this._selReportType.on('change', (e) => {
            this.onSelReportTypeChange(e);
        });
        this._labelProperty = $('#property-label');
        this._selProperty = $('#property');
        this._btnPropertyAdd = $('#btn-property-add');
        this._btnPropertyAdd.on('click', (e) => {
            this.onBtnPropertyAddClick(e);
        });
        this._dataContainer = $('#qto-data');
        this._dataContainer.on('click', (e) => {
            this.onDataContainerClick(e);
        });
        this._templateLoaded = true;
        // poplate report-type dropdown
        const keys: string[] = Object.keys(this._reports);

        keys.forEach((k) => {
            const reportData = this._reports[k];
            const optionElement: HTMLOptionElement = document.createElement('option');

            optionElement.value = k;
            optionElement.innerText = reportData.name;
            this._selReportType.append(optionElement);
        });
        // update dialog
        this.refresh();
    }

    private onVisibilityChange(state: boolean): void {
        if (!state) {
            this._controller.restoreDisplay();
        }
    }
}
