export interface DocsFile {
    name: string;
    path: string;
    type: 'file' | 'dir';
    children?: DocsFile[];
}
export interface DocsConfig {
    source: 'local' | 'github';
    path?: string;
}
export declare class DocsProvider {
    private localAPI;
    private githubAPI;
    private config;
    constructor();
    initialize(): Promise<DocsConfig>;
    buildFileTree(): Promise<DocsFile[]>;
    fetchFileContent(filePath: string): Promise<string>;
    getSourceInfo(): {
        source: string;
        description: string;
    };
}
export declare function createDocsProvider(): DocsProvider;
//# sourceMappingURL=docs.d.ts.map