import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from '../service/user.service';

describe('UserController', () => {
  let controller: UserController;

  const mockUsersService = {
    create: jest.fn(dto => {
      return {
        id: Date.now(),
        ...dto,
      };
    }),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService],
    })
    .overrideProvider(UserService)
    .useValue(mockUsersService)
    .compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a user', () => {
    expect(controller.create({name: 'John Doe'})).toEqual({
      id: expect.any(Number),
      name: 'John Doe',
    });
  })
})
