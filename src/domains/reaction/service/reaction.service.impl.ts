import { NotFoundException, ValidationException } from '@utils/errors'
import { ReactionDTO } from '../dto'
import { ReactionRepository } from '../repository'
import { ReactionService } from './reaction.service'
import { ReactionType } from '@prisma/client'

export class ReactionServiceImpl implements ReactionService {
  constructor (private readonly repository: ReactionRepository) {}

  async getReactionById (reactionId: string): Promise<ReactionDTO> {
    const reaction = await this.repository.getById(reactionId)
    if (!reaction) throw new NotFoundException('reaction')
    return reaction
  }

  async createReaction (userId: string, postId: string, type: ReactionType): Promise<ReactionDTO> {
    if (await this.doesReactionExist(userId, postId, type)) throw new ValidationException([{ message: 'Reaction already exists' }])
    return await this.repository.create(userId, postId, type)
  }

  async deleteReaction (userId: string, postId: string, type: ReactionType): Promise<void> {
    const reaction = await this.repository.getByIdsAndType(userId, postId, type)
    if (!reaction) throw new NotFoundException('reaction')
    await this.repository.delete(reaction.id)
  }

  async doesReactionExist (userId: string, postId: string, type: ReactionType): Promise<boolean> {
    const reaction = await this.repository.getByIdsAndType(userId, postId, type)
    return (reaction != null)
  }
}
