const Person = require('../../model/person.model');
const { dataBaseConnectionString } = require("../../util/url");
const { Sequelize } = require('sequelize');


describe('Person model', () => {

    let testPerson;

    beforeAll(async () => {

        const db = new Sequelize(dataBaseConnectionString);

        db.sync({ force: true })
            .then(() => {
                console.log('Connection has been established successfully.');
            })
            .catch(error => {
                console.error('Unable to connect to the database:', error);
            });
    });

    afterAll(async () => {
        await db.close();
    });

    beforeEach(async () => {
        // Create a test person
        testPerson = await Person.create({
        name: 'John',
        surname: 'Doe',
        pnr: '12345678-1234',
        email: 'johndoe@example.com',
        password: 'password123',
        username: 'johndoe',
        role_id: 2,
        });
    });

    afterEach(async () => {
        await testPerson.destroy();
    });

    describe('Validations', () => {

        test('should not allow a person to be created without a name', async () => {
            const person = await Person.create({
                surname: 'Doe',
                pnr: '12345678-1234',
                email: 'johndoe@example.com',
                password: 'password123',
                username: 'johndoe',
                role_id: 2,
            }).catch((err) => {
                expect(err).toBeTruthy();
            });
        });

        test('should not allow a person to be created without a surname', async () => {
            const person = await Person.create({
                name: 'John',
                pnr: '12345678-1234',
                email: 'johndoe@example.com',
                password: 'password123',
                username: 'johndoe',
                role_id: 2,
            }).catch((err) => {
                expect(err).toBeTruthy();
            });
        });

        test('should not allow a person to be created with an invalid name', async () => {
            const person = await Person.create({
                name: 'John123',
                surname: 'Doe',
                pnr: '12345678-1234',
                email: 'johndoe@example.com',
                password: 'password123',
                username: 'johndoe',
                role_id: 2,
            }).catch((err) => {
                expect(err).toBeTruthy();
            });
        });

        test('should not allow a person to be created with an invalid surname', async () => {
            const person = await Person.create({
                name: 'John',
                surname: 'Doe123',
                pnr: '12345678-1234',
                email: 'johndoe@example.com',
                password: 'password123',
                username: 'johndoe',
                role_id: 2,
            }).catch((err) => {
                expect(err).toBeTruthy();
            });
        });

        test('should not allow a person to be created without a pnr', async () => {
            const person = await Person.create({
                name: 'John',
                surname: 'Doe',
                email: 'johndoe@example.com',
                password: 'password123',
                username: 'johndoe',
                role_id: 2,
            }).catch((err) => {
                expect(err).toBeTruthy();
            });
        });
    }) 
}) 

