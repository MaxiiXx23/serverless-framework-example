import { APIGatewayProxyHandler } from "aws-lambda";
import { document } from "src/utils/dynamodbClient";

import * as dotenv from 'dotenv'
dotenv.config();

interface IUserCertificate {
    id: string;
    name: string;
    grade: string;
    created_at: string;
}

export const handler :APIGatewayProxyHandler = async (event) => {
    // http://localhost:3000/dev/verifyCertificate/{id}
    // o método pathParameters captura os parametros vindo pela url, no caso, o id

    const { id } = event.pathParameters;

    const response = await document.query({
        TableName: "users_certificate",
        KeyConditionExpression: "id = :id",
        ExpressionAttributeValues: {
            ":id": id
        }
    }).promise();

    const userCertificate = response.Items[0] as IUserCertificate;

    if(userCertificate){
        return {
            statusCode: 201,
            body: JSON.stringify({
                message: "Certificado válido.",
                name: userCertificate.name,
                url: `${process.env.URL}/certificate.pdf`
            })
        }
    }

    return{
        statusCode: 400,
        body: JSON.stringify({
            message: "Certificado inválido.",
        })
    }
}