import { ReactionDTO } from '../dto'
import { ReactionType } from '@prisma/client'

export interface ReactionService {
  getReactionById: (reactionId: string) => Promise<ReactionDTO>
  createReaction: (userId: string, postId: string, type: ReactionType) => Promise<ReactionDTO>
  deleteReaction: (userId: string, postId: string, type: ReactionType) => Promise<void>
}
