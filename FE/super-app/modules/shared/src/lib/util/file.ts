
export class FileUtils {
    static isImage(fileName: string): boolean {
        if (!fileName) { return false; }
        return /\.(gif|jpg|jpeg|tiff|png)$/i.test(fileName.toLowerCase());
    }
}