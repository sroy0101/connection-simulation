import "mocha";
import * as chai from "chai";

import { Consumer } from "../../src/consumer";
import {ConsumerSpec, AgentSpec, getRandomAgentSpec, getRandomConsumerSpec, randomDelay} from "../../src/common";
import { Router } from "../../src/router";
import { Agent } from "../../src/agent";
import { Report, ConsumerRecord } from "../../src/report";
import { assert } from "chai";

const expect = chai.expect;
let router = Router.instance();

describe('simulate connections between consumer and agents', () => {
    it('uses 1000 consumers and 20 agents', async () => {
        
        const requiredConsumers = 10000;         
        const requiredAgents = 20; 
        const printDetails = false;
        const generateReport = true;

        // create agents with randomly generated agent spec 
        let agents: Agent[] = [];
        for(let x=0; x < requiredAgents; x++) {
            let agentSpec: AgentSpec = getRandomAgentSpec();
            agentSpec.id = x + 1;
            agents.push(new Agent(agentSpec, router));            
        }
        
        // create consumers with randomly generated consumer spec
        let consumers: Consumer[] = [];
        for(let x=0; x < requiredConsumers; x++) {
            let consumerSpec: ConsumerSpec = getRandomConsumerSpec();
            consumerSpec.id = x + 1;
            consumers.push(new Consumer(consumerSpec, router));            
        }

        // start calls 
        consumers.forEach(consumer => {
            consumer.startConnection();
        })

        //await(randomDelay(30000, 40000));   
        setTimeout(() => {            
            printResults(consumers, agents, printDetails);

            // generate Report
            if(generateReport) {
                const report = new Report(); 
                consumers.forEach(consumer => {
                    report.updateConsumerRecord(consumer);
                });
                agents.forEach(agent => {
                    report.updateAgentRecord(agent);
                })
                report.createReports(); 
            }
        }, 40000)  ; 


    });

    function printResults (consumers: Consumer[], agents: Agent[], printDetails: boolean = true) {
        let totalConnected: number = 0;
        consumers.forEach(consumer => {
            if(consumer.connected) {
                totalConnected++;
            }
        });
        const connectedConsumersPercent = Math.floor(totalConnected * 100 / consumers.length) 
        let agentReceivedCallsTotal: number = 0;
        agents.forEach(agent => {
            if(agent.callsReceived) {
                agentReceivedCallsTotal++;
            }
        });
        const agentUtilization = Math.floor(agentReceivedCallsTotal * 100/agents.length);

        console.log(`Number of Consumers = ${consumers.length} ----------- Number of Agents = ${agents.length}`);
        console.log(`Consumers Connected = ${connectedConsumersPercent}%;  Agent Utilization = ${agentUtilization}%`);

        if(printDetails) {
            consumers.forEach(consumer => {            
                console.log(`consumer id = ${consumer.consumerSpec.id}; is Connected = ${consumer.connected}; Callbacks Received = ${consumer.callbacksReceived}; specs = ${JSON.stringify(consumer.consumerSpec)}`);
            });
            agents.forEach(agent => {
                console.log(`agent id = ${agent.agentSpec.id}; calls Received = ${agent.callsReceived}; messages Received = ${agent.messagesReceived}; accepts = ${JSON.stringify(agent.agentSpec.accepts)}; `)
            });
        }
        
    }
})