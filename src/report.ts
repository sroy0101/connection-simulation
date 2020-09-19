"use strict"
import * as csvWriter from "csv-writer"; 
import {AgentSpec, ConsumerSpec } from "./common";
import {Consumer} from "./consumer";
import {Agent} from "./agent";
import {FilePaths} from "./env";



const createCsvWriter = csvWriter.createObjectCsvWriter;

export interface AgentRecord {
    agentSpec: AgentSpec;
    callsReceived: number;
    messagesReceived: number;
}
export interface ConsumerRecord {
    connected: boolean;
    consumerSpec: ConsumerSpec;
    callbacksReceived: number;
}

export class Report {
    consumerRecord : Map<number, ConsumerRecord>;
    agentRecord : Map<number, AgentRecord>
    isFileSavedSuccess: boolean;

    constructor() {
        this.consumerRecord = new Map();
        this.agentRecord = new Map();
        this.isFileSavedSuccess = false;

    }
    updateConsumerRecord = (consumer: Consumer) => {
        let id: number = consumer.consumerSpec.id; 
        let consumerRecord: ConsumerRecord = {
            connected: consumer.connected,
            consumerSpec: consumer.consumerSpec,
            callbacksReceived: consumer.callbacksReceived
        }
        this.consumerRecord.set(id, consumerRecord);
    }

    updateAgentRecord = (agent: Agent) => {
        let id: number = agent.agentSpec.id;
        let agentRecord: AgentRecord = {
            agentSpec: agent.agentSpec,
            callsReceived: agent.callsReceived,
            messagesReceived: agent.messagesReceived
        }
        this.agentRecord.set(id, agentRecord);
    }

    /**
     * Creates 3 CSV files: 
     * 1. consumers - containing the consumer attributes
     * 2. agents - containing the agents attributes
     * 3. callMetrics - agent: voicemails count, calls count. consumer: callback count
     */
    createReport = () => {
        this.createConsumerReport(); 

    }

    createConsumerReport = () => {
        const csvCreate = createCsvWriter( {
            path: FilePaths.consumerFilePath,
            header: [
                {id: 'id', title: "ConsumerId"},
                {id: 'consumerSpec', title: "Consumer Spec"}
            ]
        });
        let records = [{}];
        this.consumerRecord.forEach((value, key) => {
            let recordItem = {
                id: key.toString(),
                consumerSpec: JSON.stringify(value)
            }
            records.push(recordItem);
        });
        this.isFileSavedSuccess = false; 
        let that = this;
        csvCreate.writeRecords(records)
            .then(() => {
                that.isFileSavedSuccess = true;
            }).catch((error) => {
                console.error(`Create consumer record file error.\n ${error}`);
            });
    }

}