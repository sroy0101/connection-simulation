import "mocha";
import * as sinon from "sinon";
import * as chai from "chai";


import { Consumer } from "../src/consumer";
import {ConsumerSpec, Message, AgentSpec, Accept, AcceptType, randomDelay} from "../src/common";
import { Router } from "../src/router";
import { Agent } from "../src/agent";
import { Report, ConsumerRecord, AgentRecord } from "../src/report";
import { assert } from "chai";

const expect = chai.expect;
let router = Router.instance();
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
let agentSpecs: AgentSpec[] = [];

describe('perform unit tests', () => {

    describe('consumer tests', () => {
        afterEach(() => {
            sinon.restore();
        })    
        it('initiate a connection', () => {        

            // stub router connect request method to return true. 
            let stub= sinon.stub(router, "connect").returns(true); 

            let consumer: Consumer = new Consumer(consumerSpec, router);
            consumer.startConnection(); 
            expect(stub.callCount).equal(1);
            expect(consumer.connected).to.equal(true);
        });
        
    });

    describe('router tests', () => {
        before(() => {        
            let accepts1: Accept[] = [ {type: AcceptType.AGE, value: "40"}];         
            let accepts2: Accept[] = [ {type: AcceptType.INCOME, value: "90000"}];    
            agentSpecs.push({id: 1, accepts: accepts1}, {id: 2, accepts: accepts2});
        })

        it('finds matching agent', () => {
            // create a stub for Agent.
            let agent1 : Agent = new Agent(agentSpecs[0], router);
            let agent2 : Agent = new Agent(agentSpecs[1], router);

            // set up the agent Registry. 
            router.agentRegistry= []; 
            router.registerAgent(agent1);
            router.registerAgent(agent2)

            // check it matches on age
            let agents: Agent = router.selectAgentsForConsumer(consumerSpec); 
            expect(agents.agentSpec.accepts[0].value).to.equal('40');

            //check it always returns one agent even if there is 
            consumerSpec.income = 92000;
            agents = router.selectAgentsForConsumer(consumerSpec); 
            expect(agents.agentSpec.id).to.be.oneOf([1,2]);
        });
    });

    describe('agent tests', () => {
        before(() => {        
            let accepts1: Accept[] = [ {type: AcceptType.AGE, value: "40"}];         
            let accepts2: Accept[] = [ {type: AcceptType.INCOME, value: "90000"}];    
            agentSpecs.push({id: 1, accepts: accepts1}, {id: 2, accepts: accepts2});
        });
        afterEach(() => {
            sinon.restore();
        });    
        it('should stay busy for 50 to 300ms after a connection', () => {
            let agent : Agent = new Agent(agentSpecs[0], router);
            agent.connect(); 
            setTimeout(()=> {
                expect(agent.isBusy).equal(true);
            }, 45);
            setTimeout(() => {
                expect(agent.isBusy).equal(false);
            }, 350);
        });
        it('returns calls for left messages', () => {        
            let consumer: Consumer = new Consumer(consumerSpec, router);
            const spy = sinon.spy(consumer, 'messageCallBack');
            
            let agent : Agent = new Agent(agentSpecs[0], router);
            let message: Message = {
                phone: consumerSpec.phone,
                message: "please call back",
                callBack: consumer.messageCallBack
            }
            agent.saveMessage(message);
            agent.saveMessage(message);

            setTimeout(() => {
                expect(spy.callCount).equal(2);
            }, 3000)
           
        });
    });

});

