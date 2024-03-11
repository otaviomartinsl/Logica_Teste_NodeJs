const express = require('express');
const axios = require('axios');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

const csvWriter = createCsvWriter({
    path: 'users.csv',
    header: [
        { id: 'id', title: 'ID' },
        { id: 'first_name', title: 'First Name' },
        { id: 'last_name', title: 'Last Name' },
        { id: 'email', title: 'Email' },
        { id: 'phone_number', title: 'Phone' },
        { id: 'password', title: 'password' },
    ]
});

// Função que faz os usuários serem salvos no arquivo CSV
async function saveUsersToCSV(users) {
    try {
        // Verificar se o arquivo CSV existe
        const csvFilePath = 'users.csv';
        const csvExists = fs.existsSync(csvFilePath);

        // Abrir o arquivo CSV em modo de adição
        const csvWriter = createCsvWriter({
            path: csvFilePath,
            header: [
                { id: 'id', title: 'ID' },
                { id: 'first_name', title: 'First Name' },
                { id: 'last_name', title: 'Last Name' },
                { id: 'email', title: 'Email' },
                { id: 'phone_number', title: 'Phone' },
                { id: 'password', title: 'password' },
            ],
            append: csvExists // Adicionar ao arquivo existente caso exista
        });

        // Escrever os novos registros no arquivo CSV
        await csvWriter.writeRecords(users);
        console.log('Dados adicionados ao arquivo users.csv');
    } catch (error) {
        console.error('Erro ao salvar usuários no arquivo CSV:', error);
    }
}

// Rota para salvar usuários no arquivo CSV
app.get('/save-users-to-csv', async (req, res) => {
    try {
        const response = await axios.get('https://random-data-api.com/api/users/random_user?size=10');
        const users = response.data;

        // Salvar usuários no arquivo CSV
        await saveUsersToCSV(users);

        res.status(200).send('Usuários salvos no arquivo CSV com sucesso');
    } catch (error) {
        console.error('Erro ao salvar usuários no arquivo CSV:', error);
        res.status(500).send('Erro ao salvar usuários no arquivo CSV');
    }
});

// Rota para listar usuários e salvar no arquivo CSV
app.get('/users', async (req, res) => {
    try {
        const response = await axios.get('https://random-data-api.com/api/users/random_user?size=10');
        const users = response.data;
        res.json(users);

        // Salvar no arquivo CSV
        await csvWriter.writeRecords(users);
        console.log('Dados salvos em users.csv');
    } catch (error) {
        console.error('Erro ao obter usuários:', error);
        res.status(500).send('Erro ao obter usuários');
    }
});

// Rota para editar um usuário por ID
app.put('/users/:id', async (req, res) => {
    const userId = req.params.id;
    const userData = req.body;

    try {
        // Ler os usuários do arquivo CSV
        const csvFilePath = 'users.csv';
        const users = await readUsersFromCSV(csvFilePath);

        // Encontrar o índice do usuário com o ID fornecido
        const index = users.findIndex(user => user.id === userId);

        if (index !== -1) {
            // Atualizar os dados do usuário
            users[index] = {
                ...users[index],
                ...userData
            };

            // Reescrever o arquivo CSV com os dados atualizados
            await writeUsersToCSV(users, csvFilePath);

            console.log(`Usuário com ID ${userId} editado com sucesso`);
            res.status(200).send(`Usuário com ID ${userId} editado com sucesso`);
        } else {
            console.error(`Usuário com ID ${userId} não encontrado`);
            res.status(404).send(`Usuário com ID ${userId} não encontrado`);
        }
    } catch (error) {
        console.error('Erro ao editar usuário:', error);
        res.status(500).send('Erro ao editar usuário');
    }
});

// Rota para excluir um usuário usando o ID
app.delete('/users/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        // Ler os usuários do arquivo CSV
        const csvFilePath = 'users.csv';
        const users = await readUsersFromCSV(csvFilePath);

        // Encontrar o índice do usuário com o ID fornecido
        const index = users.findIndex(user => user.id === userId);

        if (index !== -1) {
            // Remover o usuário da lista
            users.splice(index, 1);

            // Reescrever o arquivo CSV sem o usuário excluído
            await writeUsersToCSV(users, csvFilePath);

            console.log(`Usuário com ID ${userId} excluído com sucesso`);
            res.status(200).send(`Usuário com ID ${userId} excluído com sucesso`);
        } else {
            console.error(`Usuário com ID ${userId} não encontrado`);
            res.status(404).send(`Usuário com ID ${userId} não encontrado`);
        }
    } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        res.status(500).send('Erro ao excluir usuário');
    }
});

// Função para ler os usuários do arquivo CSV
async function readUsersFromCSV(csvFilePath) {
    const csvParser = createCsvParser({
        delimiter: ',',
        trim: true,
        skipEmptyLines: true,
        header: true
    });

    const csvData = fs.readFileSync(csvFilePath, 'utf-8');
    const users = await csvParser.parse(csvData);

    return users;
}

// Função para escrever os usuários no arquivo CSV
async function writeUsersToCSV(users, csvFilePath) {
    const csvWriter = createCsvWriter({
        path: csvFilePath,
        header: [
            { id: 'id', title: 'ID' },
            { id: 'first_name', title: 'First Name' },
            { id: 'last_name', title: 'Last Name' },
            { id: 'email', title: 'Email' },
            { id: 'phone_number', title: 'Phone' },
            { id: 'password', title: 'password' },
        ]
    });

    await csvWriter.writeRecords(users);
}

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
