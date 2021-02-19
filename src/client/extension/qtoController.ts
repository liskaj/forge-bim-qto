import * as THREE from 'three';

export interface QtoDataRow {
    dbIds: number[];
    color: string;
    values: { [key: string]: string };
}

export interface QtoData {
    properties: string[];
    rows: QtoDataRow[];
}

export interface QtoReport {
    name: string;
    category: string;
    properties: string[];
}

export class QtoController {
    private static s_Colors: string[] = [
        '#3957ff', '#d3fe14', '#c9080a', '#fec7f8', '#0b7b3e', '#0bf0e9', '#c203c8', '#fd9b39', '#888593', '#906407',
        '#98ba7f', '#fe6794', '#10b0ff', '#ac7bff', '#fee7c0', '#964c63', '#1da49c', '#0ad811', '#bbd9fd', '#fe6cfe',
        '#297192', '#d1a09c', '#78579e', '#81ffad', '#739400', '#ca6949', '#d9bf01', '#646a58', '#d5097e', '#bb73a9',
        '#ccf6e9', '#9cb4b6', '#b6a7d4', '#9e8c62', '#6e83c8', '#01af64', '#a71afd', '#cfe589', '#d4ccd1', '#fd4109',
        '#bf8f0e', '#2f786e', '#4ed1a5', '#d8bb7d', '#a54509', '#6a9276', '#a4777a', '#fc12c9', '#606f15', '#3cc4d9',
        '#f31c4e', '#73616f', '#f097c6', '#fc8772', '#92a6fe', '#875b44', '#699ab3', '#94bc19', '#7d5bf0', '#d24dfe',
        '#c85b74', '#68ff57', '#b62347', '#994b91', '#646b8c', '#977ab4', '#d694fd', '#c4d5b5', '#fdc4bd', '#1cae05',
        '#7bd972', '#e9700a', '#d08f5d', '#8bb9e1', '#fde945', '#a29d98', '#1682fb', '#9ad9e0', '#d6cafe', '#8d8328',
        '#b091a7', '#647579', '#1f8d11', '#e7eafd', '#b9660b', '#a4a644', '#fec24c', '#b1168c', '#188cc1', '#7ab297',
        '#4468ae', '#c949a6', '#d48295', '#eb6dc2', '#d5b0cb', '#ff9ffb', '#fdb082', '#af4d44', '#a759c4', '#a9e03a'
    ];
    private _viewer: Autodesk.Viewing.GuiViewer3D;

    constructor(viewer: Autodesk.Viewing.GuiViewer3D) {
        this._viewer = viewer;
    }

    private get viewer(): Autodesk.Viewing.GuiViewer3D {
        return this._viewer;
    }

    public applyTheming(data: QtoData): void {
        this.viewer.clearThemingColors(this.viewer.model);
        const ids: number[] = [];

        data.rows.forEach((r) => {
            const rgba: number[] = this.getColor(r.color);
            const color: THREE.Vector4 = new THREE.Vector4(rgba[0] / 255, rgba[1] / 255, rgba[2] / 255, 1.0);

            r.dbIds.forEach((id) => {
                this._viewer.setThemingColor(id, color);
                ids.push(id);
            });
        });
        this.viewer.isolate(ids);
    }

    public getData(properties: string[], filterFn: (p: string) => boolean, callback: (data: QtoData) => void): void {
        this.viewer.model.getObjectTree((instanceTree: Autodesk.Viewing.InstanceTree) => {
            // get leaf nodes
            const ids: number[] = [];

            instanceTree.enumNodeChildren(instanceTree.getRootId(), (id: number) => {
                if (instanceTree.getChildCount(id) === 0) {
                    ids.push(id);
                }
            }, true);
            const filter: string[] = [];

            properties.forEach((p) => {
                filter.push(p);
            });
            if (filter.indexOf('Category') === -1) {
                filter.push('Category');
            }
            this.viewer.model.getBulkProperties(ids, filter, (propResults: Autodesk.Viewing.PropertyResult[]) => {
                const result: QtoData = {
                    properties: properties,
                    rows: []
                };

                propResults.forEach((propResult: Autodesk.Viewing.PropertyResult) => {
                    let elementData: { [name: string]: string } = {};
                    let include: boolean = false;

                    if (!filterFn) {
                        include = true;
                    }
                    propResult.properties.forEach((p) => {
                        let value = p.displayValue;

                        if (typeof (value) === 'number') {
                            value = Math.round(value).toString();
                        }
                        if ((p.displayCategory === '__category__') && (p.displayName === 'Category')) {
                            if (filterFn) {
                                include = filterFn(p.displayValue);
                            }
                            value = null;
                        }
                        if (value && value.length > 0) {
                            elementData[p.displayName] = value;
                        }
                    });
                    if (!include) {
                        elementData = {};
                    }
                    // try to find if there is row with same value
                    const keys: string[] = Object.keys(elementData);

                    if (keys.length === properties.length) {
                        let found: boolean = false;

                        for (let i = 0; i < result.rows.length; i++) {
                            const row = result.rows[i];
                            const rowKeys: string[] = Object.keys(row.values);

                            if (keys.length !== rowKeys.length) {
                                continue;
                            }
                            // compare values
                            let count: number = 0;

                            keys.forEach((key: string) => {
                                const value1 = elementData[key];
                                const value2 = row.values[key];

                                if (value1 === value2) {
                                    count++;
                                }
                            });
                            if (count === keys.length) {
                                row.dbIds.push(propResult.dbId);
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            result.rows.push({
                                dbIds: [propResult.dbId],
                                color: QtoController.s_Colors[result.rows.length],
                                values: elementData
                            });
                        }
                    }
                });
                result.rows.sort((firstRow, secondRow) => {
                    for (let i = 0; i < result.properties.length; i++) {
                        const key = result.properties[i];
                        const firstValue = firstRow.values[key];
                        const secondValue = secondRow.values[key];

                        const comp: number = firstValue.localeCompare(secondValue);

                        if (comp !== 0) {
                            return comp;
                        }
                    }
                    return -1;
                });
                callback(result);
            });
        });
    }

    public async getReports(): Promise<{ [id: string]: QtoReport }> {
        const response = await fetch('api/v1/reports');
        const data = await response.json();

        return data;
    }

    public restoreDisplay(): void {
        this.viewer.clearSelection();
        this.viewer.clearThemingColors(this.viewer.model);
        this.viewer.showAll();
    }

    public select(row: QtoDataRow): void {
        this.viewer.select(row.dbIds);
        this.viewer.fitToView(row.dbIds);
    }

    private getColor(name: string): number[] {
        const colorMatch = name.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/);
        const r: number = parseInt(colorMatch[1], 16);
        const g: number = parseInt(colorMatch[2], 16);
        const b: number = parseInt(colorMatch[3], 16);
        const a: number = (colorMatch.length === 5 ? parseFloat(colorMatch[4]) : 1.0);

        return [ r, g, b, a ];
    }
}
