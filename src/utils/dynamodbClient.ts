import { DynamoDB } from "aws-sdk";

const options = {
    region: "localhost",
    endpoint: "http://localhost:8000",
    // defino essa valor, caso eu não tenho as credências e queira usar o DynamoDB offline
    accessKeyId: "x",
    secretAccessKey: "x"
}

// o serverless-offline já define a variável de ambiente como true por padrão
const isOffline = () => {
    return process.env.IS_OFFLINE;
}

// se estiver offline nós usado as options de acesso para o localhost, caso contrário usa o da AWS
export const document = isOffline() 
    ? new DynamoDB.DocumentClient(options)
    : new DynamoDB.DocumentClient();