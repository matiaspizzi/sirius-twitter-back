import { CreateCommentInputDTO } from '../dto'
import { PostDTO } from '@domains/post/dto'

export interface CommentService {
  createComment: (userId: string, body: CreateCommentInputDTO) => Promise<PostDTO>
  deleteComment: (userId: string, postId: string) => Promise<void>
  getCommentsByPost: (userId: string, postId: string) => Promise<PostDTO[]>
  getComment: (userId: string, postId: string) => Promise<PostDTO>
  getCommentsByAuthor: (userId: any, authorId: string) => Promise<PostDTO[]>
}
