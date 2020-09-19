import { AgentSpec } from "./common";
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
        // Wait

        this.isBusy = false;

    }
    
}