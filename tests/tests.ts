import { assert } from "chai";
import "mocha"

import { Consumer } from "../src/consumer";
import {ConsumerSpec, AgentSpec, Accept, AcceptType} from "../src/common";
import { Agent } from "../src/agent";

describe('consumer tests', () => {
    before ('initialize for all tests', () => {
        // create agent
        let agentAccepts: Accept[] = [];
        let accept: Accept = {
            type: AcceptType.AGE,
            value: "40"
        };
        agentAccepts.push(accept);

        let agentSpec: AgentSpec = {
            id: 1,
            accepts: agentAccepts                
        }
        
        new Agent(agentSpec);

    });
    it('initiate a connection', () => {
        let consumerSpec: ConsumerSpec = {
            id: 1,
            age: 44,
            state: "Georgia",
            kids: 3,
            cars: 2,
            isRenting: false,
            income: 80000,
            phone: 4045556666
        }

        let consumer: Consumer = new Consumer(consumerSpec);
        let result: boolean = consumer.startConnection();
        assert.equal(result, true);
    });
    it('retries if connection fails', () => {

    })





})