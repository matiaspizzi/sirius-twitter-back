import { CreateCommentInputDTO } from '../dto'
import { PostDTO } from '@domains/post/dto'

export interface CommentRepository {
  create: (userId: string, data: CreateCommentInputDTO) => Promise<PostDTO>
  getAllByPostId: (postId: string) => Promise<PostDTO[]>
  delete: (commentId: string) => Promise<void>
  getById: (commentId: string) => Promise<PostDTO | null>
  getByAuthorId: (authorId: string) => Promise<PostDTO[]>
}
