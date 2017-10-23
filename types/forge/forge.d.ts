declare module Autodesk {
    export module Forge {
        export interface Credentials {
            client_id: string;
            client_secret: string;
            grant_type: string;
            scope?: string;
        }

        export interface AuthToken {
            access_token: string;
            expires_in: number;
            expires_at?: Date;
            token_type: string;
            refresh_token?: string;
        }

        export module Dm {
            export interface BucketResponse {
                bucketKey: string;
                bucketOwner: string;
                createdDate: number;
                permissions: {
                    access: string;
                    authId: string;
                }[];
                policyKey: string;
            }

            export interface ItemResponse {
                data: any[];
                included: Item[];
                jsonapi: {
                    version: string;
                };
                links: any;
            }

            export interface Item {
                attributes: {
                    createTime: string;
                    createUserId: string;
                    displayName: string;
                    extension: Object;
                    fileType: string;
                    lastModifiedTime: string;
                    lastModifiedUserId: string;
                    mimeType: string;
                    name: string;
                    storageSize: number;
                    versionNumber: number;
                };
                id: string;
                links: {
                    self: {
                        href: string;
                    };
                };
                relationships: {
                    derivatives: {
                        data: {
                            id: string;
                        },
                        meta: {
                            link: {
                                href: string;
                            }
                        }
                    },
                    item: any;
                    refs: any;
                    storage: {
                        data: {
                            id: string;
                            type: string;
                        }
                    };
                    thumbnail: any;
                };
                type: string;
            }
        }
    }
}
