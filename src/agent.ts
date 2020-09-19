import { random } from "faker";
import { AgentSpec, randomDelay } from "./common";
import { Router } from "./router";

export class Agent {

    agentSpec: AgentSpec;
    isBusy: boolean;
    router: Router; 
    
    constructor (agentSpec: AgentSpec, router: Router) {
        this.agentSpec = agentSpec;
        this.isBusy = false;
        this.router = router;
        // Register with router
        this.router.registerAgent(this);         
    }
    
    /**
     * Called to connect to agent. 
     * Sets itself to busy state - for a time period. 
     */
    connect = () => {
        this.isBusy = true; 
        // Wait 50 to 300ms. 
        randomDelay(50, 300).then(() => {
            this.isBusy = false;            
        })
        return true;


    }
    
}