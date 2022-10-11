import { APIGatewayProxyHandler } from "aws-lambda";

import { document } from "src/utils/dynamodbClient";

interface ICreateCertificate {
    id: string;
    name: string;
    grade: string;
    created_at: number;
}


export const handler: APIGatewayProxyHandler = async (event) => {

    const { id, name, grade } = JSON.parse(event.body) as ICreateCertificate;

    // método para inserção na table do dynamonDB, específico o nome da table e o body
    // o métdo 'put' retorna 'void'

    await document.put({
        TableName: "users_certificate",
        Item:{
            id,
            name,
            grade,
            created_at: new Date().getTime(),
        }
    }).promise();

    const response = await document.query({
        TableName: "users_certificate",
        KeyConditionExpression: "id = :id",
        ExpressionAttributeValues: {
            ":id": id
        }
    }).promise();

    return {
       statusCode: 201,
       // no body colocamos informatações que desejamos
       body: JSON.stringify(response.Items[0])
    }
} 