const UserDao = require('../src/models/User');



describe('testDao', () => {
    const sampleNewId= {

        name:"Johny",
        surname : "Smithy",
        username:"user1@ezwh.com",
        password : "testpasswordy",
        type : "manager"
    }
    
    beforeAll(async () => {
        await UserDao.deleteTable();
        await UserDao.createTable();
    });
    afterEach(async () => {
        await UserDao.deleteTable();
        await UserDao.createTable();
    });

    test('delete db', async () => {
        var res = await UserDao.getUsers();
        expect(res.length).toStrictEqual(0);
    });

    testNewUser(sampleNewId);

});

function testNewUser(newUser) {
    test('create new item', async () => {
        
        await UserDao.insertNewUser(newUser);
        // console.log("ARRIVED HERE AFTER INSERTION")
        var res = await UserDao.getUsers();
        // console.log("ARRIVED HERE AFTER GET")
        var ID= res[res.length-1].id 

        //expect(res.length).toStrictEqual(1);
        
        res = await UserDao.getUserById(ID);

        expect(res.name).toStrictEqual(newUser.name);
        expect(res.surname).toStrictEqual(newUser.surname);
        expect(res.email).toStrictEqual(newUser.username);
        expect(res.type).toStrictEqual(newUser.type);
    });
}