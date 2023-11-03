import { MessageDTO, MessageInputDTO } from '../dto'

export interface MessageRepository {
  create: (data: MessageInputDTO) => Promise<MessageDTO>
  getById: (messageId: string) => Promise<MessageDTO | null>
  getByUserIds: (userId: string, receiverId: string) => Promise<MessageDTO[]>
}
