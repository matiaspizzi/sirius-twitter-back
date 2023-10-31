import { CursorPagination } from '@types'
import { CreateCommentInputDTO } from '../dto'
import { PostDTO, ExtendedPostDTO } from '@domains/post/dto'

export interface CommentService {
  createComment: (userId: string, body: CreateCommentInputDTO) => Promise<PostDTO>
  deleteComment: (userId: string, postId: string) => Promise<void>
  getCommentsByPost: (userId: string, postId: string, options: CursorPagination) => Promise<ExtendedPostDTO[]>
  getComment: (userId: string, postId: string) => Promise<PostDTO>
  getCommentsByAuthor: (userId: any, authorId: string) => Promise<PostDTO[]>
}
