enum HTTP_METHOD {
    POST = 'POST',
    GET = 'GET'
}

enum HTTP_STATUS {
    OK = 200,
    SERVER_ERROR = 500
}

interface User {
    name: string,
    age: number,
    roles: ['admin', 'user'],
    createdAt: Date,
    isDeleated: boolean
}

interface Requests {
    method: HTTP_METHOD,
    host: string,
    path: string,
    body?: User,
    params: {
        id?: string
    }
}


const userMock: User = {
    name: 'Ivan',
    age: 343,
    roles: ["admin", "user"],
    createdAt: new Date(),
    isDeleated: false
}


const requestsMock: Requests[] = [
    {
        method: HTTP_METHOD.POST,
        host: 'service.example',
        path: 'user',
        body: userMock,
        params: {},
    },
    {
        method: HTTP_METHOD.POST,
        host: 'service.example',
        path: 'user',
        params: {
            id: '3f5h67s4s'
        },
    }
];

type RequestHandlerFunc = (request: any) => { status: HTTP_STATUS }
type ErrorHandlerFunc = (error: any) => { status: HTTP_STATUS }
type CompleteHandlerFunc = () => void


interface Obs {
    next: RequestHandlerFunc,
    error: ErrorHandlerFunc,
    complete: CompleteHandlerFunc
}

class Observer {
    private handlers: Obs;
    private isUnsubscribed: boolean;
    _unsubscribe: any;

    constructor(handlers: Obs) {
        this.handlers = handlers
        this.isUnsubscribed = false
    }

    next(value: Requests) {
        this.handlers.next(value);
    }

    error(error: string) {
        if (!this.isUnsubscribed) {
            this.handlers.error(error);

            this.unsubscribe();
        }
    }

    complete() {
        if (!this.isUnsubscribed) {
            this.handlers.complete();

            this.unsubscribe();
        }
    }

    unsubscribe() {
        this.isUnsubscribed = true;

        if (this._unsubscribe) {
            this._unsubscribe();
        }
    }
}


class Observable {

    constructor(
        private readonly _subscribe: (observer: Observer) => () => void
    ) {
    }

    static from(values: Requests[]) {
        return new Observable((observer: { next: (arg0: Requests) => void; complete: () => void; }) => {
            values.forEach((value) => observer.next(value));
            observer.complete();

            return () => {
                console.log('unsubscribed');
            };
        });
    }

    subscribe(obs: Obs) {
        const observer = new Observer(obs);

        observer._unsubscribe = this._subscribe(observer);

        return ({
            unsubscribe() {
                observer.unsubscribe();
            }
        });
    }
}

const handleRequest: RequestHandlerFunc = (request) => {
    // handling of request
    return {status: HTTP_STATUS.OK};
};
const handleError: ErrorHandlerFunc = (error) => {
    // handling of error
    return {status: HTTP_STATUS.SERVER_ERROR};
};

const handleComplete: CompleteHandlerFunc = () => console.log('complete');

const requests$ = Observable.from(requestsMock);

const subscription = requests$.subscribe({
    next: handleRequest,
    error: handleError,
    complete: handleComplete
});

subscription.unsubscribe();