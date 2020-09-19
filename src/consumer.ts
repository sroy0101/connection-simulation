"use strict"
import {ConsumerSpec, randomDelay} from "./common";
import { Router } from "./router";


export class Consumer {
    consumerSpec: ConsumerSpec;
    router: Router; 
    isAbort: boolean;    
    connected: boolean;

    // metrics
    connectionAttempts: number;
    callbacksReceived: number;

    constructor (consumerSpec: ConsumerSpec, router: Router) {
        this.consumerSpec = consumerSpec;
        this.router = router;
        this.isAbort = false;        
        this.connected = false;

        this.connectionAttempts = 0; 
        this.callbacksReceived = 0;
    }

    /**
     * Start a connection. 
     * Requests a connection to an agent through the router. 
     * If unsuccessful, retry after a random time within 30 ms. 
     */
    startConnection = async () => {
        this.isAbort = false;
        this.connectionAttempts = 0; 
        do {
            this.connected = this.router.connect(this.consumerSpec);
            if(!this.connected) {
                // delay up to 33ms and try connecting again. 
                await randomDelay(0, 33);
                this.connectionAttempts++; 
            }
            else {
                this.connectionAttempts = 0;
            }
            
        } while(!this.connected && !this.isAbort); 
        return this.connected;
    }

    /**
     * Aborts an existing connection attempt. 
     */
    abortConnection = () => {
        this.isAbort = true; 
    }
    

    /**
     * Receiver of voice calls from an agent in response
     * to message left for the agent.
     */
    messageCallBack = () => {
        this.callbacksReceived++;
    }

}