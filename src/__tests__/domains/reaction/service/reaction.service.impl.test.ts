import { ReactionDTO } from '@domains/reaction/dto';
import { ReactionServiceImpl } from '@domains/reaction/service/reaction.service.impl'

const mockRepository = {
    create: jest.fn(),
    delete: jest.fn(),
    getById: jest.fn(),
    getByIdsAndType: jest.fn(),
    getByUserAndType: jest.fn(),
    getByPostId: jest.fn(),
    doesReactionExist: jest.fn()
}

const mockPostRepository = {
    addQtyLikes: jest.fn(),
    addQtyRetweets: jest.fn(),
    subtractQtyLikes: jest.fn(),
    subtractQtyRetweets: jest.fn()
}

const service = new ReactionServiceImpl(mockRepository)

const mockReaction = { id: '1', userId: '1', postId: '1', type: 'LIKE' };

const mockReactions = [
    { id: '1', userId: '1', postId: '1', type: 'LIKE' },
    { id: '2', userId: '1', postId: '2', type: 'LIKE' },
    { id: '3', userId: '1', postId: '3', type: 'LIKE' },
    { id: '4', userId: '1', postId: '4', type: 'LIKE' }
];

describe('ReactionServiceImpl', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('getReactionById (reactionId: string): Promise<ReactionDTO>', async () => {
        mockRepository.getById.mockResolvedValue(mockReaction);
        const reaction = await service.getReactionById('1');
        expect(reaction).toEqual(mockReaction);
        expect(mockRepository.getById).toHaveBeenCalledWith('1');

        mockRepository.getById.mockResolvedValue(null);
        await expect(service.getReactionById('1')).rejects.toThrowError('reaction');
    });

    it('getReactionsByUserAndType (userId: string, type: ReactionType): Promise<ReactionDTO[]>', async () => {

        mockRepository.getByUserAndType.mockResolvedValue(mockReactions);
        const reactions = await service.getReactionsByUserAndType('1', 'LIKE');
        expect(reactions).toBeInstanceOf(Array<Promise<ReactionDTO>>);
        expect(mockRepository.getByUserAndType).toHaveBeenCalledWith('1', 'LIKE');

        mockRepository.getByUserAndType.mockResolvedValue(null);
        await expect(service.getReactionsByUserAndType('1', 'LIKE')).rejects.toThrowError('reaction');
    });

    it('createReaction (userId: string, postId: string, type: ReactionType): Promise<ReactionDTO>', async () => {
        mockRepository.create.mockResolvedValue(mockReaction);
        mockPostRepository.addQtyLikes.mockResolvedValue(undefined);
        mockRepository.doesReactionExist = jest.fn().mockResolvedValue(false);
        const reaction = await service.createReaction('1', '1', 'LIKE');
        expect(reaction).toEqual(mockReaction);
        expect(mockRepository.create).toHaveBeenCalledWith('1', '1', 'LIKE');
    });

    it('deleteReaction (userId: string, postId: string, type: ReactionType): Promise<void>', async () => {
        mockRepository.getByIdsAndType.mockResolvedValue(mockReaction);
        mockPostRepository.subtractQtyLikes.mockResolvedValue(undefined);
        mockRepository.doesReactionExist = jest.fn().mockResolvedValue(true);
        const reaction = await service.deleteReaction('1', '1', 'LIKE');
        expect(reaction).toEqual(undefined);
        expect(mockRepository.delete).toHaveBeenCalledWith('1', '1', 'LIKE');
    });

    it('doesReactionExist (userId: string, postId: string, type: ReactionType): Promise<boolean>', async () => {
        mockRepository.getByIdsAndType.mockResolvedValue(mockReaction);
        const reaction = await service.doesReactionExist('1', '1', 'LIKE');
        expect(reaction).toEqual(true);

        mockRepository.getByIdsAndType.mockResolvedValue(null);
        const reaction2 = await service.doesReactionExist('1', '1', 'LIKE');
        expect(reaction2).toEqual(false);

    });
});




