import { join } from "path";
import { readFileSync } from "fs";

import * as dotenv from 'dotenv'
dotenv.config();

// function responsável pela conexão com o db
import { document } from "src/utils/dynamodbClient";

import { APIGatewayProxyHandler } from "aws-lambda";
import { compile } from "handlebars";
import dayjs from "dayjs";
import chromium from "chrome-aws-lambda";
// import { S3 } from "aws-sdk";

interface ICreateCertificate {
    id: string;
    name: string;
    grade: string;
    created_at: number;
}

interface ITemplate {
    id: string;
    name: string;
    grade: string;
    medal: string;
    date: string;
}

const compileTemplate = async (data: ITemplate) => {
    // cwd "começa" seu caminho a partir da raiz do projeto, diferente do __dirname

    const filePath = join(process.cwd(), "src", "templates", "certificate.hbs");

    const html = readFileSync(filePath, "utf-8");

    // transforma o html com as informações recebidas no data
    return compile(html)(data)
}

export const handler: APIGatewayProxyHandler = async (event) => {

    const { id, name, grade } = JSON.parse(event.body) as ICreateCertificate;

    // verifco se o aluno já existe na base de dados
    const response = await document.query({
        TableName: "users_certificate",
        KeyConditionExpression: "id = :id",
        ExpressionAttributeValues: {
            ":id": id
        }
    }).promise();

    const userAlreadyExists = response.Items[0];

    if(!userAlreadyExists){

            // método para inserção na table do dynamonDB, específico o nome da table e o body
    // o métdo 'put' retorna 'void'

    await document.put({
        TableName: "users_certificate",
        Item: {
            id,
            name,
            grade,
            created_at: new Date().getTime(),
        }
    }).promise();

    }

    const medalPath = join(process.cwd(), "src", "templates", "selo.png");
    const medal = readFileSync(medalPath, "base64");

    const data : ITemplate = {
        id,
        name,
        grade,
        medal,
        date: dayjs().format('DD/MM/YYYY')
    }

    const content = await compileTemplate(data);

    const browser = await chromium.puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath,
    })

    const page = await browser.newPage();

    await page.setContent(content);
    
    const pdf = await page.pdf({
        format: "a4",
        landscape: true,
        printBackground: true,
        preferCSSPageSize: true,
        path: process.env.IS_OFFLINE ? "./certificate.pdf" : null
    })

    await browser.close();

    // upload para o bucket S3

    // const s3 = new S3();

    // s
    
    // await s3.putObject({
    //     Bucket: "certificateIgnite",
    //     Key: `${id}.pdf`,
    //     ACL: "public-read",
    //     Body: pdf,
    //     ContentType: "application/pdf"
    // }).promise();

    return {
        statusCode: 201,
        // no body colocamos informatações que desejamos
        body: JSON.stringify({
            message: "Certificado criado com sucesso!",
            url: `${process.env.URL}/certificate.pdf`
        })
    }
} 