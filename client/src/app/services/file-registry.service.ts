import {EventHubService} from "./event-hub/event-hub.service";
import {
    CreateFileRequestAction,
    FetchFileRequestAction,
    FileCreatedAction,
    SaveFileRequestAction,
    UpdateFileAction,
    CopyFileRequestAction
} from "../action-events/index";
import {FileApi} from "./api/file.api";
import {FileModel} from "../store/models/fs.models";
import {HashCache} from "../lib/cache.lib";
import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Rx";

@Injectable()
export class FileRegistry {

    // Contains all loaded files
    private fileCache: HashCache<FileModel>;

    constructor(private files: FileApi,
                private eventHub: EventHubService) {

        this.fileCache = new HashCache<FileModel>({}, (a, b) => a.isChangedSince(b));

        // Whenever a fetch requests comes from the event hub,
        // forward the request to the FileAPI and pass the result to the cache.
        this.eventHub.onValueFrom(FetchFileRequestAction)
            .flatMap(file => this.files.getFileContent(file.absolutePath))
            .subscribe(file => this.fileCache.put(file.id, file));

        this.eventHub.onValueFrom(UpdateFileAction)
            .subscribe(file => this.fileCache.put(file.id, file));

        this.eventHub.on(CreateFileRequestAction)
            .flatMap(action => this.files.createFile(action.payload).let(this.eventHub.intercept(action)))
            .subscribe(file => {
                this.fileCache.put(file.id, file);
                this.eventHub.publish(new FileCreatedAction(file));
            });

        this.eventHub.onValueFrom(SaveFileRequestAction)
            .flatMap(file => this.files.updateFile(file.relativePath, file.content).map(_ => file))
            .subscribe(file => {
                this.fileCache.put(file.id, Object.assign(file, {originalContent: file.content, isModified: false}));
            });

        this.eventHub.on(CopyFileRequestAction)
            .flatMap(action => {
                const {source, destination} = action.payload;
                return this.files.copyFile(source, destination).let(this.eventHub.intercept(action))
            })
            .subscribe(file => {
                this.eventHub.publish(new FileCreatedAction(file));
            });
    }

    /**
     * Get the fully loaded FileModel.
     */
    public getFile(file: FileModel): Observable<FileModel> {
        if (!this.fileCache.has(file.id)) {
            this.eventHub.publish(new FetchFileRequestAction(file));
        }
        return this.fileCache.watch(file.id);
    }

    public watchFile(file: FileModel): Observable<FileModel> {
        return this.fileCache.watch(file.id);
    }

    public save(file: FileModel) {

    }
}
