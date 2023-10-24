import { CreatePostInputDTO, PostDTO } from '../dto'

export interface CommentRepository {
  create: (userId: string, data: CreatePostInputDTO) => Promise<PostDTO>
  getAllByPostId: (postId: string) => Promise<PostDTO[]>
  delete: (commentId: string) => Promise<void>
  getById: (commentId: string) => Promise<PostDTO | null>
  getByAuthorId: (authorId: string) => Promise<PostDTO[]>
}
