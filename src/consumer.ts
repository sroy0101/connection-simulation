import {ConsumerSpec, randomDelay} from "./common";
import { Router } from "./router";


export class Consumer {
    consumerSpec: ConsumerSpec;
    router: Router; 

    constructor (consumerSpec: ConsumerSpec) {
        this.consumerSpec = consumerSpec;
        this.router = Router.instance();
    }

    /**
     * Start a connection. 
     * Requests a connection to an agent through the router. 
     * If unsuccessful, retry after a random time within 30 ms. 
     */
    startConnection = (): boolean => {
        let connected = false;
        do {
            connected = this.router.connect(this.consumerSpec);
            if(!connected) {
                // delay up to 33ms and try connecting again. 
                randomDelay(0, 33); 
            }
        } while(!connected); 
        return connected;
    }

}