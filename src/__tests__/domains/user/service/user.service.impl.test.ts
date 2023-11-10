import { ExtendedUserDTO, UserViewDTO } from '@domains/user/dto';
import { UserServiceImpl } from '../../../../domains/user/service/user.service.impl'

const mockRepository = {
    getById: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    getByUsernamePaginated: jest.fn(),
    getRecommendedUsersPaginated: jest.fn(),
    getByEmailOrUsername: jest.fn(),
    setPrivate: jest.fn(),
    setProfilePicture: jest.fn(),
    getProfilePicture: jest.fn()
}

const service = new UserServiceImpl(mockRepository)

const mockUser = { id: '1', username: 'Test User' };

const mockUsers = [
    { id: '1', username: 'Test User' },
    { id: '2', username: 'Test User 2' },
    { id: '3', username: 'Test User 3' },
    { id: '4', username: 'This one not' }
];

describe('UserServiceImpl', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('getUser (userId: string): Promise<ExtendedUserDTO>', async () => {
        mockRepository.getById.mockResolvedValue(mockUser);

        const user = await service.getUser('1');

        expect(user).toEqual(mockUser);
        expect(mockRepository.getById).toHaveBeenCalledWith('1');

        mockRepository.getById.mockResolvedValue(null);

        await expect(service.getUser('1')).rejects.toThrowError('user');
    });

    it('getUsersByUsername (username: string, options: CursorPagination): Promise<UserViewDTO[]>', async () => {

        mockRepository.getByUsernamePaginated.mockResolvedValue(mockUsers);

        const users = await service.getUsersByUsername('Test User', { limit: 10, before: '1' });

        expect(users).toBeInstanceOf(Array<Promise<ExtendedUserDTO>>);

        expect(mockRepository.getByUsernamePaginated).toHaveBeenCalledWith('Test User', { limit: 10, before: '1' });
    });

    it('getUserView (userId: string): Promise<UserViewDTO>', async () => {
        mockRepository.getById.mockResolvedValue(mockUser);

        const user = await service.getUserView('1');

        expect(user).toEqual(mockUser);
        expect(user).toBeInstanceOf(UserViewDTO);
        expect(mockRepository.getById).toHaveBeenCalledWith('1');
    });

    it('getUserRecommendations (userId: string, options: OffsetPagination): Promise<UserViewDTO[]>', async () => {

        mockRepository.getRecommendedUsersPaginated.mockResolvedValue(mockUsers);

        const users = await service.getUserRecommendations('1', { limit: 10, skip: 0 });

        expect(users).toBeInstanceOf(Array<Promise<UserViewDTO>>);
        expect(users).toEqual(mockUsers);
        expect(mockRepository.getRecommendedUsersPaginated).toHaveBeenCalledWith({ limit: 10, skip: 0 });
    });

    it('deleteUser (userId: string): Promise<void>', async () => {
        mockRepository.delete.mockResolvedValue(mockUser);

        const user = await service.deleteUser('1');

        expect(user).toEqual(undefined);
        expect(mockRepository.delete).toHaveBeenCalledWith('1');
    });

    it('setPrivate (userId: string, isPrivate: string): Promise<boolean>', async () => {
        mockRepository.setPrivate.mockResolvedValue(true);

        const setted = await service.setPrivate('1', 'true');

        expect(setted).toEqual(true);
        expect(mockRepository.setPrivate).toHaveBeenCalledWith('1', true);

        mockRepository.setPrivate.mockResolvedValue(false);

        const setted2 = await service.setPrivate('1', 'false');

        expect(setted2).toEqual(false);
        expect(mockRepository.setPrivate).toHaveBeenCalledWith('1', false);

        await expect(service.setPrivate('1', 'not a boolean')).rejects.toThrowError('The parameter must be true or false');
    });

    it('setProfilePicture (userId: string): Promise<{ presignedUrl: string, profilePictureUrl: string }>', async () => {
        const data = await service.setProfilePicture('1');

        expect(data.presignedUrl).toBeDefined();
        expect(data.profilePictureUrl).toBeDefined();
        expect(mockRepository.setProfilePicture).toHaveBeenCalledWith('1', data.profilePictureUrl);
    });

    it('getProfilePicture (userId: string): Promise<string | null>', async () => {
        const data = await service.setProfilePicture('1');

        expect(data.presignedUrl).toBeDefined();
        expect(data.profilePictureUrl).toBeDefined();
        expect(mockRepository.setProfilePicture).toHaveBeenCalledWith('1', data.profilePictureUrl);

        mockRepository.getProfilePicture.mockResolvedValue(data.profilePictureUrl);

        const url = await service.getProfilePicture('1');

        expect(url).toEqual(data.profilePictureUrl);
        expect(mockRepository.getProfilePicture).toHaveBeenCalledWith('1');
    });
});




