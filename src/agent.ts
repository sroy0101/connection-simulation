import { random } from "faker";
import { AgentSpec, Message, randomDelay } from "./common";
import { Router } from "./router";

export class Agent {

    agentSpec: AgentSpec;
    isBusy: boolean;
    router: Router; 
    messages: Message[];
    // metrics
    messagesReceived: number;
    callsReceived: number;
    
    constructor (agentSpec: AgentSpec, router: Router) {
        this.agentSpec = agentSpec;
        this.isBusy = false;
        this.router = router;
        // Register with router
        this.router.registerAgent(this);
        this.messages = []; 
        this.callConsumer();  
        this.messagesReceived = 0;
        this.callsReceived = 0;      
    }
    
    /**
     * Called to connect to agent. 
     * Sets itself to busy state - for a time period. 
     */
    connect = () : boolean => {
        this.callsReceived++;
        this.isBusy = true; 
        // Wait 50 to 300ms. 
        randomDelay(50, 300).then(() => {
            this.isBusy = false;            
        })
        return true;
    }

    /**
     * Saves a voice message for the agent to call at a later time. 
     * @param message - the message to be saved. 
     */
    saveMessage = (message : Message) => {
        this.messages.push(message);
        this.messagesReceived++;
    }

    /**
     * Checks every 1 second and if not busy calls consumers in the message list. 
     * Then removes the message from the list. 
     */
    callConsumer = () => {
        const PROCESS_MESSAGES_RATE_MS = 1000;

        const interval = setInterval(() => {
            if(!this.isBusy && this.messages.length) {
                let message : Message = this.messages[0]; 
                // if the consumer was not busy, ie accepted the call, remove the message from message list. 
                if(!message.callBack()) {
                    this.messages.splice(0, 1);
                }
            }
        }, PROCESS_MESSAGES_RATE_MS)
        return interval;
    }




    
}