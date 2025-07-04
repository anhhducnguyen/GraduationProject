const sinon = require('sinon');
const serviceFactory = require('../../src/services/exam.schedules.service');

describe('ExamScheduleService', () => {
  let dbStub, service, buildQueryStub;

  beforeEach(() => {
    dbStub = sinon.stub();
    buildQueryStub = sinon.stub();

    service = serviceFactory(dbStub, { buildQuery: buildQueryStub });
  });

  afterEach(() => {
    sinon.restore();
  });

  it('queryExamSchedules - should return formatted exam schedules', async () => {
    const selectStub = sinon.stub().resolves([{
      schedule_id: 1,
      start_time: '2024-01-01',
      end_time: '2024-01-01',
      name_schedule: 'Exam A',
      status: 'planned',
      room_id: 10,
    }]);

    const queryStub = {
      join: sinon.stub().returnsThis(),
      select: selectStub
    };

    buildQueryStub.returns(queryStub);

    const result = await service.queryExamSchedules({}, {});
    expect(result).toEqual([{
      schedule_id: 1,
      start_time: '2024-01-01',
      end_time: '2024-01-01',
      name_schedule: 'Exam A',
      status: 'planned',
      room: { room_id: 10 }
    }]);
  });

  it('countExamSchedules - should return total count', async () => {
    const countStub = sinon.stub().resolves([{ count: '5' }]);
    dbStub.withArgs('examschedules').returns({ count: countStub });

    const result = await service.countExamSchedules();
    expect(result).toBe(5);
  });

  it('deleteScheduleById - should delete schedule', async () => {
    const delStub = sinon.stub().resolves(1);
    const whereStub = sinon.stub().returns({ del: delStub });

    dbStub.withArgs('examschedules').returns({ where: whereStub });

    const result = await service.deleteScheduleById(123);
    expect(result).toBe(1);
  });

  it('create - should insert and return new exam schedule', async () => {
    const insertStub = sinon.stub().resolves([999]);
    const firstStub = sinon.stub().resolves({ schedule_id: 999 });

    dbStub.withArgs('examschedules').onFirstCall().returns({ insert: insertStub });
    dbStub.withArgs('examschedules').onSecondCall().returns({ where: () => ({ first: firstStub }) });

    const result = await service.create({
      name_schedule: 'Test',
      room_id: 1,
      start_time: '2025-01-01',
      end_time: '2025-01-01',
      status: 'new'
    });

    expect(result).toEqual({ schedule_id: 999 });
  });

  it('update - should return updated schedule if rows affected', async () => {
    const updateStub = sinon.stub().resolves(1);
    const firstStub = sinon.stub().resolves({ schedule_id: 100 });

    dbStub.withArgs('examschedules').onFirstCall().returns({ where: () => ({ update: updateStub }) });
    dbStub.withArgs('examschedules').onSecondCall().returns({ where: () => ({ first: firstStub }) });

    const result = await service.update(100, {
      name_schedule: 'Updated',
      room_id: 1,
      start_time: '2025-01-01',
      end_time: '2025-01-01',
      status: 'updated'
    });

    expect(result).toEqual({ schedule_id: 100 });
  });

  it('update - should return null if no rows affected', async () => {
    const updateStub = sinon.stub().resolves(0);
    dbStub.withArgs('examschedules').returns({ where: () => ({ update: updateStub }) });

    const result = await service.update(200, {});
    expect(result).toBeNull();
  });
});
