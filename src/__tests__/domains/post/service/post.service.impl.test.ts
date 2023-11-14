import { PostDTO } from '@domains/post/dto';
import { PostServiceImpl } from '@domains/post/service/post.service.impl'
import { UserServiceImpl } from '@domains/user/service'

const mockRepository = {
    create: jest.fn(),
    delete: jest.fn(),
    getById: jest.fn(),
    getAllByDatePaginated: jest.fn(),
    getByAuthorId: jest.fn(),
    addQtyLikes: jest.fn(),
    subtractQtyLikes: jest.fn(),
    addQtyRetweets: jest.fn(),
    subtractQtyRetweets: jest.fn(),
    addQtyComments: jest.fn(),
    subtractQtyComments: jest.fn()
}

const mockUserRepository = {
    getUser: jest.fn(),
    doesFollowExist: jest.fn()
}

const service = new PostServiceImpl(mockRepository)
const userService = new UserServiceImpl(mockUserRepository)

const mockPost = { id: '1', authorId: '1', content: '1', images: ['1'], createdAt: new Date(), parentId: '1', author: { id: '1', name: '1', username: '1', email: '1', createdAt: new Date(), updatedAt: new Date() }, qtyComments: 1, qtyLikes: 1, qtyRetweets: 1 }

const mockPosts = [
    { id: '1', authorId: '1', content: '1', images: ['1'], createdAt: new Date(), parentId: '1', author: { id: '1', name: '1', username: '1', email: '1', createdAt: new Date(), updatedAt: new Date() }, qtyComments: 1, qtyLikes: 1, qtyRetweets: 1 },
    { id: '2', authorId: '1', content: '2', images: ['2'], createdAt: new Date(), parentId: '2', author: { id: '1', name: '1', username: '1', email: '1', createdAt: new Date(), updatedAt: new Date() }, qtyComments: 2, qtyLikes: 2, qtyRetweets: 2 },
    { id: '3', authorId: '1', content: '3', images: ['3'], createdAt: new Date(), parentId: '3', author: { id: '1', name: '1', username: '1', email: '1', createdAt: new Date(), updatedAt: new Date() }, qtyComments: 3, qtyLikes: 3, qtyRetweets: 3 },
    { id: '4', authorId: '1', content: '4', images: ['4'], createdAt: new Date(), parentId: '4', author: { id: '1', name: '1', username: '1', email: '1', createdAt: new Date(), updatedAt: new Date() }, qtyComments: 4, qtyLikes: 4, qtyRetweets: 4 },
    { id: '5', authorId: '2', content: '5', images: ['5'], createdAt: new Date(), parentId: '5', author: { id: '2', name: '2', username: '2', email: '2', createdAt: new Date(), updatedAt: new Date() }, qtyComments: 5, qtyLikes: 5, qtyRetweets: 5 },
];

describe('PostServiceImpl', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('getPost (userId: string): Promise<PostDTO>', async () => {
        mockRepository.getById.mockResolvedValue(mockPost);
        const reaction = await service.getPost('1', '1');
        expect(reaction).toEqual(mockPost);
        expect(mockRepository.getById).toHaveBeenCalledWith('1');

        mockRepository.getById.mockResolvedValue(null);
        await expect(service.getPost('1', '1')).rejects.toThrowError('reaction');
    });

    it('getPostsByAuthor (userId: string, authorId: string): Promise<PostDTO[]>', async () => {

        mockRepository.getByAuthorId.mockResolvedValue(mockPosts);
        const posts = await service.getPostsByAuthor('1', '2');
        expect(posts).toBeInstanceOf(Array<Promise<PostDTO>>);
        expect(mockRepository.getByAuthorId).toHaveBeenCalledWith('1', '2');

        mockRepository.getByAuthorId.mockResolvedValue(null);
        await expect(service.getPostsByAuthor('1', '2')).rejects.toThrowError('post');
    });

    it('createPost (userId: string, postId: string, type: ReactionType): Promise<ReactionDTO>', async () => {
        mockRepository.create.mockResolvedValue(mockPost);
        const post = await service.createPost('1',{content: '1', images: ['1']});
        expect(post).toEqual(mockPost);
        expect(mockRepository.create).toHaveBeenCalledWith('1',{content: '1', images: ['1']});

        mockRepository.create.mockResolvedValue(null);
        await expect(service.createPost('1',{content: '1', images: ['1']})).rejects.toThrowError('post');
    });

    it('deletePost (userId: string, postId: string): Promise<void>', async () => {
        mockRepository.getById.mockResolvedValue(mockPost);
        const post = await service.deletePost('1', '1');
        expect(post).toEqual(undefined);
        expect(mockRepository.delete).toHaveBeenCalledWith('1', '1');

        mockRepository.getById.mockResolvedValue(null);
        await expect(service.deletePost('1', '1')).rejects.toThrowError('post');
    });

    it('getLatestPosts (userId: string, options: CursorPagination): Promise<ExtendedPostDTO[]>', async () => {
        mockRepository.getAllByDatePaginated.mockResolvedValue(mockPosts);
        const posts = await service.getLatestPosts('1',{limit: 1});
        expect(posts).toBeInstanceOf(Array<Promise<PostDTO>>);
        expect(mockRepository.getAllByDatePaginated).toHaveBeenCalledWith({limit: 1});

        mockRepository.getAllByDatePaginated.mockResolvedValue(null);
        await expect(service.getLatestPosts('1',{limit: 1})).rejects.toThrowError('post');
    });

});




