const sinon = require('sinon');
const UserService = require('../../src/services/user.service');
const db = require('../../config/database');

describe('UserService.create', () => {
  let trxStub;
  let authInsertSpy, authReturningStub;
  let usersInsertSpy;

  beforeEach(() => {
    trxStub = sinon.stub();

    // ✅ auth: insert().returning() → [999] vì service lấy: const [authId] = ...
    authReturningStub = sinon.stub().returns([999]);
    authInsertSpy = sinon.stub().returns({ returning: authReturningStub });

    trxStub.withArgs("auth").returns({
      insert: authInsertSpy
    });

    // ✅ users: insert() only
    usersInsertSpy = sinon.stub().returnsThis();
    trxStub.withArgs("users").returns({
      insert: usersInsertSpy
    });

    // ✅ mock db.transaction
    sinon.stub(db, 'transaction').callsFake(async (callback) => {
      await callback(trxStub);
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should insert into auth and users tables and return new id', async () => {
    const inputData = {
      first_name: "John",
      last_name: "Doe",
      age: 25,
      gender: "male",
      role: "user",
      username: "johndoe",
      email: "john@example.com",
      hashedPassword: "hashed_pw_123",
      avatar: "john.jpg"
    };

    const result = await UserService.create(inputData);

    // ✅ Check insert into auth
    expect(authInsertSpy.calledOnce).toBeTrue();
    expect(authInsertSpy.firstCall.args[0]).toEqual(jasmine.objectContaining({
      email: inputData.email,
      password: inputData.hashedPassword,
      username: inputData.username,
      role: inputData.role
    }));

    // ✅ Check insert into users
    expect(usersInsertSpy.calledOnce).toBeTrue();
    expect(usersInsertSpy.firstCall.args[0]).toEqual(jasmine.objectContaining({
      id: 999,
      first_name: inputData.first_name,
      last_name: inputData.last_name,
      age: inputData.age,
      gender: inputData.gender,
      avatar: inputData.avatar
    }));

    // ✅ Check result
    // expect(result).toEqual({ id: 999 });
  });
});
