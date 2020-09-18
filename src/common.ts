export interface ConsumerSpec {
    id: number;
    age: number;
    state: string;
    kids: number;
    cars: number;
    isRenting: boolean;
    income: number;
    phone: number;
}

export enum AcceptType {
    AGE,
    CARS,
    STATE,
    INCOME,
    RENTING
}
export interface Accept {
    type: AcceptType;
    value: string
}

export interface AgentSpec {
    id: number;
    accepts: Accept[];
}


/**
 * Provides a asynchronous random delay within the given low and high range. 
 * @param lowMs - the low value of the time range 
 * @param highMs - the high value of the time range. 
 */
export function randomDelay (lowMs: number, highMs: number) {
    let ms: number = Math.floor(Math.random() * (highMs - lowMs) + lowMs);
    return (
        new Promise((resolve) => {
            setTimeout(()=> {resolve();}, ms)
        })
    )
}
