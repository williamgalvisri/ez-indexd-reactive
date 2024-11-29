import { Observable } from 'rxjs';

export class IndexedDbORM {
    private dbName: string;
    private dbVersion: number;
    private entities: string[];
    private db: IDBDatabase | null = null;

    constructor(dbName: string, dbVersion: number, entities: string[]) {
        this.dbName = dbName;
        this.dbVersion = dbVersion;
        this.entities = entities;
    }

    openDatabase() {
        return new Observable<IDBDatabase>((oberserver) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBRequest).result;
                this.entities.forEach((entity) => {
                    if (!db.objectStoreNames.contains(entity)) {
                        db.createObjectStore(entity, { keyPath: "id" });
                    }
                });
            };  

            request.onerror = (event) => oberserver.error(event);
            request.onsuccess = (event) => {
                this.db = (event.target as IDBRequest).result;
                oberserver.next((event.target as IDBRequest).result);
            };
        });
    }

    createOne<T>(storeName: string, object: T): Observable<void> {
        if (!this.db) {
            throw new Error("Database not opened");
        }

        const transaction = this.db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);

        const request = store.add(object);

        return new Observable<void>((observer) => {
            request.onsuccess = () => observer.next();
            request.onerror = (event) => observer.error(event);
        });
    }
    

    getById<T>(storeName: string, key: any): Observable<T | undefined> {
        if (!this.db) {
            throw new Error("Database not opened");
        }

        const transaction = this.db.transaction(storeName, "readonly");
        const store = transaction.objectStore(storeName);

        const request = store.get(key);

        return new Observable<T | undefined>((observer) => {
            request.onsuccess = () => observer.next(request.result);
            request.onerror = (event) => observer.error(event);
        });
    }

    getAll<T>(storeName: string): Observable<T[]> {
        if (!this.db) {
            throw new Error("Database not opened");
        }

        const transaction = this.db.transaction(storeName, "readonly");
        const store = transaction.objectStore(storeName);

        const request = store.getAll();
        return new Observable<T[]>((observer) => {
            request.onsuccess = () => observer.next(request.result);
            request.onerror = (event) => observer.error(event);
        });
    }

    // Eliminar un objeto por su clave
    deleteById(storeName: string, key: any): Observable<void> {
        if (!this.db) {
            throw new Error("Database not opened");
        }

        const transaction = this.db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);

        const request = store.delete(key);
        return new Observable<void>((observer) => {
            request.onsuccess = () => observer.next();
            request.onerror = (event) => observer.error(event);
        });
    }
}
