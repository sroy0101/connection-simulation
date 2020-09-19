import * as faker from "faker";

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
const acceptTypes : AcceptType[] = [
    AcceptType.AGE, 
    AcceptType.CARS, 
    AcceptType.STATE,
    AcceptType.INCOME,
    AcceptType.RENTING
];

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

/**
 * Uses faker package to create 12 agent specs data. 
 */
export function createAgentSpecs(): AgentSpec[] {
    let agentSpecs: AgentSpec[] = []; 
    const requiredSpecs = 12; 
    for(let x=0; x < requiredSpecs; x++) {
        let accepts: Accept[] = [];
        // allow one accepts per agent 
        // randomly select one of the 5 accept types 
        let randomType: number = Math.floor(Math.random() * (4 - 0));
        let acceptValue = getAgentSpecsValue(acceptTypes[randomType]);
        let accept: Accept = {
            type: acceptTypes[randomType],
            value: acceptValue
        }
        accepts.push(accept);
        agentSpecs.push({id:x+1, accepts: accepts});   
    }

    return agentSpecs; 

}

const getAgentSpecsValue= (type: AcceptType) : any => {
    let result : any;
    switch(type) {
        case AcceptType.AGE: 
        // age between 18 and 65
        result = Math.floor(Math.random() * (65 - 18) + 18);
        break; 
        case AcceptType.CARS: 
        // 0 - 3 cars
        result = Math.floor(Math.random() * (3 - 0));
        break; 
        case AcceptType.INCOME: 
        // 20000 - 1000000
        result = Math.floor(Math.random() * (1000000 - 20000) + 20000);
        break; 
        case AcceptType.STATE: 
        result = faker.address.state();
        break; 
        case AcceptType.RENTING: 
        result = faker.random.boolean();
        break; 
    }


    return result;
}