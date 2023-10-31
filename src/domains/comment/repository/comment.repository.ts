import { CursorPagination } from '@types'
import { CreateCommentInputDTO } from '../dto'
import { PostDTO, ExtendedPostDTO } from '@domains/post/dto'

export interface CommentRepository {
  create: (userId: string, data: CreateCommentInputDTO) => Promise<PostDTO>
  getAllByPostId: (postId: string, options: CursorPagination) => Promise<ExtendedPostDTO[]>
  delete: (commentId: string) => Promise<void>
  getById: (commentId: string) => Promise<PostDTO | null>
  getByAuthorId: (authorId: string) => Promise<PostDTO[]>
}
