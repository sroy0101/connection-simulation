import { AgentSpec } from "./common";
import { Router } from "./router";

export class Agent {

    agentSpec: AgentSpec;
    isBusy: boolean;
    router: Router; 
    
    constructor (agentSpec: AgentSpec) {
        this.agentSpec = agentSpec;
        this.isBusy = false;
        this.router = Router.instance();
        // Register with router
        this.router.registerAgent(this);         
    }
    
    /**
     * Called to connect to agent. 
     * Sets itself to busy state - for a time period. 
     */
    connect = async () => {
        this.isBusy = true; 
        // Wait

        this.isBusy = false;

    }

    // random delay - 50 to 300ms
    randomDelay = async () => {

    }

    
}